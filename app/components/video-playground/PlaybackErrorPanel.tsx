import type { PlaybackErrorPanelProps } from "./types";

export function PlaybackErrorPanel({
  error,
  onDismiss,
  onRetry,
}: PlaybackErrorPanelProps) {
  const isExternalHls =
    error.sourceOrigin === "external" && error.sourceType.includes("mpeg");

  return (
    <section
      className="lab-alert"
      aria-labelledby="playback-error-heading"
      role="alert"
    >
      <div className="min-w-0">
        <p
          id="playback-error-heading"
          className="text-sm font-semibold text-[var(--lab-warning)]"
        >
          영상을 불러오지 못했습니다
        </p>
        <p className="mt-1 text-sm text-[var(--lab-text)]">
          {error.sourceLabel}
          {error.code ? ` 오류 코드 ${error.code}` : ""}: {error.message}
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--lab-muted)]">
          {isExternalHls
            ? "외부 HLS 스트림은 브라우저 지원, 네트워크 상태, CORS 정책에 따라 재생에 실패할 수 있습니다. 로컬 MP4 소스로 바꾸거나 잠시 후 다시 시도해보세요."
            : "소스 파일 경로, 파일 형식, 네트워크 상태를 확인해보세요."}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button className="lab-button lab-button-small" onClick={onRetry}>
          다시 시도
        </button>
        <button className="lab-button lab-button-small" onClick={onDismiss}>
          닫기
        </button>
      </div>
    </section>
  );
}
