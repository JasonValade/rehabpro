export function getYouTubeVideoId(exercise) {
  if (exercise.videoEmbed) {
    try {
      const embedUrl = new URL(exercise.videoEmbed);
      return embedUrl.pathname.split("/").filter(Boolean).at(-1) || "";
    } catch {
      return "";
    }
  }

  if (exercise.youtubeId) {
    return exercise.youtubeId;
  }

  if (!exercise.youtubeUrl) {
    return "";
  }

  try {
    const url = new URL(exercise.youtubeUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return url.hostname.includes("youtu.be")
      ? pathParts[0] || ""
      : url.searchParams.get("v") || (pathParts[0] === "shorts" || pathParts[0] === "embed" ? pathParts[1] : pathParts.at(-1)) || "";
  } catch {
    return "";
  }
}
