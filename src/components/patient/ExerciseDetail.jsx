import { C } from "../../constants/colors";

const DEFAULT_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function ExerciseDetail({ exercise }) {
  if (!exercise) {
    return (
      <div style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6 }}>
        Select an exercise to review movement cues, session progression rules, and demo guidance.
      </div>
    );
  }

  const instructions = exercise.instructions || exercise.cue || "Perform the movement with control and tolerance first."
  const progression = exercise.progression || "Progress when movement is comfortable, then add resistance or reps one step at a time while keeping form clean."
  const videoSrc = exercise.video || DEFAULT_VIDEO;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone, lineHeight: 1.1 }}>{exercise.name}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
              {exercise.stage ? `${exercise.stage.join(" · ")}` : "Exercise details"}
            </div>
          </div>
          <div style={{ display: "grid", gap: 6, textAlign: "right" }}>
            {exercise.muscles ? <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone }}>Targets {exercise.muscles}</div> : null}
            {exercise.equipment ? <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{exercise.equipment}</div> : null}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <div style={{ background: C.deep, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: "'Fira Neue', cursive", fontSize: 12, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Sets</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.bone }}>{exercise.sets || "—"}</div>
          </div>
          <div style={{ background: C.deep, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: "'Fira Neue', cursive", fontSize: 12, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Reps</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.bone }}>{exercise.reps || "—"}</div>
          </div>
          <div style={{ background: C.deep, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: "'Fira Neue', cursive", fontSize: 12, color: C.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Progression</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.bone }}>{exercise.difficulty ? `Level ${exercise.difficulty}` : "Baseline"}</div>
          </div>
        </div>
      </div>

      <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${C.rim}` }}>
        <video
          controls
          aria-label={`Video demo for ${exercise.name}`}
          style={{ width: "100%", height: "auto", display: "block", background: C.black }}
          src={videoSrc}
        >
          Your browser does not support embedded video.
        </video>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Technique
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.7 }}>{instructions}</div>
        </div>
        <div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Progression rules
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.7 }}>{progression}</div>
        </div>
      </div>
    </div>
  );
}
