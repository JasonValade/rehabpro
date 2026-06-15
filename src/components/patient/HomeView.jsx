import { Tag } from "../ui/Tag";
import { StatBox } from "../ui/StatBox";
import { C } from "../../constants/colors";

/**
 * @typedef {{ workout: string; highlight: string; details: string }} ScheduleItem
 */

/**
 * @param {{ patientProfile?: any; rehabItems: any[]; milestones: any[]; ptMessage: { time: string; text: string }; lockedExercises: any[]; schedule?: ScheduleItem[]; notification?: { unreadReports?: number } }} props
 */
function CompletionCard({ done, total }) {
  const pct = total ? (done / total) * 100 : 0;

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "14px 14px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <Tag label="RECOVERY" color={C.amber} />
      </div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: done === total ? C.amber : C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
        {done}
        <span style={{ fontSize: 18, color: C.muted }}>/ {total}</span>
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, marginTop: 2 }}>Rehab plan</div>
      <div style={{ marginTop: 10, height: 3, background: C.rim, borderRadius: 1 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: C.amber, borderRadius: 1, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export function HomeView({ patientProfile, rehabItems, milestones, ptMessage, lockedExercises, schedule, notification = {} }) {
  const weeklySchedule = schedule || [];
  const rehabDone = rehabItems.filter((i) => i.done).length;
  const total = rehabItems.length;
  const dayPct = total ? Math.round((rehabDone / total) * 100) : 0;
  const achieved = milestones.filter((m) => m.achieved).length;
  const milestonePct = Math.round((achieved / milestones.length) * 100);
  const headline = patientProfile?.homeHeadline ?? "COME BACK\nSTRONGER.";
  const provider = patientProfile?.provider ?? "Dr. Rivera";

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
            {patientProfile?.homeSubhead ?? "Week 14 · ACL + Meniscus (L)"}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: C.black, lineHeight: 1, letterSpacing: "0.02em" }}>
            {headline.split("\n").map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
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

      {patientProfile ? (
        <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Patient profile
              </div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone, letterSpacing: "0.04em" }}>{patientProfile.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                {patientProfile.injuryType} · {patientProfile.injurySide} · {patientProfile.rehabPhase}
              </div>
            </div>
            <Tag label={patientProfile.oversightMode} color={patientProfile.oversightMode === "PT assigned" ? C.lime : C.blue} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            <div style={{ borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, padding: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                Assigned plan
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.4 }}>{patientProfile.assignedPlan}</div>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, padding: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                Doctor script
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.4 }}>{patientProfile.doctorScriptStatus}</div>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, padding: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                PT oversight
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.4 }}>{patientProfile.ptOversightStatus}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            {patientProfile.planSummary}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatBox label="Recovery" value={milestonePct} unit="%" color={C.lime} sub={`${achieved}/${milestones.length} milestones`} />
        <StatBox label="Today" value={dayPct} unit="%" color={C.blue} sub={`${rehabDone}/${total} exercises complete`} />
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: "14px 16px" }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              {notification.unreadReports ? "Report alert" : "Session reminder"}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.5 }}>
              {notification.unreadReports ? `You have ${notification.unreadReports} update${notification.unreadReports === 1 ? "" : "s"} from PT.` : "No new alerts. Keep progressing."}
            </div>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {notification.unreadReports ? "Review now" : "All clear"}
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Rehab workouts
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime }}>{weeklySchedule.length} workouts this week</div>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginBottom: 12 }}>
            {patientProfile?.ptOversightStatus === "PT assigned" ? "This weekly plan stays active until your PT changes it." : "This starter plan stays active while the script is reviewed."}
          </div>
          {weeklySchedule.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ borderRadius: 14, padding: 16, background: C.deep, border: `1px solid ${C.rim}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: C.bone }}>Next workout</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted, letterSpacing: "0.08em" }}>{weeklySchedule.find((item) => item.highlight === "Active this week")?.highlight ?? "Planned"}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.bone, marginBottom: 8 }}>{weeklySchedule.find((item) => item.highlight === "Active this week")?.workout ?? weeklySchedule[0].workout}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{weeklySchedule.find((item) => item.highlight === "Active this week")?.details ?? weeklySchedule[0].details}</div>
              </div>
            </div>
          )}
        </div>
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
            {provider} · {patientProfile?.ptOversightStatus === "PT assigned" ? "PT" : "Intake"}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{ptMessage.time}</div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.6 }}>
          {patientProfile?.nextStep ?? ptMessage.text}
        </div>
      </div>

      <CompletionCard done={rehabDone} total={total} />

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
