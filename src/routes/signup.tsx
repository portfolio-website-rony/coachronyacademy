import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, GraduationCap, Briefcase } from "lucide-react";
import { safeName, safeEmail, safePassword } from "@/lib/security/schemas";
import { z } from "zod";

const signupSchema = z.object({
  name: safeName,
  email: safeEmail,
  password: safePassword,
  accountType: z.enum(["student", "client"]),
});

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — CoachRony" }] }),
  component: SignupPage,
});

type AccountType = "student" | "client";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, accountType });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { display_name: parsed.data.name, account_type: parsed.data.accountType },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to confirm, then sign in.");
    const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const returnTo = sp?.get("returnTo");
    if (returnTo && returnTo.startsWith("/")) {
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    } else {
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4 py-12">
      <div className="glass w-full max-w-lg rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-background" />
          </span>
          <span className="text-gradient">CoachRony</span>
        </div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you want to use CoachRony.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("student")}
            className={`glass rounded-xl p-4 text-left transition ${accountType === "student" ? "border-primary/60 shadow-glow ring-1 ring-primary/40" : "hover:border-primary/30"}`}
          >
            <GraduationCap className="h-5 w-5 text-primary-glow" />
            <div className="mt-2 font-semibold">Student</div>
            <div className="text-xs text-muted-foreground">Courses, progress, community</div>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("client")}
            className={`glass rounded-xl p-4 text-left transition ${accountType === "client" ? "border-primary/60 shadow-glow ring-1 ring-primary/40" : "hover:border-primary/30"}`}
          >
            <Briefcase className="h-5 w-5 text-primary-glow" />
            <div className="mt-2 font-semibold">Client</div>
            <div className="text-xs text-muted-foreground">Projects, meetings, payments</div>
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            maxLength={100}
            className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
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
            placeholder="Password (min 8 chars)"
            className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
          <button
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-glow hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
