const VIDEO_ID = /^[a-zA-Z0-9_-]{6,20}$/;

export function safeHttpsUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export type PublicVideo = {
  id: string;
  title: string;
};

export function publishedVideos(
  videos: readonly { id: string; title: string }[],
): PublicVideo[] {
  return videos
    .filter((video) => VIDEO_ID.test(video.id) && video.title.trim().length > 0)
    .map((video) => ({ id: video.id, title: video.title.trim() }));
}
