import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — CoachRony Admin" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-background" />
          </span>
          <span className="text-gradient">Reset password</span>
        </div>
        {sent ? (
          <>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to <strong>{email}</strong>. Open it on this device
              to set a new password.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin email and we'll send a reset link.
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
              <button
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>
            </form>
          </>
        )}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/admin/login" className="text-primary-glow hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
