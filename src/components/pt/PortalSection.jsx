import React, { useMemo } from "react";
import { C } from "../../constants/colors";
import { MILESTONES } from "../../data/rehabMock";
import { Tag } from "../ui/Tag";
import { EmptyState, Label, Metric, Panel, PatientRow, SectionHeader, WorkQueueCard } from "./ptPortalShared";
import { relativeTime } from "./ptPortalUtils";

function getLatestPatientReport(reports, patientId) {
  return reports
    .filter((report) => report.patientId === patientId)
    .sort((a, b) => b.ts - a.ts)[0];
}

function getLatestMessageNeedingReply(thread) {
  const messages = [...(thread?.messages || [])].sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const latestPtMessage = [...messages].reverse().find((message) => message.sender === "pt");
  const latestPtTs = latestPtMessage?.ts || 0;

  return [...messages]
    .reverse()
    .find(
      (message) =>
        message.sender === "patient" &&
        (message.ts || 0) > latestPtTs &&
        !message.reportId &&
        !String(message.text || "").startsWith("SYMPTOM REPORT"),
    );
}

function hasWorseningSymptoms(patientCheckIns) {
  const comparable = [...patientCheckIns]
    .filter((checkIn) => Number.isFinite(Number(checkIn.pain)) || Number.isFinite(Number(checkIn.swelling)))
    .sort((a, b) => a.ts - b.ts);
  if (comparable.length < 2) return false;

  const previous = comparable.at(-2);
  const latest = comparable.at(-1);
  return Number(latest.pain || 0) > Number(previous.pain || 0) || Number(latest.swelling || 0) > Number(previous.swelling || 0);
}

function getNextPatientMilestone(patient) {
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
}

