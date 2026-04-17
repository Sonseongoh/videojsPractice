import { formatTime } from "@/app/lib/videoSources";
import type { LoopRegion } from "./types";

type LoopPanelProps = {
  isReady: boolean;
  loopError: string;
  loopRegion: LoopRegion;
  onClearLoop: () => void;
  onSetLoopPoint: (point: "start" | "end") => void;
};

export function LoopPanel({
  isReady,
  loopError,
  loopRegion,
  onClearLoop,
  onSetLoopPoint,
}: LoopPanelProps) {
  const hasLoopPoint =
    typeof loopRegion.start === "number" || typeof loopRegion.end === "number";

  return (
    <section className="lab-panel p-4" aria-labelledby="loop-heading">
      <h2 id="loop-heading" className="text-sm font-semibold">
        구간 반복
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="lab-button"
          onClick={() => onSetLoopPoint("start")}
          disabled={!isReady}
        >
          시작 지점
        </button>
        <button
          className="lab-button"
          onClick={() => onSetLoopPoint("end")}
          disabled={!isReady}
        >
          끝 지점
        </button>
      </div>
      <div className="mt-3 rounded-md border border-[var(--lab-border)] bg-[var(--lab-surface-raised)] p-3 font-mono text-sm">
        {hasLoopPoint ? (
          <span>
            {formatTime(loopRegion.start)}부터 {formatTime(loopRegion.end)}
            까지
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
      {hasLoopPoint ? (
        <button className="lab-button mt-3 w-full" onClick={onClearLoop}>
          반복 해제
        </button>
      ) : null}
    </section>
  );
}
