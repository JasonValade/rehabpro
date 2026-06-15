import React from "react";
import { C } from "../../constants/colors";

export function ProgressArc({ pct, size = 100, stroke = 8, color = C.lime, label }) {
  const safePct = Math.max(0, Math.min(100, pct));
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safePct / 100) * circ;
  const center = size / 2;
  const innerSize = size - stroke * 4.2;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: `radial-gradient(circle at 50% 45%, ${C.lift} 0%, ${C.deep} 68%, ${C.black} 100%)`,
        boxShadow: `inset 0 0 0 1px ${C.rim}, 0 10px 22px rgba(0, 0, 0, 0.22)`,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <circle cx={center} cy={center} r={r + stroke * 0.55} fill="none" stroke={C.ghost} strokeWidth="1" opacity="0.75" />
        <circle cx={center} cy={center} r={r} fill="none" stroke={C.rim} strokeWidth={stroke} opacity="0.9" />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke + 3}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity="0.16"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: innerSize,
          height: innerSize,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "rgba(8, 9, 9, 0.42)",
          border: `1px solid ${C.rim}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: size * 0.25,
            color,
            lineHeight: 1,
            letterSpacing: "0.02em",
            textShadow: `0 0 14px ${color}55`,
          }}
        >
          {safePct}%
        </div>
        {label && (
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
