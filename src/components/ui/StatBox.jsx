import { C } from "../../constants/colors";

export function StatBox({ label, value, unit, color = C.lime, sub }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.rim}`,
        borderTop: `2px solid ${color}`,
        borderRadius: "0 0 8px 8px",
        padding: "14px 16px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 10,
          color: C.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 36,
          color,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {value}
        <span style={{ fontSize: 16, color: C.muted, marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: C.muted,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
