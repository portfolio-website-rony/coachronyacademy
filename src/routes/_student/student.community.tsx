import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { Heart, MessageCircle, Pin, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_student/student/community")({
  head: () => ({ meta: [{ title: "Community — CoachRony" }] }),
  component: CommunityPage,
});

type Space = { id: string; name: string; slug: string; course_id: string | null };
type Post = {
  id: string;
  space_id: string;
  author_id: string;
  title: string | null;
  body: string;
  pinned: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
};
type Comment = { id: string; post_id: string; author_id: string; body: string; created_at: string };

function CommunityPage() {
  const { session } = useAuthUser();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { display_name: string | null; avatar_url: string | null }>>(new Map());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("community_spaces").select("id,name,slug,course_id").order("display_order");
      const list = (data as Space[]) ?? [];
      setSpaces(list);
      if (list.length > 0 && !activeSpace) setActiveSpace(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!activeSpace) return;
    void loadPosts();
    const ch = supabase
      .channel(`space-${activeSpace}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: `space_id=eq.${activeSpace}` }, () => void loadPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_likes" }, () => void loadPosts())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [activeSpace]);

  async function loadPosts() {
    if (!activeSpace) return;
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("space_id", activeSpace)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    const list = (data as Post[]) ?? [];
    setPosts(list);
    const ids = Array.from(new Set(list.map((p) => p.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url")
        .in("id", ids);
      setProfiles(new Map((profs ?? []).map((p: any) => [p.id, p])));
    }
    if (session && list.length) {
      const { data: likes } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", session.user.id)
        .in("post_id", list.map((p) => p.id));
      setLikedIds(new Set((likes ?? []).map((l: any) => l.post_id)));
    }
  }

  async function createPost() {
    if (!session || !activeSpace || !body.trim()) return;
    const { error } = await supabase.from("community_posts").insert({
      space_id: activeSpace,
      author_id: session.user.id,
      title: title.trim() || null,
      body: body.trim(),
    });
    if (error) return toast.error(error.message);
    setBody("");
    setTitle("");
  }

  async function toggleLike(p: Post) {
    if (!session) return;
    if (likedIds.has(p.id)) {
      await supabase.from("community_likes").delete().eq("post_id", p.id).eq("user_id", session.user.id);
    } else {
      await supabase.from("community_likes").insert({ post_id: p.id, user_id: session.user.id });
    }
  }

  async function toggleComments(postId: string) {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at");
    setComments((prev) => ({ ...prev, [postId]: (data as Comment[]) ?? [] }));
  }

  async function addComment(postId: string) {
    if (!session || !commentDraft.trim()) return;
    const { error } = await supabase
      .from("community_comments")
      .insert({ post_id: postId, author_id: session.user.id, body: commentDraft.trim() });
    if (error) return toast.error(error.message);
    setCommentDraft("");
    void toggleComments(postId);
    void toggleComments(postId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Community</h1>
        <p className="text-sm text-muted-foreground">Discuss with peers and instructors.</p>
      </div>

      {spaces.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {spaces.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSpace(s.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                activeSpace === s.id ? "bg-gradient-primary text-background" : "bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="glass space-y-2 rounded-2xl p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share something with the community…"
          className="w-full rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex justify-end">
          <button
            onClick={createPost}
            disabled={!body.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Post
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {posts.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
            No posts yet — be the first.
          </div>
        )}
        {posts.map((p) => {
          const author = profiles.get(p.author_id);
          const liked = likedIds.has(p.id);
          return (
            <div key={p.id} className="glass space-y-3 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm font-semibold text-primary-glow">
                    {(author?.display_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{author?.display_name ?? "Member"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                </div>
                {p.pinned && <Pin className="h-4 w-4 text-primary-glow" />}
              </div>
              {p.title && <h3 className="font-display text-lg font-bold">{p.title}</h3>}
              <p className="whitespace-pre-wrap text-sm">{p.body}</p>
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => toggleLike(p)}
                  className={`inline-flex items-center gap-1.5 text-xs ${liked ? "text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {p.like_count}
                </button>
                <button
                  onClick={() => toggleComments(p.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> {p.comment_count}
                </button>
              </div>
              {openComments === p.id && (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  {(comments[p.id] ?? []).map((c) => (
                    <div key={c.id} className="rounded-lg bg-background/40 p-2.5 text-sm">
                      <div className="text-xs text-muted-foreground">
                        {profiles.get(c.author_id)?.display_name ?? "Member"} ·{" "}
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Write a comment…"
                      className="flex-1 rounded-lg border border-white/10 bg-background/40 px-3 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => addComment(p.id)}
                      className="rounded-lg bg-primary/20 px-3 py-1.5 text-sm text-primary-glow"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
