"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Player from "video.js/dist/types/player";
import { formatTime, videoSources } from "@/app/lib/videoSources";
import type {
  Bookmark,
  EventLogEntry,
  LoopRegion,
  PlaybackError,
  PlayerState,
  VideoSource,
} from "@/app/types/video";
import { readPlayerNumber, writePlayerTime } from "./playerUtils";

const TEXT_TRACK_OFF = "off";
const STORAGE_KEY = "videojs-playground:v1";

type StoredPlaygroundState = {
  bookmarksBySource?: Record<string, Bookmark[]>;
  playbackRate?: number;
  volume?: number;
  muted?: boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStoredNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && value >= min && value <= max
    ? value
    : undefined;
}

function readStoredBookmarks(value: unknown) {
  if (!isObject(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, Bookmark[]>>(
    (sources, [sourceId, bookmarks]) => {
      if (!Array.isArray(bookmarks)) {
        return sources;
      }

      const validBookmarks = bookmarks.filter(
        (bookmark): bookmark is Bookmark =>
          isObject(bookmark) &&
          typeof bookmark.id === "string" &&
          typeof bookmark.label === "string" &&
          typeof bookmark.time === "number" &&
          bookmark.time >= 0,
      );

      if (validBookmarks.length > 0) {
        sources[sourceId] = validBookmarks;
      }

      return sources;
    },
    {},
  );
}

function readStoredPlaygroundState(): StoredPlaygroundState {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isObject(parsedValue)) {
      return {};
    }

    return {
      bookmarksBySource: readStoredBookmarks(parsedValue.bookmarksBySource),
      playbackRate: readStoredNumber(parsedValue.playbackRate, 0.25, 4),
      volume: readStoredNumber(parsedValue.volume, 0, 1),
      muted:
        typeof parsedValue.muted === "boolean" ? parsedValue.muted : undefined,
    };
  } catch {
    return {};
  }
}

