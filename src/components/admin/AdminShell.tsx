import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Video,
  UserCircle2,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  FolderOpen,
  Activity,
  Ticket,
  Image as ImageIcon,
  Trophy,
  BookMarked,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationBell } from "@/components/admin/NotificationBell";

const NAV: Array<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/meetings", label: "Meetings", icon: Video },
  { to: "/admin/clients", label: "Clients", icon: UserCircle2 },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/ebooks", label: "Ebooks", icon: BookMarked },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/community", label: "Community", icon: MessageSquare },
  { to: "/admin/challenge", label: "30-Day Challenge", icon: Sparkles },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/users", label: "Users & Auth", icon: ShieldCheck },
  { to: "/admin/files", label: "Files", icon: FolderOpen },
  { to: "/admin/activity", label: "Activity Log", icon: Activity },
  { to: "/admin/cms", label: "CMS", icon: FileText },
  { to: "/admin/homepage-media", label: "Homepage Media", icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-[oklch(0.16_0.02_270)]/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-background" />
            </span>
            <span className="text-gradient">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((n) => {
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
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block text-sm text-muted-foreground">
            CoachRony Admin Panel
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← View site
            </Link>
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
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary-glow">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
