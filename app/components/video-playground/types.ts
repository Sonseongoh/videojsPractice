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

export type Bookmark = {
  id: string;
  label: string;
  time: number;
};

export type LoopRegion = {
  start?: number;
  end?: number;
};
