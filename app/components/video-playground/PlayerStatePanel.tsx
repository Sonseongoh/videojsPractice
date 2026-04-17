import { formatTime } from "@/app/lib/videoSources";
import type { PlayerStatePanelProps, StateRowProps } from "./types";

export function PlayerStatePanel({
  isPlaying,
  playerState,
  selectedSource,
}: PlayerStatePanelProps) {
  return (
    <section className="lab-panel p-4" aria-labelledby="state-heading">
      <h2 id="state-heading" className="text-sm font-semibold">
        플레이어 상태
      </h2>
      <dl className="state-grid mt-3">
        <StateRow label="현재 시간" value={formatTime(playerState.currentTime)} />
        <StateRow label="전체 길이" value={formatTime(playerState.duration)} />
        <StateRow label="속도" value={`${playerState.playbackRate ?? "--"}x`} />
        <StateRow label="상태" value={isPlaying ? "재생 중" : "일시정지"} />
        <StateRow
          label="음량"
          value={`${Math.round((playerState.volume ?? 0) * 100)}%`}
        />
        <StateRow label="음소거" value={playerState.muted ? "예" : "아니오"} />
        <StateRow
          label="버퍼"
          value={`${Math.round((playerState.bufferedPercent ?? 0) * 100)}%`}
        />
        <StateRow label="타입" value={selectedSource.type} />
      </dl>
    </section>
  );
}

function StateRow({ label, value }: StateRowProps) {
  return (
    <div className="contents">
      <dt className="text-[var(--lab-muted)]">{label}</dt>
      <dd className="min-w-0 truncate text-right font-mono text-[var(--lab-text)]">
        {value}
      </dd>
    </div>
  );
}
