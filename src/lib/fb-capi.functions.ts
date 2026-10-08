import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const ALLOWED = ["PageView", "ViewContent", "Lead", "InitiateCheckout", "Purchase", "CompleteRegistration"] as const;

const Input = z.object({
  event_name: z.enum(ALLOWED),
  event_id: z.string().min(8).max(64),
  url: z.string().url().max(2000),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(300).optional(),
  value: z.number().nonnegative().max(10_000_000).optional(),
  currency: z.string().length(3).optional(),
});

/** Public: forwards a whitelisted browser event to Meta Conversions API. Token never leaves the server. */
export const sendFbServerEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [{ data: pub }, { data: priv }] = await Promise.all([
        supabaseAdmin.from("cms_site_settings").select("value").eq("key", "tracking").maybeSingle(),
        supabaseAdmin.from("cms_site_settings").select("value").eq("key", "tracking_capi").maybeSingle(),
      ]);
      const p = (pub?.value ?? {}) as { fb_pixel_id?: string; fb_pixel_enabled?: boolean };
      const s = (priv?.value ?? {}) as { access_token?: string; test_event_code?: string; enabled?: boolean };
      const pixel = (p.fb_pixel_id ?? "").trim();
      if (!p.fb_pixel_enabled || !s.enabled || !s.access_token || !/^\d{5,20}$/.test(pixel)) return { ok: false };

      const ip = (getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "").split(",")[0].trim();
      const ua = getRequestHeader("user-agent") ?? "";
      const body: Record<string, unknown> = {
        data: [
          {
            event_name: data.event_name,
            event_time: Math.floor(Date.now() / 1000),
            event_id: data.event_id,
            event_source_url: data.url,
            action_source: "website",
            user_data: {
              client_ip_address: ip || undefined,
              client_user_agent: ua || undefined,
              fbp: data.fbp,
              fbc: data.fbc,
            },
            custom_data: data.value != null ? { value: data.value, currency: data.currency ?? "BDT" } : undefined,
          },
        ],
      };
      if (s.test_event_code) body.test_event_code = s.test_event_code;
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(s.access_token)}`,
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) console.error("FB CAPI error", res.status, await res.text());
      return { ok: res.ok };
    } catch (e) {
      console.error("FB CAPI failed", e);
      return { ok: false };
    }
  });
