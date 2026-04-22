import { formatTime } from "@/app/lib/videoSources";
import type { BookmarksPanelProps } from "./types";

export function BookmarksPanel({
  bookmarkLabel,
  bookmarks,
  isReady,
  onAddBookmark,
  onDeleteBookmark,
  onSeekTo,
  onSetBookmarkLabel,
}: BookmarksPanelProps) {
  return (
    <section className="lab-panel p-4" aria-labelledby="bookmarks-heading">
      <h2 id="bookmarks-heading" className="text-sm font-semibold">
        북마크
      </h2>
      <div className="mt-3 flex gap-2">
        <input
          className="lab-input min-w-0 flex-1"
          value={bookmarkLabel}
          onChange={(event) => onSetBookmarkLabel(event.target.value)}
          placeholder="선택 사항: 북마크 이름"
          aria-label="북마크 이름"
        />
        <button
          className="lab-button lab-button-primary"
          onClick={onAddBookmark}
          disabled={!isReady}
        >
          추가
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {bookmarks.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--lab-border)] p-3 text-sm text-[var(--lab-muted)]">
            이 영상에는 아직 북마크가 없습니다. 재생 중 원하는 지점에서
            북마크를 추가하세요.
          </p>
        ) : (
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-row">
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => onSeekTo(bookmark.time)}
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
                onClick={() => onDeleteBookmark(bookmark.id)}
                aria-label={`${bookmark.label} 삭제`}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
