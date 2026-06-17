import React from "react";
import { C } from "../../constants/colors";
import { Tag } from "../ui/Tag";
import { formatClinicalDate, relativeTime } from "./ptPortalUtils";

export function Panel({ children, style }) {
  return (
    <section className="pt-panel" style={style}>
      {children}
    </section>
  );
}

export function Label({ children, color = C.muted }) {
  return (
    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

export function Metric({ label, value, color = C.bone, tone = "default" }) {
  return (
    <div className={`pt-metric pt-metric-${tone}`}>
      <Label>{label}</Label>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color, lineHeight: 1, marginTop: 8 }}>{value}</div>
    </div>
  );
}

export function HistoryStat({ label, value, detail, color = C.bone }) {
  return (
    <div className="pt-history-stat">
      <Label>{label}</Label>
      <div style={{ color }}>{value}</div>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

export function SeverityMeter({ label, value, max = 5, color = C.lime }) {
  const percent = Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
        <Label>{label}</Label>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.bone }}>{value ?? "-"}/{max}</div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: C.rim, overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div style={{ border: `1px dashed ${C.rimHi}`, background: C.deep, borderRadius: 8, padding: 16, color: C.muted }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, lineHeight: 1 }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 7 }}>{message}</div>
    </div>
  );
}

export function PatientRow({ patient, active, report, checkIn, onClick }) {
  const symptom = report || checkIn;
  const symptomText = report
    ? `Report: pain ${report.pain}/5, swelling ${report.swelling}/5`
    : checkIn
      ? `Check-in: pain ${checkIn.pain}/10, confidence ${checkIn.confidence}/10`
      : "No new check-in";
  const planLabel = `${patient.assignedExercises.length} exercise${patient.assignedExercises.length === 1 ? "" : "s"}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="pt-patient-row"
      style={{
        border: `1px solid ${active ? C.lime : C.rim}`,
        background: active ? C.limeDim : C.deep,
        color: C.bone,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <div
            className="pt-patient-avatar"
            style={{
              background: `linear-gradient(135deg, ${patient.color}28, ${C.deep})`,
              borderColor: patient.color + "44",
              color: patient.color,
            }}
          >
            {patient.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.bone, lineHeight: 1 }}>{patient.name}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 5 }}>
              {patient.injury} / Week {patient.week}
            </div>
            <div className="pt-patient-meta">
              <span style={{ color: patient.color }}>{patient.stage}</span>
              <span>{patient.status}</span>
              <span>{planLabel}</span>
            </div>
          </div>
        </div>
        {report && !report.ptRead ? <Tag label="Needs review" color={C.red} /> : patient.alert ? <Tag label="Watch" color={C.amber} /> : null}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: symptom ? C.bone : C.muted, lineHeight: 1.45 }}>
        {symptomText}
      </div>
    </button>
  );
}

export function DetailBlock({ label, children, accent = C.rim }) {
  return (
    <div style={{ border: `1px solid ${C.rim}`, borderLeft: `3px solid ${accent}`, background: C.deep, borderRadius: 8, padding: 16 }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 9 }}>{children}</div>
    </div>
  );
}

export function TimelineItem({ item, type, onMarkReviewed }) {
  const isReport = type === "report";
  const title = isReport ? item.exercise : "Session check-in";
  const isUnread = isReport && !item.ptRead;
  const accent = isUnread ? C.red : isReport ? C.blue : C.lime;
  const max = isReport ? 5 : 10;
  const painHigh = item.pain >= (isReport ? 5 : 7);
  const swellingHigh = item.swelling >= (isReport ? 4 : 7);
  const note = isReport ? item.note : item.concern;
  const outcomeLabel = isReport ? item.location : `${item.confidence ?? "-"}/10 confidence`;

  return (
    <article className={`pt-timeline-item${isUnread ? " pt-timeline-item-unread" : ""}`} style={{ "--timeline-accent": accent }}>
      <div className="pt-timeline-marker" aria-hidden="true" />
      <div className="pt-timeline-body">
        <div className="pt-timeline-head">
          <div style={{ minWidth: 0 }}>
            <div className="pt-timeline-title">{title}</div>
            <div className="pt-timeline-meta">
              <span>{formatClinicalDate(item.ts)}</span>
              <span>{relativeTime(item.ts)}</span>
            </div>
          </div>
          <Tag label={isUnread ? "New report" : isReport ? "Reviewed" : "Check-in"} color={accent} />
        </div>

        <div className="pt-timeline-signals">
          <HistoryStat label="Pain" value={`${item.pain ?? "-"}/${max}`} color={painHigh ? C.red : C.bone} detail={painHigh ? "Elevated" : "Reported"} />
          <HistoryStat label="Swelling" value={`${item.swelling ?? "-"}/${max}`} color={swellingHigh ? C.red : C.bone} detail={swellingHigh ? "Elevated" : "Reported"} />
          <HistoryStat label={isReport ? "Location" : "Confidence"} value={outcomeLabel} color={C.bone} detail={isReport ? "Symptom area" : "Self rating"} />
        </div>

        {note ? <p className="pt-timeline-note">{note}</p> : null}

        {isUnread && (
          <button type="button" onClick={onMarkReviewed} className="pt-timeline-action">
            Mark reviewed
          </button>
        )}
      </div>
    </article>
  );
}

export function ProgressCheckRow({ label, value, detail, status = "watch" }) {
  const passed = status === "pass";
  const color = passed ? C.lime : C.amber;

  return (
    <div className="pt-progress-check-row">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, marginTop: 4 }}>{detail}</div>
      </div>
      <Tag label={value} color={color} />
    </div>
  );
}

export function TrendBadge({ label, value, color }) {
  return (
    <div className="pt-trend-badge">
      <Label>{label}</Label>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color, lineHeight: 1, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, detail, tag }) {
  return (
    <header className="pt-header">
      <div>
        <Label color={C.lime}>{eyebrow}</Label>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: C.bone, lineHeight: 1, marginTop: 6 }}>{title}</h1>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 7 }}>
          {detail}
        </div>
      </div>
      {tag}
    </header>
  );
}

export function WorkQueueCard({ title, meta, description, tag, onClick, children }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="pt-queue-card"
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, lineHeight: 1 }}>{title}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{meta}</div>
        </div>
        {tag}
      </div>
      <div style={{ fontSize: 13, color: C.bone, lineHeight: 1.45 }}>{description}</div>
      {children}
    </div>
  );
}
