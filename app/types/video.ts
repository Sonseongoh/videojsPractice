export type TextTrackSource = {
  id: string;
  label: string;
  language: string;
  src: string;
  kind: "subtitles" | "captions";
  default?: boolean;
};

export type VideoSource = {
  id: string;
  label: string;
  description: string;
  src: string;
  type: string;
  origin: "local" | "external";
  textTracks?: TextTrackSource[];
};

export type EventLogEntry = {
  id: number;
  name: string;
  time: string;
  detail?: string;
};

export type PlayerState = {
  currentTime?: number;
  duration?: number;
  playbackRate?: number;
  paused?: boolean;
  volume?: number;
  muted?: boolean;
  bufferedPercent?: number;
};

export type PlaybackError = {
  code?: number;
  message: string;
  sourceId: string;
  sourceLabel: string;
  sourceType: string;
  sourceOrigin: VideoSource["origin"];
};

export type Bookmark = {
  id: string;
  label: string;
  time: number;
};

export type LoopRegion = {
  start?: number;
  end?: number;
};
