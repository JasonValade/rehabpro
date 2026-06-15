import React, { useState } from "react";
import { C } from "../../constants/colors";
import { ProgressArc } from "../ui/ProgressArc";
import { SparkLine } from "../ui/SparkLine";

const TABS = ["Symptoms", "Completion", "ROM", "Milestones"];

function Panel({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 8, padding: 16, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, color = C.lime }) {
  return (
    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
}

function numberOrDefault(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function completionPct(day) {
  const total = numberOrDefault(day.total);
  const done = numberOrDefault(day.done);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function lastNumber(items, key, fallback = 0) {
  const item = [...items].reverse().find((entry) => Number.isFinite(entry[key]));
  return item ? item[key] : fallback;
}

function changeLabel(delta, metric, improveDirection = "down") {
  if (delta === 0) return "Stable";
  const improved = improveDirection === "down" ? delta < 0 : delta > 0;
  const direction = delta > 0 ? "up" : "down";
  return `${improved ? "Improved" : "Worse"}, ${direction} ${Math.abs(delta)} ${metric}`;
}

function getRecentDelta(series, count = 3) {
  if (series.length < 2) return 0;
  const start = series[Math.max(0, series.length - count - 1)];
  const end = series[series.length - 1];
  return end - start;
}

function getStatus({ latest, recentPainDelta, recentSwellingDelta, weeklyCompletion }) {
  if (latest.pain >= 7 || latest.swelling >= 6 || recentPainDelta >= 2 || recentSwellingDelta >= 2) {
    return {
      label: "Needs PT Review",
      color: C.red,
      bg: C.redDim,
      nextStep: "Message your PT before progressing the next session.",
      summary: "Symptoms are high or trending upward. Hold progression and get PT guidance before adding load.",
    };
  }

  if (latest.pain >= 5 || latest.swelling >= 4 || weeklyCompletion < 50 || latest.difficulty >= 8) {
    return {
      label: "Watch",
      color: C.amber,
      bg: C.amberDim,
      nextStep: "Repeat the current plan and monitor the next check-in.",
      summary: "Recovery is moving, but symptoms or consistency need attention before the next progression.",
    };
  }

  return {
    label: "On Track",
    color: C.lime,
    bg: C.limeDim,
    nextStep: "Continue the current plan.",
    summary: "Pain is improving and completion is strong. Continue the current plan, but monitor swelling after harder sessions.",
  };
}

function SnapshotCard({ label, value, unit, detail, color }) {
  return (
    <Panel style={{ padding: 14, minHeight: 106 }}>
      <SectionLabel color={color}>{label}</SectionLabel>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
        {value}
        <span style={{ fontSize: 15, color: C.muted }}> {unit}</span>
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.45, marginTop: 8 }}>
        {detail}
      </div>
    </Panel>
  );
}

function TabButton({ tab, activeTab, onClick }) {
  const isActive = tab === activeTab;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      aria-pressed={isActive}
      style={{
        border: `1px solid ${isActive ? C.lime : C.rim}`,
        background: isActive ? C.lime : C.deep,
        color: isActive ? C.black : C.bone,
        borderRadius: 7,
        padding: "10px 8px",
        fontFamily: "'Fira Code', monospace",
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        cursor: "pointer",
        minWidth: 0,
      }}
    >
      {tab}
    </button>
  );
}

function TrendPanel({ title, value, unit, series, color, interpretation, points = [], children }) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, points.length - 1));
  const effectiveSelectedIndex = points.length ? Math.min(selectedIndex, points.length - 1) : 0;
  const selectedPoint = points[effectiveSelectedIndex];

  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <div>
          <SectionLabel color={color}>{title}</SectionLabel>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone, lineHeight: 1 }}>
            {value}
            <span style={{ fontSize: 15, color: C.muted }}> {unit}</span>
          </div>
        </div>
        {children}
      </div>
      <SparkLine data={series} color={color} height={58} labels={points.map((point) => point.label)} selectedIndex={effectiveSelectedIndex} onPointSelect={setSelectedIndex} />
      {selectedPoint && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "center", border: `1px solid ${C.rim}`, borderRadius: 7, padding: "10px 12px", background: C.deep, marginTop: 12 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {selectedPoint.label}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.45 }}>
            {selectedPoint.detail}
          </div>
        </div>
      )}
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.55, marginTop: 12 }}>
        {interpretation}
      </div>
    </Panel>
  );
}

