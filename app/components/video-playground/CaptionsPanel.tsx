import type { CaptionsPanelProps } from "./types";

const TEXT_TRACK_OFF = "off";

export function CaptionsPanel({
  activeTextTrackId,
  isReady,
  selectedSource,
  onSetTextTrack,
}: CaptionsPanelProps) {
  const textTracks = selectedSource.textTracks ?? [];
  const hasTextTracks = textTracks.length > 0;

  return (
    <section className="lab-panel p-4" aria-labelledby="captions-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="captions-heading" className="text-sm font-semibold">
          자막 트랙
        </h2>
        <span className="text-xs text-[var(--lab-muted)]">
          {hasTextTracks ? `${textTracks.length}개` : "없음"}
        </span>
      </div>

      {hasTextTracks ? (
        <>
          <div className="control-grid">
            <button
              className={`lab-button ${
                activeTextTrackId === TEXT_TRACK_OFF ? "lab-button-active" : ""
              }`}
              onClick={() => onSetTextTrack(TEXT_TRACK_OFF)}
              disabled={!isReady}
            >
              끄기
            </button>
            {textTracks.map((track) => (
              <button
                key={track.id}
                className={`lab-button ${
                  activeTextTrackId === track.id ? "lab-button-active" : ""
                }`}
                onClick={() => onSetTextTrack(track.id)}
                disabled={!isReady}
              >
                {track.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--lab-muted)]">
            WebVTT 파일을 Video.js 원격 텍스트 트랙으로 추가합니다. 기본
            컨트롤의 자막 메뉴와 이 버튼이 같은 트랙을 다룹니다.
          </p>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-[var(--lab-border)] p-3 text-sm text-[var(--lab-muted)]">
          이 소스에는 등록된 자막 트랙이 없습니다.
        </p>
      )}
    </section>
  );
}
