import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Trash2, MessageSquare, Plus } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { toast } from "sonner";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/community")({
  head: () => ({ meta: [{ title: "Community — Admin" }] }),
  component: CommunityAdmin,
});

type Space = { id: string; name: string; slug: string; course_id: string | null };
type Post = {
  id: string;
  title: string | null;
  body: string;
  pinned: boolean;
  created_at: string;
  space_id: string;
  author_id: string;
  like_count: number;
  comment_count: number;
};

function CommunityAdmin() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [posts, setPosts] = useState<Post[] | null>(null);

  async function load() {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("community_spaces").select("id,name,slug,course_id").order("display_order"),
      supabase.from("community_posts").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100),
    ]);
    setSpaces((s as Space[]) ?? []);
    setPosts((p as Post[]) ?? []);
  }
  useEffect(() => {
    void load();
  }, []);
  useRealtime(["community_posts"], () => void load());

  async function createSpace() {
    const name = prompt("Space name (global / not tied to a course)");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase
      .from("community_spaces")
      .insert({ name, slug: `${slug}-${Date.now().toString(36).slice(-4)}` });
    if (error) return toast.error(error.message);
    void load();
  }

  async function togglePin(p: Post) {
    await supabase.from("community_posts").update({ pinned: !p.pinned }).eq("id", p.id);
    void load();
  }
  async function del(id: string) {
    if (!confirm("Delete post?")) return;
    await supabase.from("community_posts").delete().eq("id", id);
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Community</h1>
          <p className="text-sm text-muted-foreground">Moderate posts and manage spaces.</p>
        </div>
        <button
          onClick={createSpace}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> New space
        </button>
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="mb-2 text-sm font-semibold">Spaces</h3>
        <div className="flex flex-wrap gap-2">
          {spaces.length === 0 && <span className="text-sm text-muted-foreground">No spaces.</span>}
          {spaces.map((s) => (
            <span key={s.id} className="rounded-full bg-white/5 px-3 py-1 text-xs">
              {s.name} {s.course_id ? "· course" : "· global"}
            </span>
          ))}
        </div>
      </div>

      {posts === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : posts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No posts yet" />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {p.title && <h4 className="font-semibold">{p.title}</h4>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                    <span>♥ {p.like_count}</span>
                    <span>💬 {p.comment_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(p)}
                    className={`rounded-lg p-1.5 ${p.pinned ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
