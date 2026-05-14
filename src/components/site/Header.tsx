import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Search,
  Sun,
  Moon,
  User,
  BookOpen,
  BookMarked,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo-coachrony.png";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserBell } from "@/components/dashboard/UserBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dark, setDark] = useState(true);
  const { session, profile } = useAuthUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isStudent = pathname.startsWith("/student");
  const email = session?.user?.email ?? "";
  const initial = (profile?.display_name ?? email ?? "U").slice(0, 1).toUpperCase();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate({ to: "/courses", search: { q: term } as any });
    setOpen(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Coachrony Academy">
            <img src={logo} alt="Coachrony Academy" className="h-12 w-auto sm:h-14" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  activeProps={{ className: "text-foreground bg-white/10" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {session && <UserBell />}
            <button
              onClick={() => setDark((v) => !v)}
              className="grid h-9 w-16 place-items-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              aria-label="Toggle theme"
              title="Theme"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                  dark ? "ml-auto mr-0.5 bg-white/10" : "ml-0.5 mr-auto bg-gradient-primary text-background"
                }`}
              >
                {dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </span>
            </button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-primary text-xs font-bold text-background outline-none ring-primary/40 transition hover:ring-2"
                    aria-label="Account menu"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex items-center gap-3 py-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary text-sm font-bold text-background">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initial
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {profile?.display_name ?? "Account"}
                      </span>
                      {email && (
                        <span className="block truncate text-xs font-normal text-muted-foreground">
                          {email}
                        </span>
                      )}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isStudent ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/student" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/student/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/student/courses" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" /> My Courses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/student/ebooks" className="flex items-center gap-2">
                          <BookMarked className="h-4 w-4" /> My Ebooks
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/student/profile" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-400 focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
                >
                  Book a Call
                </Link>
              </>
            )}
          </div>

          <button
            className="ml-auto rounded-lg p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  activeProps={{ className: "text-foreground bg-white/5" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link
                    to="/student"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-400 hover:bg-white/5"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
                  >
                    Book a Call
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
