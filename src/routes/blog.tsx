import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Section, GlassCard } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Content Hub — CoachRony" },
      { name: "description", content: "AI tips, tutorials, free resources ও blog posts — সব এক জায়গায়।" },
      { property: "og:title", content: "Blog & Content Hub — CoachRony" },
      { property: "og:description", content: "AI tips, tutorials ও free resources." },
    ],
  }),
  component: Blog,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
};

type Banner = {
  title: string | null;
  subtitle: string | null;
  media_type: string;
  media_url: string | null;
};

function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    void (async () => {
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from("cms_blog_posts").select("id,title,slug,excerpt,cover_url,tags,published_at,created_at").eq("published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
        supabase.from("cms_page_banners").select("title,subtitle,media_type,media_url").eq("page", "blog").maybeSingle(),
      ]);
      setPosts((p as Post[]) ?? []);
      setBanner((b as Banner) ?? null);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(s) || (p.excerpt ?? "").toLowerCase().includes(s));
  }, [q, posts]);

  return (
    <>
      {banner?.media_url && (
        <div className="relative h-[40vh] w-full overflow-hidden">
          {banner.media_type === "video" ? (
            <video src={banner.media_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={banner.media_url} alt={banner.title ?? "Blog banner"} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
          {(banner.title || banner.subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              {banner.title && <h1 className="font-display text-3xl font-bold sm:text-5xl">{banner.title}</h1>}
              {banner.subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{banner.subtitle}</p>}
            </div>
          )}
        </div>
      )}

      <Section
        eyebrow="Content Hub"
        title={<>Latest <span className="text-gradient">articles & guides</span></>}
        subtitle="AI, content ও business — সব কিছু এক জায়গায়।"
      >
        <div className="mx-auto mb-10 max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search content..."
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {posts.length === 0 ? "No posts yet. Check back soon!" : "No posts match your search."}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group">
                <GlassCard>
                  {p.cover_url && (
                    <div className="mb-4 -mx-1 -mt-1 overflow-hidden rounded-xl">
                      <img src={p.cover_url} alt={p.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary-glow" />
                    <span className="uppercase tracking-wider">Article</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary-glow">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(p.published_at ?? p.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    {p.tags && p.tags.length > 0 && <span className="truncate">{p.tags.slice(0, 2).join(" · ")}</span>}
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
