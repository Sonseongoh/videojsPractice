import type { Dispatch, SetStateAction } from "react";
import type { VideoSource } from "@/app/types/video";
import type {
  Bookmark,
  EventLogEntry,
  LoopRegion,
  PlayerState,
} from "@/app/types/video";

export type PlaygroundHeaderProps = {
  isReady: boolean;
  selectedSource: VideoSource;
};

export type SourceSelectorProps = {
  selectedSource: VideoSource;
  onChangeSource: (sourceId: string) => void;
};

export type PlayerControlsProps = {
  isPlaying: boolean;
  isReady: boolean;
  playerState: PlayerState;
  onPlayPause: () => void;
  onRequestFullscreen: () => void;
  onSeekBy: (delta: number) => void;
  onSetRate: (rate: number) => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
};

export type LoopPanelProps = {
  isReady: boolean;
  loopError: string;
  loopRegion: LoopRegion;
  onClearLoop: () => void;
  onSetLoopPoint: (point: "start" | "end") => void;
};

export type BookmarksPanelProps = {
  bookmarkLabel: string;
  bookmarks: Bookmark[];
  isReady: boolean;
  onAddBookmark: () => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onSeekTo: (time: number) => void;
  onSetBookmarkLabel: (label: string) => void;
};

export type PlayerStatePanelProps = {
  isPlaying: boolean;
  playerState: PlayerState;
  selectedSource: VideoSource;
};

export type StateRowProps = {
  label: string;
  value: string;
};

export type EventLogPanelProps = {
  events: EventLogEntry[];
  logExpanded: boolean;
  onClearEvents: () => void;
  onSetLogExpanded: Dispatch<SetStateAction<boolean>>;
};
