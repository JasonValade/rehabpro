import React from "react";
import { C } from "../../constants/colors";
import { Tag } from "./Tag";

function Label({ children, color = C.muted }) {
  return (
    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

export function SymptomReportCard({ report, sourceReport, onMarkReviewed, statusLabel, maxWidth = "560px" }) {
  const isReviewed = Boolean(sourceReport?.ptRead);
  const accent = isReviewed ? C.lime : C.red;
  const label = statusLabel || (isReviewed ? "Reviewed" : "Needs review");

  return (
    <div style={{ width: `min(100%, ${maxWidth})`, border: `1px solid ${accent}55`, background: isReviewed ? C.limeDim : C.redDim, borderRadius: 8, padding: 12, display: "grid", gap: 10, minWidth: 260 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <Label color={accent}>Symptom report</Label>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 23, color: C.bone, lineHeight: 1, marginTop: 6 }}>{report.exercise || "General"}</div>
        </div>
        <Tag label={label} color={accent} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
        <div style={{ border: `1px solid ${C.rim}`, background: C.deep, borderRadius: 7, padding: "9px 10px" }}>
          <Label>Pain</Label>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone, lineHeight: 1, marginTop: 5 }}>{report.pain || "0/5"}</div>
        </div>
        <div style={{ border: `1px solid ${C.rim}`, background: C.deep, borderRadius: 7, padding: "9px 10px" }}>
          <Label>Swelling</Label>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone, lineHeight: 1, marginTop: 5 }}>{report.swelling || "0/5"}</div>
        </div>
        <div style={{ border: `1px solid ${C.rim}`, background: C.deep, borderRadius: 7, padding: "9px 10px", minWidth: 0 }}>
          <Label>Location</Label>
          <div style={{ fontSize: 12, color: C.bone, lineHeight: 1.35, marginTop: 6, overflowWrap: "anywhere" }}>{report.location || "Not specified"}</div>
        </div>
      </div>
      {report.note ? (
        <div style={{ borderTop: `1px solid ${accent}30`, paddingTop: 9, color: C.bone, fontSize: 13, lineHeight: 1.5 }}>
          {report.note}
        </div>
      ) : null}
      {!isReviewed && sourceReport ? (
        <button
          type="button"
          onClick={onMarkReviewed}
          style={{ justifySelf: "start", padding: "10px 12px", border: `1px solid ${C.red}55`, borderRadius: 7, background: C.panel, color: C.bone, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Mark as read
        </button>
      ) : null}
    </div>
  );
}
