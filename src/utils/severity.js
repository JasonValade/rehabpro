import { C } from "../constants/theme";

export const severityColor = (n) => {
  if (n <= 2) return C.accent;
  if (n <= 3) return C.yellow;
  return C.warn;
};

export const stageColor = (stage) => {
  const colors = {
    Prehab: C.purple,
    Protection: C.warn,
    "Early Motion": C.yellow,
    Strengthening: C.blue,
    "Return to Sport": C.accent,
  };

  return colors[stage] || C.muted;
};

export const diffLabel = (n) => {
  return ["", "Beginner", "Easy", "Moderate", "Advanced", "Elite"][n];
};

export const diffColor = (n) => {
  return [C.muted, C.accent, C.accent, C.yellow, C.warn, C.warn][n];
};