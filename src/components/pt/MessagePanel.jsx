import React, { useEffect, useRef, useState } from "react";
import { C } from "../../constants/colors";
import { parseSymptomReportMessage } from "../../utils/reportChat";
import { SymptomReportCard } from "../ui/SymptomReportCard";
import { Tag } from "../ui/Tag";
import { EmptyState, Label, Panel } from "./ptPortalShared";

export function MessagePanel({ thread, reports, onSendMessage, onMarkReportReviewed }) {
  const [draft, setDraft] = useState("");
  const messageListRef = useRef(null);
  const messageCount = thread?.messages.length || 0;

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    messageList.scrollTop = messageList.scrollHeight;
  }, [thread?.id, messageCount]);

  const handleSend = () => {
    const message = draft.trim();
    if (!message || !thread) return;
    onSendMessage(thread.id, message);
    setDraft("");
  };

  return (
    <Panel style={{ minHeight: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", marginBottom: 16 }}>
        <div>
          <Label color={C.lime}>Messages</Label>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, lineHeight: 1, marginTop: 6 }}>{thread?.patientName || "No thread selected"}</div>
        </div>
        {thread?.hasReport ? <Tag label="Needs review" color={C.red} /> : thread ? <Tag label="Conversation" color={C.blue} /> : null}
      </div>
      <div className="pt-message-list" ref={messageListRef}>
        {thread ? (
          thread.messages.map((message, index) => {
            const report = parseSymptomReportMessage(message.text);
            const sourceReport = report
              ? reports.find((item) => item.id === message.reportId) ||
                reports.find((item) => item.patientId === thread.patientId && item.ts === message.ts) ||
                reports.find((item) => item.patientId === thread.patientId && item.exercise === report.exercise && `${item.pain}/5` === report.pain && `${item.swelling}/5` === report.swelling)
              : null;
            return (
              <div key={`${message.ts}-${index}`} style={{ display: "flex", justifyContent: message.sender === "pt" ? "flex-end" : "flex-start" }}>
                {report ? (
                  <div style={{ width: "min(100%, 560px)" }}>
                    <SymptomReportCard report={report} sourceReport={sourceReport} onMarkReviewed={() => onMarkReportReviewed(sourceReport.id)} />
                  </div>
                ) : (
                  <div style={{ maxWidth: "82%", borderRadius: message.sender === "pt" ? "8px 8px 2px 8px" : "8px 8px 8px 2px", padding: "11px 12px", background: message.sender === "pt" ? C.lime : C.deep, border: message.sender === "pt" ? "none" : `1px solid ${C.rim}`, color: message.sender === "pt" ? C.black : C.bone, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {message.text}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState title="No thread selected" message="Choose a patient from the caseload to open their conversation." />
        )}
      </div>
      <div className="pt-message-composer">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder="Write a message..."
          style={{ flex: 1, minWidth: 0, borderRadius: 7, border: `1px solid ${C.rim}`, background: C.deep, color: C.bone, padding: "12px 13px", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
        />
        <button type="button" onClick={handleSend} style={{ padding: "0 16px", border: "none", borderRadius: 7, background: C.lime, color: C.black, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Send
        </button>
      </div>
    </Panel>
  );
}
