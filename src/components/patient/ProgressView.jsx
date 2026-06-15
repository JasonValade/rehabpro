import { C } from "../../constants/colors";
import { ProgressArc } from "../ui/ProgressArc";
import { SparkLine } from "../ui/SparkLine";

function TrendCard({ label, value, unit, data, color, direction, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em" }}>
            {value}
            <span style={{ fontSize: 16, color: C.muted }}> {unit}</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {direction}
        </div>
      </div>
      <SparkLine data={data} color={color} height={48} />
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 8 }}>{sub}</div>
    </div>
  );
}

/**
 * @param {{ patientProfile?: any; milestones: any[]; progressData?: any[]; completionHistory?: any[]; checkIns?: any[] }} props
 */
export function ProgressView({ patientProfile, milestones, progressData, completionHistory, checkIns = [] }) {
  const sessionProgress = [...checkIns]
    .sort((a, b) => a.ts - b.ts)
    .map((checkIn) => ({
      label: new Date(checkIn.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      pain: checkIn.pain,
      swelling: checkIn.swelling,
      difficulty: checkIn.difficulty,
      completion: checkIn.completion,
    }));
  const recoveryProgress = [...(progressData || []), ...sessionProgress];
  const savedCompletionDays = checkIns.slice(-7).map((checkIn) => ({
    day: new Date(checkIn.ts).toLocaleDateString(undefined, { weekday: "short" }),
    done: checkIn.done,
    total: checkIn.total,
  }));
  const completionDays = savedCompletionDays.length ? savedCompletionDays : completionHistory || [];
  const achieved = milestones.filter((m) => m.achieved).length;
  const latest = recoveryProgress[recoveryProgress.length - 1] || { pain: 0, swelling: 0, rom: 0, difficulty: 0, completion: 0 };
  const first = recoveryProgress[0] || latest;
  const painSeries = recoveryProgress.map((d) => d.pain);
  const swellingSeries = recoveryProgress.map((d) => d.swelling);
  const romSeries = recoveryProgress.filter((d) => typeof d.rom === "number").map((d) => d.rom);
  const difficultySeries = recoveryProgress.map((d) => d.difficulty);
  const completionSeries = recoveryProgress.map((d) => d.completion);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
          PERFORMANCE
          <br />
          <span style={{ color: C.lime }}>COMEBACK.</span>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>
          {patientProfile?.progressSubhead ?? "14 weeks post-op · ACL + Meniscus (L)"}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <ProgressArc pct={Math.round((achieved / milestones.length) * 100)} size={90} stroke={7} color={C.lime} label="recovery" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, letterSpacing: "0.04em" }}>{patientProfile?.phaseLabel ?? "Phase 2 of 4"}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>{patientProfile?.rehabPhase ?? "Early Motion"} → Strengthening</div>
          <div style={{ display: "flex", gap: 4 }}>
            {milestones.map((m) => (
              <div key={m.id} style={{ flex: 1, height: 4, borderRadius: 1, background: m.achieved ? C.lime : C.rim, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 4 }}>{achieved}/{milestones.length} milestones</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <div style={{ background: C.limeDim, border: `1px solid ${C.lime}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Pain improved
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone }}>
            {first.pain} → {latest.pain}
            <span style={{ fontSize: 14, color: C.muted }}> /10</span>
          </div>
        </div>
        <div style={{ background: C.blueDim, border: `1px solid ${C.blue}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Range gained
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone }}>
            +{(recoveryProgress.filter((item) => typeof item.rom === "number").at(-1)?.rom ?? first.rom) - first.rom}°
            <span style={{ fontSize: 14, color: C.muted }}> flexion</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <TrendCard label="Pain" value={latest.pain} unit="/10" data={painSeries} color={C.lime} direction="Down" sub="Morning pain has dropped while exercise tolerance has improved." />
        <TrendCard label="Swelling" value={latest.swelling} unit="/10" data={swellingSeries} color={C.blue} direction="Down" sub="Swelling response is staying low after higher completion days." />
        <TrendCard label="Range of Motion" value={recoveryProgress.filter((item) => typeof item.rom === "number").at(-1)?.rom ?? 0} unit="degrees" data={romSeries} color={C.amber} direction="Up" sub="Knee flexion is trending toward the next milestone target." />
        <TrendCard label="Difficulty" value={latest.difficulty} unit="/10" data={difficultySeries} color={C.red} direction="Down" sub="The same plan feels easier as strength and control return." />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              Completion History
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em" }}>
              {latest.completion}
              <span style={{ fontSize: 16, color: C.muted }}> % weekly</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            +{latest.completion - first.completion} pts
          </div>
        </div>
        <SparkLine data={completionSeries} color={C.lime} height={48} />
        <div style={{ display: "flex", alignItems: "end", gap: 7, minHeight: 86, marginTop: 14 }}>
          {completionDays.map((day) => {
            const pct = Math.round((day.done / day.total) * 100);
            return (
              <div key={day.day} style={{ flex: 1, display: "grid", gap: 6, alignItems: "end" }}>
                <div style={{ height: 52, display: "flex", alignItems: "end" }}>
                  <div style={{ width: "100%", height: `${pct}%`, minHeight: 6, borderRadius: "6px 6px 2px 2px", background: day.day === "Today" ? C.amber : C.lime }} />
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: day.day === "Today" ? C.amber : C.muted, textAlign: "center", textTransform: "uppercase" }}>{day.day}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.bone, textAlign: "center" }}>{day.done}/{day.total}</div>
              </div>
            );
          })}
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
