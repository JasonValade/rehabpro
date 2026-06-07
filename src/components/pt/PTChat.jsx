import { useState, useEffect, useRef } from "react";
import { C } from "../../constants/colors";

const PT_SYSTEM = `You are Dr. Rivera, a sports-specialized physical therapist inside the RehabPro app. The patient is Jason — 20 years old, 6'2", competitive basketball player, 14 weeks post ACL + meniscus surgery (left knee). Current phase: Early Motion. He trains upper body daily and is focused on returning to full basketball performance — dunking, lateral cuts, explosiveness. He's been tracking vertical jump gains (+18 inches from baseline so far). He also trains on a PPL split for upper body.
Be direct, specific, motivating. Talk like a sports PT who works with athletes, not a hospital doctor. Keep responses under 120 words.`;

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    content: "What's up Jason. Checked your session data — wall slides look solid. What do you need today?",
  },
];

export function PTChat() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/chat/history?patientId=pt_jason");
        if (!res.ok) throw new Error("Failed to load chat history");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(
            data.map((entry) => ({
              role: entry.sender === "assistant" ? "assistant" : "user",
              content: entry.text,
            }))
          );
        }
      } catch {
        // Keep fallback history for offline behavior.
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    const updated = [...messages, { role: "user", content: text }];
    setMessages(updated);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: "pt_jason",
          text,
          history: updated,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((entry) => ({
            role: entry.sender === "assistant" ? "assistant" : "user",
            content: entry.text,
          }))
        );
      } else {
        const reply = data.reply || "Can't connect right now.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue. Try again." }]);
    }

    setLoading(false);
  };

  const QUICK = ["When can I start jumping?", "Knee feels tight today", "Can I add more leg work?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 10 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: C.lime + "20",
            border: `1.5px solid ${C.lime}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 16,
            color: C.lime,
          }}
        >
          DR
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: C.bone }}>
            Dr. Rivera, DPT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.lime }} />
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime }}>Active</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em" }}>
            Sports PT
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "84%",
                padding: "11px 14px",
                borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                background: m.role === "user" ? C.lime : C.panel,
                border: m.role === "user" ? "none" : `1px solid ${C.rim}`,
                color: m.role === "user" ? C.black : C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "11px 14px", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: "14px 14px 14px 3px", width: "fit-content" }}>
            {[0, 1, 2].map((j) => (
              <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${j * 0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {QUICK.map((q, i) => (
            <button key={i} type="button" onClick={() => setInput(q)} style={{ padding: "9px 14px", background: C.limeDim, border: `1px solid ${C.limeMid}`, borderRadius: 8, color: C.lime, fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Dr. Rivera..."
          style={{
            flex: 1,
            background: C.panel,
            border: `1px solid ${C.rim}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: C.bone,
            fontSize: 13,
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <button type="button" onClick={send} disabled={!input.trim() || loading} style={{ width: 46, height: 46, background: C.lime, border: "none", borderRadius: 10, color: C.black, fontSize: 18, cursor: "pointer", fontWeight: 900, opacity: input.trim() && !loading ? 1 : 0.3, transition: "opacity 0.2s" }}>
          ↑
        </button>
      </div>
    </div>
  );
}
