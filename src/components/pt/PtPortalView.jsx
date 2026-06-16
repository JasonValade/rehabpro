import React, { useMemo, useState } from "react";
import { C } from "../../constants/colors";
import { EXERCISE_LIBRARY } from "../../data/exerciseLibrary";
import { MILESTONES } from "../../data/rehabMock";
import { parseSymptomReportMessage } from "../../utils/reportChat";
import { ProgressArc } from "../ui/ProgressArc";
import { SymptomReportCard } from "../ui/SymptomReportCard";
import { Tag } from "../ui/Tag";

function relativeTime(ts) {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Panel({ children, style }) {
  return (
    <section className="pt-panel" style={style}>
      {children}
    </section>
  );
}

function Label({ children, color = C.muted }) {
  return (
    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function Metric({ label, value, color = C.bone, tone = "default" }) {
  return (
    <div className={`pt-metric pt-metric-${tone}`}>
      <Label>{label}</Label>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color, lineHeight: 1, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function SeverityMeter({ label, value, max = 5, color = C.lime }) {
  const percent = Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
        <Label>{label}</Label>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.bone }}>{value ?? "-"}/{max}</div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: C.rim, overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div style={{ border: `1px dashed ${C.rimHi}`, background: C.deep, borderRadius: 8, padding: 16, color: C.muted }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, lineHeight: 1 }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 7 }}>{message}</div>
    </div>
  );
}

