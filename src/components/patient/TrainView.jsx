import React, { useEffect, useState } from "react";
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

function RatingField({ label, value, onChange, lowLabel, highLabel, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 9 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color }}>{value}<span style={{ fontSize: 12, color: C.muted }}> /10</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 3 }}>
        {Array.from({ length: 11 }, (_, rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            aria-label={`${label} ${rating} out of 10`}
            aria-pressed={value === rating}
            style={{
              minWidth: 0,
              height: 29,
              borderRadius: 6,
              border: `1px solid ${value === rating ? color : C.rim}`,
              background: value === rating ? color + "25" : C.deep,
              color: value === rating ? color : C.muted,
              fontFamily: "'Fira Code', monospace",
              fontSize: 9,
            }}
          >
            {rating}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "'Fira Code', monospace", fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function SessionCheckIn({ completed, total, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({ pain: null, swelling: null, difficulty: null });
  const skipped = total - completed;
  const canSubmit = Object.values(ratings).every((rating) => rating !== null);

  const submit = () => {
    if (!canSubmit) return;

    onSubmit?.({
      ...ratings,
      done: completed,
      total,
      completion: total ? Math.round((completed / total) * 100) : 0,
    });
    setSubmitted(true);
    setIsOpen(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: 16, borderRadius: 16, background: C.limeDim, border: `1px solid ${C.lime}55` }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.lime }}>SESSION SAVED</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 4 }}>
          Your check-in and {completed}/{total} completion have been added to Progress.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, borderRadius: 16, background: C.panel, border: `1px solid ${isOpen ? C.lime + "60" : C.rim}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.lime, letterSpacing: "0.1em", textTransform: "uppercase" }}>Finished for today?</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 6 }}>
            Submit even if you skipped exercises. Your progress will show {completed} complete and {skipped} skipped.
          </div>
        </div>
      </div>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ width: "100%", padding: "13px 16px", marginTop: 14, border: "none", borderRadius: 12, background: C.lime, color: C.black, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}
        >
          End session and check in
        </button>
      ) : (
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          <RatingField label="Pain" value={ratings.pain ?? "–"} onChange={(pain) => setRatings((current) => ({ ...current, pain }))} lowLabel="No pain" highLabel="Severe" color={C.red} />
          <RatingField label="Swelling" value={ratings.swelling ?? "–"} onChange={(swelling) => setRatings((current) => ({ ...current, swelling }))} lowLabel="None" highLabel="Severe" color={C.blue} />
          <RatingField label="Difficulty" value={ratings.difficulty ?? "–"} onChange={(difficulty) => setRatings((current) => ({ ...current, difficulty }))} lowLabel="Easy" highLabel="Very hard" color={C.amber} />
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8 }}>
            <button type="button" onClick={() => setIsOpen(false)} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, color: C.muted, fontSize: 12 }}>
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={!canSubmit} style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: C.lime, color: C.black, fontSize: 12, fontWeight: 700, opacity: canSubmit ? 1 : 0.35 }}>
              Save session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TrainView({ rehabItems, setRehabItems, onSubmitCheckIn }) {
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

      <SessionCheckIn completed={completed} total={total} onSubmit={onSubmitCheckIn} />
    </div>
  );
}
