import React from "react";
import { C } from "../../constants/colors";
import { Tag } from "../ui/Tag";
import { EmptyState, Label, Metric, Panel, PatientRow, SectionHeader, WorkQueueCard } from "./ptPortalShared";
import { relativeTime } from "./ptPortalUtils";

export function PortalSection({
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
