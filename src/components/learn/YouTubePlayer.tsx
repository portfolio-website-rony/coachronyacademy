import { useEffect, useRef } from "react";
import { extractYouTubeId, loadYouTubeApi } from "@/lib/learn/youtube";

type Props = {
  url: string;
  onProgress?: (seconds: number) => void;
  onDuration?: (seconds: number) => void;
  startAt?: number;
};

export function YouTubePlayer({ url, onProgress, onDuration, startAt = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const videoId = extractYouTubeId(url);

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
          },
          onStateChange: (e: any) => {
            // 1 = playing
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
              }
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-black/40 text-sm text-muted-foreground">
        No video available.
      </div>
    );
  }
  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
