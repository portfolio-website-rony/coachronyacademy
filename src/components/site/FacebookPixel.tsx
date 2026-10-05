import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type FbqWindow = Window & { fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] }; _fbq?: unknown };

/** Loads Facebook Pixel using the ID saved in Admin → Settings (key: tracking). */
export function FacebookPixel() {
  const ready = useRef(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from("cms_site_settings")
      .select("value")
      .eq("key", "tracking")
      .maybeSingle()
      .then(({ data }) => {
        const v = (data?.value ?? {}) as { fb_pixel_id?: string; fb_pixel_enabled?: boolean };
        const id = (v.fb_pixel_id ?? "").trim();
        if (cancelled || !v.fb_pixel_enabled || !/^\d{5,20}$/.test(id)) return;
        const w = window as FbqWindow;
        if (!w.fbq) {
          const n = function (...args: unknown[]) {
            const self = n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
            if (self.callMethod) self.callMethod(...args);
            else self.queue.push(args);
          } as unknown as NonNullable<FbqWindow["fbq"]>;
          Object.assign(n, { push: n, loaded: true, version: "2.0", queue: [] });
          w.fbq = n;
          w._fbq = n;
          const s = document.createElement("script");
          s.async = true;
          s.src = "https://connect.facebook.net/en_US/fbevents.js";
          document.head.appendChild(s);
        }
        w.fbq!("init", id);
        w.fbq!("track", "PageView");
        ready.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const w = window as FbqWindow;
    if (ready.current && w.fbq) w.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