function getPatientAction(patient, reports, latestCheckIn, patientCheckIns, thread) {
  const latestReport = getLatestPatientReport(reports, patient.id);
  const nextMilestone = getNextPatientMilestone(patient);
  const unreadReport = reports
    .filter((report) => report.patientId === patient.id && !report.ptRead)
    .sort((a, b) => b.ts - a.ts)[0];
  const highReport = unreadReport && (Number(unreadReport.pain) >= 5 || Number(unreadReport.swelling) >= 4);
  const highCheckIn = latestCheckIn && (Number(latestCheckIn.pain) >= 5 || Number(latestCheckIn.swelling) >= 5);
  const completion = Number(latestCheckIn?.completion);
  const lowCompletion = Number.isFinite(completion) && completion < 75;
  const lastCheckInAgeHours = latestCheckIn ? (Date.now() - latestCheckIn.ts) / 3600000 : Infinity;
  const staleCheckIn = lastCheckInAgeHours > 72;
  const planGap = patient.assignedExercises.length < 3;
  const messageNeedingReply = getLatestMessageNeedingReply(thread);
  const worseningSymptoms = hasWorseningSymptoms(patientCheckIns);
  const milestoneDue = !unreadReport && patient.week >= Math.max(0, Number(nextMilestone.week || patient.week) - 1);
  const readyToProgress = !unreadReport && !highCheckIn && Number.isFinite(completion) && completion >= 85 && patient.assignedExercises.length >= 3;

  const candidates = [
    highReport && {
      id: `${patient.id}:report:${unreadReport.id}`,
      score: 100,
      tab: "overview",
      label: "Review now",
      color: C.red,
      title: "High symptom report",
      detail: `${unreadReport.exercise}: pain ${unreadReport.pain}/5, swelling ${unreadReport.swelling}/5`,
      note: unreadReport.note,
      ts: unreadReport.ts,
      reportId: unreadReport.id,
    },
    !highReport && unreadReport && {
      id: `${patient.id}:report:${unreadReport.id}`,
      score: 80,
      tab: "overview",
      label: "Review report",
      color: C.amber,
      title: "New symptom report",
      detail: `${unreadReport.exercise}: pain ${unreadReport.pain}/5`,
      note: unreadReport.note,
      ts: unreadReport.ts,
      reportId: unreadReport.id,
    },
    messageNeedingReply && {
      id: `${patient.id}:message:${messageNeedingReply.ts || "latest"}`,
      score: 70,
      tab: "messages",
      label: "Reply needed",
      color: C.blue,
      title: "Patient question",
      detail: "Latest message has no PT reply",
      note: messageNeedingReply.text,
      ts: messageNeedingReply.ts,
    },
    milestoneDue && {
      id: `${patient.id}:milestone:${nextMilestone.label}`,
      score: 60,
      tab: "overview",
      label: "Milestone check",
      color: C.lime,
      title: "Milestone due",
      detail: `${nextMilestone.label} readiness screen`,
      note: `Week ${patient.week} lines up with the ${nextMilestone.label} milestone. Check symptoms and movement quality before progressing.`,
      ts: latestCheckIn?.ts || latestReport?.ts || 0,
    },
    worseningSymptoms && {
      id: `${patient.id}:worsening:${latestCheckIn?.id || latestCheckIn?.ts || "latest"}`,
      score: 55,
      tab: "history",
      label: "Trend review",
      color: C.amber,
      title: "Symptoms trending worse",
      detail: `Latest check-in: pain ${latestCheckIn?.pain ?? "-"}/10, swelling ${latestCheckIn?.swelling ?? "-"}/10`,
      note: latestCheckIn?.concern || "Recent check-ins show a symptom increase.",
      ts: latestCheckIn?.ts || 0,
    },
    highCheckIn && {
      id: `${patient.id}:high-check-in:${latestCheckIn.id || latestCheckIn.ts}`,
      score: 55,
      tab: "history",
      label: "Check symptoms",
      color: C.amber,
      title: "Symptoms trending high",
      detail: `Latest check-in: pain ${latestCheckIn.pain}/10, swelling ${latestCheckIn.swelling}/10`,
      note: latestCheckIn.concern,
      ts: latestCheckIn.ts,
    },
    lowCompletion && {
      id: `${patient.id}:low-completion:${latestCheckIn.id || latestCheckIn.ts}`,
      score: 45,
      tab: "messages",
      label: "Follow up",
      color: C.blue,
      title: "Low adherence",
      detail: `Last session completion ${completion}%`,
      note: latestCheckIn.concern,
      ts: latestCheckIn.ts,
    },
    staleCheckIn && {
      id: `${patient.id}:stale-check-in:${latestCheckIn?.id || latestCheckIn?.ts || "missing"}`,
      score: 35,
      tab: "messages",
      label: "Check in",
      color: C.blue,
      title: "No recent check-in",
      detail: latestCheckIn ? `Last check-in ${relativeTime(latestCheckIn.ts)}` : "No check-ins submitted",
      note: "Send a quick follow-up before the next home session.",
      ts: latestCheckIn?.ts || 0,
    },
    planGap && {
      id: `${patient.id}:plan-gap:${patient.assignedExercises.length}`,
      score: 25,
      tab: "plan",
      label: "Update plan",
      color: C.blue,
      title: "Plan needs coverage",
      detail: `${patient.assignedExercises.length} assigned exercises`,
      note: "Add enough home work to cover today's rehab block.",
      ts: latestReport?.ts || latestCheckIn?.ts || 0,
    },
    readyToProgress && {
      id: `${patient.id}:ready-to-progress:${latestCheckIn.id || latestCheckIn.ts}`,
      score: 20,
      tab: "plan",
      label: "Progress plan",
      color: C.lime,
      title: "Ready to progress",
      detail: `Completion ${completion}% with no open reports`,
      note: "Review load tolerance and consider the next progression.",
      ts: latestCheckIn.ts,
    },
  ].filter(Boolean);

  if (candidates.length > 0) {
    return candidates.sort((a, b) => b.score - a.score || b.ts - a.ts)[0];
  }

  return {
    id: `${patient.id}:stable:${latestReport?.id || latestCheckIn?.id || latestCheckIn?.ts || "empty"}`,
    score: 0,
    tab: "overview",
    label: "Stable",
    color: C.lime,
    title: "Stable",
    detail: latestReport ? `Latest report reviewed ${relativeTime(latestReport.ts)}` : "No open review items",
    note: latestCheckIn?.concern || "Continue current plan and monitor next check-in.",
    ts: latestReport?.ts || latestCheckIn?.ts || 0,
  };
}

