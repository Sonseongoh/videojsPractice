export type VideoSource = {
  id: string;
  label: string;
  description: string;
  src: string;
  type: string;
  origin: "local" | "external";
};

export const videoSources: VideoSource[] = [
  {
    id: "flower",
    label: "꽃 샘플",
    description: "로컬 MP4 기본 영상",
    src: "/videos/flower.mp4",
    type: "video/mp4",
    origin: "local",
  },
  {
    id: "sintel",
    label: "신텔 예고편",
    description: "로컬 MP4 예고편",
    src: "/videos/sintel-trailer.mp4",
    type: "video/mp4",
    origin: "local",
  },
  {
    id: "hls-tears",
    label: "Tears of Steel HLS",
    description: "외부 HLS 스트림, 브라우저 환경에 따라 재생 여부가 달라질 수 있음",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "application/x-mpegURL",
    origin: "external",
  },
];

export function formatTime(seconds: number | undefined) {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) {
    return "--";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
