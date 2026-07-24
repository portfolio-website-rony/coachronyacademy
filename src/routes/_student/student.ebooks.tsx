import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Eye, Loader2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_student/student/ebooks")({
  head: () => ({ meta: [{ title: "My Ebooks — CoachRony" }] }),
  component: EbooksPage,
});

type Ebook = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  author: string | null;
  pages: number | null;
  is_free: boolean;
  price: number | null;
  download_count: number;
};

function EbooksPage() {
  const [items, setItems] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("ebooks")
      .select("id,title,slug,description,cover_url,file_url,author,pages,is_free,price,download_count")
      .eq("published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Ebook[]) ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDownload(e: Ebook) {
    if (!e.file_url) return;
    // Bump counter (best-effort; ignore RLS failure)
    await supabase.rpc as any; // no-op to keep tree-shake happy
    void supabase.from("ebooks").update({ download_count: e.download_count + 1 }).eq("id", e.id);
    window.open(e.file_url, "_blank", "noopener");
  }

  if (loading) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-primary-glow" />
        <div className="text-lg font-semibold">No ebooks yet</div>
        <p className="text-sm text-muted-foreground">New ebooks will appear here as soon as they're published.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Ebooks</h1>
        <p className="text-sm text-muted-foreground">Read online or download as PDF.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <div key={e.id} className="glass group overflow-hidden rounded-2xl transition hover:shadow-glow">
            <div className="aspect-[3/4] w-full overflow-hidden bg-background/40">
              {e.cover_url ? (
                <img src={e.cover_url} alt={e.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground"><FileText className="h-12 w-12" /></div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold leading-snug">{e.title}</h3>
                  {e.author && <div className="text-xs text-muted-foreground">by {e.author}</div>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${e.is_free ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/20 text-primary-glow"}`}>
                  {e.is_free ? "Free" : `৳${e.price ?? 0}`}
                </span>
              </div>
              {e.description && <p className="line-clamp-2 text-xs text-muted-foreground">{e.description}</p>}
              {e.pages && <div className="text-[11px] text-muted-foreground">{e.pages} pages</div>}
              <div className="flex flex-wrap gap-2 pt-2">
                {e.file_url && (
                  <>
                    <a
                      href={e.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      <Eye className="h-3.5 w-3.5" /> Read
                    </a>
                    <button
                      onClick={() => handleDownload(e)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background shadow-glow"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </>
                )}
                {!e.file_url && <span className="text-xs text-muted-foreground">File coming soon</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
