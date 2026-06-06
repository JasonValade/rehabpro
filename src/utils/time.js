export const relTime = (ts) => {
  const diff = Date.now() - ts;

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return `${Math.floor(diff / 86400000)}d ago`;
};