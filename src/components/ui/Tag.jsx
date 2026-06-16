import React from "react";
import { C } from "../../constants/colors";

export function Tag({ label, color = C.lime }) {
  return (
    <span
      style={{
        fontFamily: "'Fira Code', monospace",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color,
        background: color + "18",
        border: `1px solid ${color}30`,
        padding: "2px 7px",
        borderRadius: 3,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
