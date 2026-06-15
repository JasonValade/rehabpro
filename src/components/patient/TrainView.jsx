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

function ExerciseCard({ item, index, onToggle, onDetails }) {
  const color = C.amber;

  return (
    <div
      style={{
        background: item.done ? color + "12" : C.panel,
        border: `1px solid ${item.done ? color + "40" : C.rim}`,
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
        onClick={onToggle}
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
        {item.done ? "✓" : index + 1}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: C.bone }}>{item.name}</div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
          {item.sets} × {item.reps}
          {item.load ? ` · ${item.load} lbs` : ""}
        </div>
        {item.reminder ? (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: item.done ? C.muted : C.bone, lineHeight: 1.4 }}>
            {item.reminder}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onDetails}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${C.rim}`,
          background: C.panel,
          color: C.bone,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        Details
      </button>
    </div>
  );
}

export function TrainView({ rehabItems, setRehabItems }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);

  useEffect(() => {
    if (selectedExerciseId && !rehabItems.some((item) => item.id === selectedExerciseId)) {
      setSelectedExerciseId(null);
    }
  }, [rehabItems, selectedExerciseId]);

  const toggle = (id) => setRehabItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const selectedItem = rehabItems.find((item) => item.id === selectedExerciseId);
  const selectedExerciseData = selectedItem ? findExercise(selectedItem.name) : null;
  const detailExercise = selectedItem
    ? {
        ...selectedExerciseData,
        name: selectedItem.name,
        sets: selectedItem.sets,
        reps: selectedItem.reps,
        load: selectedItem.load,
        tag: selectedItem.tag,
        reminder: selectedItem.reminder,
        instructions: selectedItem.instructions,
        clinicalNotes: selectedItem.clinicalNotes,
        videoStatus: selectedItem.videoStatus,
        youtubeId: selectedItem.youtubeId,
        youtubeUrl: selectedItem.youtubeUrl,
        videoEmbed: selectedItem.videoEmbed,
        done: selectedItem.done,
      }
    : null;
  const completed = rehabItems.filter((i) => i.done).length;
  const total = rehabItems.length;

  if (detailExercise) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => setSelectedExerciseId(null)}
            aria-label="Back to plan"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: `1px solid ${C.rim}`,
              background: C.panel,
              color: C.bone,
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Back to plan
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em" }}>
              Exercise details
            </div>
          </div>
          {detailExercise?.difficulty ? <Tag label={`Level ${detailExercise.difficulty}`} color={C.lime} /> : null}
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 16 }}>
          <ExerciseDetail exercise={detailExercise} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em" }}>
            {"Today's Knee Rehab"}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginTop: 4 }}>
            Halfway-through ACL + meniscus plan. Discomfort is fine, pain is not.
          </div>
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: completed === total ? C.lime : C.muted }}>
          {completed}/{total} complete
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rehabItems.map((item, idx) => (
          <ExerciseCard
            key={item.id}
            item={item}
            index={idx}
            onToggle={() => toggle(item.id)}
            onDetails={() => setSelectedExerciseId(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
