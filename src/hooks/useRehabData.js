import { useState } from "react";
import { MOCK_PATIENTS } from "../data/mockPatients";
import { MOCK_REPORTS } from "../data/mockReports";
import { MOCK_LOGS } from "../data/mockLogs";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";

export function useRehabData() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [logs, setLogs] = useState(MOCK_LOGS);

  const assignExercise = (patientId, exerciseId) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const assignedExercises = patient.assignedExercises || [];

        if (assignedExercises.includes(exerciseId)) {
          return patient;
        }

        return {
          ...patient,
          assignedExercises: [...assignedExercises, exerciseId],
        };
      })
    );
  };

  const removeExercise = (patientId, exerciseId) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const assignedExercises = patient.assignedExercises || [];

        return {
          ...patient,
          assignedExercises: assignedExercises.filter((id) => id !== exerciseId),
        };
      })
    );
  };

  const addWorkoutLog = ({
    patientId,
    completedExerciseIds = [],
    painLevel = 0,
    notes = "",
  }) => {
    const newLog = {
      id: `log-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split("T")[0],
      ts: Date.now(),
      completedExerciseIds,
      painLevel: Number(painLevel),
      notes,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const submitReport = ({
    patientId,
    exercise,
    pain,
    swelling,
    location,
    note,
  }) => {
    const report = {
      id: `r_${Date.now()}`,
      patientId,
      ts: Date.now(),
      exercise: exercise || "General",
      swelling,
      pain,
      location: location || "Not specified",
      note,
      ptRead: false,
      ptReply: null,
    };

    setReports((prev) => [report, ...prev]);

    return report;
  };

  const markReportRead = (reportId) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, ptRead: true } : report
      )
    );
  };

  const replyToReport = (reportId, text) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              ptReply: text,
              ptRead: true,
            }
          : report
      )
    );
  };

  return {
    patients,
    reports,
    logs,
    exercises: EXERCISE_LIBRARY,
    assignExercise,
    removeExercise,
    addWorkoutLog,
    submitReport,
    markReportRead,
    replyToReport,
  };
}