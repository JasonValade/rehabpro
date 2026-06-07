import { useState } from "react";
import { C } from "./constants/colors";
import { MILESTONES, PERF_DATA, REHAB_TODAY, GYM_TODAY, LOCKED_EXERCISES, PT_MSG, PT_PATIENTS, PT_THREADS, EXERCISE_NAMES } from "./data/rehabMock";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { HomeView } from "./components/patient/HomeView";
import { TrainView } from "./components/patient/TrainView";
import { ProgressView } from "./components/patient/ProgressView";
import { ReportView } from "./components/patient/ReportView";
import { PtHomeView } from "./components/pt/PtHomeView";
import { PtTrainView } from "./components/pt/PtTrainView";
import { MessagesView } from "./components/pt/MessagesView";
import { PTChat } from "./components/pt/PTChat";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500;600&display=swap');
`;

const TABS = [
  { id: "home", icon: "⬡", label: "HOME" },
  { id: "train", icon: "◈", label: "TRAIN" },
  { id: "progress", icon: "◎", label: "PROGRESS" },
  { id: "pt", icon: "⊕", label: "PT" },
  { id: "report", icon: "", label: "REPORT" },
];

const PT_HOME_TABS = [
  { id: "home", icon: "⬡", label: "HOME" },
  { id: "pt", icon: "⊕", label: "MSG" },
];

const PT_PATIENT_TABS = [
  { id: "train", icon: "◈", label: "TRAIN" },
  { id: "progress", icon: "◎", label: "PROGRESS" },
  { id: "pt", icon: "⊕", label: "MSG" },
];

export default function RehabPro() {
  const [viewMode, setViewMode] = useLocalStorageState("rehabpro:viewMode", "patient");
  const [tab, setTab] = useLocalStorageState("rehabpro:tab", "home");
  const [rehabItems, setRehabItems] = useLocalStorageState("rehabpro:rehabItems", REHAB_TODAY);
  const [gymItems, setGymItems] = useLocalStorageState("rehabpro:gymItems", GYM_TODAY);
  const [ptPatients, setPtPatients] = useLocalStorageState("rehabpro:ptPatients", PT_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useLocalStorageState("rehabpro:selectedPatientId", null);
  const [ptDetailMode, setPtDetailMode] = useLocalStorageState("rehabpro:ptDetailMode", false);
  const [ptThreads, setPtThreads] = useLocalStorageState("rehabpro:ptThreads", PT_THREADS);
  const [activeThreadId, setActiveThreadId] = useLocalStorageState("rehabpro:activeThreadId", PT_THREADS[0].id);

  const selectedPatient = ptPatients.find((patient) => patient.id === selectedPatientId);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setPtDetailMode(true);
    setTab("train");
  };

  const handleBackToPtHome = () => {
    setPtDetailMode(false);
    setTab("home");
    setActiveThreadId("");
  };

  const handleAssignExercise = (patientId, exercise) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId && !patient.assignedExercises.includes(exercise)
          ? { ...patient, assignedExercises: [...patient.assignedExercises, exercise] }
          : patient
      )
    );
  };

  const handleUnassignExercise = (patientId, exercise) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, assignedExercises: patient.assignedExercises.filter((item) => item !== exercise) }
          : patient
      )
    );
  };

  const handleSendPtMessage = (threadId, text) => {
    setPtThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              hasReport: false,
              updated: "Now",
              excerpt: text,
              messages: [...thread.messages, { sender: "pt", text, ts: Date.now() }],
            }
          : thread
      )
    );
  };

  return (
    <>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.black}; color: ${C.bone}; }
        body { min-height: 100vh; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: ${C.muted}; }
        button { cursor: pointer; }
        @keyframes bounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
      <div
        style={{
          background: C.black,
          minHeight: "100vh",
          height: "100vh",
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.rim}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em", lineHeight: 1 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
                  JASON · WK14 · ACL+MEN
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em" }}>
                  {viewMode === "patient" ? "PATIENT MODE" : "PT MODE"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em" }}>
                {rehabItems.filter((i) => i.done).length + gymItems.filter((i) => i.done).length}/{rehabItems.length + gymItems.length} TODAY
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {[{ id: "patient", label: "Patient" }, { id: "pt", label: "PT" }].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setViewMode(option.id);
                  setTab("home");
                  if (option.id === "pt") {
                    setPtDetailMode(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 12,
                  border: `1px solid ${viewMode === option.id ? C.lime : C.rim}`,
                  background: viewMode === option.id ? C.lime : C.panel,
                  color: viewMode === option.id ? C.black : C.bone,
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "pt" && ptDetailMode && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={handleBackToPtHome}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${C.rim}`,
                background: C.panel,
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ← Back to patients
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: "16px 20px", paddingBottom: "calc(112px + env(safe-area-inset-bottom, 0))", overflowY: "auto" }}>
          {tab === "home" && (viewMode === "pt" ? <PtHomeView patients={ptPatients} selectedPatientId={selectedPatientId} onSelectPatient={handleSelectPatient} /> : <HomeView rehabItems={rehabItems} gymItems={gymItems} milestones={MILESTONES} perfData={PERF_DATA} ptMessage={PT_MSG} lockedExercises={LOCKED_EXERCISES} />)}
          {tab === "train" && (viewMode === "pt" ? <PtTrainView patient={selectedPatient} exerciseNames={EXERCISE_NAMES} onAssign={handleAssignExercise} onUnassign={handleUnassignExercise} /> : <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} gymItems={gymItems} setGymItems={setGymItems} />)}
          {tab === "progress" && <ProgressView milestones={MILESTONES} perfData={PERF_DATA} />}
          {tab === "pt" && (viewMode === "pt" ? <MessagesView threads={ptThreads} activeThreadId={activeThreadId} onSelectThread={setActiveThreadId} onSendMessage={handleSendPtMessage} onBack={() => setActiveThreadId("")} /> : <PTChat />)}
          {tab === "report" && viewMode !== "pt" && <ReportView rehabItems={rehabItems} />}
        </div>

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: 430,
            margin: "0 auto",
            borderTop: `1px solid ${C.rim}`,
            background: C.deep,
            display: "flex",
            padding: "10px 4px calc(20px + env(safe-area-inset-bottom, 0))",
            zIndex: 20,
            boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
          }}
        >
          {(viewMode === "pt" ? (ptDetailMode ? PT_PATIENT_TABS : PT_HOME_TABS) : TABS).map((t) => {
            const active = tab === t.id;
            const isReport = t.id === "report";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "12px 0 10px",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 20, color: active ? (isReport ? C.red : C.lime) : C.muted, transition: "color 0.15s" }}>
                  {t.icon}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 11, letterSpacing: "0.1em", color: active ? (isReport ? C.red : C.lime) : C.muted, transition: "color 0.15s" }}>
                  {t.label}
                </div>
                {active && <div style={{ width: 18, height: 2, borderRadius: 1, background: isReport ? C.red : C.lime }} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
