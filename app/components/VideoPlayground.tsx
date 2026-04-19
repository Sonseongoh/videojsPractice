"use client";

import VideoJsPlayer from "@/app/components/VideoJsPlayer";
import { BookmarksPanel } from "./video-playground/BookmarksPanel";
import { EventLogPanel } from "./video-playground/EventLogPanel";
import { LoopPanel } from "./video-playground/LoopPanel";
import { PlayerControls } from "./video-playground/PlayerControls";
import { PlaybackErrorPanel } from "./video-playground/PlaybackErrorPanel";
import { PlayerStatePanel } from "./video-playground/PlayerStatePanel";
import { PlaygroundHeader } from "./video-playground/PlaygroundHeader";
import { SourceSelector } from "./video-playground/SourceSelector";
import { useVideoPlayground } from "./video-playground/useVideoPlayground";

export default function VideoPlayground() {
  const playground = useVideoPlayground();

  return (
    <main className="min-h-screen bg-[var(--lab-bg)] px-4 py-5 text-[var(--lab-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PlaygroundHeader
          isReady={playground.isReady}
          selectedSource={playground.selectedSource}
        />

        <SourceSelector
          selectedSource={playground.selectedSource}
          onChangeSource={playground.changeSource}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)]">
          <section className="flex min-w-0 flex-col gap-4">
            {playground.playbackError ? (
              <PlaybackErrorPanel
                error={playground.playbackError}
                onDismiss={playground.dismissPlaybackError}
                onRetry={playground.retrySource}
              />
            ) : null}

            <VideoJsPlayer
              source={playground.selectedSource}
              onReady={playground.handleReady}
              onDispose={playground.handleDispose}
              onEvent={playground.addEvent}
              onPlaybackError={playground.handlePlaybackError}
              onStateTick={playground.syncPlayerState}
            />

            <PlayerControls
              isPlaying={playground.isPlaying}
              isReady={playground.isReady}
              playerState={playground.playerState}
              onPlayPause={playground.playPause}
              onRequestFullscreen={playground.requestFullscreen}
              onSeekBy={playground.seekBy}
              onSetRate={playground.setRate}
              onSetVolume={playground.setVolume}
              onToggleMute={playground.toggleMute}
            />
          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <LoopPanel
              isReady={playground.isReady}
              loopError={playground.loopError}
              loopRegion={playground.loopRegion}
              onClearLoop={playground.clearLoop}
              onSetLoopPoint={playground.setLoopPoint}
            />

            <BookmarksPanel
              bookmarkLabel={playground.bookmarkLabel}
              bookmarks={playground.bookmarks}
              isReady={playground.isReady}
              onAddBookmark={playground.addBookmark}
              onDeleteBookmark={playground.deleteBookmark}
              onSeekTo={playground.seekTo}
              onSetBookmarkLabel={playground.setBookmarkLabel}
            />

            <PlayerStatePanel
              isPlaying={playground.isPlaying}
              playerState={playground.playerState}
              selectedSource={playground.selectedSource}
            />

            <EventLogPanel
              events={playground.events}
              logExpanded={playground.logExpanded}
              onClearEvents={() => playground.setEvents([])}
              onSetLogExpanded={playground.setLogExpanded}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
