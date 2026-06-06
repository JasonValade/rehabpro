export default function Avatar({ initials, color, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        background: color + "22",
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontSize: size * 0.33,
        fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}