function PatientRow({ patient, active, report, checkIn, onClick }) {
  const symptom = report || checkIn;
  const symptomText = report
    ? `Report: pain ${report.pain}/5, swelling ${report.swelling}/5`
    : checkIn
      ? `Check-in: pain ${checkIn.pain}/10, confidence ${checkIn.confidence}/10`
      : "No new check-in";
  const planLabel = `${patient.assignedExercises.length} exercise${patient.assignedExercises.length === 1 ? "" : "s"}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="pt-patient-row"
      style={{
        border: `1px solid ${active ? C.lime : C.rim}`,
        background: active ? C.limeDim : C.deep,
        color: C.bone,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <div
            className="pt-patient-avatar"
            style={{
              background: `linear-gradient(135deg, ${patient.color}28, ${C.deep})`,
              borderColor: patient.color + "44",
              color: patient.color,
            }}
          >
            {patient.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.bone, lineHeight: 1 }}>{patient.name}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 5 }}>
              {patient.injury} / Week {patient.week}
            </div>
            <div className="pt-patient-meta">
              <span style={{ color: patient.color }}>{patient.stage}</span>
              <span>{patient.status}</span>
              <span>{planLabel}</span>
            </div>
          </div>
        </div>
        {report && !report.ptRead ? <Tag label="Needs review" color={C.red} /> : patient.alert ? <Tag label="Watch" color={C.amber} /> : null}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: symptom ? C.bone : C.muted, lineHeight: 1.45 }}>
        {symptomText}
      </div>
    </button>
  );
}

function DetailBlock({ label, children, accent = C.rim }) {
  return (
    <div style={{ border: `1px solid ${C.rim}`, borderLeft: `3px solid ${accent}`, background: C.deep, borderRadius: 8, padding: 16 }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 9 }}>{children}</div>
    </div>
  );
}

function TimelineItem({ item, type, onMarkReviewed }) {
  const isReport = type === "report";
  const title = isReport ? item.exercise : "Session check-in";
  const isUnread = isReport && !item.ptRead;
  const accent = isUnread ? C.red : isReport ? C.blue : C.lime;

  return (
    <div style={{ border: `1px solid ${C.rim}`, background: C.deep, borderRadius: 8, padding: 14, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, lineHeight: 1 }}>{title}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 5 }}>{relativeTime(item.ts)}</div>
        </div>
        <Tag label={isUnread ? "New report" : isReport ? "Reviewed" : "Check-in"} color={accent} />
      </div>
      <div className="pt-history-metrics">
        <Metric label="Pain" value={`${item.pain}/${isReport ? 5 : 10}`} color={item.pain >= (isReport ? 5 : 7) ? C.red : C.bone} tone={item.pain >= (isReport ? 5 : 7) ? "danger" : "default"} />
        <Metric label="Swelling" value={`${item.swelling}/${isReport ? 5 : 10}`} color={item.swelling >= (isReport ? 4 : 7) ? C.red : C.bone} tone={item.swelling >= (isReport ? 4 : 7) ? "danger" : "default"} />
        <Metric label={isReport ? "Location" : "Confidence"} value={isReport ? item.location : `${item.confidence}/10`} color={C.bone} />
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.55 }}>
        {isReport ? item.note : item.concern}
      </div>
      {isUnread && (
        <button type="button" onClick={onMarkReviewed} style={{ justifySelf: "start", padding: "10px 12px", border: `1px solid ${C.rim}`, borderRadius: 7, background: C.panel, color: C.bone, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Mark reviewed
        </button>
      )}
    </div>
  );
}

function ProgressCheckRow({ label, value, detail, status = "watch" }) {
  const passed = status === "pass";
  const color = passed ? C.lime : C.amber;

  return (
    <div className="pt-progress-check-row">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, marginTop: 4 }}>{detail}</div>
      </div>
      <Tag label={value} color={color} />
    </div>
  );
}

function TrendBadge({ label, value, color }) {
  return (
    <div className="pt-trend-badge">
      <Label>{label}</Label>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color, lineHeight: 1, marginTop: 6 }}>{value}</div>
    </div>
  );
}

const PLAN_CATEGORIES = [
  { id: "all", label: "All", color: C.bone },
  { id: "mobility", label: "Mobility", color: C.blue },
  { id: "activation", label: "Activation", color: C.lime },
  { id: "strength", label: "Strength", color: C.amber },
  { id: "control", label: "Control", color: C.bone },
];

const CADENCE_OPTIONS = ["Daily", "3x / week", "2x / week", "As tolerated", "Hold"];

const EXERCISE_ALIASES = {
  bridges: "glute bridge",
  slr: "straight leg raise",
};

function normalizeExerciseName(name) {
  const normalized = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return EXERCISE_ALIASES[normalized] || normalized;
}

function getPlanLoad(exercise) {
  const name = normalizeExerciseName(exercise);
  if (name.includes("slide") || name.includes("pump") || name.includes("extension") || name.includes("mobility")) return "mobility";
  if (name.includes("quad") || name.includes("raise") || name.includes("bridge") || name.includes("activation")) return "activation";
  if (name.includes("squat") || name.includes("step") || name.includes("calf") || name.includes("lunge") || name.includes("press")) return "strength";
  if (name.includes("balance") || name.includes("hop") || name.includes("landing") || name.includes("shuffle") || name.includes("walk")) return "control";
  return "general";
}

function getCategoryColor(categoryId) {
  return PLAN_CATEGORIES.find((category) => category.id === categoryId)?.color || C.muted;
}

function getDefaultExerciseCadence(categoryId) {
  const cadence = {
    mobility: "Daily",
    activation: "Daily",
    strength: "3x / week",
    control: "3x / week",
    general: "As tolerated",
  };

  return cadence[categoryId] || "As tolerated";
}

function getExercisePurpose(exercise) {
  const category = exercise.category;
  if (category === "mobility") return "Restore range";
  if (category === "activation") return "Wake up support muscles";
  if (category === "strength") return "Build load tolerance";
  if (category === "control") return "Improve movement quality";
  return exercise.detail?.muscles || "General rehab";
}

const SIDEBAR_SECTIONS = [
  { id: "patients", label: "Patients" },
  { id: "review", label: "Review" },
  { id: "messages", label: "Messages" },
  { id: "plans", label: "Exercise plans" },
];

function SectionHeader({ eyebrow, title, detail, tag }) {
  return (
    <header className="pt-header">
      <div>
        <Label color={C.lime}>{eyebrow}</Label>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: C.bone, lineHeight: 1, marginTop: 6 }}>{title}</h1>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 7 }}>
          {detail}
        </div>
      </div>
      {tag}
    </header>
  );
}

function WorkQueueCard({ title, meta, description, tag, onClick, children }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="pt-queue-card"
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, lineHeight: 1 }}>{title}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{meta}</div>
        </div>
        {tag}
      </div>
      <div style={{ fontSize: 13, color: C.bone, lineHeight: 1.45 }}>{description}</div>
      {children}
    </div>
  );
}

function PortalSection({
  section,
  patients,
  reports,
  threads,
  latestCheckInsByPatient,
  onOpenPatient,
  onMarkReportReviewed,
}) {
  const unreadReports = reports.filter((report) => !report.ptRead).sort((a, b) => b.ts - a.ts);
  const sortedThreads = [...threads].sort((a, b) => {
    const aTs = a.messages.at(-1)?.ts || 0;
    const bTs = b.messages.at(-1)?.ts || 0;
    return bTs - aTs;
  });
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const reportsByPatient = reports.reduce((groups, report) => {
    const patientReports = groups.get(report.patientId) || [];
    patientReports.push(report);
    groups.set(report.patientId, patientReports);
    return groups;
  }, new Map());

  if (section === "review") {
    return (
      <>
        <SectionHeader
          eyebrow="Clinical review"
          title="Review queue"
          detail="Prioritize new symptom reports and open the patient workspace when a plan change is needed."
          tag={<Tag label={`${unreadReports.length} unread`} color={unreadReports.length ? C.red : C.lime} />}
        />
        <Panel>
          <div style={{ display: "grid", gap: 10 }}>
            {unreadReports.length > 0 ? (
              unreadReports.map((report) => {
                const patient = patientById.get(report.patientId);
                return (
                  <WorkQueueCard
                    key={report.id}
                    title={patient?.name || "Unknown patient"}
                    meta={`${report.exercise} / ${relativeTime(report.ts)}`}
                    description={report.note}
                    tag={<Tag label={`Pain ${report.pain}/5`} color={report.pain >= 5 ? C.red : C.amber} />}
                    onClick={() => onOpenPatient(report.patientId, "overview")}
                  >
                    <div className="pt-report-metrics">
                      <Metric label="Swelling" value={`${report.swelling}/5`} color={report.swelling >= 4 ? C.red : C.bone} tone={report.swelling >= 4 ? "danger" : "default"} />
                      <Metric label="Location" value={report.location} />
                      <div style={{ display: "grid", alignContent: "end" }}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMarkReportReviewed(report.id);
                          }}
                          style={{ width: "100%", padding: "11px 12px", border: `1px solid ${C.rim}`, borderRadius: 7, background: C.panel, color: C.bone, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}
                        >
                          Mark reviewed
                        </button>
                      </div>
                    </div>
                  </WorkQueueCard>
                );
              })
            ) : (
              <EmptyState title="Review queue clear" message="New patient symptom reports will appear here when they need clinician review." />
            )}
          </div>
        </Panel>
      </>
    );
  }

  if (section === "messages") {
    return (
      <>
        <SectionHeader
          eyebrow="Inbox"
          title="Messages"
          detail="Open patient conversations for questions, plan updates, symptom reports, and follow-up."
          tag={<Tag label={`${threads.length} threads`} color={C.blue} />}
        />
        <Panel>
          <div style={{ display: "grid", gap: 10 }}>
            {sortedThreads.map((thread) => {
              const threadReports = reportsByPatient.get(thread.patientId) || [];
              const latestReport = threadReports.slice().sort((a, b) => b.ts - a.ts)[0];
              const unreadReportCount = threadReports.filter((report) => !report.ptRead).length;
              const showReportPreview = thread.hasReport && latestReport;

              return (
                <WorkQueueCard
                  key={thread.id}
                  title={thread.patientName}
                  meta={showReportPreview ? `Latest report / ${latestReport.exercise} / ${relativeTime(latestReport.ts)}` : thread.updated}
                  description={showReportPreview ? latestReport.note : thread.excerpt}
                  tag={thread.hasReport ? <Tag label={unreadReportCount === 1 ? "Needs review" : `${unreadReportCount} need review`} color={C.red} /> : <Tag label="Conversation" color={C.blue} />}
                  onClick={() => onOpenPatient(thread.patientId, "messages")}
                />
              );
            })}
          </div>
        </Panel>
      </>
    );
  }

  if (section === "plans") {
    return (
      <>
        <SectionHeader
          eyebrow="Plan management"
          title="Exercise plans"
          detail="Compare assigned plans across the caseload and jump into plan editing for a patient."
          tag={<Tag label={`${patients.length} active`} color={C.lime} />}
        />
        <Panel>
          <div style={{ display: "grid", gap: 10 }}>
            {patients.map((patient) => (
              <WorkQueueCard
                key={patient.id}
                title={patient.name}
                meta={`${patient.injury} / Week ${patient.week}`}
                description={`${patient.assignedExercises.length} assigned exercises for ${patient.stage.toLowerCase()}.`}
                onClick={() => onOpenPatient(patient.id, "plan")}
              >
                <div className="pt-plan-preview">
                  {patient.assignedExercises.slice(0, 4).map((exercise) => (
                    <span key={exercise}>{exercise}</span>
                  ))}
                </div>
              </WorkQueueCard>
            ))}
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        eyebrow="Caseload"
        title="Patients"
        detail="Choose a patient to open their clinical review, messages, and exercise plan."
        tag={<Tag label={`${patients.length} active`} color={C.blue} />}
      />
      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <Label color={C.lime}>Patients</Label>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, marginTop: 5 }}>Active caseload</div>
          </div>
          <Tag label={`${patients.length} active`} color={C.blue} />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {patients.map((patient) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              active={false}
              report={reports.find((report) => report.patientId === patient.id)}
              checkIn={latestCheckInsByPatient.get(patient.id)}
              onClick={() => onOpenPatient(patient.id, "overview")}
            />
          ))}
        </div>
      </Panel>
    </>
  );
}

function PatientWorkspace({
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

              <DetailBlock label="Exercise load" accent={planStatus === "pass" ? C.lime : C.amber}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, lineHeight: 1 }}>{planLoadLabel}</div>
                    <Tag label={`${patient.assignedExercises.length} exercises`} color={planStatus === "pass" ? C.lime : C.amber} />
                  </div>
                  <div className="pt-load-grid">
                    <TrendBadge label="Mobility" value={planLoads.mobility} color={C.blue} />
                    <TrendBadge label="Activation" value={planLoads.activation} color={C.lime} />
                    <TrendBadge label="Strength" value={planLoads.strength} color={C.amber} />
                    <TrendBadge label="Control" value={planLoads.control} color={C.bone} />
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div>
                <Label color={C.lime}>Exercise plan</Label>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, marginTop: 5 }}>Today&apos;s clinical plan</div>
              </div>
              <Tag label={planRiskLabel} color={planRiskColor} />
            </div>

            <div className="pt-plan-summary">
              <TrendBadge label="Focus" value={planPrimaryFocus} color={C.bone} />
              <TrendBadge label="Readiness" value={`${readinessScore}%`} color={readinessColor} />
              <TrendBadge label="Plan load" value={planLoadLabel} color={planStatus === "pass" ? C.lime : C.amber} />
              <div className="pt-plan-next">
                <Label>Next action</Label>
                <div>{planNextAction}</div>
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
                        <div className="pt-today-dose">{exercise.detail ? `${exercise.detail.sets} sets / ${exercise.detail.reps} / rest ${exercise.detail.rest}` : "Dose not set"}</div>
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
                    const isExpanded = expandedPlanExercise === exercise.name;
                    const categoryColor = getCategoryColor(exercise.category);
                    return (
                      <div key={exercise.name} className={`pt-assigned-exercise${isExpanded ? " pt-assigned-exercise-open" : ""}`}>
                        <div className="pt-assigned-row">
                          <button
                            type="button"
                            className="pt-assigned-toggle"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedPlanExercise(isExpanded ? "" : exercise.name)}
                          >
                            <div className="pt-assigned-row-main">
                              <div className="pt-exercise-index" style={{ "--exercise-color": categoryColor }}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="pt-exercise-title">{exercise.name}</div>
                                <div className="pt-exercise-dose">
                                  {exercise.detail ? `${exercise.detail.sets} sets / ${exercise.detail.reps} / rest ${exercise.detail.rest}` : "Dose not set"}
                                </div>
                              </div>
                            </div>
                          </button>
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
                        {isExpanded ? (
                          <div className="pt-assigned-details">
                            <div className="pt-exercise-meta">
                              <span>{exercise.detail?.equipment || "No equipment listed"}</span>
                              <span>{exercise.detail?.muscles || "General rehab"}</span>
                            </div>
                            <div className="pt-exercise-cue">
                              {exercise.detail?.cue || "Use clinician guidance for tempo, range, and symptom limits."}
                            </div>
                            <button type="button" onClick={() => onUnassignExercise(patient.id, exercise.name)} className="pt-plan-remove">
                              Remove from plan
                            </button>
                          </div>
                        ) : null}
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div>
                <Label color={C.lime}>History</Label>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, marginTop: 5 }}>Reports & check-ins</div>
              </div>
              <Tag label={`${historyItems.length} records`} color={C.blue} />
            </div>
            <div style={{ display: "grid", gap: 10 }}>
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
          </Panel>
        )}
      </div>
    </div>
  );
}

function MessagePanel({ thread, reports, onSendMessage, onMarkReportReviewed }) {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const message = draft.trim();
    if (!message || !thread) return;
    onSendMessage(thread.id, message);
    setDraft("");
  };

  return (
    <Panel style={{ minHeight: 420, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", marginBottom: 16 }}>
        <div>
          <Label color={C.lime}>Messages</Label>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, lineHeight: 1, marginTop: 6 }}>{thread?.patientName || "No thread selected"}</div>
        </div>
        {thread?.hasReport ? <Tag label="Needs review" color={C.red} /> : thread ? <Tag label="Conversation" color={C.blue} /> : null}
      </div>
      <div style={{ flex: 1, display: "grid", gap: 12, alignContent: "start", maxHeight: 380, overflowY: "auto", padding: "2px 4px 2px 0" }}>
        {thread ? (
          thread.messages.map((message, index) => {
            const report = parseSymptomReportMessage(message.text);
            const sourceReport = report
              ? reports.find((item) => item.id === message.reportId) ||
                reports.find((item) => item.patientId === thread.patientId && item.ts === message.ts) ||
                reports.find((item) => item.patientId === thread.patientId && item.exercise === report.exercise && `${item.pain}/5` === report.pain && `${item.swelling}/5` === report.swelling)
              : null;
            return (
              <div key={`${message.ts}-${index}`} style={{ display: "flex", justifyContent: message.sender === "pt" ? "flex-end" : "flex-start" }}>
                {report ? (
                  <div style={{ width: "min(100%, 560px)" }}>
                    <SymptomReportCard report={report} sourceReport={sourceReport} onMarkReviewed={() => onMarkReportReviewed(sourceReport.id)} />
                  </div>
                ) : (
                  <div style={{ maxWidth: "82%", borderRadius: message.sender === "pt" ? "8px 8px 2px 8px" : "8px 8px 8px 2px", padding: "11px 12px", background: message.sender === "pt" ? C.lime : C.deep, border: message.sender === "pt" ? "none" : `1px solid ${C.rim}`, color: message.sender === "pt" ? C.black : C.bone, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {message.text}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState title="No thread selected" message="Choose a patient from the caseload to open their conversation." />
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.rim}` }}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder="Write a message..."
          style={{ flex: 1, minWidth: 0, borderRadius: 7, border: `1px solid ${C.rim}`, background: C.deep, color: C.bone, padding: "12px 13px", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
        />
        <button type="button" onClick={handleSend} style={{ padding: "0 16px", border: "none", borderRadius: 7, background: C.lime, color: C.black, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Send
        </button>
      </div>
    </Panel>
  );
}

export function PtPortalView({
  user,
  patients,
  selectedPatientId,
  reports,
  checkIns,
  threads,
  activeThreadId,
  exerciseNames,
  onSelectPatient,
  onSignOut,
  onResetDemo,
  onSendMessage,
  onAssignExercise,
  onUnassignExercise,
  onUpdateExerciseCadence,
  onMarkReportReviewed,
}) {
  const [activePatientTab, setActivePatientTab] = useState("overview");
  const [activeSidebarSection, setActiveSidebarSection] = useState("patients");
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || null;
  const selectedReport = reports.find((report) => report.patientId === selectedPatient?.id);
  const selectedCheckIn = [...checkIns].reverse().find((checkIn) => checkIn.patientId === selectedPatient?.id);
  const activeThread = selectedPatient
    ? threads.find((thread) => thread.patientId === selectedPatient.id && thread.id === activeThreadId) || threads.find((thread) => thread.patientId === selectedPatient.id)
    : null;
  const latestCheckInsByPatient = useMemo(
    () =>
      checkIns.reduce((latest, checkIn) => {
        const current = latest.get(checkIn.patientId);
        if (!current || checkIn.ts > current.ts) {
          latest.set(checkIn.patientId, checkIn);
        }
        return latest;
      }, new Map()),
    [checkIns],
  );
  const availableExercises = useMemo(
    () => exerciseNames.filter((exercise) => selectedPatient && !selectedPatient.assignedExercises.includes(exercise)),
    [exerciseNames, selectedPatient],
  );
  const isPatientListOnly = !selectedPatient;
  const selectedPatientReports = useMemo(
    () => reports.filter((report) => report.patientId === selectedPatient?.id),
    [reports, selectedPatient],
  );
  const selectedPatientCheckIns = useMemo(
    () => checkIns.filter((checkIn) => checkIn.patientId === selectedPatient?.id),
    [checkIns, selectedPatient],
  );

  const openPatientWorkspace = (patientId, tab = "overview") => {
    onSelectPatient(patientId);
    setActivePatientTab(tab);
  };

  const openSidebarSection = (sectionId) => {
    setActiveSidebarSection(sectionId);
    onSelectPatient(null);
    setActivePatientTab("overview");
  };

  const showPatientList = () => {
    openSidebarSection("patients");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.black}; color: ${C.bone}; }
        body { min-height: 100vh; }
        button, input { font: inherit; outline: none; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.lime}; outline-offset: 3px; }
        button { cursor: pointer; }
        .pt-panel {
          background: ${C.panel};
          border: 1px solid ${C.rim};
          border-radius: 8px;
          padding: 18px;
        }
        .pt-shell {
          min-height: 100vh;
          background: ${C.black};
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
        }
        .pt-layout {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 18px;
        }
        .pt-sidebar {
          position: sticky;
          top: 24px;
          align-self: start;
          height: calc(100vh - 48px);
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .pt-header {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pt-header-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(112px, 1fr));
          gap: 10px;
          min-width: min(100%, 560px);
        }
        .pt-patient-row {
          width: 100%;
          border-radius: 8px;
          padding: 16px 18px;
          text-align: left;
          display: grid;
          gap: 14px;
        }
        .pt-sidebar-button {
          width: 100%;
          border-radius: 7px;
          padding: 11px 12px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.08em;
          text-align: left;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid ${C.rim};
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .pt-sidebar-button:hover,
        .pt-sidebar-button:focus-visible,
        .pt-sidebar-button[aria-current="page"] {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-queue-card {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 16px 18px;
          color: ${C.bone};
          text-align: left;
          display: grid;
          gap: 12px;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .pt-queue-card:hover,
        .pt-queue-card:focus-visible {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          transform: translateY(-1px);
        }
        .pt-patient-avatar {
          width: 48px;
          height: 48px;
          border: 1px solid;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          font-family: 'Bebas Neue', cursive;
          font-size: 16px;
          line-height: 1;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }
        .pt-patient-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 10px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pt-patient-meta span {
          display: inline-flex;
          align-items: center;
          min-width: 0;
        }
        .pt-patient-meta span + span::before {
          content: '/';
          color: ${C.ghost};
          margin: 0 8px;
        }
        .pt-metric {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 7px;
          padding: 12px 14px;
          min-height: 84px;
          min-width: 0;
        }
        .pt-metric-danger {
          border-color: ${C.red}55;
          background: ${C.redDim};
        }
        .pt-report-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-history-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-selected-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }
        .pt-overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.9fr) minmax(220px, 0.7fr);
          gap: 12px;
        }
        .pt-overview-dashboard {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 12px;
          align-items: stretch;
        }
        .pt-overview-dashboard > :first-child {
          grid-column: 1 / -1;
        }
        .pt-progress-check-hero {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 16px;
          align-items: center;
        }
        .pt-progress-score-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-trend-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-load-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-trend-badge {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          min-width: 0;
        }
        .pt-progress-check-row {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }
        .pt-tabbar {
          display: flex;
          gap: 8px;
          padding: 6px;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          overflow-x: auto;
        }
        .pt-tab {
          flex: 1 0 auto;
          min-width: 120px;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 10px 12px;
          background: transparent;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-tab[aria-selected="true"] {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-back-link {
          border: none;
          background: transparent;
          color: ${C.muted};
          padding: 2px 0;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-back-link:hover,
        .pt-back-link:focus-visible {
          color: ${C.lime};
        }
        .pt-tab-content {
          min-height: 560px;
          display: grid;
        }
        .pt-tab-content > .pt-panel {
          min-height: 100%;
        }
        .pt-note-grid,
        .pt-plan-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .pt-plan-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }
        .pt-plan-decision {
          border: 1px solid var(--decision-color);
          background: ${C.deep};
          border-radius: 8px;
          padding: 13px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          margin-bottom: 12px;
        }
        .pt-plan-decision > div:first-child > div {
          font-family: 'Bebas Neue', cursive;
          font-size: 30px;
          color: var(--decision-color);
          line-height: 1;
          margin-top: 6px;
        }
        .pt-plan-decision p {
          margin: 8px 0 0;
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-plan-decision-steps {
          display: grid;
          grid-template-columns: repeat(3, auto);
          gap: 6px;
        }
        .pt-plan-decision-steps span {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 999px;
          padding: 7px 9px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pt-plan-decision-steps span.active {
          border-color: var(--decision-color);
          background: color-mix(in srgb, var(--decision-color) 16%, transparent);
          color: var(--decision-color);
        }
        .pt-plan-next {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 7px;
          padding: 11px 12px;
          min-width: 0;
        }
        .pt-plan-next div {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
          margin-top: 8px;
        }
        .pt-plan-alert {
          border: 1px solid ${C.amber}55;
          background: ${C.amberDim};
          border-radius: 8px;
          padding: 12px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px 14px;
          align-items: center;
          margin-bottom: 12px;
        }
        .pt-plan-alert div {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-plan-alert button {
          grid-row: 1 / span 2;
          grid-column: 2;
          border: 1px solid ${C.amber}66;
          background: ${C.panel};
          border-radius: 7px;
          color: ${C.bone};
          padding: 10px 12px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-weekly-plan {
          display: grid;
          gap: 10px;
          margin-bottom: 16px;
        }
        .pt-today-plan {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 12px;
        }
        .pt-today-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          padding-bottom: 12px;
          border-bottom: 1px solid ${C.rim};
        }
        .pt-today-header > div:first-child > div {
          font-family: 'Bebas Neue', cursive;
          font-size: 30px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-today-header p {
          margin: 8px 0 0;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.5;
        }
        .pt-today-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(86px, 1fr));
          gap: 8px;
        }
        .pt-today-list {
          display: grid;
          gap: 7px;
        }
        .pt-today-list button {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          padding: 10px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          color: ${C.bone};
          text-align: left;
        }
        .pt-today-list button:hover,
        .pt-today-list button:focus-visible {
          border-color: ${C.lime}66;
          background: ${C.limeDim};
        }
        .pt-today-index {
          width: 30px;
          height: 30px;
          border: 1px solid ${C.lime}55;
          background: ${C.limeDim};
          border-radius: 7px;
          display: grid;
          place-items: center;
          color: ${C.lime};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
        }
        .pt-today-main {
          min-width: 0;
        }
        .pt-today-exercise {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-today-dose {
          margin-top: 5px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.35;
        }
        .pt-today-rationale {
          color: ${C.bone};
          font-size: 12px;
          line-height: 1.35;
          margin-top: 6px;
        }
        .pt-today-tags {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pt-weekly-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .pt-weekly-section {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 12px;
          display: grid;
          gap: 10px;
          min-width: 0;
          color: ${C.bone};
          text-align: left;
        }
        .pt-weekly-section:hover,
        .pt-weekly-section:focus-visible {
          border-color: ${C.lime}66;
        }
        .pt-weekly-section-active {
          border-color: ${C.lime};
          background: ${C.limeDim};
        }
        .pt-weekly-section-head {
          display: grid;
          gap: 10px;
        }
        .pt-weekly-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 21px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-weekly-cadence {
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          color: ${C.muted};
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .pt-weekly-days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 3px;
        }
        .pt-weekly-days span {
          height: 22px;
          border: 1px solid ${C.rim};
          border-radius: 5px;
          display: grid;
          place-items: center;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 8px;
        }
        .pt-weekly-days span.active {
          border-color: ${C.lime}66;
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-weekly-exercises {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .pt-weekly-exercises span {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 999px;
          padding: 5px 7px;
          color: ${C.bone};
          font-size: 10px;
          line-height: 1.25;
        }
        .pt-plan-column {
          display: grid;
          gap: 10px;
          align-content: start;
          min-width: 0;
        }
        .pt-plan-column-header {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 7px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .pt-plan-column-header div div {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-assigned-exercise,
        .pt-add-exercise {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 13px;
          color: ${C.bone};
          text-align: left;
          display: grid;
          gap: 10px;
          min-width: 0;
        }
        .pt-assigned-exercise {
          padding: 0;
          overflow: hidden;
        }
        .pt-assigned-exercise-open {
          border-color: ${C.lime}44;
        }
        .pt-assigned-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px;
        }
        .pt-assigned-toggle {
          width: 100%;
          min-width: 0;
          border: none;
          background: transparent;
          color: ${C.bone};
          padding: 0;
          display: block;
          text-align: left;
        }
        .pt-assigned-row-main {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          min-width: 0;
        }
        .pt-exercise-index {
          width: 32px;
          height: 32px;
          border: 1px solid var(--exercise-color);
          background: color-mix(in srgb, var(--exercise-color) 14%, transparent);
          border-radius: 7px;
          display: grid;
          place-items: center;
          color: var(--exercise-color);
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
        }
        .pt-assigned-row-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .pt-assigned-row-meta label {
          display: grid;
          gap: 4px;
        }
        .pt-assigned-row-meta label span {
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-assigned-row-meta select {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          color: ${C.bone};
          border-radius: 6px;
          padding: 7px 26px 7px 8px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          min-width: 118px;
        }
        .pt-assigned-purpose {
          border-top: 1px solid ${C.rim};
          padding: 8px 12px;
          color: ${C.muted};
          font-size: 12px;
          line-height: 1.35;
        }
        .pt-assigned-details {
          border-top: 1px solid ${C.rim};
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .pt-add-exercise {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
        }
        .pt-add-exercise:hover,
        .pt-add-exercise:focus-visible {
          border-color: ${C.lime};
        }
        .pt-exercise-main {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
          min-width: 0;
        }
        .pt-exercise-main > div {
          min-width: 0;
        }
        .pt-exercise-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-exercise-dose {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 6px;
          line-height: 1.4;
        }
        .pt-exercise-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pt-exercise-meta span {
          border: 1px solid ${C.rim};
          border-radius: 999px;
          padding: 5px 7px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .pt-exercise-cue {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.5;
        }
        .pt-plan-remove {
          justify-self: start;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          color: ${C.muted};
          border-radius: 7px;
          padding: 8px 10px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-plan-remove:hover,
        .pt-plan-remove:focus-visible {
          color: ${C.red};
          border-color: ${C.red}55;
        }
        .pt-plan-search {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          color: ${C.bone};
          border-radius: 7px;
          padding: 12px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }
        .pt-plan-search::placeholder {
          color: ${C.muted};
        }
        .pt-plan-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .pt-plan-filters button {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 999px;
          color: ${C.muted};
          padding: 7px 9px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pt-plan-filters button[aria-pressed="true"] {
          border-color: var(--category-color);
          background: ${C.limeDim};
          color: var(--category-color);
        }
        .pt-plan-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .pt-plan-preview span {
          border: 1px solid ${C.rim};
          border-radius: 999px;
          padding: 6px 8px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        @media (max-width: 1180px) {
          .pt-layout {
            grid-template-columns: 1fr;
          }
          .pt-sidebar {
            position: static;
            height: auto;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
          }
          .pt-sidebar nav {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .pt-sidebar-actions {
            margin-top: 0 !important;
            grid-template-columns: 1fr;
          }
          .pt-plan-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-weekly-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-overview-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pt-overview-dashboard {
            grid-template-columns: 1fr;
          }
          .pt-overview-dashboard > :first-child {
            grid-column: auto;
          }
        }
        @media (max-width: 820px) {
          .pt-shell {
            padding: 14px;
          }
          .pt-sidebar {
            grid-template-columns: 1fr;
          }
          .pt-sidebar nav,
          .pt-header-metrics,
          .pt-selected-metrics,
          .pt-overview-grid,
          .pt-progress-score-row,
          .pt-trend-grid,
          .pt-history-metrics,
          .pt-note-grid,
          .pt-plan-grid,
          .pt-plan-decision,
          .pt-weekly-grid,
          .pt-plan-summary {
            grid-template-columns: 1fr;
          }
          .pt-plan-decision-steps {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .pt-plan-decision-steps span {
            text-align: center;
          }
          .pt-today-header,
          .pt-today-list button {
            grid-template-columns: 1fr;
          }
          .pt-today-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-today-tags {
            justify-content: flex-start;
          }
          .pt-assigned-row {
            grid-template-columns: 1fr;
          }
          .pt-assigned-row-meta {
            justify-content: flex-start;
          }
          .pt-plan-alert {
            grid-template-columns: 1fr;
          }
          .pt-plan-alert button {
            grid-column: auto;
            grid-row: auto;
            justify-self: start;
          }
          .pt-load-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pt-progress-check-hero,
          .pt-progress-check-row {
            grid-template-columns: 1fr;
          }
          .pt-header {
            align-items: stretch;
          }
          .pt-report-metrics {
            grid-template-columns: 1fr;
          }
          .pt-tab-content {
            min-height: 460px;
          }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
      `}</style>
      <div className="pt-shell">
        <div className="pt-layout">
          <aside className="pt-sidebar">
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.04em", lineHeight: 1 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>
                PT portal
              </div>
            </div>
            <nav style={{ display: "grid", gap: 8 }}>
              {SIDEBAR_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSidebarSection(item.id)}
                  className="pt-sidebar-button"
                  aria-current={!selectedPatient && activeSidebarSection === item.id ? "page" : undefined}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-sidebar-actions" style={{ marginTop: "auto", display: "grid", gap: 8 }}>
              <div style={{ border: `1px solid ${C.rim}`, background: C.panel, borderRadius: 8, padding: 12 }}>
                <Label>Signed in</Label>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, marginTop: 7 }}>{user.name}</div>
              </div>
              <button type="button" onClick={onSignOut} style={{ padding: "11px 12px", borderRadius: 7, border: `1px solid ${C.rim}`, background: C.panel, color: C.bone, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Sign out
              </button>
              <button type="button" onClick={onResetDemo} style={{ padding: "11px 12px", borderRadius: 7, border: `1px solid ${C.rim}`, background: "transparent", color: C.muted, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Reset demo
              </button>
            </div>
          </aside>

          <main style={{ display: "grid", gap: 18 }}>
            {isPatientListOnly ? (
              <PortalSection
                section={activeSidebarSection}
                patients={patients}
                reports={reports}
                threads={threads}
                latestCheckInsByPatient={latestCheckInsByPatient}
                onOpenPatient={openPatientWorkspace}
                onMarkReportReviewed={onMarkReportReviewed}
              />
            ) : (
              <PatientWorkspace
                patient={selectedPatient}
                report={selectedReport}
                checkIn={selectedCheckIn}
                reports={selectedPatientReports}
                checkIns={selectedPatientCheckIns}
                activeThread={activeThread}
                availableExercises={availableExercises}
                activeTab={activePatientTab}
                onTabChange={setActivePatientTab}
                onBack={showPatientList}
                onSendMessage={onSendMessage}
                onAssignExercise={onAssignExercise}
                onUnassignExercise={onUnassignExercise}
                onUpdateExerciseCadence={onUpdateExerciseCadence}
                onMarkReportReviewed={onMarkReportReviewed}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
