import { C } from "../../constants/colors";
import { ProgressArc } from "../ui/ProgressArc";
import { SparkLine } from "../ui/SparkLine";

export function ProgressView({ milestones, perfData }) {
  const verticals = perfData.map((d) => d.vertical);
  const squats = perfData.map((d) => d.squat);
  const labels = perfData.map((d) => d.week);
  const achieved = milestones.filter((m) => m.achieved).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
          PERFORMANCE
          <br />
          <span style={{ color: C.lime }}>COMEBACK.</span>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>
          14 weeks post-op · ACL + Meniscus (L)
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <ProgressArc pct={Math.round((achieved / milestones.length) * 100)} size={90} stroke={7} color={C.lime} label="recovery" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, letterSpacing: "0.04em" }}>Phase 2 of 4</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>Early Motion → Strengthening</div>
          <div style={{ display: "flex", gap: 4 }}>
            {milestones.map((m) => (
              <div key={m.id} style={{ flex: 1, height: 4, borderRadius: 1, background: m.achieved ? C.lime : C.rim, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 4 }}>{achieved}/{milestones.length} milestones</div>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Vertical Jump Recovery
        </div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em", marginBottom: 10 }}>
          +18
          <span style={{ fontSize: 16, color: C.muted }}> in gained</span>
        </div>
        <SparkLine data={verticals} color={C.blue} height={52} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: i === labels.length - 1 ? C.blue : C.muted, textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.amber, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Single-leg Squat Load
        </div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em", marginBottom: 10 }}>
          185
          <span style={{ fontSize: 16, color: C.muted }}> lbs</span>
        </div>
        <SparkLine data={squats} color={C.amber} height={52} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: i === labels.length - 1 ? C.amber : C.muted, textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.rim}` }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, letterSpacing: "0.06em" }}>MILESTONE TRACK</div>
        </div>
        {milestones.map((m, i) => (
          <div key={m.id} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < milestones.length - 1 ? `1px solid ${C.ghost}` : "none", background: m.achieved ? C.limeDim : "transparent" }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, background: m.achieved ? C.lime : "transparent", border: `2px solid ${m.achieved ? C.lime : C.rimHi}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.achieved && <span style={{ color: C.black, fontSize: 11, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: m.achieved ? C.bone : C.muted, fontWeight: m.achieved ? 500 : 400 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: m.achieved ? C.lime : C.muted }}>Wk {m.week}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
