import type { PlaygroundHeaderProps } from "./types";

export function PlaygroundHeader({
  isReady,
  selectedSource,
}: PlaygroundHeaderProps) {
  return (
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
  );
}
