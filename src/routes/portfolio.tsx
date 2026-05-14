import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site/Section";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — CoachRony" },
      { name: "description", content: "Landing pages, AI videos, ad creatives, funnels ও websites — recent work by CoachRony।" },
      { property: "og:title", content: "Portfolio — CoachRony" },
      { property: "og:description", content: "Selected projects ও case studies." },
    ],
  }),
  component: Portfolio,
});

type PortfolioItem = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  cover_url: string | null;
  media_type: string | null;
  media_url: string | null;
  link: string | null;
  display_order: number;
};

type Banner = {
  page: string;
  media_type: string;
  media_url: string | null;
  title: string | null;
  subtitle: string | null;
};

function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");

  useEffect(() => {
    void (async () => {
      const [pf, bn] = await Promise.all([
        supabase
          .from("cms_portfolio")
          .select("id,title,category,description,cover_url,media_type,media_url,link,display_order")
          .eq("published", true)
          .order("display_order", { ascending: true }),
        supabase.from("cms_page_banners").select("*").eq("page", "portfolio").maybeSingle(),
      ]);
      setItems((pf.data as PortfolioItem[]) ?? []);
      setBanner((bn.data as Banner) ?? null);
      setLoading(false);
    })();
  }, []);

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(items.map((p) => p.category).filter(Boolean) as string[]))],
    [items],
  );
  const filtered = active === "All" ? items : items.filter((p) => p.category === active);

  return (
    <>
      {banner?.media_url && (
        <div className="relative isolate -mt-px overflow-hidden">
          <div className="relative aspect-[21/9] w-full">
            {banner.media_type === "video" ? (
              <video src={banner.media_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              <img src={banner.media_url} alt={banner.title ?? "Portfolio banner"} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div>
                  {banner.title && <h1 className="font-display text-3xl font-bold sm:text-5xl">{banner.title}</h1>}
                  {banner.subtitle && <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{banner.subtitle}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Section
        eyebrow="Portfolio"
        title="Selected work"
        subtitle="Real projects shipped for creators, coaches ও brands।"
      >
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No projects yet — check back soon.</div>
        ) : (
          <>
            {tags.length > 1 && (
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActive(t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      active === t
                        ? "bg-gradient-primary text-background shadow-glow"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const card = (
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-background/40">
                      {p.media_type === "video" && p.media_url ? (
                        <video
                          src={p.media_url}
                          poster={p.cover_url ?? undefined}
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => void e.currentTarget.play()}
                          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : p.cover_url || p.media_url ? (
                        <img
                          src={p.cover_url ?? p.media_url ?? ""}
                          alt={p.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/40 to-accent/40" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      {p.category && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
                          {p.category}
                        </span>
                      )}
                      <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
                      {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                    </div>
                  </div>
                );
                return p.link ? (
                  <a key={p.id} href={p.link} target="_blank" rel="noreferrer" className="block">{card}</a>
                ) : (
                  <div key={p.id}>{card}</div>
                );
              })}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
