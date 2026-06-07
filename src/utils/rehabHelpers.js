import { CARE_PATH_OPTIONS } from "../constants/rehabConfig";

export const getPatientMilestones = (patient, milestones) => {
  const currentPhase = patient?.phaseNum ?? 0;
  const patientInjury = patient?.injury || patient?.condition;
  const patientStatuses = patient?.milestoneStatus || {};

  return milestones
    .filter(
      (milestone) =>
        milestone.injury === patientInjury || milestone.injury === "All"
    )
    .sort((a, b) => a.phaseNum - b.phaseNum || a.title.localeCompare(b.title))
    .map((milestone) => {
      const manualStatus = patientStatuses[milestone.id];

      if (manualStatus) {
        return {
          ...milestone,
          status: manualStatus.status || "Not Started",
          note: manualStatus.note || "",
          metDate: manualStatus.metDate || "",
        };
      }

      if (milestone.phaseNum < currentPhase) {
        return { ...milestone, status: "Complete", note: "" };
      }

      if (milestone.phaseNum === currentPhase) {
        return { ...milestone, status: "Current", note: "" };
      }

      return { ...milestone, status: "Upcoming", note: "" };
    });
};

export const getCareStatusLabel = (patient) => {
  const carePath =
    CARE_PATH_OPTIONS.find((option) => option.value === patient?.carePath)
      ?.label || "Care path not set";

  if (patient?.carePath === "post-op") {
    return `${carePath} · Week ${patient.weekPostOp ?? "N/A"}`;
  }

  if (patient?.surgeryDate) {
    return `${carePath} · Surgery ${patient.surgeryDate}`;
  }

  return carePath;
};

export const getReportPriority = (report) => {
  const note = String(report?.note || report?.summary || "").toLowerCase();
  const urgentWords = ["sharp", "pop", "gave way", "giving way", "worse"];

  if (
    Number(report?.pain) >= 7 ||
    Number(report?.swelling) >= 6 ||
    urgentWords.some((word) => note.includes(word))
  ) {
    return "urgent";
  }

  if (
    !report?.ptRead ||
    Number(report?.pain) >= 5 ||
    Number(report?.swelling) >= 4
  ) {
    return "watch";
  }

  return "routine";
};

export const getStageClass = (stage) =>
  String(stage || "unknown").toLowerCase().replaceAll(" ", "-");

export const getInitials = (name) =>
  String(name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const formatRehabDate = (item) => {
  if (item.date) return item.date;
  if (item.ts) return new Date(item.ts).toLocaleDateString();
  return "No date";
};
