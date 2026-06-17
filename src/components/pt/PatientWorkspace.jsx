import React, { useMemo, useState } from "react";
import { C } from "../../constants/colors";
import { EXERCISE_LIBRARY } from "../../data/exerciseLibrary";
import { MILESTONES } from "../../data/rehabMock";
import { ExerciseDetail } from "../patient/ExerciseDetail";
import { ProgressArc } from "../ui/ProgressArc";
import { Tag } from "../ui/Tag";
import { MessagePanel } from "./MessagePanel";
import {
  DetailBlock,
  EmptyState,
  HistoryStat,
  Label,
  Metric,
  Panel,
  ProgressCheckRow,
  SeverityMeter,
  TimelineItem,
  TrendBadge,
} from "./ptPortalShared";
import {
  CADENCE_OPTIONS,
  PLAN_CATEGORIES,
  formatClinicalDate,
  getCategoryColor,
  getDefaultExerciseCadence,
  getExercisePurpose,
  getPlanLoad,
  normalizeExerciseName,
  relativeTime,
} from "./ptPortalUtils";

export function PatientWorkspace({
  patient,
  report,
  checkIn,
  reports,
  checkIns,
  activeThread,
  availableExercises,
  activeTab,
  onTabChange,
  onBack,
  onSendMessage,
  onAssignExercise,
  onUnassignExercise,
  onUpdateExerciseCadence,
  onUpdateExerciseDose,
  onMarkReportReviewed,
}) {
  const [planSearch, setPlanSearch] = useState("");
  const [planCategory, setPlanCategory] = useState("all");
  const [expandedPlanExercise, setExpandedPlanExercise] = useState("");
  const [activePlanSectionId, setActivePlanSectionId] = useState("daily");
  const sortedReports = [...reports].sort((a, b) => b.ts - a.ts);
  const currentReport = sortedReports[0] || report;
  const unreadReport = sortedReports.find((item) => !item.ptRead);
  const latestCheckIn = checkIn ? relativeTime(checkIn.ts) : "None";
  const needsReview = Boolean(unreadReport);
  const latestSignal = [currentReport ? { ...currentReport, type: "report" } : null, checkIn ? { ...checkIn, type: "check-in" } : null]
    .filter(Boolean)
    .sort((a, b) => b.ts - a.ts)[0];
  const latestSignalIsReport = latestSignal?.type === "report";
  const historyItems = [
    ...reports.map((item) => ({ ...item, type: "report" })),
    ...checkIns.map((item) => ({ ...item, type: "check-in" })),
  ].sort((a, b) => b.ts - a.ts);
  const normalizeToTen = (value, max) => Number.isFinite(Number(value)) ? Math.round((Number(value) / max) * 10) : null;
  const getTrend = (values) => {
    if (values.length < 2) return { label: "Need data", delta: 0, color: C.muted, status: "watch" };
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const delta = lastValue - firstValue;
    if (delta <= -1) return { label: "Improving", delta, color: C.lime, status: "pass" };
    if (delta >= 1) return { label: "Worse", delta, color: C.red, status: "watch" };
    return { label: "Flat", delta, color: C.blue, status: "pass" };
  };
  const exerciseDetailByName = useMemo(
    () =>
      EXERCISE_LIBRARY.reduce((lookup, exercise) => {
        lookup.set(normalizeExerciseName(exercise.name), exercise);
        return lookup;
      }, new Map()),
    [],
  );
  const getExerciseDetail = (exercise) => exerciseDetailByName.get(normalizeExerciseName(exercise));
  const getNextMilestone = () => {
    if (patient.injury?.toLowerCase().includes("achilles")) {
      return patient.week < 8
        ? { label: "Pain-free walking volume", week: 8 }
        : patient.week < 14
          ? { label: "Single-leg calf raise control", week: 14 }
          : { label: "Return-to-run tolerance", week: 18 };
    }

    if (patient.injury?.toLowerCase().includes("patellar")) {
      return patient.week < 16
        ? { label: "Squat and step-down tolerance", week: 16 }
        : { label: "Single-leg tendon loading", week: 22 };
    }

    return MILESTONES.find((milestone) => !milestone.achieved && milestone.week >= patient.week) || MILESTONES.find((milestone) => !milestone.achieved) || { label: "Return to activity", week: patient.week };
  };
  const painMax = latestSignalIsReport ? 5 : 10;
  const swellingMax = latestSignalIsReport ? 5 : 10;
  const painValue = latestSignal?.pain;
  const swellingValue = latestSignal?.swelling;
  const painTen = normalizeToTen(painValue, painMax);
  const swellingTen = normalizeToTen(swellingValue, swellingMax);
  const symptomScore = latestSignal
    ? Math.max(0, Math.round(100 - (((painTen ?? 0) + (swellingTen ?? 0)) / 2) * 10))
    : 64;
  const sessionCheckIns = checkIns.filter((item) => item.type === "session" || Number.isFinite(Number(item.completion)) || Number.isFinite(Number(item.done)));
  const completionValues = sessionCheckIns
    .map((item) => Number.isFinite(Number(item.completion)) ? Number(item.completion) : Number(item.total) ? Math.round((Number(item.done || 0) / Number(item.total)) * 100) : null)
    .filter((value) => Number.isFinite(value));
  const consistencyScore = completionValues.length
    ? Math.round(completionValues.slice(-7).reduce((sum, value) => sum + value, 0) / Math.min(completionValues.length, 7))
    : checkIn
      ? 70
      : 50;
  const planScore = Math.min(100, Math.round((patient.assignedExercises.length / 5) * 100));
  const readinessScore = Math.max(0, Math.min(100, Math.round(symptomScore * 0.5 + consistencyScore * 0.3 + planScore * 0.2 - (needsReview ? 12 : 0))));
  const readinessLabel = readinessScore >= 80 ? "Ready to progress" : readinessScore >= 60 ? "Hold current phase" : "Needs attention";
  const readinessColor = readinessScore >= 80 ? C.lime : readinessScore >= 60 ? C.amber : C.red;
  const confidenceLabel = historyItems.length >= 3 && completionValues.length >= 2 ? "High" : historyItems.length >= 1 ? "Moderate" : "Low";
  const comparableCheckIns = [...checkIns]
    .filter((item) => Number.isFinite(Number(item.pain)) || Number.isFinite(Number(item.swelling)))
    .sort((a, b) => a.ts - b.ts);
  const painTrend = getTrend(comparableCheckIns.map((item) => Number(item.pain)).filter((value) => Number.isFinite(value)));
  const swellingTrend = getTrend(comparableCheckIns.map((item) => Number(item.swelling)).filter((value) => Number.isFinite(value)));
  const trendHeadline = comparableCheckIns.length < 2 ? "Need data" : painTrend.label === swellingTrend.label ? painTrend.label : "Mixed";
  const trendAccent = comparableCheckIns.length < 2 ? C.blue : painTrend.status === "watch" || swellingTrend.status === "watch" ? C.amber : C.lime;
  const trendTag = comparableCheckIns.length < 2 ? "Need 2 check-ins" : `${comparableCheckIns.length} check-ins`;
  const completionDelta = completionValues.length >= 2 ? completionValues.at(-1) - completionValues[0] : 0;
  const completionTrend = completionValues.length < 2
    ? { label: "No trend", color: C.muted }
    : completionDelta >= 5
      ? { label: "Improving", color: C.lime }
      : completionDelta <= -5
        ? { label: "Dropping", color: C.red }
        : { label: "Flat", color: C.blue };
  const historyReportsCount = reports.length;
  const historyCheckInsCount = checkIns.length;
  const unreadHistoryCount = reports.filter((item) => !item.ptRead).length;
  const normalizedHistoryPain = historyItems
    .map((item) => normalizeToTen(item.pain, item.type === "report" ? 5 : 10))
    .filter((value) => Number.isFinite(value));
  const averageHistoryPain = normalizedHistoryPain.length
    ? Math.round(normalizedHistoryPain.reduce((sum, value) => sum + value, 0) / normalizedHistoryPain.length)
    : null;
  const latestHistoryItem = historyItems[0];
  const latestHistoryLabel = latestHistoryItem
    ? latestHistoryItem.type === "report"
      ? `${latestHistoryItem.exercise} report`
      : "Session check-in"
    : "No submissions";
  const historyWindowLabel = historyItems.length
    ? `${formatClinicalDate(historyItems.at(-1).ts)} to ${formatClinicalDate(historyItems[0].ts)}`
    : "Awaiting first patient submission";
  const planLoads = patient.assignedExercises.reduce(
    (loads, exercise) => {
      const load = getPlanLoad(exercise);
      return { ...loads, [load]: loads[load] + 1 };
    },
    { mobility: 0, activation: 0, strength: 0, control: 0, general: 0 },
  );
  const planLoadLabel = planLoads.strength + planLoads.control >= 3 ? "Higher load" : planLoads.mobility + planLoads.activation >= 3 ? "Foundation" : "Mixed";
  const nextMilestone = getNextMilestone();
  const phaseMinimumMet = patient.week >= Math.max(0, nextMilestone.week - 2);
  const milestoneStatus = readinessScore >= 80 && phaseMinimumMet && !needsReview ? "pass" : "watch";
  const symptomStatus = symptomScore >= 75 ? "pass" : "watch";
  const symptomStatusLabel = symptomStatus === "pass" ? "Acceptable" : "Watch";
  const consistencyStatus = consistencyScore >= 80 ? "pass" : "watch";
  const consistencyStatusLabel = consistencyStatus === "pass" ? "Consistent" : completionValues.length ? "Incomplete" : "Insufficient data";
  const planStatus = patient.assignedExercises.length >= 3 ? "pass" : "watch";
  const planLoadDetail = planLoadLabel === "Foundation"
    ? "Mobility and activation dominate the current plan."
    : planLoadLabel === "Higher load"
      ? "Strength and control work are prominent in this plan."
      : "Load is spread across several exercise categories.";
  const nextProgressCheck = needsReview
    ? "Resolve the open report before advancing load."
    : readinessScore >= 80
      ? "Ready for a PT progression check if movement quality is clean."
      : "Repeat the current load and recheck symptoms after the next session.";
  const progressReason = needsReview
    ? "Progression is held because an unread symptom report needs clinician review."
    : readinessScore >= 80
      ? "Symptoms, consistency, and plan coverage support a progression screen."
      : consistencyStatus !== "pass"
        ? "Hold the current phase because completion history is not strong enough yet."
        : symptomStatus !== "pass"
          ? "Hold the current phase because symptom response still needs to settle."
          : "Hold the current phase until movement quality is verified.";
  const planSearchTerm = planSearch.trim().toLowerCase();
  const assignedExerciseRows = patient.assignedExercises.map((exercise) => ({
    name: exercise,
    detail: getExerciseDetail(exercise),
    category: getPlanLoad(exercise),
  })).map((exercise) => ({
    ...exercise,
    cadence: patient.planCadence?.[exercise.name] || getDefaultExerciseCadence(exercise.category),
    dose: {
      sets: patient.planDose?.[exercise.name]?.sets ?? (exercise.detail?.sets ? String(exercise.detail.sets) : ""),
      reps: patient.planDose?.[exercise.name]?.reps ?? (exercise.detail?.reps ? String(exercise.detail.reps) : ""),
      hold: patient.planDose?.[exercise.name]?.hold ?? "",
      rest: patient.planDose?.[exercise.name]?.rest ?? "",
    },
  }));
  const filteredAvailableExercises = availableExercises
    .map((exercise) => ({
      name: exercise,
      detail: getExerciseDetail(exercise),
      category: getPlanLoad(exercise),
    }))
    .filter((exercise) => planCategory === "all" || exercise.category === planCategory)
    .filter((exercise) => {
      if (!planSearchTerm) return true;
      const haystack = [
        exercise.name,
        exercise.detail?.muscles,
        exercise.detail?.equipment,
        exercise.detail?.cue,
        exercise.category,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(planSearchTerm);
    })
    .slice(0, 10);
  const planPrimaryFocus = planLoadLabel === "Foundation" ? "Protect symptoms" : planLoadLabel === "Higher load" ? "Build capacity" : "Balance load";
  const planRiskLabel = needsReview ? "Review first" : symptomStatus === "watch" ? "Monitor symptoms" : "Clear to continue";
  const planRiskColor = needsReview || symptomStatus === "watch" ? C.amber : C.lime;
  const planNextAction = needsReview
    ? "Read the latest report before changing load."
    : readinessScore >= 80
      ? "Consider one measured progression."
      : "Keep volume stable through the next check-in.";
  const planDecision = needsReview
    ? {
        id: "hold",
        label: "Hold progression",
        color: C.amber,
        detail: "Review the open symptom report before increasing load.",
      }
    : readinessScore >= 80 && phaseMinimumMet
      ? {
          id: "progress",
          label: "Ready to progress",
          color: C.lime,
          detail: "Symptoms, timing, and completion support one measured progression.",
        }
      : readinessScore >= 60
        ? {
            id: "continue",
            label: "Continue current plan",
            color: C.blue,
            detail: "Keep the weekly structure stable and reassess after the next check-in.",
          }
        : {
            id: "hold",
            label: "Hold progression",
            color: C.red,
            detail: "Symptoms or completion history need attention before plan advancement.",
          };
  const weeklyPlanSections = [
    {
      id: "daily",
      title: "Daily foundation",
      cadence: "Every rehab day",
      assignCadence: "Daily",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      exercises: assignedExerciseRows.filter((exercise) => exercise.cadence === "Daily"),
    },
    {
      id: "load",
      title: "Three-day block",
      cadence: "Mon / Wed / Fri",
      assignCadence: "3x / week",
      days: ["Mon", "Wed", "Fri"],
      exercises: assignedExerciseRows.filter((exercise) => exercise.cadence === "3x / week"),
    },
    {
      id: "control",
      title: "Two-day block",
      cadence: "Tue / Fri",
      assignCadence: "2x / week",
      days: ["Tue", "Fri"],
      exercises: assignedExerciseRows.filter((exercise) => exercise.cadence === "2x / week"),
    },
    {
      id: "recovery",
      title: "Flexible / hold",
      cadence: "As needed",
      assignCadence: "As tolerated",
      days: ["Sun"],
      exercises: assignedExerciseRows.filter((exercise) => ["As tolerated", "Hold"].includes(exercise.cadence)),
      note: needsReview ? "Review report before progressing next week." : "Check symptoms before the next load block.",
    },
  ];
  const assignedCountLabel = `${patient.assignedExercises.length} exercise${patient.assignedExercises.length === 1 ? "" : "s"}`;
  const todayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const todaysPlanSections = weeklyPlanSections.filter((section) => section.days.includes(todayLabel) && section.exercises.length > 0);
  const todaysExercises = todaysPlanSections.flatMap((section) => section.exercises.map((exercise) => ({ ...exercise, sectionTitle: section.title })));
  const todaysPrimaryBlock = todaysPlanSections[0]?.title || "Recovery checkpoint";
  const todaysSessionIntent = needsReview
    ? "Keep the session conservative until the open report is reviewed."
    : todaysExercises.length
      ? `${todaysPrimaryBlock} with symptom monitoring after completion.`
      : "No scheduled loading today; use this as a symptom review day.";
  const activePlanSection = weeklyPlanSections.find((section) => section.id === activePlanSectionId) || weeklyPlanSections[0];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
            <div
              className="pt-patient-avatar pt-patient-avatar-large"
              style={{
                background: `linear-gradient(135deg, ${patient.color}28, ${C.deep})`,
                borderColor: patient.color + "44",
                color: patient.color,
              }}
            >
              {patient.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <Label color={patient.color}>Patient workspace</Label>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 40, color: C.bone, lineHeight: 1, marginTop: 7 }}>{patient.name}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 8 }}>
                {patient.injury} / Week {patient.week} / {patient.stage}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={onBack} className="pt-back-link">
              Back to patients
            </button>
          </div>
        </div>
        <div className="pt-selected-metrics">
          <Metric label="Pain" value={report ? `${report.pain}/5` : checkIn ? `${checkIn.pain}/10` : "-"} color={report?.pain >= 5 ? C.red : C.bone} tone={report?.pain >= 5 ? "danger" : "default"} />
          <Metric label="Swelling" value={report ? `${report.swelling}/5` : checkIn ? `${checkIn.swelling}/10` : "-"} color={report?.swelling >= 4 ? C.red : C.bone} tone={report?.swelling >= 4 ? "danger" : "default"} />
          <Metric label="Last check-in" value={latestCheckIn} color={C.blue} />
        </div>
      </Panel>

      <div className="pt-tabbar" role="tablist" aria-label="Patient workspace sections">
        {["Overview", "Plan", "Messages", "History"].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.toLowerCase()}
            onClick={() => onTabChange(tab.toLowerCase())}
            className="pt-tab"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-tab-content">
        {activeTab === "overview" && (
          <Panel style={{ minHeight: "100%" }}>
            <div className="pt-overview-dashboard">
              <DetailBlock label="Progression status" accent={readinessColor}>
                <div className="pt-progress-check-hero">
                  <ProgressArc pct={readinessScore} size={96} stroke={7} color={readinessColor} label="ready" />
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: readinessColor, lineHeight: 1 }}>{readinessLabel}</div>
                    <div style={{ fontSize: 14, color: C.bone, lineHeight: 1.55, marginTop: 8 }}>{progressReason}</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Confidence {confidenceLabel} / Week {patient.week} / {patient.stage}
                    </div>
                  </div>
                </div>
              </DetailBlock>

              <DetailBlock label="Trends" accent={trendAccent}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, lineHeight: 1 }}>
                      {trendHeadline}
                    </div>
                    <Tag label={trendTag} color={trendAccent} />
                  </div>
                  <div className="pt-trend-grid">
                    <TrendBadge label="Pain" value={painTrend.label} color={painTrend.color} />
                    <TrendBadge label="Swelling" value={swellingTrend.label} color={swellingTrend.color} />
                  </div>
                  <SeverityMeter label="Pain" value={painValue} max={painMax} color={symptomStatus === "pass" ? C.lime : C.amber} />
                  <SeverityMeter label="Swelling" value={swellingValue} max={swellingMax} color={symptomStatus === "pass" ? C.blue : C.amber} />
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                    Trends use check-ins only. Latest signal: {latestSignalIsReport ? currentReport.exercise : latestSignal ? "session check-in" : "none yet"}. Current control: {symptomStatusLabel.toLowerCase()}.
                  </div>
                </div>
              </DetailBlock>

              <DetailBlock label="Session consistency" accent={consistencyStatus === "pass" ? C.lime : C.amber}>
                <div className="pt-progress-score-row">
                  <Metric label="Status" value={consistencyStatusLabel} color={consistencyStatus === "pass" ? C.lime : C.amber} />
                  <Metric label="Trend" value={completionTrend.label} color={completionTrend.color} />
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 12 }}>
                  {completionValues.length ? `Recent completion estimate is ${consistencyScore}%.` : "No session completion trend yet, using latest check-in activity as a placeholder."}
                </div>
              </DetailBlock>

              <DetailBlock label="Next milestone" accent={milestoneStatus === "pass" ? C.lime : C.blue}>
                <div style={{ display: "grid", gap: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, lineHeight: 1 }}>{nextMilestone.label}</div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Target week {nextMilestone.week}
                      </div>
                    </div>
                    <Tag label={milestoneStatus === "pass" ? "Test ready" : "Not yet"} color={milestoneStatus === "pass" ? C.lime : C.amber} />
                  </div>
                  <ProgressCheckRow
                    label="Minimum timing"
                    value={phaseMinimumMet ? "Met" : "Wait"}
                    detail={phaseMinimumMet ? "Week timing supports a progression screen." : "Give this phase more time before testing the next unlock."}
                    status={phaseMinimumMet ? "pass" : "watch"}
                  />
                  <ProgressCheckRow
                    label="Movement quality"
                    value="Verify"
                    detail="Manual PT observation still needs to confirm clean mechanics."
                    status="watch"
                  />
                  <ProgressCheckRow
                    label="Next PT check"
                    value={milestoneStatus === "pass" ? "Progression screen" : "Reassess"}
                    detail={nextProgressCheck}
                    status={milestoneStatus}
                  />
                </div>
              </DetailBlock>

              <DetailBlock label="Plan structure" accent={planDecision.color}>
                <div className="pt-overview-plan-card">
                  <div className="pt-overview-plan-head">
                    <div>
                      <div className="pt-overview-plan-title">{planDecision.label}</div>
                      <div className="pt-overview-plan-detail">{todaysSessionIntent}</div>
                    </div>
                    <Tag label={`${todaysExercises.length} today`} color={todaysExercises.length ? C.lime : C.amber} />
                  </div>
                  <div className="pt-overview-plan-metrics">
                    <TrendBadge label="Today" value={todaysExercises.length} color={todaysExercises.length ? C.lime : C.amber} />
                    <TrendBadge label="Blocks" value={weeklyPlanSections.filter((section) => section.exercises.length > 0).length} color={C.blue} />
                    <TrendBadge label="Load" value={planLoadLabel} color={planStatus === "pass" ? C.lime : C.amber} />
                  </div>
                  <div className="pt-overview-plan-sections">
                    {weeklyPlanSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          setActivePlanSectionId(section.id);
                          onTabChange("plan");
                        }}
                      >
                        <span>{section.title}</span>
                        <Tag label={`${section.exercises.length}`} color={section.exercises.length ? C.lime : C.muted} />
                      </button>
                    ))}
                  </div>
                  <ProgressCheckRow
                    label="Coverage"
                    value={`${planScore}%`}
                    detail={planStatus === "pass" ? planLoadDetail : "Add or confirm enough exercises before judging progress."}
                    status={planStatus}
                  />
                </div>
              </DetailBlock>

            </div>
          </Panel>
        )}

        {activeTab === "plan" && (
          <Panel style={{ minHeight: "100%" }}>
            <div className="pt-plan-hero" style={{ "--plan-risk-color": planRiskColor }}>
              <div className="pt-plan-hero-main">
                <Label color={C.lime}>Exercise plan</Label>
                <div className="pt-plan-hero-title">Today&apos;s clinical plan</div>
                <p>{todaysSessionIntent}</p>
                <div className="pt-plan-hero-rail" aria-label={`Plan readiness ${readinessScore}% and coverage ${planScore}%`}>
                  <span style={{ "--rail-color": readinessColor, "--rail-value": `${readinessScore}%` }}>
                    <b>Readiness</b>
                  </span>
                  <span style={{ "--rail-color": planStatus === "pass" ? C.lime : C.amber, "--rail-value": `${planScore}%` }}>
                    <b>Coverage</b>
                  </span>
                </div>
              </div>
              <div className="pt-plan-hero-side">
                <Tag label={planRiskLabel} color={planRiskColor} />
                <div className="pt-plan-summary">
                  <TrendBadge label="Focus" value={planPrimaryFocus} color={C.bone} />
                  <TrendBadge label="Readiness" value={`${readinessScore}%`} color={readinessColor} />
                  <TrendBadge label="Plan load" value={planLoadLabel} color={planStatus === "pass" ? C.lime : C.amber} />
                </div>
                <div className="pt-plan-next">
                  <Label>Next action</Label>
                  <div>{planNextAction}</div>
                </div>
              </div>
            </div>

            <div className="pt-plan-decision" style={{ "--decision-color": planDecision.color }}>
              <div>
                <Label color={planDecision.color}>Plan status</Label>
                <div>{planDecision.label}</div>
                <p>{planDecision.detail}</p>
              </div>
              <div className="pt-plan-decision-steps" aria-label="Plan decision path">
                {[
                  { id: "hold", label: "Hold" },
                  { id: "continue", label: "Continue" },
                  { id: "progress", label: "Progress" },
                ].map((step) => (
                  <span key={step.id} className={planDecision.id === step.id ? "active" : ""}>
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            {needsReview ? (
              <div className="pt-plan-alert">
                <Label color={C.amber}>Open report</Label>
                <div>Hold progressions until the latest symptom report is reviewed.</div>
                <button type="button" onClick={() => onMarkReportReviewed(unreadReport.id)}>
                  Mark reviewed
                </button>
              </div>
            ) : null}

            <div className="pt-today-plan">
              <div className="pt-today-header">
                <div>
                  <Label>Today&apos;s plan</Label>
                  <div>{todayLabel} clinical session</div>
                  <p>{todaysSessionIntent}</p>
                </div>
                <div className="pt-today-summary">
                  <Metric label="Due" value={todaysExercises.length} color={todaysExercises.length ? C.lime : C.amber} />
                  <Metric label="Blocks" value={todaysPlanSections.length || 1} color={C.blue} />
                </div>
              </div>
              {todaysExercises.length > 0 ? (
                <div className="pt-today-list">
                  {todaysExercises.map((exercise, index) => (
                    <button
                      key={`${exercise.sectionTitle}-${exercise.name}`}
                      type="button"
                      onClick={() => setActivePlanSectionId(weeklyPlanSections.find((section) => section.title === exercise.sectionTitle)?.id || "daily")}
                    >
                      <div className="pt-today-index">{index + 1}</div>
                      <div className="pt-today-main">
                        <div className="pt-today-exercise">{exercise.name}</div>
                        <div className="pt-today-dose">{exercise.dose.sets || "-"} sets / {exercise.dose.reps || "-"} reps{exercise.dose.hold ? ` / hold ${exercise.dose.hold}` : ""}{exercise.dose.rest ? ` / rest ${exercise.dose.rest}` : ""}</div>
                        <div className="pt-today-rationale">{getExercisePurpose(exercise)}</div>
                      </div>
                      <div className="pt-today-tags">
                        <Tag label={exercise.sectionTitle} color={C.blue} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title="No exercises due today" message="Open a cadence block below to add work or move an exercise into today's cadence." />
              )}
            </div>

            <div className="pt-weekly-plan">
              <div className="pt-plan-column-header">
                <div>
                  <Label>Weekly structure</Label>
                  <div>Click a block to edit</div>
                </div>
                <Tag label={assignedCountLabel} color={C.blue} />
              </div>
              <div className="pt-weekly-grid">
                {weeklyPlanSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`pt-weekly-section${activePlanSection.id === section.id ? " pt-weekly-section-active" : ""}`}
                    style={{ "--section-color": section.exercises.length ? getCategoryColor(section.exercises[0].category) : C.muted }}
                    onClick={() => setActivePlanSectionId(section.id)}
                    aria-pressed={activePlanSection.id === section.id}
                  >
                    <div className="pt-weekly-section-head">
                      <div>
                        <div className="pt-weekly-title">{section.title}</div>
                        <div className="pt-weekly-cadence">{section.cadence}</div>
                      </div>
                      <div className="pt-weekly-days" aria-label={`${section.title} days`}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <span key={day} className={section.days.includes(day) ? "active" : ""}>
                            {day.slice(0, 1)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-weekly-exercises">
                      {section.exercises.length > 0 ? (
                        section.exercises.slice(0, 4).map((exercise) => (
                          <span key={exercise.name}>{exercise.name}</span>
                        ))
                      ) : (
                        <span>{section.note || "No exercises assigned to this block yet."}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-plan-grid">
              <div className="pt-plan-column">
                <div className="pt-plan-column-header">
                  <div>
                    <Label>Edit block</Label>
                    <div>{activePlanSection.title}</div>
                  </div>
                  <Tag label={`${activePlanSection.exercises.length} exercises`} color={C.lime} />
                </div>
                {activePlanSection.exercises.length > 0 ? (
                  activePlanSection.exercises.map((exercise, index) => {
                    const showingDetails = expandedPlanExercise === `${exercise.name}:details`;
                    const categoryColor = getCategoryColor(exercise.category);
                    return (
                      <div key={exercise.name} className={`pt-assigned-exercise${showingDetails ? " pt-assigned-exercise-open" : ""}`}>
                        <div className="pt-assigned-row">
                          <div className="pt-assigned-toggle">
                            <div className="pt-assigned-row-main">
                              <div className="pt-exercise-index" style={{ "--exercise-color": categoryColor }}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="pt-exercise-title">{exercise.name}</div>
                                <div className="pt-exercise-dose">
                                  {exercise.dose.sets || "-"} sets / {exercise.dose.reps || "-"} reps{exercise.dose.hold ? ` / hold ${exercise.dose.hold}` : ""}{exercise.dose.rest ? ` / rest ${exercise.dose.rest}` : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="pt-assigned-row-meta">
                            <label>
                              <span>Cadence</span>
                              <select
                                value={exercise.cadence}
                                onChange={(event) => onUpdateExerciseCadence(patient.id, exercise.name, event.target.value)}
                                aria-label={`${exercise.name} cadence`}
                              >
                                {CADENCE_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <Tag label={exercise.category} color={categoryColor} />
                          </div>
                        </div>
                        <div className="pt-assigned-purpose">{getExercisePurpose(exercise)}</div>
                        <div className="pt-assigned-details">
                          <div className="pt-dose-editor" aria-label={`${exercise.name} prescription`}>
                            {[
                              ["sets", "Sets"],
                              ["reps", "Reps"],
                              ["hold", "Hold"],
                              ["rest", "Rest"],
                            ].map(([field, label]) => (
                              <label key={field}>
                                <span>{label}</span>
                                <input
                                  value={exercise.dose[field] || ""}
                                  onChange={(event) => onUpdateExerciseDose(patient.id, exercise.name, field, event.target.value)}
                                  placeholder={field === "hold" || field === "rest" ? "Optional" : "-"}
                                  aria-label={`${exercise.name} ${label.toLowerCase()}`}
                                />
                              </label>
                            ))}
                          </div>
                          <div className="pt-exercise-actions">
                            <button type="button" className="pt-details-toggle" onClick={() => setExpandedPlanExercise(showingDetails ? "" : `${exercise.name}:details`)}>
                              {showingDetails ? "Hide details" : "Details + video"}
                            </button>
                            <button type="button" onClick={() => onUnassignExercise(patient.id, exercise.name)} className="pt-plan-remove">
                              Remove from plan
                            </button>
                          </div>
                          {showingDetails ? (
                            <div className="pt-exercise-detail-panel">
                              <ExerciseDetail exercise={{ ...(exercise.detail || {}), name: exercise.name, sets: exercise.dose.sets, reps: exercise.dose.reps, rest: exercise.dose.rest }} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title="No exercises in this block" message="Add from the library to build this cadence block." />
                )}
              </div>

              <div className="pt-plan-column">
                <div className="pt-plan-column-header">
                  <div>
                    <Label>Add to {activePlanSection.title}</Label>
                    <div>Library matches</div>
                  </div>
                  <Tag label={activePlanSection.assignCadence} color={C.blue} />
                </div>
                <input
                  value={planSearch}
                  onChange={(event) => setPlanSearch(event.target.value)}
                  placeholder="Search name, muscle, cue..."
                  className="pt-plan-search"
                />
                <div className="pt-plan-filters" role="list" aria-label="Exercise categories">
                  {PLAN_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setPlanCategory(category.id)}
                      aria-pressed={planCategory === category.id}
                      style={{ "--category-color": category.color }}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                {filteredAvailableExercises.length > 0 ? (
                  filteredAvailableExercises.map((exercise) => (
                    <button key={exercise.name} type="button" onClick={() => onAssignExercise(patient.id, exercise.name, activePlanSection.assignCadence)} className="pt-add-exercise">
                      <div className="pt-exercise-main">
                        <div>
                          <div className="pt-exercise-title">Add {exercise.name}</div>
                          <div className="pt-exercise-dose">
                            {exercise.detail ? `${exercise.detail.sets} sets / ${exercise.detail.reps} / difficulty ${exercise.detail.difficulty}` : "Demo exercise"}
                          </div>
                        </div>
                        <Tag label={exercise.category} color={getCategoryColor(exercise.category)} />
                      </div>
                      <div className="pt-exercise-cue">
                        {exercise.detail?.cue || "Add to the current plan and set details during review."}
                      </div>
                    </button>
                  ))
                ) : availableExercises.length > 0 ? (
                  <EmptyState title="No matches" message="Adjust the search or category filter to find another exercise." />
                ) : (
                  <EmptyState title="Plan is full" message="Every exercise in the demo library is already assigned to this patient." />
                )}
              </div>
            </div>
          </Panel>
        )}

        {activeTab === "messages" && <MessagePanel thread={activeThread} reports={reports} onSendMessage={onSendMessage} onMarkReportReviewed={onMarkReportReviewed} />}

        {activeTab === "history" && (
          <Panel style={{ minHeight: "100%" }}>
            <div className="pt-history-hero">
              <div>
                <div className="pt-history-hero-head">
                  <div>
                    <Label color={C.lime}>History</Label>
                    <div>Reports & check-ins</div>
                  </div>
                  <Tag label={`${historyItems.length} records`} color={historyItems.length ? C.blue : C.muted} />
                </div>
                <p>{historyWindowLabel}</p>
              </div>
              <div className="pt-history-summary">
                <HistoryStat label="Reports" value={historyReportsCount} detail={unreadHistoryCount ? `${unreadHistoryCount} unread` : "All reviewed"} color={unreadHistoryCount ? C.red : C.lime} />
                <HistoryStat label="Check-ins" value={historyCheckInsCount} detail={latestCheckIn === "None" ? "No recent check-in" : `Latest ${latestCheckIn}`} color={C.blue} />
                <HistoryStat label="Pain avg" value={averageHistoryPain === null ? "-" : `${averageHistoryPain}/10`} detail="Normalized scale" color={averageHistoryPain === null ? C.muted : averageHistoryPain >= 7 ? C.red : averageHistoryPain >= 4 ? C.amber : C.lime} />
                <HistoryStat label="Completion" value={completionValues.length ? `${consistencyScore}%` : "-"} detail={completionTrend.label} color={completionTrend.color} />
              </div>
            </div>

            {latestHistoryItem ? (
              <div className="pt-history-latest">
                <div>
                  <Label>Latest signal</Label>
                  <div>{latestHistoryLabel}</div>
                  <p>{latestHistoryItem.type === "report" ? latestHistoryItem.note : latestHistoryItem.concern}</p>
                </div>
                <Tag label={latestHistoryItem.type === "report" && !latestHistoryItem.ptRead ? "Needs review" : trendHeadline} color={latestHistoryItem.type === "report" && !latestHistoryItem.ptRead ? C.red : trendAccent} />
              </div>
            ) : null}

            <div className="pt-history-timeline">
              <div className="pt-history-timeline-head">
                <Label>Timeline</Label>
                {historyItems.length ? <span>{historyItems.length} total submissions</span> : null}
              </div>
              <div className="pt-history-list">
                {historyItems.length > 0 ? (
                  historyItems.map((item) => (
                    <TimelineItem
                      key={`${item.type}-${item.id}`}
                      item={item}
                      type={item.type === "report" ? "report" : "check-in"}
                      onMarkReviewed={() => onMarkReportReviewed(item.id)}
                    />
                  ))
                ) : (
                  <EmptyState title="No history yet" message="Reports and check-ins will appear here as the patient submits them." />
                )}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
