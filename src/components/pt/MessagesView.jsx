import { useState } from "react";
import { C } from "../../constants/colors";

export function MessagesView({ threads, activeThreadId, onSelectThread, onSendMessage, onBack }) {
  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const message = draft.trim();
    if (!message) return;
    onSendMessage(activeThread.id, message);
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      {!activeThread ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: C.bone }}>Messages</div>
          <div style={{ display: "grid", gap: 10 }}>
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: C.panel,
                  border: `1px solid ${C.rim}`,
                  borderRadius: 16,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: C.bone }}>{thread.patientName}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{thread.updated}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>{thread.excerpt}</div>
                  {thread.hasReport && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.red }}>Report</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: "10px 12px",
                background: C.panel,
                border: `1px solid ${C.rim}`,
                borderRadius: 12,
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone }}>{activeThread.patientName}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{activeThread.updated}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
            {activeThread.messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: msg.sender === "pt" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: msg.sender === "pt" ? C.lime : C.panel,
                    color: msg.sender === "pt" ? C.black : C.bone,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a reply..."
              style={{
                flex: 1,
                background: C.panel,
                border: `1px solid ${C.rim}`,
                borderRadius: 14,
                padding: "12px 14px",
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              style={{
                width: 48,
                borderRadius: 14,
                border: "none",
                background: C.lime,
                color: C.black,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