function SymptomGraph({ label, value, series, color, points, selectedIndex, onPointSelect }) {
  return (
    <div style={{ border: `1px solid ${C.rim}`, borderRadius: 7, padding: 12, background: C.deep }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <SectionLabel color={color}>{label}</SectionLabel>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone, lineHeight: 1 }}>
          {value}
          <span style={{ fontSize: 12, color: C.muted }}> /10</span>
        </div>
      </div>
      <SparkLine data={series} color={color} height={50} labels={points.map((point) => point.label)} selectedIndex={selectedIndex} onPointSelect={onPointSelect} />
    </div>
  );
}

function SymptomsPanel({ latest, painSeries, swellingSeries, difficultySeries, points, interpretation }) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, points.length - 1));
  const effectiveSelectedIndex = points.length ? Math.min(selectedIndex, points.length - 1) : 0;
  const selectedPoint = points[effectiveSelectedIndex];

  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <div>
          <SectionLabel color={C.red}>Symptoms</SectionLabel>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone, lineHeight: 1 }}>
            {latest.pain}
            <span style={{ fontSize: 15, color: C.muted }}> /10 pain</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.blue, textTransform: "uppercase" }}>
          swelling {latest.swelling}/10
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <SymptomGraph label="Pain" value={latest.pain} series={painSeries} color={C.red} points={points} selectedIndex={effectiveSelectedIndex} onPointSelect={setSelectedIndex} />
        <SymptomGraph label="Swelling" value={latest.swelling} series={swellingSeries} color={C.blue} points={points} selectedIndex={effectiveSelectedIndex} onPointSelect={setSelectedIndex} />
        <SymptomGraph label="Difficulty" value={latest.difficulty} series={difficultySeries} color={C.amber} points={points} selectedIndex={effectiveSelectedIndex} onPointSelect={setSelectedIndex} />
      </div>

      {selectedPoint && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "center", border: `1px solid ${C.rim}`, borderRadius: 7, padding: "10px 12px", background: C.deep, marginTop: 12 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {selectedPoint.label}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.45 }}>
            Pain {selectedPoint.pain}/10 · Swelling {selectedPoint.swelling}/10 · Difficulty {selectedPoint.difficulty}/10
          </div>
        </div>
      )}

      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.55, marginTop: 12 }}>
        {interpretation}
      </div>
    </Panel>
  );
}

function getMilestoneState(milestone, index, latest, latestRom, latestCompletion) {
  if (milestone.achieved) return "Achieved";
  const previousComplete = index === 0 || Boolean(milestone.previousAchieved);
  const readyForTest = previousComplete && latest.pain <= 2 && latest.swelling <= 2 && latestRom >= 120 && latestCompletion >= 80;
  if (readyForTest) return "Ready for test";
  if (previousComplete || index <= 3) return "In progress";
  return "Locked";
}

function stateColor(state) {
  if (state === "Achieved") return C.lime;
  if (state === "Ready for test") return C.amber;
  if (state === "In progress") return C.blue;
  return C.muted;
}

