import { useState } from "react";
import { Tag } from "../ui/Tag";
import { C } from "../../constants/colors";

export function TrainView({ rehabItems, setRehabItems, gymItems, setGymItems }) {
  const [section, setSection] = useState("rehab");
  const items = section === "rehab" ? rehabItems : gymItems;
  const setItems = section === "rehab" ? setRehabItems : setGymItems;

  const toggle = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 8, padding: 3, gap: 3 }}>
        {[ ["rehab", "REHAB", C.amber], ["gym", "GYM", C.blue] ].map(([id, label, color]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 6,
              background: section === id ? color : "transparent",
              color: section === id ? C.black : C.muted,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 16,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em" }}>
          {section === "rehab" ? "Recovery Protocol" : "Push Day"}
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
          {items.filter((i) => i.done).length}/{items.length} done
        </div>
      </div>
      {items.map((item, idx) => {
        const color = section === "rehab" ? C.amber : C.blue;
        return (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            style={{
              background: item.done ? color + "12" : C.panel,
              border: `1px solid ${item.done ? color + "40" : C.rim}`,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: item.done ? color : C.rimHi, lineHeight: 1, minWidth: 28, textAlign: "center", transition: "color 0.2s" }}>
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: item.done ? C.muted : C.bone, textDecoration: item.done ? "line-through" : "none", transition: "all 0.2s" }}>
                  {item.name}
                </span>
                {item.tag && <Tag label={item.tag} color={color} />}
                {item.pr && <Tag label="PR" color={C.lime} />}
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
                {item.sets} × {item.reps}
                {item.load ? ` · ${item.load} lbs` : ""}
              </div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: item.done ? color : "transparent", border: `2px solid ${item.done ? "transparent" : C.rimHi}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              {item.done && <span style={{ color: C.black, fontSize: 13, fontWeight: 900 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
