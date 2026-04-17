import type { EventLogPanelProps } from "./types";

export function EventLogPanel({
  events,
  logExpanded,
  onClearEvents,
  onSetLogExpanded,
}: EventLogPanelProps) {
  return (
    <section className="lab-panel p-4" aria-labelledby="events-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="events-heading" className="text-sm font-semibold">
          이벤트 로그
        </h2>
        <div className="flex gap-2">
          <button
            className="lab-button lab-button-small md:hidden"
            onClick={() => onSetLogExpanded((value) => !value)}
          >
            {logExpanded ? "접기" : "펼치기"}
          </button>
          <button className="lab-button lab-button-small" onClick={onClearEvents}>
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
  );
}
