"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type Player from "video.js/dist/types/player";
import { formatTime, videoSources } from "@/app/lib/videoSources";
import type {
  Bookmark,
  EventLogEntry,
  LoopRegion,
  PlayerState,
} from "@/app/types/video";
import { readPlayerNumber, writePlayerTime } from "./playerUtils";

export function useVideoPlayground() {
  const [selectedSourceId, setSelectedSourceId] = useState(videoSources[0].id);
  const selectedSource = useMemo(
    () =>
      videoSources.find((source) => source.id === selectedSourceId) ??
      videoSources[0],
    [selectedSourceId],
  );
  const playerRef = useRef<Player | null>(null);
  const logIdRef = useRef(0);
  const loopRef = useRef<LoopRegion>({});

  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({});
  const [bookmarksBySource, setBookmarksBySource] = useState<
    Record<string, Bookmark[]>
  >({});
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({});
  const [loopError, setLoopError] = useState("");
  const [logExpanded, setLogExpanded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const bookmarks = bookmarksBySource[selectedSource.id] ?? [];
  const isReady = playerReady;
  const isPlaying = playerState.paused === false;

  const addEvent = useCallback((name: string, detail?: string) => {
    const player = playerRef.current;
    const entry: EventLogEntry = {
      id: logIdRef.current++,
      name,
      time: formatTime(
        player ? readPlayerNumber(() => player.currentTime()) : undefined,
      ),
      detail,
    };

    setEvents((current) => [entry, ...current].slice(0, 40));
  }, []);

  const syncPlayerState = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const currentTime = readPlayerNumber(() => player.currentTime());
    const duration = readPlayerNumber(() => player.duration());
    const loop = loopRef.current;

    if (
      typeof currentTime === "number" &&
      typeof loop.start === "number" &&
      typeof loop.end === "number" &&
      loop.end > loop.start &&
      currentTime >= loop.end
    ) {
      writePlayerTime(player, loop.start);
      addEvent(
        "loop",
        `${formatTime(loop.end)}에서 ${formatTime(loop.start)}로 이동`,
      );
    }

    setPlayerState({
      currentTime,
      duration,
      playbackRate: readPlayerNumber(() => player.playbackRate()),
      paused: player.paused(),
      volume: readPlayerNumber(() => player.volume()),
      muted: player.muted(),
      bufferedPercent: readPlayerNumber(() => player.bufferedPercent()),
    });
  }, [addEvent]);

  const handleReady = useCallback(
    (player: Player) => {
      playerRef.current = player;
      setPlayerReady(true);
      syncPlayerState();
    },
    [syncPlayerState],
  );

  const handleDispose = useCallback(() => {
    playerRef.current = null;
    setPlayerReady(false);
    setPlayerState({});
  }, []);

  const changeSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setLoopRegion({});
    loopRef.current = {};
    setLoopError("");
  };

  const playPause = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.paused()) {
      void player.play();
    } else {
      player.pause();
    }
    syncPlayerState();
  };

  const seekBy = (delta: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const currentTime = readPlayerNumber(() => player.currentTime()) ?? 0;
    writePlayerTime(player, Math.max(0, currentTime + delta));
    addEvent("custom-seek", `${delta > 0 ? "+" : ""}${delta}s`);
    syncPlayerState();
  };

  const setRate = (rate: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.playbackRate(rate);
    syncPlayerState();
  };

  const setVolume = (volume: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.volume(volume);
    syncPlayerState();
  };

  const toggleMute = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.muted(!player.muted());
    syncPlayerState();
  };

  const requestFullscreen = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.requestFullscreen) {
      player.requestFullscreen();
      addEvent("fullscreen", "전체화면 요청");
    }
  };

  const addBookmark = () => {
    const player = playerRef.current;
    const time = player
      ? readPlayerNumber(() => player.currentTime())
      : undefined;

    if (typeof time !== "number") {
      return;
    }

    const nextNumber = bookmarks.length + 1;
    const nextBookmark: Bookmark = {
      id: `${selectedSource.id}-${Date.now()}`,
      label: bookmarkLabel.trim() || `북마크 ${nextNumber}`,
      time,
    };

    setBookmarksBySource((current) => ({
      ...current,
      [selectedSource.id]: [...(current[selectedSource.id] ?? []), nextBookmark],
    }));
    setBookmarkLabel("");
    addEvent("bookmark", `${nextBookmark.label}, ${formatTime(time)}`);
  };

  const seekTo = (time: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    writePlayerTime(player, time);
    syncPlayerState();
  };

  const deleteBookmark = (bookmarkId: string) => {
    setBookmarksBySource((current) => ({
      ...current,
      [selectedSource.id]: (current[selectedSource.id] ?? []).filter(
        (bookmark) => bookmark.id !== bookmarkId,
      ),
    }));
  };

  const setLoopPoint = (point: "start" | "end") => {
    const player = playerRef.current;
    const time = player
      ? readPlayerNumber(() => player.currentTime())
      : undefined;

    if (typeof time !== "number") {
      return;
    }

    const nextLoop = { ...loopRef.current, [point]: time };

    if (
      typeof nextLoop.start === "number" &&
      typeof nextLoop.end === "number" &&
      nextLoop.end <= nextLoop.start
    ) {
      setLoopError("끝 지점은 시작 지점보다 뒤에 있어야 합니다.");
    } else {
      setLoopError("");
    }

    loopRef.current = nextLoop;
    setLoopRegion(nextLoop);
    addEvent(`loop-${point}`, formatTime(time));
  };

  const clearLoop = () => {
    loopRef.current = {};
    setLoopRegion({});
    setLoopError("");
    addEvent("loop-clear");
  };

  return {
    addBookmark,
    addEvent,
    bookmarks,
    bookmarkLabel,
    changeSource,
    clearLoop,
    deleteBookmark,
    events,
    handleDispose,
    handleReady,
    isPlaying,
    isReady,
    logExpanded,
    loopError,
    loopRegion,
    playPause,
    playerState,
    requestFullscreen,
    seekBy,
    seekTo,
    selectedSource,
    setBookmarkLabel,
    setEvents,
    setLogExpanded,
    setLoopPoint,
    setRate,
    setVolume,
    syncPlayerState,
    toggleMute,
  };
}
