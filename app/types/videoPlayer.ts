import type Player from "video.js/dist/types/player";
import type { VideoSource } from "./video";

export type VideoJsPlayerProps = {
  source: VideoSource;
  onReady: (player: Player) => void;
  onDispose: () => void;
  onEvent: (name: string, detail?: string) => void;
  onStateTick: () => void;
};
