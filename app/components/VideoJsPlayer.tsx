"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import type { VideoJsPlayerProps } from "@/app/types/videoPlayer";
import "video.js/dist/video-js.css";

const PLAYER_EVENTS = [
  "loadstart",
  "loadedmetadata",
  "play",
  "pause",
  "seeking",
  "seeked",
  "ratechange",
  "volumechange",
  "ended",
  "error",
  "texttrackchange",
] as const;

const TEXT_TRACK_OFF = "off";

function getTextTracks(player: Player) {
  return player.textTracks() as unknown as ArrayLike<
    TextTrack & { id?: string }
  >;
}

function applyTextTrackMode(player: Player, activeTextTrackId: string) {
  const tracks = getTextTracks(player);

  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index];
    track.mode =
      activeTextTrackId !== TEXT_TRACK_OFF && track.id === activeTextTrackId
        ? "showing"
        : "disabled";
  }
}

function addTextTracks(player: Player, source: VideoJsPlayerProps["source"]) {
  source.textTracks?.forEach((track) => {
    player.addRemoteTextTrack(
      {
        id: track.id,
        kind: track.kind,
        label: track.label,
        language: track.language,
        srclang: track.language,
        src: track.src,
        default: track.default,
      },
      false,
    );
  });
}

function removeRemoteTextTracks(player: Player) {
  const tracks = player.remoteTextTracks() as unknown as ArrayLike<
    TextTrack & { id?: string }
  >;

  for (let index = tracks.length - 1; index >= 0; index -= 1) {
    player.removeRemoteTextTrack(tracks[index]);
  }
}

export default function VideoJsPlayer({
  source,
  activeTextTrackId,
  onReady,
  onDispose,
  onEvent,
  onPlaybackError,
  onStateTick,
}: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const initialSourceRef = useRef(source);
  const sourceRef = useRef(source.id);
  const currentSourceRef = useRef(source);
  const sourceLabelRef = useRef(source.label);
  const lastTimeUpdateRef = useRef(0);
  const callbacksRef = useRef({
    activeTextTrackId,
    onReady,
    onDispose,
    onEvent,
    onPlaybackError,
    onStateTick,
  });

  useEffect(() => {
    callbacksRef.current = {
      activeTextTrackId,
      onReady,
      onDispose,
      onEvent,
      onPlaybackError,
      onStateTick,
    };
  }, [
    activeTextTrackId,
    onReady,
    onDispose,
    onEvent,
    onPlaybackError,
    onStateTick,
  ]);

  useEffect(() => {
    sourceLabelRef.current = source.label;
    currentSourceRef.current = source;
  }, [source]);

  useEffect(() => {
    if (!videoRef.current || playerRef.current) {
      return;
    }

    const initialSource = initialSourceRef.current;
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      preload: "auto",
      responsive: true,
      sources: [{ src: initialSource.src, type: initialSource.type }],
    });

    playerRef.current = player;
    sourceRef.current = initialSource.id;
    addTextTracks(player, initialSource);
    applyTextTrackMode(player, callbacksRef.current.activeTextTrackId);

    const handleTimeUpdate = () => {
      const now = Date.now();
      callbacksRef.current.onStateTick();

      if (now - lastTimeUpdateRef.current > 1000) {
        lastTimeUpdateRef.current = now;
        callbacksRef.current.onEvent("timeupdate");
      }
    };

    const eventHandlers = PLAYER_EVENTS.map((eventName) => {
      const handler = () => {
        const error = player.error();
        const detail =
          eventName === "error" && error
            ? `${error.code}: ${error.message}`
            : undefined;
        callbacksRef.current.onEvent(eventName, detail);
        if (eventName === "error" && error) {
          callbacksRef.current.onPlaybackError({
            code: error.code,
            message: error.message,
            source: currentSourceRef.current,
          });
        }
        callbacksRef.current.onStateTick();
      };

      player.on(eventName, handler);
      return { eventName, handler };
    });

    player.on("timeupdate", handleTimeUpdate);

    player.ready(() => {
      callbacksRef.current.onEvent("ready", sourceLabelRef.current);
      callbacksRef.current.onReady(player);
      callbacksRef.current.onStateTick();
    });

    return () => {
      player.off("timeupdate", handleTimeUpdate);
      eventHandlers.forEach(({ eventName, handler }) => {
        player.off(eventName, handler);
      });
      player.dispose();
      playerRef.current = null;
      callbacksRef.current.onDispose();
      callbacksRef.current.onEvent("dispose", sourceRef.current);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    applyTextTrackMode(player, activeTextTrackId);
    onStateTick();
  }, [activeTextTrackId, onStateTick]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player || sourceRef.current === source.id) {
      return;
    }

    sourceRef.current = source.id;
    currentSourceRef.current = source;
    sourceLabelRef.current = source.label;
    removeRemoteTextTracks(player);
    player.src({ src: source.src, type: source.type });
    addTextTracks(player, source);
    applyTextTrackMode(player, activeTextTrackId);
    player.load();
    onEvent("sourcechange", source.label);
    onStateTick();
  }, [activeTextTrackId, onEvent, onStateTick, source]);

  return (
    <div className="player-frame">
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}
