export function getYouTubeEmbedUrl(videoId: string) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}
