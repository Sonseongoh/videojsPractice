import { videoSources } from "@/app/lib/videoSources";
import type { SourceSelectorProps } from "./types";

export function SourceSelector({
  selectedSource,
  onChangeSource,
}: SourceSelectorProps) {
  return (
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
            onClick={() => onChangeSource(source.id)}
          >
            <span className="font-semibold">{source.label}</span>
            <span className="text-xs text-[var(--lab-muted)]">
              {source.description}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