function writeStoredPlaygroundState(state: StoredPlaygroundState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

function getDefaultTextTrackId(source: VideoSource) {
  return (
    source.textTracks?.find((track) => track.default)?.id ?? TEXT_TRACK_OFF
  );
}

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
  const hasLoadedStorageRef = useRef(false);

  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({});
  const [bookmarksBySource, setBookmarksBySource] = useState<
    Record<string, Bookmark[]>
  >({});
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({});
  const [loopError, setLoopError] = useState("");
  const [playbackError, setPlaybackError] = useState<PlaybackError | null>(null);
  const [logExpanded, setLogExpanded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [preferredPlaybackRate, setPreferredPlaybackRate] = useState<
    number | undefined
  >();
  const [preferredVolume, setPreferredVolume] = useState<number | undefined>();
  const [preferredMuted, setPreferredMuted] = useState<boolean | undefined>();
  const [activeTextTrackId, setActiveTextTrackId] = useState(() =>
    getDefaultTextTrackId(videoSources[0]),
  );

  const bookmarks = bookmarksBySource[selectedSource.id] ?? [];
  const isReady = playerReady;
  const isPlaying = playerState.paused === false;

  useEffect(() => {
    const restoreStorage = window.setTimeout(() => {
      const storedState = readStoredPlaygroundState();

      setBookmarksBySource(storedState.bookmarksBySource ?? {});
      setPreferredPlaybackRate(storedState.playbackRate);
      setPreferredVolume(storedState.volume);
      setPreferredMuted(storedState.muted);
      hasLoadedStorageRef.current = true;
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(restoreStorage);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    writeStoredPlaygroundState({
      bookmarksBySource,
      playbackRate: preferredPlaybackRate,
      volume: preferredVolume,
      muted: preferredMuted,
    });
  }, [
    bookmarksBySource,
    hasLoadedStorage,
    preferredMuted,
    preferredPlaybackRate,
    preferredVolume,
  ]);

  const applySavedPlayerPreferences = useCallback(
    (player: Player) => {
      if (typeof preferredPlaybackRate === "number") {
        player.playbackRate(preferredPlaybackRate);
      }

      if (typeof preferredVolume === "number") {
        player.volume(preferredVolume);
      }

      if (typeof preferredMuted === "boolean") {
        player.muted(preferredMuted);
      }
    },
    [preferredMuted, preferredPlaybackRate, preferredVolume],
  );

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

    const nextPlaybackRate = readPlayerNumber(() => player.playbackRate());
    const nextVolume = readPlayerNumber(() => player.volume());
    const nextMuted = player.muted();

    if (hasLoadedStorageRef.current) {
      setPreferredPlaybackRate((current) =>
        typeof nextPlaybackRate === "number" && current !== nextPlaybackRate
          ? nextPlaybackRate
          : current,
      );
      setPreferredVolume((current) =>
        typeof nextVolume === "number" && current !== nextVolume
          ? nextVolume
          : current,
      );
      setPreferredMuted((current) =>
        current !== nextMuted ? nextMuted : current,
      );
    }

    setPlayerState({
      currentTime,
      duration,
      playbackRate: nextPlaybackRate,
      paused: player.paused(),
      volume: nextVolume,
      muted: nextMuted,
      bufferedPercent: readPlayerNumber(() => player.bufferedPercent()),
    });
  }, [addEvent]);

  useEffect(() => {
    const player = playerRef.current;

    if (!playerReady || !hasLoadedStorage || !player) {
      return;
    }

    applySavedPlayerPreferences(player);
    syncPlayerState();
  }, [
    applySavedPlayerPreferences,
    hasLoadedStorage,
    playerReady,
    syncPlayerState,
  ]);

  const handleReady = useCallback(
    (player: Player) => {
      playerRef.current = player;
      setPlayerReady(true);
      if (hasLoadedStorageRef.current) {
        applySavedPlayerPreferences(player);
      }
      syncPlayerState();
    },
    [applySavedPlayerPreferences, syncPlayerState],
  );

  const handleDispose = useCallback(() => {
    playerRef.current = null;
    setPlayerReady(false);
    setPlayerState({});
  }, []);

  const dismissPlaybackError = useCallback(() => {
    setPlaybackError(null);
  }, []);

  const handlePlaybackError = useCallback(
    ({
      code,
      message,
      source,
    }: {
      code?: number;
      message: string;
      source: VideoSource;
    }) => {
      setPlaybackError({
        code,
        message,
        sourceId: source.id,
        sourceLabel: source.label,
        sourceType: source.type,
        sourceOrigin: source.origin,
      });
    },
    [],
  );

  const changeSource = (sourceId: string) => {
    const nextSource =
      videoSources.find((source) => source.id === sourceId) ?? videoSources[0];

    setSelectedSourceId(sourceId);
    setActiveTextTrackId(getDefaultTextTrackId(nextSource));
    setLoopRegion({});
    loopRef.current = {};
    setLoopError("");
    setPlaybackError(null);
  };

  const setTextTrack = (trackId: string) => {
    const selectedTrack = selectedSource.textTracks?.find(
      (track) => track.id === trackId,
    );

    setActiveTextTrackId(trackId);
    addEvent("caption", selectedTrack ? selectedTrack.label : "끄기");
  };

  const retrySource = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    setPlaybackError(null);
    player.src({ src: selectedSource.src, type: selectedSource.type });
    player.load();
    addEvent("retry", selectedSource.label);
    syncPlayerState();
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
    setPreferredPlaybackRate(rate);
    syncPlayerState();
  };

  const setVolume = (volume: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.volume(volume);
    setPreferredVolume(volume);
    syncPlayerState();
  };

  const toggleMute = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const nextMuted = !player.muted();
    player.muted(nextMuted);
    setPreferredMuted(nextMuted);
    syncPlayerState();
  };

  const requestFullscreen = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.requestFullscreen) {
      player.requestFullscreen();
      addEvent("fullscreen", "전체 화면 요청");
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
    activeTextTrackId,
    bookmarks,
    bookmarkLabel,
    changeSource,
    clearLoop,
    deleteBookmark,
    events,
    dismissPlaybackError,
    handleDispose,
    handlePlaybackError,
    handleReady,
    isPlaying,
    isReady,
    logExpanded,
    loopError,
    loopRegion,
    playPause,
    playbackError,
    playerState,
    requestFullscreen,
    retrySource,
    seekBy,
    seekTo,
    selectedSource,
    setBookmarkLabel,
    setEvents,
    setLogExpanded,
    setLoopPoint,
    setRate,
    setTextTrack,
    setVolume,
    syncPlayerState,
    toggleMute,
  };
}