function DashboardActionCard({ patient, action, onOpenPatient, onMarkPriorityActionReviewed }) {
  const openAction = (tab = action.tab) => {
    onOpenPatient(patient.id, tab);
  };

  return (
    <article className="pt-dashboard-action-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, lineHeight: 1 }}>{patient.name}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {action.title} / {action.ts ? relativeTime(action.ts) : "No recent check-in"}
          </div>
        </div>
        <Tag label={action.label} color={action.color} />
      </div>
      <div style={{ fontSize: 13, color: C.bone, lineHeight: 1.45 }}>{action.note}</div>
      <div className="pt-dashboard-action-row">
        <div>
          <Label color={action.color}>Next action</Label>
          <div>{action.detail}</div>
        </div>
        <div className="pt-dashboard-actions">
          <button
            type="button"
            className="pt-dashboard-review-button"
            aria-label={`Mark ${patient.name}'s priority item reviewed`}
            onClick={() => onMarkPriorityActionReviewed(action)}
          >
            Mark reviewed
          </button>
          <button type="button" onClick={() => openAction(action.tab)}>
            Open
          </button>
          <button type="button" onClick={() => openAction("messages")}>
            Message
          </button>
          <button type="button" onClick={() => openAction("plan")}>
            Plan
          </button>
        </div>
      </div>
    </article>
  );
}

function getMilestoneCheckId(patient, milestone) {
  return `${patient.id}:milestone:${milestone.label}`;
}

function CompactMilestoneCheck({ patient, milestone, latestReport, latestCheckIn, decision, onOpenPatient, onSetMilestoneDecision }) {
  const checkId = getMilestoneCheckId(patient, milestone);
  const hasOpenReport = latestReport && !latestReport.ptRead;
  const due = patient.week >= Number(milestone.week || patient.week);
  const status = decision?.outcome || "pending";
  const statusColor = status === "passed" ? C.lime : status === "failed" ? C.red : hasOpenReport ? C.amber : due ? C.lime : C.blue;
  const statusLabel = status === "passed" ? "Passed" : status === "failed" ? "Failed" : hasOpenReport ? "Hold" : due ? "Due" : "Upcoming";
  const signal = latestReport
    ? `Report pain ${latestReport.pain}/5 / ${relativeTime(latestReport.ts)}`
    : latestCheckIn
      ? `${latestCheckIn.completion ?? "-"}% complete / ${relativeTime(latestCheckIn.ts)}`
      : `${patient.assignedExercises.length} assigned exercises`;

  return (
    <article className="pt-dashboard-gate-row">
      <div style={{ minWidth: 0 }}>
        <div className="pt-dashboard-gate-head">
          <div>
            {patient.name}
            <span>
              {patient.injury} / Week {patient.week}
            </span>
          </div>
          <Tag label={statusLabel} color={statusColor} />
        </div>
        <div className="pt-dashboard-gate-title">{milestone.label}</div>
        <div className="pt-dashboard-gate-signal">{signal}</div>
      </div>
      <div className="pt-dashboard-gate-actions">
        <button type="button" onClick={() => onOpenPatient(patient.id, "history")}>
          Screen
        </button>
        <button
          type="button"
          className={status === "passed" ? "pt-milestone-pass-button-active" : "pt-milestone-pass-button"}
          onClick={() => onSetMilestoneDecision(checkId, "passed")}
        >
          Pass
        </button>
        <button
          type="button"
          className={status === "failed" ? "pt-milestone-fail-button-active" : "pt-milestone-fail-button"}
          onClick={() => onSetMilestoneDecision(checkId, "failed")}
        >
          Fail
        </button>
      </div>
    </article>
  );
}

