import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exercises as baseExercises, initialMessages, milestones as baseMilestones, patients as basePatients, reports as baseReports } from "./data.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
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

function extractOpenAIText(responseData) {
  if (typeof responseData?.output_text === "string") return responseData.output_text;

  return responseData?.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("\n") || null;
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
  const aiMessages = messages.filter((message) => message.channel === "ai" || message.sender === "assistant");
  const result = patientId ? aiMessages.filter((message) => message.patientId === patientId) : aiMessages;
  res.json(result);
});

app.post("/api/chat", async (req, res) => {
  const { patientId, text, history, patientContext } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  if (!OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI coach is not configured. Add OPENAI_API_KEY to the server environment." });
  }

  const knownPatient = patients.find((patient) => patient.id === patientId);
  const context = knownPatient || patientContext || {};
  const conversation = Array.isArray(history)
    ? history.slice(-12).map((item) => ({ role: normalizeRole(item.role), content: item.content || "" }))
    : [];
  conversation.push({ role: "user", content: text });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: `You are the RehabPro AI Coach, an educational exercise and rehabilitation assistant. You are not the patient's physical therapist and must never claim to be a clinician or provide a diagnosis. Give concise, practical guidance about symptoms, exercise form, and questions to ask a licensed PT. Use the supplied patient context when relevant: ${JSON.stringify(context)}. Do not recommend changing a post-operative protocol, weight-bearing status, medication, or prescribed plan. If symptoms suggest an emergency or serious complication, clearly tell the user to stop and seek urgent medical care. Encourage contacting their PT for worsening symptoms, uncertainty, or plan changes. Ask one focused follow-up question when details are insufficient.`,
        input: conversation,
        max_output_tokens: 700,
      }),
    });

    if (!response.ok) {
      const textBody = await response.text();
      console.error("OpenAI request failed", response.status, textBody);
      return res.status(502).json({ error: "The AI coach could not respond right now." });
    }

    const data = await response.json();
    const reply = extractOpenAIText(data) || "I couldn't get a response right now.";

    const normalizedPatientId = patientId || "unknown";
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      patientId: normalizedPatientId,
      sender: "patient",
      channel: "ai",
      text,
      ts: Date.now(),
    };
    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      patientId: normalizedPatientId,
      sender: "assistant",
      channel: "ai",
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
