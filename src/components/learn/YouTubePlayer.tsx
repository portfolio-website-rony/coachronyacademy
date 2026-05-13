import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { extractYouTubeId, loadYouTubeApi } from "@/lib/learn/youtube";
import { Gauge } from "lucide-react";

type Props = {
  url: string;
  onProgress?: (seconds: number) => void;
  onDuration?: (seconds: number) => void;
  onEnded?: () => void;
  startAt?: number;
};

export type YouTubePlayerHandle = {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer(
  { url, onProgress, onDuration, onEnded, startAt = 0 },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const videoId = extractYouTubeId(url);
  const [speed, setSpeed] = useState(1);

  useImperativeHandle(ref, () => ({
    seekTo: (s: number) => {
      try {
        playerRef.current?.seekTo?.(s, true);
        playerRef.current?.playVideo?.();
      } catch { /* noop */ }
    },
    getCurrentTime: () => {
      try { return playerRef.current?.getCurrentTime?.() ?? 0; } catch { return 0; }
    },
  }));

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let destroyed = false;

    void loadYouTubeApi().then((YT) => {
      if (destroyed || !containerRef.current) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, start: Math.floor(startAt) },
        events: {
          onReady: () => {
            const d = playerRef.current?.getDuration?.() ?? 0;
            if (d > 0) onDuration?.(d);
            try { playerRef.current?.setPlaybackRate?.(speed); } catch { /* noop */ }
          },
          onStateChange: (e: any) => {
            if (e.data === 1) {
              if (intervalRef.current) window.clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                onProgress?.(t);
              }, 5000);
            } else {
              if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              if (e.data === 0) {
                const t = playerRef.current?.getDuration?.() ?? 0;
                onProgress?.(t);
                onEnded?.();
              }
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      try { playerRef.current?.destroy?.(); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  function changeSpeed(v: number) {
    setSpeed(v);
    try { playerRef.current?.setPlaybackRate?.(v); } catch { /* noop */ }
  }

  if (!videoId) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-black/40 text-sm text-muted-foreground">
        No video available.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Speed</span>
          <select
            value={speed}
            onChange={(e) => changeSpeed(Number(e.target.value))}
            className="bg-transparent text-xs outline-none"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s} className="bg-background">{s}x</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});
