import type Player from "video.js/dist/types/player";

export function safeNumber(value: number | undefined) {
  return typeof value === "number" && !Number.isNaN(value) ? value : undefined;
}

export function readPlayerNumber(reader: () => number | undefined) {
  try {
    return safeNumber(reader());
  } catch {
    return undefined;
  }
}

export function writePlayerTime(player: Player, time: number) {
  try {
    player.currentTime(time);
    return true;
  } catch {
    return false;
  }
}
