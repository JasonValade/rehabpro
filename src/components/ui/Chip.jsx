export default function Chip({ label, color, small, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? "3px 9px" : "5px 12px",
        borderRadius: 20,
        background: active ? color + "28" : color + "12",
        color,
        border: `1px solid ${active ? color + "60" : color + "30"}`,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}