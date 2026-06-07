import { C } from "../../constants/colors";

export function ProgressArc({ pct, size = 100, stroke = 8, color = C.lime, label }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.rim} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
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
            fontSize: size * 0.22,
            color,
            lineHeight: 1,
          }}
        >
          {pct}%
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
