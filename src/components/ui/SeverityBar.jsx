import { C } from "../../constants/theme";

export default function SeverityBar({ value, max = 5, color }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 5,
            borderRadius: 2,
            background: i < value ? color : C.border,
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}