export function PortalSection({
  section,
  patients,
  reports,
  checkIns,
  threads,
  latestCheckInsByPatient,
  onOpenPatient,
  onMarkPriorityActionReviewed,
  reviewedPriorityActionIds = [],
  milestoneDecisions = {},
  onSetMilestoneDecision,
}) {
  const needsDashboardData = section === "dashboard" || section === "patients";
  const needsMessageData = section === "dashboard" || section === "messages";

  const unreadReports = useMemo(
    () => (needsDashboardData ? reports.filter((report) => !report.ptRead).sort((a, b) => b.ts - a.ts) : []),
    [needsDashboardData, reports],
  );
  const sortedThreads = useMemo(
    () =>
      needsMessageData
        ? [...threads].sort((a, b) => {
            const aTs = a.messages.at(-1)?.ts || 0;
            const bTs = b.messages.at(-1)?.ts || 0;
            return bTs - aTs;
          })
        : [],
    [needsMessageData, threads],
  );
  const reportsByPatient = useMemo(() => {
    if (section !== "messages") return new Map();

    return reports.reduce((groups, report) => {
      const current = groups.get(report.patientId) || { latestReport: null, unreadReportCount: 0 };
      groups.set(report.patientId, {
        latestReport: !current.latestReport || report.ts > current.latestReport.ts ? report : current.latestReport,
        unreadReportCount: current.unreadReportCount + (report.ptRead ? 0 : 1),
      });
      return groups;
    }, new Map());
  }, [reports, section]);
  const checkInsByPatient = useMemo(() => {
    if (!needsDashboardData) return new Map();

    return checkIns.reduce((groups, checkIn) => {
      const patientCheckIns = groups.get(checkIn.patientId) || [];
      patientCheckIns.push(checkIn);
      groups.set(checkIn.patientId, patientCheckIns);
      return groups;
    }, new Map());
  }, [checkIns, needsDashboardData]);
  const latestReportByPatient = useMemo(() => {
    if (!needsDashboardData) return new Map();

    return reports.reduce((latest, report) => {
      const current = latest.get(report.patientId);
      if (!current || report.ts > current.ts) {
        latest.set(report.patientId, report);
      }
      return latest;
    }, new Map());
  }, [needsDashboardData, reports]);
  const patientActions = useMemo(() => {
    if (!needsDashboardData) return [];

    const threadsByPatient = new Map(threads.map((thread) => [thread.patientId, thread]));
    return patients
      .map((patient) => ({
        patient,
        action: getPatientAction(
          patient,
          reports,
          latestCheckInsByPatient.get(patient.id),
          checkInsByPatient.get(patient.id) || [],
          threadsByPatient.get(patient.id),
        ),
      }))
      .sort((a, b) => b.action.score - a.action.score || b.action.ts - a.action.ts);
  }, [checkInsByPatient, latestCheckInsByPatient, needsDashboardData, patients, reports, threads]);
  const reviewedPriorityActions = useMemo(() => new Set(reviewedPriorityActionIds), [reviewedPriorityActionIds]);
  const visiblePatientActions = useMemo(
    () => (needsDashboardData ? patientActions.filter(({ action }) => !reviewedPriorityActions.has(action.id)) : []),
    [needsDashboardData, patientActions, reviewedPriorityActions],
  );
  const priorityActions = useMemo(
    () => (section === "dashboard" ? visiblePatientActions.filter(({ action }) => action.score >= 25) : []),
    [section, visiblePatientActions],
  );
  const readyActions = useMemo(
    () => (section === "dashboard" ? visiblePatientActions.filter(({ action }) => action.score === 20) : []),
    [section, visiblePatientActions],
  );
  const dashboardActions = priorityActions.length ? priorityActions.slice(0, 2) : readyActions.slice(0, 2);
  const milestoneChecks = useMemo(
    () =>
      section === "dashboard"
        ? patients
            .map((patient) => {
              const milestone = getNextPatientMilestone(patient);
              const latestReport = latestReportByPatient.get(patient.id);
              const latestCheckIn = latestCheckInsByPatient.get(patient.id);
              const decision = milestoneDecisions[getMilestoneCheckId(patient, milestone)];
              return {
                patient,
                milestone,
                latestReport,
                latestCheckIn,
                decision,
                dueScore: patient.week >= Number(milestone.week || patient.week) ? 2 : patient.week >= Number(milestone.week || patient.week) - 2 ? 1 : 0,
              };
            })
            .sort((a, b) => b.dueScore - a.dueScore || b.patient.week - a.patient.week)
        : [],
    [latestCheckInsByPatient, latestReportByPatient, milestoneDecisions, patients, section],
  );
  const pendingMilestoneCount = useMemo(() => milestoneChecks.filter((check) => !check.decision).length, [milestoneChecks]);
  const dashboardMilestoneChecks = useMemo(
    () => (section === "dashboard" ? milestoneChecks.filter((check) => !check.decision).slice(0, 3) : []),
    [milestoneChecks, section],
  );
  const latestMessages = useMemo(
    () => (needsMessageData ? sortedThreads.filter((thread) => !thread.hasReport).slice(0, section === "dashboard" ? 2 : 3) : []),
    [needsMessageData, section, sortedThreads],
  );

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
              const threadReportSummary = reportsByPatient.get(thread.patientId);
              const latestReport = threadReportSummary?.latestReport;
              const unreadReportCount = threadReportSummary?.unreadReportCount || 0;
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

  if (section === "patients") {
    return (
      <>
        <SectionHeader
          eyebrow="Caseload"
          title="Active patients"
          detail="Browse every active patient, scan their latest signal, and open the full workspace."
          tag={<Tag label={`${patients.length} active`} color={C.blue} />}
        />
        <Panel>
          <div className="pt-dashboard-section-head">
            <div>
              <Label color={C.lime}>Patients</Label>
              <div>Full active caseload</div>
            </div>
            <Tag label={`${unreadReports.length} open reports`} color={unreadReports.length ? C.red : C.lime} />
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {patientActions.map(({ patient }) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                active={false}
                report={getLatestPatientReport(reports, patient.id)}
                checkIn={latestCheckInsByPatient.get(patient.id)}
                onClick={() => onOpenPatient(patient.id, "overview")}
              />
            ))}
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        eyebrow="PT workday"
        title="Today"
        detail="Start with the patients that need attention, then clear the next gates when the queue is quiet."
        tag={<Tag label={`${priorityActions.length} priority / ${pendingMilestoneCount} gates`} color={priorityActions.length ? C.red : pendingMilestoneCount ? C.amber : C.lime} />}
      />
      <div className="pt-dashboard-focus-grid">
        <div className="pt-dashboard-main-stack">
          <Panel>
            <div className="pt-dashboard-summary">
              <Metric label="Open reviews" value={unreadReports.length} color={unreadReports.length ? C.red : C.lime} tone={unreadReports.length ? "danger" : "default"} />
              <Metric label="Replies" value={latestMessages.length} color={C.blue} />
              <Metric label="Gates" value={pendingMilestoneCount} color={pendingMilestoneCount ? C.amber : C.lime} />
            </div>
          </Panel>

          <Panel>
            <div className="pt-dashboard-section-head">
              <div>
                <Label color={C.lime}>Priority queue</Label>
                <div>Next best action</div>
              </div>
              <Tag label={priorityActions.length ? `${priorityActions.length} open` : "Clear"} color={priorityActions.length ? C.red : C.lime} />
            </div>
            <div className="pt-dashboard-priority-list">
              {dashboardActions.length > 0 ? (
                dashboardActions.map(({ patient, action }) => (
                  <DashboardActionCard key={patient.id} patient={patient} action={action} onOpenPatient={onOpenPatient} onMarkPriorityActionReviewed={onMarkPriorityActionReviewed} />
                ))
              ) : (
                <EmptyState title="Queue clear" message="No reports, replies, adherence dips, stale check-ins, or progression candidates need action right now." />
              )}
            </div>
          </Panel>
        </div>

        <div className="pt-dashboard-side-stack">
          <Panel>
            <div className="pt-dashboard-section-head">
              <div>
                <Label color={C.amber}>Progression checks</Label>
                <div>Next gates</div>
              </div>
              <Tag label={`${pendingMilestoneCount} pending`} color={pendingMilestoneCount ? C.amber : C.lime} />
            </div>
            <div className="pt-dashboard-gate-list">
              {dashboardMilestoneChecks.length > 0 ? (
                dashboardMilestoneChecks.map(({ patient, milestone, latestReport, latestCheckIn, decision }) => (
                  <CompactMilestoneCheck
                    key={getMilestoneCheckId(patient, milestone)}
                    patient={patient}
                    milestone={milestone}
                    latestReport={latestReport}
                    latestCheckIn={latestCheckIn}
                    decision={decision}
                    onOpenPatient={onOpenPatient}
                    onSetMilestoneDecision={onSetMilestoneDecision}
                  />
                ))
              ) : (
                <EmptyState title="No gates pending" message="Progression checks will appear here when a patient is ready for a screen." />
              )}
            </div>
          </Panel>

          <Panel>
            <div className="pt-dashboard-section-head">
              <div>
                <Label color={C.blue}>Conversations</Label>
                <div>Recent follow-up</div>
              </div>
              <Tag label={`${threads.length} threads`} color={C.blue} />
            </div>
            <div className="pt-dashboard-compact-list">
              {latestMessages.length > 0 ? (
                latestMessages.map((thread) => (
                  <button key={thread.id} type="button" className="pt-dashboard-compact-row" onClick={() => onOpenPatient(thread.patientId, "messages")}>
                    <div>
                      <div>{thread.patientName}</div>
                      <span>{thread.excerpt}</span>
                    </div>
                    <Tag label={thread.updated} color={C.blue} />
                  </button>
                ))
              ) : (
                <EmptyState title="Inbox quiet" message="Open messages will appear here when they are not already part of the priority queue." />
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