function MilestoneTimeline({ milestones, latest, latestRom, latestCompletion }) {
  const decorated = milestones.map((milestone, index) => ({
    ...milestone,
    previousAchieved: index === 0 || milestones[index - 1]?.achieved,
  }));

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {decorated.map((milestone, index) => {
        const state = getMilestoneState(milestone, index, latest, latestRom, latestCompletion);
        const color = stateColor(state);
        const needsPtClearance = index >= 4 || milestone.label.toLowerCase().includes("jog") || milestone.label.toLowerCase().includes("return");
        const requirements = [
          "Pain <= 2",
          "Swelling <= 2",
          milestone.label.includes("Flexion") ? `${milestone.label} maintained` : "Clean movement quality",
          needsPtClearance ? "PT clearance needed" : "Completion >= 80%",
        ];

        return (
          <Panel key={milestone.id} style={{ padding: 14, background: state === "Achieved" ? C.limeDim : C.panel }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${color}`, background: state === "Achieved" ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.black, fontSize: 12, fontWeight: 900 }}>
                {state === "Achieved" ? "✓" : index + 1}
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.bone, fontWeight: 700, lineHeight: 1.3 }}>
                  {milestone.label}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                  {state}
                </div>
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>Wk {milestone.week}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, marginTop: 12 }}>
              {requirements.map((requirement) => (
                <div key={requirement} style={{ border: `1px solid ${C.rim}`, borderRadius: 6, padding: "7px 8px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.3 }}>
                  {requirement}
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

/**
 * @param {{ patientProfile?: any; milestones: any[]; progressData?: any[]; completionHistory?: any[]; checkIns?: any[] }} props
 */
export function ProgressView({ patientProfile, milestones = [], progressData, completionHistory, checkIns = [] }) {
  const [activeTab, setActiveTab] = useState("Symptoms");
  const sessionCheckIns = [...checkIns].sort((a, b) => a.ts - b.ts);
  const sessionProgress = sessionCheckIns
    .map((checkIn) => ({
      label: new Date(checkIn.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      pain: numberOrDefault(checkIn.pain),
      swelling: numberOrDefault(checkIn.swelling),
      difficulty: numberOrDefault(checkIn.difficulty),
      completion: numberOrDefault(checkIn.completion, completionPct(checkIn)),
    }));
  const baselineProgress = (progressData || []).map((entry) => ({
    ...entry,
    pain: numberOrDefault(entry.pain),
    swelling: numberOrDefault(entry.swelling),
    rom: Number.isFinite(entry.rom) ? entry.rom : undefined,
    difficulty: numberOrDefault(entry.difficulty),
    completion: numberOrDefault(entry.completion),
  }));
  const recoveryProgress = [...baselineProgress, ...sessionProgress];
  const savedCompletionDays = sessionCheckIns.slice(-7).map((checkIn) => ({
    day: new Date(checkIn.ts).toLocaleDateString(undefined, { weekday: "short" }),
    done: numberOrDefault(checkIn.done),
    total: numberOrDefault(checkIn.total),
  }));
  const completionDays = savedCompletionDays.length ? savedCompletionDays : completionHistory || [];
  const achieved = milestones.filter((m) => m.achieved).length;
  const milestonePct = milestones.length ? Math.round((achieved / milestones.length) * 100) : 0;
  const latest = recoveryProgress[recoveryProgress.length - 1] || { pain: 0, swelling: 0, rom: 0, difficulty: 0, completion: 0 };
  const first = recoveryProgress[0] || latest;
  const painSeries = recoveryProgress.map((d) => d.pain);
  const swellingSeries = recoveryProgress.map((d) => d.swelling);
  const difficultySeries = recoveryProgress.map((d) => d.difficulty);
  const romProgress = recoveryProgress.filter((d) => typeof d.rom === "number");
  const romSeries = romProgress.map((d) => d.rom);
  const completionSeries = recoveryProgress.map((d) => d.completion);
  const symptomPoints = recoveryProgress.map((entry) => ({
    label: entry.label || "Session",
    pain: entry.pain,
    swelling: entry.swelling,
    difficulty: entry.difficulty,
  }));
  const completionPoints = recoveryProgress.map((entry) => ({
    label: entry.label || "Session",
    detail: `Completion ${entry.completion}%`,
  }));
  const romPoints = romProgress.map((entry) => ({
    label: entry.label || "Session",
    detail: `ROM ${entry.rom}° flexion`,
  }));
  const latestRom = lastNumber(recoveryProgress, "rom");
  const firstRom = first.rom ?? latestRom;
  const weeklyCompletion = completionDays.length
    ? Math.round(completionDays.reduce((sum, day) => sum + completionPct(day), 0) / completionDays.length)
    : latest.completion;
  const painDelta = latest.pain - first.pain;
  const swellingDelta = latest.swelling - first.swelling;
  const romDelta = latestRom - numberOrDefault(firstRom);
  const recentPainDelta = getRecentDelta(painSeries);
  const recentSwellingDelta = getRecentDelta(swellingSeries);
  const status = getStatus({ latest, recentPainDelta, recentSwellingDelta, weeklyCompletion });
  const injuryTitle = patientProfile?.injuryType ? `${patientProfile.injuryType} Recovery` : "ACL + Meniscus Recovery";
  const goal = patientProfile?.goal ?? "Return to Basketball";
  const weekLabel = Number.isFinite(patientProfile?.week) ? `Week ${patientProfile.week}` : "Week 14";
  const symptomInterpretation = recentPainDelta <= 0 && recentSwellingDelta <= 0
    ? `Pain improved by ${Math.abs(recentPainDelta)} points over the recent sessions while swelling stayed controlled.`
    : "Symptoms have moved up recently. Keep the next session conservative and watch the next check-in.";
  const completionInterpretation = weeklyCompletion >= 80
    ? `Completion is strong at ${weeklyCompletion}% this week. Current load looks sustainable if symptoms stay calm.`
    : `Completion is ${weeklyCompletion}% this week. Repeat the plan before adding harder progressions.`;
  const romInterpretation = romDelta > 0
    ? `ROM is up ${romDelta}° from the baseline trend and is moving toward the next milestone target.`
    : "ROM is holding steady. Keep mobility work consistent before expecting the next unlock.";
  const milestoneInterpretation = milestones.length
    ? `${achieved} of ${milestones.length} milestones are achieved. The next unlock depends on symptom control, completion, and PT clearance when required.`
    : "Milestones will appear here once a rehab plan is assigned.";
  const activeTrend =
    activeTab === "Completion"
      ? <TrendPanel title="Completion" value={weeklyCompletion} unit="% weekly" series={completionSeries} color={C.lime} interpretation={completionInterpretation} points={completionPoints} />
      : activeTab === "ROM"
        ? <TrendPanel title="Range of Motion" value={latestRom} unit="degrees" series={romSeries} color={C.amber} interpretation={romInterpretation} points={romPoints} />
        : activeTab === "Milestones"
          ? (
            <div style={{ display: "grid", gap: 10 }}>
              <Panel>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                  <div>
                    <SectionLabel color={C.lime}>Milestones</SectionLabel>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone, lineHeight: 1 }}>
                      {achieved}/{milestones.length}
                      <span style={{ fontSize: 15, color: C.muted }}> cleared</span>
                    </div>
                  </div>
                  <ProgressArc pct={milestonePct} size={74} stroke={7} color={C.lime} label="recovery" />
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone, lineHeight: 1.55, marginTop: 12 }}>
                  {milestoneInterpretation}
                </div>
              </Panel>
              <MilestoneTimeline milestones={milestones} latest={latest} latestRom={latestRom} latestCompletion={weeklyCompletion} />
            </div>
          )
          : <SymptomsPanel latest={latest} painSeries={painSeries} swellingSeries={swellingSeries} difficultySeries={difficultySeries} points={symptomPoints} interpretation={symptomInterpretation} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel style={{ background: status.bg, border: `1px solid ${status.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <SectionLabel color={status.color}>{injuryTitle}</SectionLabel>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
              {status.label}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginTop: 5 }}>
              {weekLabel} · {goal}
            </div>
          </div>
          <ProgressArc pct={milestonePct} size={78} stroke={7} color={status.color} label="recovery" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 16 }}>
          {[
            ["Pain", `${latest.pain}/10`],
            ["Swelling", `${latest.swelling}/10`],
            ["Completion", `${weeklyCompletion}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ border: `1px solid ${C.rim}`, borderRadius: 7, padding: "9px 8px", background: C.deep }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, marginTop: 3 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.55, marginTop: 14 }}>
          {status.summary}
        </div>
        <div style={{ borderTop: `1px solid ${C.rim}`, marginTop: 14, paddingTop: 12 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: status.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Recommended next step
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>{status.nextStep}</div>
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <SnapshotCard label="Pain" value={latest.pain} unit="/10" detail={changeLabel(painDelta, "points", "down")} color={C.lime} />
        <SnapshotCard label="Swelling" value={latest.swelling} unit="/10" detail={changeLabel(swellingDelta, "points", "down")} color={C.blue} />
        <SnapshotCard label="Completion" value={weeklyCompletion} unit="% this week" detail={weeklyCompletion >= 80 ? "Strong consistency" : "Build consistency before progressing"} color={C.amber} />
        <SnapshotCard label="ROM" value={latestRom} unit="degrees" detail={romDelta > 0 ? `Up ${romDelta}° since baseline` : "Holding steady"} color={C.red} />
      </div>

      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginBottom: 10 }}>
          {TABS.map((tab) => (
            <TabButton key={tab} tab={tab} activeTab={activeTab} onClick={setActiveTab} />
          ))}
        </div>
        {activeTrend}
      </div>

    </div>
  );
}
