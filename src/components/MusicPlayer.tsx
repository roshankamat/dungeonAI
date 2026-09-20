"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_ID = "Ha2OcL_0gtM";

type YTPlayer = { playVideo: () => void; pauseVideo: () => void; setVolume: (v: number) => void; destroy: () => void };
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    if (!document.querySelector("script[src*='youtube.com/iframe_api']")) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

/**
 * Looping background music. Browsers block sound until the user interacts,
 * so playback starts from the button. Lives in the root layout so it keeps
 * playing across page navigations.
 */
export function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);

  useEffect(() => {
    if (!open || player.current || !host.current) return;
    let cancelled = false;
    void loadApi().then((YT) => {
      if (cancelled || !host.current) return;
      player.current = new YT.Player(host.current, {
        videoId: VIDEO_ID,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, loop: 1, playlist: VIDEO_ID, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.setVolume(45);
            e.target.playVideo();
            setReady(true);
            setPlaying(true);
          },
          onStateChange: (e: { data: number }) => setPlaying(e.data === 1),
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const toggle = () => {
    if (!player.current) return;
    if (playing) player.current.pauseVideo();
    else player.current.playVideo();
  };

  const close = () => {
    player.current?.destroy();
    player.current = null;
    setOpen(false);
    setPlaying(false);
    setReady(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="neon-border fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-neon backdrop-blur transition hover:bg-neon/10"
        aria-label="Play background music"
      >
        <Music className="size-3.5" /> Music
      </button>
    );
  }

  return (
    <div className="panel fixed bottom-5 right-5 z-40 w-[240px] overflow-hidden rounded-md shadow-[0_0_40px_-10px_rgba(255,43,43,0.6)]">
      <div className="relative aspect-video bg-black">
        <div ref={host} className="absolute inset-0" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-stone-500">
            Tuning in…
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-stone-400">
          <span className={cn("size-1.5 rounded-full", playing ? "bg-neon shadow-[0_0_8px_var(--neon)] animate-pulse" : "bg-stone-600")} />
          {playing ? "Now playing" : "Paused"}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggle} className="rounded p-1.5 text-neon hover:bg-neon/10" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" onClick={close} className="rounded p-1.5 text-stone-400 hover:bg-white/5 hover:text-white" aria-label="Close music">
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
