import { Tag } from "../ui/Tag";
import { StatBox } from "../ui/StatBox";
import { C } from "../../constants/colors";

export function HomeView({ rehabItems, gymItems, milestones, ptMessage, lockedExercises }) {
  const rehabDone = rehabItems.filter((i) => i.done).length;
  const gymDone = gymItems.filter((i) => i.done).length;
  const totalDone = rehabDone + gymDone;
  const total = rehabItems.length + gymItems.length;
  const dayPct = Math.round((totalDone / total) * 100);
  const achieved = milestones.filter((m) => m.achieved).length;
  const milestonePct = Math.round((achieved / milestones.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          background: C.lime,
          borderRadius: 12,
          padding: "20px 20px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 11px)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.black + "80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
            Week 14 · ACL + Meniscus (L)
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: C.black, lineHeight: 1, letterSpacing: "0.02em" }}>
            COME BACK
            <br />STRONGER.
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: C.black + "20", borderRadius: 2 }}>
              <div
                style={{
                  width: `${dayPct}%`,
                  height: "100%",
                  background: C.black,
                  borderRadius: 2,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.black, fontWeight: 600 }}>{dayPct}% today</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <StatBox label="Recovery" value={milestonePct} unit="%" color={C.lime} sub={`${achieved}/${milestones.length} milestones`} />
        <StatBox label="Vertical" value={" +18"} unit="in" color={C.blue} sub="from baseline" />
      </div>

      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.rim}`,
          borderLeft: `3px solid ${C.lime}`,
          borderRadius: "0 8px 8px 0",
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Dr. Rivera · PT
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{ptMessage.time}</div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.6 }}>{ptMessage.text}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Rehab", done: rehabDone, total: rehabItems.length, color: C.amber, tag: "RECOVERY" },
          { label: "Push Day", done: gymDone, total: gymItems.length, color: C.blue, tag: "STRENGTH" },
        ].map((s) => (
          <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "14px 14px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Tag label={s.tag} color={s.color} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: s.done === s.total ? s.color : C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
              {s.done}
              <span style={{ fontSize: 18, color: C.muted }}>/ {s.total}</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
            <div style={{ marginTop: 10, height: 3, background: C.rim, borderRadius: 1 }}>
              <div style={{ width: `${(s.done / s.total) * 100}%`, height: "100%", background: s.color, borderRadius: 1, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px 8px", borderBottom: `1px solid ${C.rim}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Locked · Unlock via milestones
          </div>
        </div>
        {lockedExercises.map((ex, i) => (
          <div key={i} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < lockedExercises.length - 1 ? `1px solid ${C.ghost}` : "none" }}>
            <div style={{ fontSize: 14 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, fontWeight: 500 }}>{ex.name}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: ex.color + "80", marginTop: 1 }}>Unlocks after: {ex.unlocksAt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
