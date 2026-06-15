import React, { useEffect, useRef, useState } from "react";
import { C } from "../../constants/colors";

const AI_WELCOME = {
  role: "assistant",
  content:
    "I can help you think through symptoms, exercise form, and questions to bring to your PT. I am not a clinician and cannot diagnose an injury.",
};

const QUICK_PROMPTS = [
  "My knee feels tight after heel slides",
  "Walk me through my squat form",
  "What should I ask my PT next visit?",
];

function messageFromApi(entry) {
  return {
    role: entry.sender === "assistant" ? "assistant" : "user",
    content: entry.text,
  };
}

function ChatBubble({ side, children, accent = false }) {
  return (
    <div style={{ display: "flex", justifyContent: side === "right" ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "84%",
          padding: "11px 14px",
          borderRadius: side === "right" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
          background: accent ? C.lime : C.panel,
          border: accent ? "none" : `1px solid ${C.rim}`,
          color: accent ? C.black : C.bone,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PTChat({ patientId, patientName, patientContext, ptThread, onSendPtMessage }) {
  const [mode, setMode] = useState("ai");
  const [messages, setMessages] = useState([AI_WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?patientId=${encodeURIComponent(patientId)}`);
        if (!res.ok) throw new Error("Failed to load chat history");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setMessages(data.map(messageFromApi));
      } catch {
        // The welcome message keeps the prototype useful while the API is offline.
      }
    };

    loadHistory();
  }, [patientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, loading, mode, ptThread?.messages]);

  const sendAiMessage = async (text) => {
    const previousMessages = messages;
    setMessages((current) => [...current, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, text, history: previousMessages, patientContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The AI coach is unavailable right now.");

      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setError(requestError.message || "The AI coach is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");

    if (mode === "pt") {
      if (!ptThread) {
        setError("Your PT conversation is not available yet.");
        return;
      }
      onSendPtMessage(ptThread.id, text);
      return;
    }

    await sendAiMessage(text);
  };

  const visibleMessages = mode === "ai" ? messages : ptThread?.messages || [];
  const disabled = !input.trim() || loading || (mode === "pt" && !ptThread);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12 }}>
        <label htmlFor="chat-mode" style={{ flexShrink: 0, color: C.muted, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Chat with
        </label>
        <div style={{ position: "relative", flex: 1 }}>
          <select
            id="chat-mode"
            aria-label="Chat with"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setInput("");
              setError("");
            }}
            style={{
              width: "100%",
              appearance: "none",
              WebkitAppearance: "none",
              padding: "10px 38px 10px 12px",
              background: C.lift,
              border: `1px solid ${mode === "ai" ? C.blue : C.lime}60`,
              borderRadius: 9,
              color: C.bone,
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <option value="ai">RehabPro AI Coach</option>
            <option value="pt">My Physical Therapist</option>
          </select>
          <span aria-hidden="true" style={{ position: "absolute", top: "50%", right: 13, color: mode === "ai" ? C.blue : C.lime, fontSize: 12, pointerEvents: "none", transform: "translateY(-50%)" }}>
            ▾
          </span>
        </div>
      </div>

      <div style={{ background: mode === "ai" ? C.blueDim : C.limeDim, border: `1px solid ${mode === "ai" ? C.blue : C.lime}40`, borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: C.bone }}>
          {mode === "ai" ? "RehabPro AI Coach" : ptThread ? "Your physical therapist" : "PT messaging"}
        </div>
        <div style={{ marginTop: 3, fontFamily: "'DM Sans', sans-serif", fontSize: 11, lineHeight: 1.45, color: C.muted }}>
          {mode === "ai"
            ? "General education only. For severe pain, a new deformity, chest pain, trouble breathing, or new numbness or weakness, seek urgent medical care."
            : `Messages go to your care team and may not be read immediately${patientName ? `, ${patientName.split(" ")[0]}` : ""}.`}
        </div>
      </div>

      <div aria-live="polite" style={{ flex: 1, minHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 2 }}>
        {visibleMessages.map((message, index) => {
          const fromPatient = mode === "ai" ? message.role === "user" : message.sender === "patient";
          return (
            <ChatBubble key={`${message.ts || index}-${index}`} side={fromPatient ? "right" : "left"} accent={fromPatient}>
              {mode === "ai" ? message.content : message.text}
            </ChatBubble>
          );
        })}
        {mode === "pt" && !ptThread && <ChatBubble side="left">Your care team has not started a conversation yet.</ChatBubble>}
        {loading && <ChatBubble side="left">Thinking...</ChatBubble>}
        <div ref={bottomRef} />
      </div>

      {mode === "ai" && messages.length === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setInput(prompt)} style={{ padding: "9px 14px", background: C.blueDim, border: `1px solid ${C.blue}40`, borderRadius: 8, color: C.blue, fontSize: 12, textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {error && <div role="alert" style={{ color: C.red, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          aria-label={mode === "ai" ? "Ask the AI coach" : "Message your PT"}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          placeholder={mode === "ai" ? "Ask about symptoms or form..." : "Message your PT..."}
          style={{ flex: 1, background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "12px 14px", color: C.bone, fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
        />
        <button aria-label="Send message" type="button" onClick={send} disabled={disabled} style={{ width: 46, height: 46, background: C.lime, border: "none", borderRadius: 10, color: C.black, fontSize: 18, fontWeight: 900, opacity: disabled ? 0.3 : 1 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
