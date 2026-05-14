import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_student/student/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CoachRony" }] }),
  component: NotificationsPage,
});

type N = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

function NotificationsPage() {
  const { session } = useAuthUser();
  const [items, setItems] = useState<N[] | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function load() {
    if (!session) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data as N[]) ?? []);
  }

  useEffect(() => {
    void load();
    if (!session) return;
    const ch = supabase
      .channel(`notif-page-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
        () => void load(),
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function markAllRead() {
    if (!session) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
    void load();
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    void load();
  }

  const visible = (items ?? []).filter((n) => filter === "all" || !n.read);
  const unreadCount = (items ?? []).filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Notifications</h1>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 ${filter === "all" ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1.5 ${filter === "unread" ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground"}`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {items === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : visible.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {filter === "unread" ? "All caught up." : "No notifications yet."}
          </p>
        </div>
      ) : (
        <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
          {visible.map((n) => {
            const body = (
              <div className="flex items-start gap-3 p-4">
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-glow" />}
                <div className={`flex-1 min-w-0 ${n.read ? "opacity-60" : ""}`}>
                  <div className="text-sm font-semibold">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} · {n.type}
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link
                key={n.id}
                to={n.link}
                onClick={() => void markRead(n.id)}
                className="block hover:bg-white/[0.03]"
              >
                {body}
              </Link>
            ) : (
              <button
                key={n.id}
                onClick={() => void markRead(n.id)}
                className="block w-full text-left hover:bg-white/[0.03]"
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
