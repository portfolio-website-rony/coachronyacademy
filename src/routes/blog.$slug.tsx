import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  notFoundComponent: () => (
    <Section title="Post not found">
      <div className="text-center">
        <Link to="/blog" className="text-primary-glow underline">← Back to blog</Link>
      </div>
    </Section>
  ),
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
};

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("cms_blog_posts")
        .select("id,title,slug,excerpt,content,cover_url,tags,published_at,created_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!data) { setMissing(true); setLoading(false); return; }
      setPost(data as Post);
      setLoading(false);
      // SEO
      document.title = `${(data as Post).title} — CoachRony Blog`;
    })();
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>;
  }

  if (missing || !post) {
    throw notFound();
  }

  return (
    <article className="pb-24">
      {post.cover_url && (
        <div className="relative h-[45vh] w-full overflow-hidden">
          <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className={post.cover_url ? "-mt-32 relative" : "pt-16"}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="glass rounded-full px-2.5 py-0.5">{t}</span>
                ))}
              </div>
            )}
          </div>
          {post.excerpt && <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>}
        </div>

        <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary-glow prose-strong:text-foreground prose-img:rounded-xl">
          <ReactMarkdown>{post.content ?? ""}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
