import { useMemo, useState } from "react";
import { MOCK_PATIENTS } from "../data/mockPatients";
import { MOCK_CHECK_INS } from "../data/mockCheckIns";
import { MOCK_MESSAGES } from "../data/mockMessages";
import { MOCK_REPORTS } from "../data/mockReports";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { relativeTime } from "../components/pt/ptPortalUtils";

// Self-contained mock state for the therapist portal demo (no backend / auth involved).
export function usePtDemoState() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);

  const exerciseNames = useMemo(() => EXERCISE_LIBRARY.map((exercise) => exercise.name), []);

  const threads = useMemo(
    () =>
      patients.map((patient) => {
        const patientMessages = messages.filter((message) => message.patientId === patient.id).sort((a, b) => a.ts - b.ts);
        const lastMessage = patientMessages[patientMessages.length - 1];
        return {
          id: `thread_${patient.id}`,
          patientId: patient.id,
          patientName: patient.name,
          updated: lastMessage ? relativeTime(lastMessage.ts) : "No messages yet",
          excerpt: lastMessage?.text || "No messages yet",
          hasReport: reports.some((report) => report.patientId === patient.id && !report.ptRead),
          messages: patientMessages,
        };
      }),
    [messages, patients, reports],
  );

  const onSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveThreadId(patientId ? threads.find((thread) => thread.patientId === patientId)?.id ?? null : null);
  };

  const onSendMessage = (threadId, text) => {
    const thread = threads.find((item) => item.id === threadId);
    if (!thread) return;
    setMessages((current) => [...current, { id: `msg_${Date.now()}`, patientId: thread.patientId, sender: "pt", text, ts: Date.now() }]);
  };

  const updatePatient = (patientId, updater) => {
    setPatients((current) => current.map((patient) => (patient.id === patientId ? updater(patient) : patient)));
  };

  const onAssignExercise = (patientId, exerciseName, cadence) => {
    updatePatient(patientId, (patient) => ({
      ...patient,
      assignedExercises: patient.assignedExercises.includes(exerciseName) ? patient.assignedExercises : [...patient.assignedExercises, exerciseName],
      planCadence: cadence ? { ...patient.planCadence, [exerciseName]: cadence } : patient.planCadence,
    }));
  };

  const onUnassignExercise = (patientId, exerciseName) => {
    updatePatient(patientId, (patient) => ({
      ...patient,
      assignedExercises: patient.assignedExercises.filter((name) => name !== exerciseName),
    }));
  };

  const onUpdateExerciseCadence = (patientId, exerciseName, cadence) => {
    updatePatient(patientId, (patient) => ({ ...patient, planCadence: { ...patient.planCadence, [exerciseName]: cadence } }));
  };

  const onUpdateExerciseDose = (patientId, exerciseName, field, value) => {
    updatePatient(patientId, (patient) => ({
      ...patient,
      planDose: { ...patient.planDose, [exerciseName]: { ...patient.planDose?.[exerciseName], [field]: value } },
    }));
  };

  const onMarkReportReviewed = (reportId) => {
    setReports((current) => current.map((report) => (report.id === reportId ? { ...report, ptRead: true } : report)));
  };

  const onResetDemo = () => {
    setPatients(MOCK_PATIENTS);
    setReports(MOCK_REPORTS);
    setMessages(MOCK_MESSAGES);
    setSelectedPatientId(null);
    setActiveThreadId(null);
  };

  return {
    patients,
    reports,
    checkIns: MOCK_CHECK_INS,
    threads,
    exerciseNames,
    selectedPatientId,
    activeThreadId,
    onSelectPatient,
    onSendMessage,
    onAssignExercise,
    onUnassignExercise,
    onUpdateExerciseCadence,
    onUpdateExerciseDose,
    onMarkReportReviewed,
    onResetDemo,
  };
}
