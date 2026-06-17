import { C } from "../../constants/colors";

export function relativeTime(ts) {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatClinicalDate(ts) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

export const PLAN_CATEGORIES = [
  { id: "all", label: "All", color: C.bone },
  { id: "mobility", label: "Mobility", color: C.blue },
  { id: "activation", label: "Activation", color: C.lime },
  { id: "strength", label: "Strength", color: C.amber },
  { id: "control", label: "Control", color: C.bone },
];

export const CADENCE_OPTIONS = ["Daily", "3x / week", "2x / week", "As tolerated", "Hold"];

const EXERCISE_ALIASES = {
  bridges: "glute bridge",
  slr: "straight leg raise",
};

export function normalizeExerciseName(name) {
  const normalized = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return EXERCISE_ALIASES[normalized] || normalized;
}

export function getPlanLoad(exercise) {
  const name = normalizeExerciseName(exercise);
  if (name.includes("slide") || name.includes("pump") || name.includes("extension") || name.includes("mobility")) return "mobility";
  if (name.includes("quad") || name.includes("raise") || name.includes("bridge") || name.includes("activation")) return "activation";
  if (name.includes("squat") || name.includes("step") || name.includes("calf") || name.includes("lunge") || name.includes("press")) return "strength";
  if (name.includes("balance") || name.includes("hop") || name.includes("landing") || name.includes("shuffle") || name.includes("walk")) return "control";
  return "general";
}

export function getCategoryColor(categoryId) {
  return PLAN_CATEGORIES.find((category) => category.id === categoryId)?.color || C.muted;
}

export function getDefaultExerciseCadence(categoryId) {
  const cadence = {
    mobility: "Daily",
    activation: "Daily",
    strength: "3x / week",
    control: "3x / week",
    general: "As tolerated",
  };

  return cadence[categoryId] || "As tolerated";
}

export function getExercisePurpose(exercise) {
  const category = exercise.category;
  if (category === "mobility") return "Restore range";
  if (category === "activation") return "Wake up support muscles";
  if (category === "strength") return "Build load tolerance";
  if (category === "control") return "Improve movement quality";
  return exercise.detail?.muscles || "General rehab";
}

export const SIDEBAR_SECTIONS = [
  { id: "patients", label: "Patients" },
  { id: "review", label: "Review" },
  { id: "messages", label: "Messages" },
  { id: "plans", label: "Exercise plans" },
];
