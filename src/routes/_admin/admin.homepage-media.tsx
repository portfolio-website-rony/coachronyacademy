import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const Route = createFileRoute("/_admin/admin/homepage-media")({
  head: () => ({ meta: [{ title: "Homepage Media — Admin" }] }),
  component: HomepageMediaPage,
});

type Media = {
  hero_video_url: string | null;
  hero_image_url: string | null;
  banner_image_url: string | null;
  banner_link_url: string | null;
  banner_caption: string | null;
};

const EMPTY: Media = {
  hero_video_url: null,
  hero_image_url: null,
  banner_image_url: null,
  banner_link_url: null,
  banner_caption: null,
};

function HomepageMediaPage() {
  const [m, setM] = useState<Media>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    void supabase
      .from("cms_site_settings")
      .select("value")
      .eq("key", "homepage_media")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setM({ ...EMPTY, ...(data.value as Partial<Media>) });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("cms_site_settings")
      .upsert({ key: "homepage_media", value: m }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved — live site updated");
  }

  function update<K extends keyof Media>(key: K, value: Media[K]) {
    setM((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Homepage Media</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hero video/image এবং banner এখান থেকে update করুন। Save করার সাথে সাথে live site-এ show হবে
            (Publish লাগবে না)।
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-xs font-medium hover:bg-white/5"
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? "Hide" : "Show"} live preview
        </button>
      </header>

      {showPreview ? (
        <section className="overflow-hidden rounded-2xl border border-primary/30 bg-background/40 shadow-neon-purple">
          <div className="flex items-center justify-between border-b border-white/10 bg-background/60 px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-glow">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary-glow" />
              Live preview — unsaved changes shown below
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              As visitors will see
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* Hero preview */}
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hero
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[oklch(0.15_0.08_270)] to-[oklch(0.08_0.05_290)]">
                {m.hero_video_url ? (
                  <video
                    key={m.hero_video_url}
                    src={m.hero_video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : m.hero_image_url ? (
                  <img
                    src={m.hero_image_url}
                    alt="Hero preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                    Default animated orbit will show (no video/image set)
                  </div>
                )}
              </div>
            </div>

            {/* Banner preview */}
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Banner
              </div>
              {m.banner_image_url ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={m.banner_image_url}
                    alt={m.banner_caption ?? "Banner preview"}
                    className="h-auto w-full object-cover"
                  />
                  {m.banner_caption ? (
                    <p className="border-t border-white/10 bg-background/60 px-3 py-2 text-center text-xs text-muted-foreground">
                      {m.banner_caption}
                    </p>
                  ) : null}
                  {m.banner_link_url ? (
                    <p className="border-t border-white/10 bg-background/40 px-3 py-1.5 text-center text-[10px] text-primary-glow">
                      → Clicks link to: {m.banner_link_url}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="grid h-24 place-items-center rounded-xl border border-dashed border-white/10 text-xs text-muted-foreground">
                  No banner set (section will be hidden)
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}


      {/* HERO */}
      <section className="rounded-2xl border border-white/10 bg-background/40 p-5">
        <h2 className="font-display text-lg font-semibold">Hero (top of homepage)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Video দিলে video দেখাবে। Video না থাকলে image দেখাবে। দুটোই খালি থাকলে default animated orbit দেখাবে।
        </p>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium">Hero Video (autoplay, muted, loop)</div>
            <MediaUploader
              value={m.hero_video_url}
              mediaType="video"
              onChange={(url) => update("hero_video_url", url)}
              folder="homepage/hero"
              maxMb={80}
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Hero Image (fallback if no video)</div>
            <MediaUploader
              value={m.hero_image_url}
              mediaType="image"
              onChange={(url) => update("hero_image_url", url)}
              folder="homepage/hero"
              maxMb={10}
            />
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="rounded-2xl border border-white/10 bg-background/40 p-5">
        <h2 className="font-display text-lg font-semibold">Banner (below hero)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Promo/announcement banner। Link দিলে clickable হবে।
        </p>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium">Banner Image</div>
            <MediaUploader
              value={m.banner_image_url}
              mediaType="image"
              onChange={(url) => update("banner_image_url", url)}
              folder="homepage/banner"
              maxMb={10}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Banner Link (optional)</label>
              <input
                type="url"
                value={m.banner_link_url ?? ""}
                onChange={(e) => update("banner_link_url", e.target.value || null)}
                placeholder="https://... বা /courses/..."
                className="w-full rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Caption (optional)</label>
              <input
                type="text"
                value={m.banner_caption ?? ""}
                onChange={(e) => update("banner_caption", e.target.value || null)}
                placeholder="Short caption"
                className="w-full rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-neon-purple transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>
    </div>
  );
}
