import { useEffect, useState } from "react";
import { Tag } from "../ui/Tag";
import { C } from "../../constants/colors";
import { EXERCISE_LIBRARY } from "../../data/exerciseLibrary";
import { ExerciseDetail } from "./ExerciseDetail";

function findExercise(name) {
  const normalized = name.toLowerCase();
  return EXERCISE_LIBRARY.find(
    (exercise) =>
      exercise.name.toLowerCase() === normalized ||
      normalized.includes(exercise.name.toLowerCase()) ||
      exercise.name.toLowerCase().includes(normalized)
  );
}

export function TrainView({ rehabItems, setRehabItems, gymItems, setGymItems }) {
  const [section, setSection] = useState("rehab");
  const items = section === "rehab" ? rehabItems : gymItems;
  const setItems = section === "rehab" ? setRehabItems : setGymItems;
  const [selectedExerciseId, setSelectedExerciseId] = useState(items[0]?.id ?? null);

  useEffect(() => {
    if (!items.some((item) => item.id === selectedExerciseId)) {
      setSelectedExerciseId(items[0]?.id ?? null);
    }
  }, [items, selectedExerciseId]);

  const toggle = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const selectedItem = items.find((item) => item.id === selectedExerciseId);
  const selectedExerciseData = selectedItem ? findExercise(selectedItem.name) : null;
  const detailExercise = selectedItem
    ? {
        name: selectedItem.name,
        sets: selectedItem.sets,
        reps: selectedItem.reps,
        load: selectedItem.load,
        ...selectedExerciseData,
      }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 8, padding: 3, gap: 3 }}>
        {[
          ["rehab", "REHAB", C.amber],
          ["gym", "GYM", C.blue],
        ].map(([id, label, color]) => (
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em" }}>
          {section === "rehab" ? "Recovery Protocol" : "Push Day"}
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
          {items.filter((i) => i.done).length}/{items.length} done
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, idx) => {
          const color = section === "rehab" ? C.amber : C.blue;
          const active = item.id === selectedExerciseId;
          return (
            <div
              key={item.id}
              style={{
                background: active ? C.deep : item.done ? color + "12" : C.panel,
                border: `1px solid ${active ? C.lime : item.done ? color + "40" : C.rim}`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                gap: 14,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-label={`${item.done ? "Mark incomplete" : "Mark complete"} ${item.name}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: `2px solid ${item.done ? color : C.rimHi}`,
                  background: item.done ? color : "transparent",
                  color: item.done ? C.black : C.muted,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {item.done ? "✓" : idx + 1}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setSelectedExerciseId(item.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15,
                    color: C.bone,
                    cursor: "pointer",
                  }}
                >
                  {item.name}
                </button>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
                  {item.sets} × {item.reps}
                  {item.load ? ` · ${item.load} lbs` : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedExerciseId(item.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${active ? C.lime : C.rim}`,
                  background: active ? C.limeDim : C.panel,
                  color: active ? C.lime : C.bone,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Details
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>Exercise details</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Tap a movement to review technique, video, and progression.
            </div>
          </div>
          {detailExercise?.difficulty ? (
            <Tag label={`Level ${detailExercise.difficulty}`} color={C.lime} />
          ) : null}
        </div>
        <ExerciseDetail exercise={detailExercise} />
      </div>
    </div>
  );
}
