import React from "react";
import { C } from "../../constants/colors";
import { getYouTubeVideoId } from "../../utils/youtube";

export function ExerciseDetail({ exercise }) {
  const [showNotes, setShowNotes] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    setIsPlaying(false);
  }, [exercise?.id, exercise?.name]);

  if (!exercise) {
    return (
      <div style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6 }}>
        Select an exercise to review movement cues, session progression rules, and demo guidance.
      </div>
    );
  }

  const instructions = exercise.instructions || exercise.cue || "Perform the movement with control and tolerance first."
  const progression = exercise.progression || "Progress when movement is comfortable, then add resistance or reps one step at a time while keeping form clean."
  const clinicalNotes = exercise.clinicalNotes || "Keep symptoms below the pain-monitoring threshold and report swelling changes at the next check-in."
  const youtubeVideoId = getYouTubeVideoId(exercise);
  const youtubeEmbedUrl = youtubeVideoId ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}${isPlaying ? "?autoplay=1&rel=0" : ""}` : "";
  const youtubeWatchUrl = youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : "";
  const videoStatus = youtubeVideoId ? "Video demo" : exercise.videoStatus || "Demo placeholder";
  const detailMeta = exercise.tag ? `${exercise.tag} · ${videoStatus}` : exercise.stages ? `${exercise.stages.join(" · ")}` : "Exercise details"
  const stats = [
    { label: "Sets", value: exercise.sets || "-", color: C.lime },
    { label: "Reps", value: exercise.reps || "-", color: C.blue },
    { label: "Level", value: exercise.difficulty ? exercise.difficulty : "Base", color: C.amber },
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, lineHeight: 0.95, letterSpacing: "0.02em" }}>{exercise.name}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ borderRadius: 999, border: `1px solid ${C.rim}`, background: C.deep, padding: "6px 9px", fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {detailMeta}
            </div>
            {exercise.equipment ? (
              <div style={{ borderRadius: 999, border: `1px solid ${C.rim}`, background: C.deep, padding: "6px 9px", fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {exercise.equipment}
              </div>
            ) : null}
          </div>
          {exercise.muscles ? (
            <div style={{ borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, padding: "10px 12px", display: "grid", gap: 3 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Targets</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.4 }}>{exercise.muscles}</div>
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: C.deep, border: `1px solid ${C.rim}`, borderTop: `2px solid ${stat.color}`, borderRadius: "0 0 10px 10px", padding: "11px 12px", minWidth: 0 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, lineHeight: 1, letterSpacing: "0.02em", overflowWrap: "anywhere" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {youtubeVideoId ? (
        <div style={{ display: "grid", gap: 9 }}>
          <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${C.rim}`, background: C.black, aspectRatio: "16 / 9", position: "relative" }}>
            {isPlaying ? (
              <iframe
                src={youtubeEmbedUrl}
                title={`${exercise.name} video demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label={`Play ${exercise.name} video demo`}
                style={{ width: "100%", height: "100%", padding: 0, border: "none", background: C.black, display: "block", position: "relative", overflow: "hidden" }}
              >
                <img src={`https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.78 }} />
                <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.55))" }}>
                  <span style={{ width: 62, height: 62, borderRadius: "50%", display: "grid", placeItems: "center", paddingLeft: 4, background: C.lime, color: C.black, fontSize: 25, boxShadow: "0 8px 30px rgba(0,0,0,0.45)" }}>▶</span>
                </span>
                <span style={{ position: "absolute", left: 12, bottom: 10, color: C.bone, fontFamily: "'Fira Code', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tap to play technique demo</span>
              </button>
            )}
          </div>
          <a href={youtubeWatchUrl} target="_blank" rel="noreferrer" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 11, textAlign: "right", textDecoration: "none" }}>
            Video not loading? Open on YouTube ↗
          </a>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Video demo placeholder for ${exercise.name}`}
          style={{
            minHeight: 172,
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${C.rim}`,
            background: `linear-gradient(135deg, ${C.deep}, ${C.panel})`,
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div style={{ position: "relative", display: "grid", placeItems: "center", gap: 10 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: C.lime,
                color: C.black,
                display: "grid",
                placeItems: "center",
                fontSize: 24,
                fontWeight: 900,
                paddingLeft: 4,
              }}
            >
              ▶
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Add YouTube ID or URL in rehabMock.js
            </div>
          </div>
        </div>
      )}

      {exercise.reminder ? (
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${C.amber}`,
            background: C.amberDim,
            padding: "11px 12px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: C.bone,
            lineHeight: 1.5,
          }}
        >
          {exercise.reminder}
        </div>
      ) : null}

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

      <div style={{ borderTop: `1px solid ${C.rim}`, paddingTop: 12 }}>
        <button
          type="button"
          onClick={() => setShowNotes((value) => !value)}
          style={{
            width: "100%",
            border: `1px solid ${showNotes ? C.lime : C.rim}`,
            background: showNotes ? C.limeDim : C.deep,
            color: showNotes ? C.lime : C.bone,
            borderRadius: 12,
            padding: "11px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
          }}
        >
          <span>Show more clinical notes</span>
          <span style={{ fontFamily: "'Fira Code', monospace", color: showNotes ? C.lime : C.muted }}>{showNotes ? "Hide" : "Open"}</span>
        </button>
        {showNotes ? (
          <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, padding: 12 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              PT notes
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.7 }}>{clinicalNotes}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
