import { rateOptions } from "./constants";
import type { PlayerControlsProps } from "./types";

export function PlayerControls({
  isPlaying,
  isReady,
  playerState,
  onPlayPause,
  onRequestFullscreen,
  onSeekBy,
  onSetRate,
  onSetVolume,
  onToggleMute,
}: PlayerControlsProps) {
  return (
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
        <button
          className="lab-button lab-button-primary"
          onClick={onPlayPause}
          disabled={!isReady}
        >
          {isPlaying ? "일시정지" : "재생"}
        </button>
        <button
          className="lab-button"
          onClick={() => onSeekBy(-10)}
          disabled={!isReady}
        >
          -10초
        </button>
        <button
          className="lab-button"
          onClick={() => onSeekBy(10)}
          disabled={!isReady}
        >
          +10초
        </button>
        <button
          className="lab-button"
          onClick={onToggleMute}
          disabled={!isReady}
        >
          {playerState.muted ? "음소거 해제" : "음소거"}
        </button>
        <button
          className="lab-button"
          onClick={onRequestFullscreen}
          disabled={!isReady}
        >
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
                onClick={() => onSetRate(rate)}
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
            onChange={(event) => onSetVolume(Number(event.target.value))}
            disabled={!isReady}
          />
        </label>
      </div>
    </section>
  );
}
