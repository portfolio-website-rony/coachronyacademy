import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

function extractId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  return m ? m[1] : null;
}

export const getYoutubeDuration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ url: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const id = extractId(data.url);
    if (!id) return { seconds: 0 };
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) return { seconds: 0 };
      const html = await res.text();
      const m =
        html.match(/"lengthSeconds":"(\d+)"/) ||
        html.match(/"approxDurationMs":"(\d+)"/);
      if (!m) return { seconds: 0 };
      const num = Number(m[1]);
      const seconds = m[0].includes("approxDurationMs")
        ? Math.round(num / 1000)
        : num;
      return { seconds: Number.isFinite(seconds) ? seconds : 0 };
    } catch {
      return { seconds: 0 };
    }
  });
