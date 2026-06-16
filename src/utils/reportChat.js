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

export function parseSymptomReportMessage(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines[0] !== "SYMPTOM REPORT") {
    return null;
  }

  return lines.slice(1).reduce(
    (report, line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return report;

      const key = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();
      return { ...report, [key]: value };
    },
    { title: lines[0] },
  );
}
