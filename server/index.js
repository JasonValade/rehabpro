import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exercises as baseExercises, initialMessages, milestones as baseMilestones, patients as basePatients, reports as baseReports } from "./data.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const patients = [...basePatients];
const reports = [...baseReports];
const exercises = [...baseExercises];
const milestones = [...baseMilestones];
const messages = [...initialMessages];

function requireBackendApiKey(req, res, next) {
  if (!BACKEND_API_KEY) {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader !== `Bearer ${BACKEND_API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

function normalizeRole(role) {
  return role === "assistant" ? "assistant" : "user";
}

function extractAnthropicText(responseData) {
  if (!responseData) return null;

  if (typeof responseData.completion === "string") {
    return responseData.completion;
  }

  if (typeof responseData?.text === "string") {
    return responseData.text;
  }

  const content = responseData?.completion?.content || responseData?.content;
  if (Array.isArray(content)) {
    const textBlock = content.find((item) => item.type === "text");
    return textBlock?.text || null;
  }

  if (Array.isArray(responseData?.output)) {
    const outputText = responseData.output
      .flatMap((item) => item.content || [])
      .find((block) => block.type === "text");
    return outputText?.text || null;
  }

  return null;
}

app.get("/api/patients", (req, res) => {
  const { patientId, q } = req.query;
  let result = [...patients];

  if (patientId) {
    result = result.filter((patient) => patient.id === patientId);
  }

  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (patient) =>
        patient.name.toLowerCase().includes(term) ||
        patient.injury.toLowerCase().includes(term) ||
        patient.goal.toLowerCase().includes(term)
    );
  }

  res.json(result);
});

app.get("/api/patients/:id", (req, res) => {
  const patient = patients.find((item) => item.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

app.get("/api/exercises", (req, res) => {
  const { q, stage, injury } = req.query;
  let result = [...exercises];

  if (stage) {
    result = result.filter((exercise) => exercise.stages?.includes(stage));
  }

  if (injury) {
    result = result.filter((exercise) => exercise.injuries?.includes(injury));
  }

  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(term) ||
        exercise.muscles.toLowerCase().includes(term) ||
        exercise.cue.toLowerCase().includes(term)
    );
  }

  res.json(result);
});

app.get("/api/exercises/:id", (req, res) => {
  const exercise = exercises.find((item) => item.id === req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found" });
  }
  res.json(exercise);
});

app.get("/api/reports", (req, res) => {
  const { patientId } = req.query;
  let result = [...reports];
  if (patientId) {
    result = result.filter((report) => report.patientId === patientId);
  }
  res.json(result);
});

app.post("/api/reports", requireBackendApiKey, (req, res) => {
  const { patientId, exercise, pain, swelling, location, note } = req.body;

  if (!patientId || typeof pain === "undefined") {
    return res.status(400).json({ error: "patientId and pain are required" });
  }

  const report = {
    id: `r_${Date.now()}`,
    patientId,
    ts: Date.now(),
    exercise: exercise || "General",
    swelling: Number(swelling) || 0,
    pain: Number(pain),
    location: location || "Not specified",
    note: note || "",
    ptRead: false,
    ptReply: null,
  };

  reports.unshift(report);
  res.status(201).json(report);
});

app.get("/api/milestones", (req, res) => {
  res.json(milestones);
});

app.get("/api/chat/history", (req, res) => {
  const { patientId } = req.query;
  const result = patientId ? messages.filter((message) => message.patientId === patientId) : [...messages];
  res.json(result);
});

app.post("/api/chat", async (req, res) => {
  const { patientId, text, history } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is not configured with ANTHROPIC_API_KEY" });
  }

  const conversation = [
    {
      role: "system",
      content:
        "You are Dr. Rivera, a sports-specialized physical therapist inside the RehabPro app. Keep responses direct, specific, and motivating. Reply based on the current conversation and patient context.",
    },
    ...(Array.isArray(history)
      ? history.map((item) => ({ role: normalizeRole(item.role), content: item.content || "" }))
      : []),
    { role: "user", content: text },
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens_to_sample: 1000,
        messages: conversation,
      }),
    });

    if (!response.ok) {
      const textBody = await response.text();
      return res.status(502).json({ error: "Anthropic request failed", details: textBody });
    }

    const data = await response.json();
    const reply = extractAnthropicText(data) || "I couldn't get a response right now.";

    const normalizedPatientId = patientId || "unknown";
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      patientId: normalizedPatientId,
      sender: "patient",
      text,
      ts: Date.now(),
    };
    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      patientId: normalizedPatientId,
      sender: "assistant",
      text: reply,
      ts: Date.now() + 1,
    };

    messages.push(userMessage, assistantMessage);

    res.json({ reply, messages: messages.filter((message) => message.patientId === normalizedPatientId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat request failed" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`RehabPro API server listening on http://localhost:${port}`);
});
