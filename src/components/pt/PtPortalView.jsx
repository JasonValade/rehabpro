import React, { useMemo, useState } from "react";
import { C } from "../../constants/colors";
import { PatientWorkspace } from "./PatientWorkspace";
import { PortalSection } from "./PortalSection";
import { PtPortalStyles } from "./PtPortalStyles";
import { Label } from "./ptPortalShared";
import { SIDEBAR_SECTIONS } from "./ptPortalUtils";

const PATIENT_WORKSPACE_TABS = new Set(["overview", "plan", "messages", "history"]);

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
  onUpdateExerciseDose,
  onMarkReportReviewed,
}) {
  const [activePatientTab, setActivePatientTab] = useState("overview");
  const [activeSidebarSection, setActiveSidebarSection] = useState("dashboard");
  const [reviewedPriorityActionIds, setReviewedPriorityActionIds] = useState([]);
  const [milestoneDecisions, setMilestoneDecisions] = useState({});
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
    setActivePatientTab(PATIENT_WORKSPACE_TABS.has(tab) ? tab : "overview");
  };

  const openSidebarSection = (sectionId) => {
    setActiveSidebarSection(sectionId);
    onSelectPatient(null);
    setActivePatientTab("overview");
  };

  const showPatientList = () => {
    openSidebarSection("dashboard");
  };

  const markPriorityActionReviewed = (action) => {
    if (action.reportId) {
      onMarkReportReviewed(action.reportId);
      return;
    }

    setReviewedPriorityActionIds((current) => (current.includes(action.id) ? current : [...current, action.id]));
  };

  const recordMilestoneDecision = (checkId, outcome) => {
    setMilestoneDecisions((current) => ({
      ...current,
      [checkId]: { outcome, ts: Date.now() },
    }));
  };

  return (
    <>
      <PtPortalStyles />
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

          <main className="pt-content">
            {isPatientListOnly ? (
              <PortalSection
                section={activeSidebarSection}
                patients={patients}
                reports={reports}
                checkIns={checkIns}
                threads={threads}
                latestCheckInsByPatient={latestCheckInsByPatient}
                onOpenPatient={openPatientWorkspace}
                onMarkReportReviewed={onMarkReportReviewed}
                onMarkPriorityActionReviewed={markPriorityActionReviewed}
                reviewedPriorityActionIds={reviewedPriorityActionIds}
                milestoneDecisions={milestoneDecisions}
                onSetMilestoneDecision={recordMilestoneDecision}
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
                onUpdateExerciseDose={onUpdateExerciseDose}
                onMarkReportReviewed={onMarkReportReviewed}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
