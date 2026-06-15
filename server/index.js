import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pathToFileURL } from "url";
import { exercises as baseExercises, initialMessages, milestones as baseMilestones, patients as basePatients, reports as baseReports } from "./data.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const AI_ENABLED = process.env.ENABLE_AI === "true";
const DEMO_API_ENABLED = process.env.ENABLE_DEMO_API === "true";
const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Origin not allowed"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "32kb", strict: true }));

const patients = [...basePatients];
const reports = [...baseReports];
const exercises = [...baseExercises];
const milestones = [...baseMilestones];
const messages = [...initialMessages];

function createRateLimiter({ windowMs, max }) {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = requests.get(key);

    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }

    current.count += 1;
    next();
  };
}

const writeRateLimit = createRateLimiter({ windowMs: 60_000, max: 30 });
const chatRateLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

function requireDemoApi(req, res, next) {
  if (!DEMO_API_ENABLED) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

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

function openAIErrorResponse(status, responseData) {
  const code = responseData?.error?.code;

  if (status === 401) {
    return { status: 502, error: "The OpenAI API key is invalid. Check OPENAI_API_KEY in .env and restart the server." };
  }

  if (status === 429 || code === "insufficient_quota") {
    return { status: 503, error: "The OpenAI project has no available API quota. Check billing and usage limits." };
  }

  if (status === 404 || code === "model_not_found") {
    return { status: 503, error: `The configured model (${OPENAI_MODEL}) is not available to this API project.` };
  }

  return { status: 502, error: "The AI coach could not respond right now." };
}

app.get("/api/patients", requireDemoApi, requireBackendApiKey, (req, res) => {
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

app.get("/api/patients/:id", requireDemoApi, requireBackendApiKey, (req, res) => {
  const patient = patients.find((item) => item.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

app.get("/api/exercises", requireDemoApi, (req, res) => {
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

app.get("/api/exercises/:id", requireDemoApi, (req, res) => {
  const exercise = exercises.find((item) => item.id === req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found" });
  }
  res.json(exercise);
});

app.get("/api/reports", requireDemoApi, requireBackendApiKey, (req, res) => {
  const { patientId } = req.query;
  let result = [...reports];
  if (patientId) {
    result = result.filter((report) => report.patientId === patientId);
  }
  res.json(result);
});

app.post("/api/reports", requireDemoApi, requireBackendApiKey, writeRateLimit, (req, res) => {
  const { patientId, exercise, pain, swelling, location, note } = req.body;
  const normalizedPain = Number(pain);
  const normalizedSwelling = Number(swelling || 0);

  if (!patients.some((patient) => patient.id === patientId)) {
    return res.status(400).json({ error: "A valid patientId is required" });
  }

  if (!Number.isFinite(normalizedPain) || normalizedPain < 0 || normalizedPain > 10 || !Number.isFinite(normalizedSwelling) || normalizedSwelling < 0 || normalizedSwelling > 10) {
    return res.status(400).json({ error: "Pain and swelling must be numbers from 0 to 10" });
  }

  const report = {
    id: `r_${Date.now()}`,
    patientId,
    ts: Date.now(),
    exercise: cleanText(exercise, 100) || "General",
    swelling: normalizedSwelling,
    pain: normalizedPain,
    location: cleanText(location, 100) || "Not specified",
    note: cleanText(note, 1000),
    ptRead: false,
    ptReply: null,
  };

  reports.unshift(report);
  res.status(201).json(report);
});

app.get("/api/milestones", requireDemoApi, (req, res) => {
  res.json(milestones);
});

app.get("/api/chat/history", (req, res) => {
  if (!AI_ENABLED || !OPENAI_API_KEY) {
    return res.json([]);
  }
  const { patientId } = req.query;
  const aiMessages = messages.filter((message) => message.channel === "ai" || message.sender === "assistant");
  const result = patientId ? aiMessages.filter((message) => message.patientId === patientId) : aiMessages;
  res.json(result);
});

app.get("/api/chat/status", (req, res) => {
  res.json({ configured: AI_ENABLED && Boolean(OPENAI_API_KEY) });
});

app.post("/api/chat", chatRateLimit, async (req, res) => {
  const { patientId, text, history, patientContext } = req.body;
  const normalizedText = cleanText(text, 1500);
  if (!normalizedText) {
    return res.status(400).json({ error: "A message is required" });
  }

  if (!AI_ENABLED || !OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI coach is not available." });
  }

  const knownPatient = patients.find((patient) => patient.id === patientId);
  const context = knownPatient || {
    injury: cleanText(patientContext?.injury, 100),
    stage: cleanText(patientContext?.stage, 100),
    goal: cleanText(patientContext?.goal, 200),
    assignedExercises: Array.isArray(patientContext?.assignedExercises)
      ? patientContext.assignedExercises.slice(0, 20).map((item) => cleanText(item, 100)).filter(Boolean)
      : [],
  };
  const conversation = Array.isArray(history)
    ? history
        .slice(-12)
        .map((item) => ({ role: normalizeRole(item?.role), content: cleanText(item?.content, 1500) }))
        .filter((item) => item.content)
    : [];
  conversation.push({ role: "user", content: normalizedText });

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
      const responseData = await response.json().catch(() => null);
      const failure = openAIErrorResponse(response.status, responseData);
      console.error("OpenAI request failed", response.status, responseData?.error?.code || "unknown_error");
      return res.status(failure.status).json({ error: failure.error });
    }

    const data = await response.json();
    const reply = extractOpenAIText(data) || "I couldn't get a response right now.";

    const normalizedPatientId = patientId || "unknown";
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      patientId: normalizedPatientId,
      sender: "patient",
      channel: "ai",
      text: normalizedText,
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

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.message === "Origin not allowed") {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }

  console.error("Unhandled server error", error?.message || "unknown_error");
  res.status(500).json({ error: "Internal server error" });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(port, () => {
    console.log(`RehabPro API server listening on http://localhost:${port}`);
    console.log(`AI coach: ${AI_ENABLED && OPENAI_API_KEY ? `configured (${OPENAI_MODEL})` : "disabled"}`);
    console.log(`Demo data API: ${DEMO_API_ENABLED ? "enabled" : "disabled"}`);
  });
}

export { app };
