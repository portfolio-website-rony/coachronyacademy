import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — CoachRony" }] }),
  component: LoginPage,
});

function getReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  const r = sp.get("returnTo");
  return r && r.startsWith("/") ? r : null;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const r = getReturnTo();
        if (r) window.location.href = r;
        else navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    const r = getReturnTo();
    if (r) window.location.href = r;
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4 py-12">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-background" />
          </span>
          <span className="text-gradient">CoachRony</span>
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your dashboard</p>
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
        <p className="mt-5 text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-primary-glow hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
