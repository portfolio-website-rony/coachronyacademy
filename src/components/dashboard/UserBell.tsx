import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function UserBell({ fallbackLink = "/student" }: { fallbackLink?: string }) {
  const { session } = useAuthUser();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25);
      setItems((data as Notification[]) ?? []);
    }
    void load();

    const ch = supabase
      .channel(`user-notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => [n, ...prev].slice(0, 25));
          toast.info(n.title, { description: n.body ?? undefined });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void load(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [session]);

  async function markAllRead() {
    if (!session || unread === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-primary px-1 text-[10px] font-bold text-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.16_0.02_270)]/98 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || fallbackLink}
                    onClick={() => {
                      void markRead(n.id);
                      setOpen(false);
                    }}
                    className={`block border-b border-white/5 px-4 py-3 hover:bg-white/[0.03] ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-glow" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{n.title}</div>
                        {n.body && <div className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</div>}
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link
              to="/student/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-white/10 px-4 py-3 text-center text-xs text-primary-glow hover:bg-white/[0.03]"
            >
              View all notifications →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
