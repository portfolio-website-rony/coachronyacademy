import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — CoachRony" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, isAdmin, loading: checking } = useAdmin();

  useEffect(() => {
    if (!checking && session && isAdmin) navigate({ to: "/admin" });
  }, [checking, session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setLoading(false);
    if (error) {
      const msg = /invalid login/i.test(error.message)
        ? "Wrong email or password"
        : /email not confirmed/i.test(error.message)
        ? "Email not confirmed yet — please try again in a moment"
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Welcome back");
    // Full reload so the new session is hydrated before the admin layout's
    // role check runs — avoids a race that bounces back to /admin/login.
    window.location.assign("/admin");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-background" />
          </span>
          <span className="text-gradient">CoachRony Admin</span>
        </div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access your admin control center.
        </p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
          <button
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          First time here?{" "}
          <Link to="/admin/signup" className="text-primary-glow hover:underline">
            Create the admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
