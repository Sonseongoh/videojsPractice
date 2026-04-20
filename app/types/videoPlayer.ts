import type Player from "video.js/dist/types/player";
import type { VideoSource } from "./video";

export type VideoJsPlayerProps = {
  source: VideoSource;
  activeTextTrackId: string;
  onReady: (player: Player) => void;
  onDispose: () => void;
  onEvent: (name: string, detail?: string) => void;
  onPlaybackError: (error: {
    code?: number;
    message: string;
    source: VideoSource;
  }) => void;
  onStateTick: () => void;
};
