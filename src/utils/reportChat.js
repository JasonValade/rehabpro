export function formatSymptomReportMessage(report) {
  const lines = [
    "SYMPTOM REPORT",
    `Exercise: ${report.exercise || "General"}`,
    `Pain: ${report.pain || 0}/5`,
    `Swelling: ${report.swelling || 0}/5`,
    `Location: ${report.location || "Not specified"}`,
  ];

  if (report.note?.trim()) {
    lines.push(`Note: ${report.note.trim()}`);
  }

  return lines.join("\n");
}
