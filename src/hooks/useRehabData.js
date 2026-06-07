import { useState } from "react";
import { MOCK_PATIENTS } from "../data/mockPatients";
import { MOCK_REPORTS } from "../data/mockReports";
import { MOCK_LOGS } from "../data/mockLogs";
import { MOCK_CHECK_INS } from "../data/mockCheckIns";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";

export function useRehabData() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [checkIns, setCheckIns] = useState(MOCK_CHECK_INS);

  const assignExercise = (patientId, exerciseId) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const assignedExercises = patient.assignedExercises || [];
        const exerciseOverrides = patient.exerciseOverrides || {};

        if (assignedExercises.includes(exerciseId)) {
          return patient;
        }

        return {
          ...patient,
          assignedExercises: [...assignedExercises, exerciseId],
          exerciseOverrides: {
            ...exerciseOverrides,
            [exerciseId]: exerciseOverrides[exerciseId] || {},
          },
        };
      })
    );
  };

  const removeExercise = (patientId, exerciseId) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const assignedExercises = patient.assignedExercises || [];
        const exerciseOverrides = { ...(patient.exerciseOverrides || {}) };

        delete exerciseOverrides[exerciseId];

        return {
          ...patient,
          assignedExercises: assignedExercises.filter((id) => id !== exerciseId),
          exerciseOverrides,
        };
      })
    );
  };

  const updateAssignedExercise = (patientId, exerciseId, updates) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const exerciseOverrides = patient.exerciseOverrides || {};

        return {
          ...patient,
          exerciseOverrides: {
            ...exerciseOverrides,
            [exerciseId]: {
              ...(exerciseOverrides[exerciseId] || {}),
              ...updates,
            },
          },
        };
      })
    );
  };

  const updatePatient = (patientId, updates) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId ? { ...patient, ...updates } : patient
      )
    );
  };

  const applyWorkoutTemplate = (patientId, template) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const assignedExercises = [
          ...new Set([
            ...(patient.assignedExercises || []),
            ...(template.exerciseIds || []),
          ]),
        ];

        return {
          ...patient,
          assignedExercises,
        };
      })
    );
  };

  const updatePatientMilestone = (patientId, milestoneId, updates) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const milestoneStatus = patient.milestoneStatus || {};
        const nextUpdates = {
          ...updates,
          ...(updates.status === "Met" && !updates.metDate
            ? { metDate: new Date().toISOString().split("T")[0] }
            : {}),
        };

        return {
          ...patient,
          milestoneStatus: {
            ...milestoneStatus,
            [milestoneId]: {
              ...(milestoneStatus[milestoneId] || {}),
              ...nextUpdates,
            },
          },
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

  const submitCheckIn = ({
    patientId,
    pain,
    swelling,
    soreness,
    confidence,
    sleep,
    concern,
  }) => {
    const checkIn = {
      id: `check-${Date.now()}`,
      patientId,
      ts: Date.now(),
      pain: Number(pain),
      swelling: Number(swelling),
      soreness: Number(soreness),
      confidence: Number(confidence),
      sleep,
      concern,
    };

    setCheckIns((prev) => [checkIn, ...prev]);

    return checkIn;
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
    checkIns,
    exercises: EXERCISE_LIBRARY,
    assignExercise,
    removeExercise,
    updateAssignedExercise,
    updatePatient,
    updatePatientMilestone,
    applyWorkoutTemplate,
    addWorkoutLog,
    submitReport,
    submitCheckIn,
    markReportRead,
    replyToReport,
  };
}
