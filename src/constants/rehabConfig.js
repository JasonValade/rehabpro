export const STAGE_OPTIONS = [
  { phaseNum: 0, stage: "Prehab" },
  { phaseNum: 1, stage: "Protection" },
  { phaseNum: 2, stage: "Early Motion" },
  { phaseNum: 3, stage: "Strengthening" },
  { phaseNum: 4, stage: "Return to Sport" },
];

export const MILESTONE_STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Met",
  "Blocked",
];

export const CARE_PATH_OPTIONS = [
  { value: "post-op", label: "Post-op" },
  { value: "prehab-scheduled", label: "Prehab - surgery scheduled" },
  { value: "prehab-unscheduled", label: "Prehab - no surgery date" },
  { value: "non-surgical", label: "Non-surgical rehab" },
];

export const CLINIC_TEAM = {
  name: "RehabPro Sports PT",
  providers: ["Dr. Rivera, PT", "Alex Rivera, PTA", "Morgan Lee, ATC"],
};
