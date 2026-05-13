import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, Bell, Sparkles, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function DashboardShell({
  brand,
  nav,
  children,
}: {
  brand: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { profile, session } = useAuthUser();

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    async function loadCount() {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      setUnread(count ?? 0);
    }
    void loadCount();

    const ch = supabase
      .channel(`notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void loadCount(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [session]);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-[oklch(0.16_0.02_270)]/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-background" />
            </span>
            <span className="text-gradient">{brand}</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gradient-primary text-background shadow-glow font-semibold"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <Link
            to="/"
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Back to site
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-muted-foreground lg:block">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-background">
                  {unread}
                </span>
              )}
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-background">
              {(profile?.display_name ?? "U").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary-glow">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
