"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type Player from "video.js/dist/types/player";
import VideoJsPlayer from "@/app/components/VideoJsPlayer";
import { formatTime, videoSources } from "@/app/lib/videoSources";

type EventLogEntry = {
  id: number;
  name: string;
  time: string;
  detail?: string;
};

type PlayerState = {
  currentTime?: number;
  duration?: number;
  playbackRate?: number;
  paused?: boolean;
  volume?: number;
  muted?: boolean;
  bufferedPercent?: number;
};

type Bookmark = {
  id: string;
  label: string;
  time: number;
};

type LoopRegion = {
  start?: number;
  end?: number;
};

const rateOptions = [0.5, 1, 1.5, 2];

function safeNumber(value: number | undefined) {
  return typeof value === "number" && !Number.isNaN(value) ? value : undefined;
}

function readPlayerNumber(reader: () => number | undefined) {
  try {
    return safeNumber(reader());
  } catch {
    return undefined;
  }
}

function writePlayerTime(player: Player, time: number) {
  try {
    player.currentTime(time);
    return true;
  } catch {
    return false;
  }
}

export default function VideoPlayground() {
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

  return (
    <main className="min-h-screen bg-[var(--lab-bg)] px-4 py-5 text-[var(--lab-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="lab-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--lab-accent)]">
              Video.js API 실험실
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Video.js 플레이그라운드
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--lab-muted)]">
              React에서 Video.js를 직접 제어하며 소스 전환, 이벤트, 북마크,
              구간 반복을 한 화면에서 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="lab-chip">{selectedSource.label}</span>
            <span className="lab-chip">
              {selectedSource.origin === "external" ? "외부" : "로컬"}{" "}
              {selectedSource.type.includes("mpeg") ? "HLS" : "MP4"}
            </span>
            <span className={isReady ? "lab-chip lab-chip-ok" : "lab-chip"}>
              {isReady ? "준비됨" : "초기화 중"}
            </span>
          </div>
        </header>

        <section className="lab-panel p-3" aria-labelledby="sources-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="sources-heading" className="text-sm font-semibold">
              영상 소스
            </h2>
            <span className="text-xs text-[var(--lab-muted)]">
              HLS는 브라우저 환경에 따라 오류가 날 수 있습니다
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {videoSources.map((source) => (
              <button
                key={source.id}
                type="button"
                className={`source-button ${
                  source.id === selectedSource.id ? "source-button-active" : ""
                }`}
                onClick={() => changeSource(source.id)}
              >
                <span className="font-semibold">{source.label}</span>
                <span className="text-xs text-[var(--lab-muted)]">
                  {source.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)]">
          <section className="flex min-w-0 flex-col gap-4">
            <VideoJsPlayer
              source={selectedSource}
              onReady={handleReady}
              onDispose={handleDispose}
              onEvent={addEvent}
              onStateTick={syncPlayerState}
            />

            <section className="lab-panel p-4" aria-labelledby="controls-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="controls-heading" className="text-sm font-semibold">
                  커스텀 컨트롤
                </h2>
                {!isReady ? (
                  <span className="text-xs text-[var(--lab-muted)]">
                    플레이어 준비 중
                  </span>
                ) : null}
              </div>
              <div className="control-grid">
                <button className="lab-button lab-button-primary" onClick={playPause} disabled={!isReady}>
                  {isPlaying ? "일시정지" : "재생"}
                </button>
                <button className="lab-button" onClick={() => seekBy(-10)} disabled={!isReady}>
                  -10초
                </button>
                <button className="lab-button" onClick={() => seekBy(10)} disabled={!isReady}>
                  +10초
                </button>
                <button className="lab-button" onClick={toggleMute} disabled={!isReady}>
                  {playerState.muted ? "음소거 해제" : "음소거"}
                </button>
                <button className="lab-button" onClick={requestFullscreen} disabled={!isReady}>
                  전체화면
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--lab-muted)]">
                    재생 속도
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rateOptions.map((rate) => (
                      <button
                        key={rate}
                        className={`lab-button lab-button-small ${
                          playerState.playbackRate === rate ? "lab-button-active" : ""
                        }`}
                        onClick={() => setRate(rate)}
                        disabled={!isReady}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[var(--lab-muted)]">
                    음량 {Math.round((playerState.volume ?? 0) * 100)}%
                  </span>
                  <input
                    className="w-full accent-[var(--lab-accent)]"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={playerState.volume ?? 1}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    disabled={!isReady}
                  />
                </label>
              </div>
            </section>
          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="lab-panel p-4" aria-labelledby="loop-heading">
              <h2 id="loop-heading" className="text-sm font-semibold">
                구간 반복
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="lab-button" onClick={() => setLoopPoint("start")} disabled={!isReady}>
                  시작 지정
                </button>
                <button className="lab-button" onClick={() => setLoopPoint("end")} disabled={!isReady}>
                  끝 지정
                </button>
              </div>
              <div className="mt-3 rounded-md border border-[var(--lab-border)] bg-[var(--lab-surface-raised)] p-3 font-mono text-sm">
                {typeof loopRegion.start === "number" ||
                typeof loopRegion.end === "number" ? (
                  <span>
                    {formatTime(loopRegion.start)}부터{" "}
                    {formatTime(loopRegion.end)}까지
                  </span>
                ) : (
                  <span className="text-[var(--lab-muted)]">
                    시작 지점과 끝 지점을 차례로 지정하세요.
                  </span>
                )}
              </div>
              {loopError ? (
                <p className="mt-2 text-sm text-[var(--lab-danger)]">{loopError}</p>
              ) : null}
              {typeof loopRegion.start === "number" ||
              typeof loopRegion.end === "number" ? (
                <button className="lab-button mt-3 w-full" onClick={clearLoop}>
                  반복 해제
                </button>
              ) : null}
            </section>

            <section className="lab-panel p-4" aria-labelledby="bookmarks-heading">
              <h2 id="bookmarks-heading" className="text-sm font-semibold">
                북마크
              </h2>
              <div className="mt-3 flex gap-2">
                <input
                  className="lab-input min-w-0 flex-1"
                  value={bookmarkLabel}
                  onChange={(event) => setBookmarkLabel(event.target.value)}
                  placeholder="선택 사항: 북마크 이름"
                  aria-label="북마크 이름"
                />
                <button className="lab-button lab-button-primary" onClick={addBookmark} disabled={!isReady}>
                  추가
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {bookmarks.length === 0 ? (
                  <p className="rounded-md border border-dashed border-[var(--lab-border)] p-3 text-sm text-[var(--lab-muted)]">
                    이 영상에는 아직 북마크가 없습니다. 재생 중 원하는 시점에서
                    북마크를 추가하세요.
                  </p>
                ) : (
                  bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="bookmark-row">
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => seekTo(bookmark.time)}
                      >
                        <span className="block truncate text-sm font-medium">
                          {bookmark.label}
                        </span>
                        <span className="font-mono text-xs text-[var(--lab-muted)]">
                          {formatTime(bookmark.time)}
                        </span>
                      </button>
                      <button
                        className="lab-button lab-button-small"
                        onClick={() => deleteBookmark(bookmark.id)}
                        aria-label={`${bookmark.label} 삭제`}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="lab-panel p-4" aria-labelledby="state-heading">
              <h2 id="state-heading" className="text-sm font-semibold">
                플레이어 상태
              </h2>
              <dl className="state-grid mt-3">
                <StateRow label="현재 시간" value={formatTime(playerState.currentTime)} />
                <StateRow label="전체 길이" value={formatTime(playerState.duration)} />
                <StateRow label="속도" value={`${playerState.playbackRate ?? "--"}x`} />
                <StateRow label="상태" value={isPlaying ? "재생 중" : "일시정지"} />
                <StateRow label="음량" value={`${Math.round((playerState.volume ?? 0) * 100)}%`} />
                <StateRow label="음소거" value={playerState.muted ? "예" : "아니오"} />
                <StateRow
                  label="버퍼"
                  value={`${Math.round((playerState.bufferedPercent ?? 0) * 100)}%`}
                />
                <StateRow label="타입" value={selectedSource.type} />
              </dl>
            </section>

            <section className="lab-panel p-4" aria-labelledby="events-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="events-heading" className="text-sm font-semibold">
                  이벤트 로그
                </h2>
                <div className="flex gap-2">
                  <button
                    className="lab-button lab-button-small md:hidden"
                    onClick={() => setLogExpanded((value) => !value)}
                  >
                    {logExpanded ? "접기" : "펼치기"}
                  </button>
                  <button className="lab-button lab-button-small" onClick={() => setEvents([])}>
                    지우기
                  </button>
                </div>
              </div>
              <div
                className={`mt-3 max-h-80 overflow-auto ${
                  logExpanded ? "block" : "hidden md:block"
                }`}
                aria-live="polite"
              >
                {events.length === 0 ? (
                  <p className="rounded-md border border-dashed border-[var(--lab-border)] p-3 text-sm text-[var(--lab-muted)]">
                    아직 이벤트가 없습니다. 재생 버튼을 눌러보세요.
                  </p>
                ) : (
                  <ol className="flex flex-col gap-2">
                    {events.map((event) => (
                      <li key={event.id} className="event-row">
                        <span className="event-chip">{event.name}</span>
                        <span className="font-mono text-xs text-[var(--lab-muted)]">
                          {event.time}
                        </span>
                        {event.detail ? (
                          <span className="min-w-0 truncate text-xs text-[var(--lab-muted)]">
                            {event.detail}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-[var(--lab-muted)]">{label}</dt>
      <dd className="min-w-0 truncate text-right font-mono text-[var(--lab-text)]">
        {value}
      </dd>
    </div>
  );
}
