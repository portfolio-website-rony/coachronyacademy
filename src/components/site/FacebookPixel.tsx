import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { sendFbServerEvent } from "@/lib/fb-capi.functions";

type FbqWindow = Window & { fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] }; _fbq?: unknown };
type FbEvent = "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase" | "CompleteRegistration";

let pixelReady = false;

function cookie(name: string) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Fires an event in the browser Pixel AND server-side (Conversions API) with a shared event_id for dedup. */
export function trackFbEvent(name: FbEvent, extra?: { value?: number; currency?: string }) {
  if (typeof window === "undefined" || !pixelReady) return;
  const eventId = `${name}-${crypto.randomUUID()}`;
  const w = window as FbqWindow;
  const params = extra?.value != null ? { value: extra.value, currency: extra.currency ?? "BDT" } : {};
  w.fbq?.("track", name, params, { eventID: eventId });
  void sendFbServerEvent({
    data: {
      event_name: name,
      event_id: eventId,
      url: window.location.href,
      fbp: cookie("_fbp"),
      fbc: cookie("_fbc"),
      value: extra?.value,
      currency: extra?.currency,
    },
  }).catch(() => {});
}

/** Loads Facebook Pixel using the ID saved in Admin → Settings (key: tracking). */
export function FacebookPixel() {
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
        pixelReady = true;
        trackFbEvent("PageView");
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
    trackFbEvent("PageView");
    if (/\/checkout$/.test(pathname)) trackFbEvent("InitiateCheckout");
  }, [pathname]);

  return null;
}
