import { useState } from "react";
import { Tag } from "../ui/Tag";
import { C } from "../../constants/colors";

export function PtTrainView({ patient, exerciseNames, onAssign, onUnassign }) {
  const [search, setSearch] = useState("");

  if (!patient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone }}>No patient selected</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>
          Choose a patient from Home to assign and review exercises.
        </div>
      </div>
    );
  }

  const availableExercises = exerciseNames.filter((ex) => !patient.assignedExercises.includes(ex));
  const normalizedSearch = search.trim().toLowerCase();
  const filteredExercises = normalizedSearch
    ? availableExercises.filter((ex) => ex.toLowerCase().includes(normalizedSearch))
    : availableExercises;
  const suggestions = normalizedSearch ? filteredExercises.slice(0, 10) : availableExercises.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, lineHeight: 1.1 }}>{patient.name}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginTop: 4 }}>
            Week {patient.week} · {patient.injury}
          </div>
        </div>
        <Tag label={patient.stage} color={patient.color} />
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>Profile</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>{patient.profile}</div>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>Status</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>{patient.status}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>Assigned exercises</div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{patient.assignedExercises.length} items</div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {patient.assignedExercises.map((name, index) => (
          <div key={`${name}-${index}`} style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.bone }}>{name}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 4 }}>Assigned by you</div>
            </div>
            <button
              type="button"
              onClick={() => onUnassign(patient.id, name)}
              style={{ padding: "10px 14px", background: C.rim, border: "none", borderRadius: 10, color: C.bone, fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.bone, marginBottom: 10 }}>Suggested assignments</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exercises..."
            style={{
              flex: 1,
              minWidth: 180,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${C.rim}`,
              background: C.black,
              color: C.bone,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${C.rim}`,
              background: C.panel,
              color: C.bone,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {suggestions.length > 0 ? (
            suggestions.map((exercise) => (
              <button
                key={exercise}
                type="button"
                onClick={() => onAssign(patient.id, exercise)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: C.limeDim,
                  border: `1px solid ${C.limeMid}`,
                  borderRadius: 12,
                  color: C.bone,
                  textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {exercise}
              </button>
            ))
          ) : (
            <div style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              No matching exercises. Try a different keyword or clear the search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
