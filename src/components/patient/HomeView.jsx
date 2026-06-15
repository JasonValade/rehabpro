import { Tag } from "../ui/Tag";
import { C } from "../../constants/colors";

/**
 * @typedef {{ workout: string; highlight: string; details: string }} ScheduleItem
 */

const monoLabel = {
  fontFamily: "'Fira Code', monospace",
  fontSize: 9,
  color: C.muted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

function Metric({ label, value, detail, color = C.lime, valueSize = 28 }) {
  return (
    <div style={{ minWidth: 0, padding: 14, borderRadius: 14, background: C.panel, border: `1px solid ${C.rim}` }}>
      <div style={monoLabel}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: valueSize, color, lineHeight: 1, marginTop: 8 }}>{value}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.4, marginTop: 5 }}>{detail}</div>
    </div>
  );
}

/**
 * @param {{ patientProfile?: any; rehabItems: any[]; milestones: any[]; ptMessage: { time: string; text: string }; schedule?: ScheduleItem[]; notification?: { unreadReports?: number }; onNavigate?: (tab: string) => void }} props
 */
export function HomeView({ patientProfile, rehabItems, milestones, ptMessage, schedule = [], notification = {}, onNavigate }) {
  const rehabDone = rehabItems.filter((item) => item.done).length;
  const total = rehabItems.length;
  const dayPct = total ? Math.round((rehabDone / total) * 100) : 0;
  const achieved = milestones.filter((milestone) => milestone.achieved).length;
  const milestonePct = milestones.length ? Math.round((achieved / milestones.length) * 100) : 0;
  const nextExercise = rehabItems.find((item) => !item.done);
  const nextMilestone = milestones.find((milestone) => !milestone.achieved);
  const activeWorkout = schedule.find((item) => item.highlight === "Active this week") ?? schedule[0];
  const provider = patientProfile?.provider ?? "Dr. Rivera";
  const isComplete = total > 0 && rehabDone === total;
  const firstName = patientProfile?.name?.split(" ")[0] ?? "Athlete";
  const isIntake = patientProfile?.week === 0;
  const heroTitle = isComplete ? "SESSION COMPLETE" : isIntake ? "START WITH THE SCRIPT" : `KEEP MOVING, ${firstName}`;
  const noteLabel = patientProfile?.ptOversightStatus === "PT assigned" ? "PT note" : "Care note";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          padding: "20px 18px 18px",
          background: C.lime,
          color: C.black,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            border: "38px solid rgba(8,9,9,0.06)",
            right: -72,
            top: -88,
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ ...monoLabel, color: "rgba(8,9,9,0.58)", marginBottom: 8 }}>
            {patientProfile?.homeSubhead ?? "Today's recovery plan"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, lineHeight: 0.95, letterSpacing: "0.02em" }}>
                {heroTitle}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, marginTop: 9, maxWidth: 235 }}>
                {isComplete ? "Today's work is done. Give your knee time to recover." : `${total - rehabDone} exercise${total - rehabDone === 1 ? "" : "s"} left in today's plan.`}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 44, lineHeight: 0.9 }}>{dayPct}%</div>
              <div style={{ ...monoLabel, color: "rgba(8,9,9,0.58)", marginTop: 5 }}>Today</div>
            </div>
          </div>

          <div style={{ height: 6, background: "rgba(8,9,9,0.16)", borderRadius: 999, marginTop: 18, overflow: "hidden" }}>
            <div style={{ width: `${dayPct}%`, height: "100%", background: C.black, borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.("train")}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 13,
              padding: "13px 16px",
              marginTop: 16,
              background: C.black,
              color: C.bone,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>{isComplete ? "Review today's session" : rehabDone ? "Continue rehab" : "Start today's rehab"}</span>
            <span aria-hidden="true" style={{ fontSize: 17 }}>→</span>
          </button>
        </div>
      </section>

      {nextExercise ? (
        <section style={{ padding: 16, borderRadius: 16, background: C.panel, border: `1px solid ${C.rim}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 13 }}>
            <div style={monoLabel}>Up next</div>
            <Tag label={nextExercise.tag ?? "Exercise"} color={C.amber} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", background: C.amberDim, border: `1px solid ${C.amber}40`, color: C.amber, fontFamily: "'Bebas Neue', cursive", fontSize: 18 }}>
              {rehabDone + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.bone, fontWeight: 600 }}>{nextExercise.name}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 5 }}>
                {nextExercise.sets} sets × {nextExercise.reps}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("train")}
              aria-label={`Open ${nextExercise.name}`}
              style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.rimHi}`, background: C.deep, color: C.bone, fontSize: 17 }}
            >
              →
            </button>
          </div>
        </section>
      ) : null}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Metric label="Recovery" value={`${milestonePct}%`} detail={`${achieved} of ${milestones.length} milestones`} />
        <Metric label="Next target" value={nextMilestone?.label ?? "Cleared"} detail={nextMilestone ? `Target week ${nextMilestone.week}` : "All milestones reached"} color={C.blue} valueSize={21} />
      </section>

      {notification.unreadReports ? (
        <button
          type="button"
          onClick={() => onNavigate?.("report")}
          style={{ width: "100%", padding: "13px 14px", borderRadius: 14, border: `1px solid ${C.blue}45`, background: C.blueDim, color: C.bone, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{notification.unreadReports} report{notification.unreadReports === 1 ? "" : "s"} awaiting PT review</span>
          <span style={{ ...monoLabel, color: C.blue }}>Open →</span>
        </button>
      ) : null}

      <section style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={monoLabel}>Current plan</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 21, color: C.bone, marginTop: 6 }}>{patientProfile?.rehabPhase ?? "Recovery"}</div>
          </div>
          <Tag label={patientProfile?.phaseLabel ?? patientProfile?.oversightMode ?? "Active"} color={C.lime} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <div style={{ padding: 11, background: C.deep, borderRadius: 12 }}>
            <div style={monoLabel}>This week</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.4, marginTop: 6 }}>{activeWorkout?.workout ?? patientProfile?.assignedPlan ?? "Plan pending"}</div>
          </div>
          <div style={{ padding: 11, background: C.deep, borderRadius: 12 }}>
            <div style={monoLabel}>Oversight</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.4, marginTop: 6 }}>{patientProfile?.ptOversightStatus ?? "PT assigned"}</div>
          </div>
        </div>
        {activeWorkout?.details ? <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 12 }}>{activeWorkout.details}</div> : null}
      </section>

      <section style={{ background: C.panel, border: `1px solid ${C.rim}`, borderLeft: `3px solid ${C.lime}`, borderRadius: "0 14px 14px 0", padding: "14px 15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ ...monoLabel, color: C.lime }}>{provider} · {noteLabel}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: C.muted }}>{ptMessage.time}</div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.6 }}>{patientProfile?.nextStep ?? ptMessage.text}</div>
        <button type="button" onClick={() => onNavigate?.("pt")} style={{ border: "none", background: "transparent", color: C.lime, padding: "11px 0 0", fontFamily: "'Fira Code', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Open messages →
        </button>
      </section>

    </div>
  );
}
