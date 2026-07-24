import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";
import { safeName, safeEmail, safePhone, safePassword } from "@/lib/security/schemas";
import { validateUpload } from "@/lib/security/files";
import { z } from "zod";
import {
  ArrowLeft, Loader2, Copy, CheckCircle2, Upload, Smartphone,
  Sparkles, ShieldCheck, Flame, User as UserIcon, Lock, Mail, Phone,
} from "lucide-react";

const CHALLENGE_SLUG = "success-code-30day";
const PRICE = 299;
const CURRENCY = "BDT";

export const Route = createFileRoute("/challenge/join")({
  head: () => ({
    meta: [
      { title: "Join The Success Code 30-Day Challenge — CoachRony" },
      { name: "description", content: "Register, pay via bKash/Nagad/Rocket, and start the 30-day success challenge." },
      { property: "og:title", content: "Join The Success Code 30-Day Challenge" },
      { property: "og:description", content: "৳299 এ ৩০ দিনের transformation journey শুরু করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

type PaymentSettings = {
  bkash_number?: string; bkash_type?: string;
  nagad_number?: string; nagad_type?: string;
  instructions_bn?: string;
};

const signupSchema = z.object({
  name: safeName,
  email: safeEmail,
  phone: safePhone,
  password: safePassword,
});

const METHODS = [
  { key: "bkash", label: "bKash", color: "from-pink-500/30 to-rose-500/20" },
  { key: "nagad", label: "Nagad", color: "from-orange-500/30 to-amber-500/20" },
  { key: "rocket", label: "Rocket", color: "from-purple-500/30 to-fuchsia-500/20" },
];

function JoinPage() {
  const { session, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [step, setStep] = useState<1 | 2>(1);

  // signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  // payment fields
  const [method, setMethod] = useState("bkash");
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    void supabase.from("cms_site_settings").select("value").eq("key", "payments").maybeSingle()
      .then(({ data }) => { if (data?.value) setSettings(data.value as PaymentSettings); });
  }, []);

  // If already signed in, skip step 1
  useEffect(() => {
    if (!authLoading && session) setStep(2);
  }, [authLoading, session]);

  // If already enrolled, redirect to challenge
  useEffect(() => {
    if (!session) return;
    void supabase.from("challenge_enrollments")
      .select("id").eq("user_id", session.user.id).eq("challenge_slug", CHALLENGE_SLUG).maybeSingle()
      .then(({ data }) => {
        if (data) {
          toast.success("আপনি ইতিমধ্যে enrolled আছেন");
          navigate({ to: "/student/challenge" });
        }
      });
  }, [session, navigate]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, phone, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
    setCreating(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/challenge/join`,
        data: {
          display_name: parsed.data.name,
          account_type: "student",
          phone: parsed.data.phone,
        },
      },
    });
    setCreating(false);
    if (error) return toast.error(error.message);

    // Try to save phone on profile (best-effort; runs after profile trigger fires)
    setTimeout(() => {
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user) void supabase.from("profiles").update({ phone: parsed.data.phone }).eq("id", data.user.id);
      });
    }, 800);

    toast.success("Account created! এখন payment complete করুন।");
    setStep(2);
  }

  async function handlePayment() {
    if (!session) return toast.error("Please sign in first");
    if (!txn.trim()) return toast.error("Transaction ID দিন");

    setSubmitting(true);
    try {
      let screenshot_path: string | null = null;
      if (file) {
        const check = validateUpload(file);
        if (!check.ok) throw new Error(check.reason);
        const path = `${session.user.id}/challenge/${Date.now()}-${file.name}`;
        const { error: ue } = await supabase.storage.from("payment-screenshots").upload(path, file);
        if (ue) throw ue;
        screenshot_path = path;
      }

      const { error: pe } = await supabase.from("payments").insert({
        user_id: session.user.id,
        amount: PRICE,
        currency: CURRENCY,
        method,
        gateway: "manual",
        status: "pending",
        transaction_id: txn.trim(),
        screenshot_path,
        challenge_slug: CHALLENGE_SLUG,
        notes: "The Success Code 30-Day Challenge",
      });
      if (pe) throw pe;

      toast.success("Payment submitted! Admin verify করলে challenge unlock হয়ে যাবে।");
      navigate({ to: "/student/challenge" });
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const activeNumber = method === "bkash" ? settings.bkash_number
    : method === "nagad" ? settings.nagad_number
    : "01960254383";
  const activeType = method === "bkash" ? settings.bkash_type
    : method === "nagad" ? settings.nagad_type : "Personal";

  async function copy(text?: string | null) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
      toast.success("Copied!");
    } catch {}
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link to="/success-code-challenge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to challenge
      </Link>

      <div className="mt-4 mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
          <Flame className="h-3.5 w-3.5" /> THE SUCCESS CODE™ 30-DAY CHALLENGE
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Join in <span className="text-gradient">2 quick steps</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register → Pay ৳{PRICE} via bKash/Nagad/Rocket → Auto-enrolled after verification
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <StepDot n={1} label="Register" active={step === 1} done={step === 2 || !!session} />
        <div className="h-px w-16 bg-white/10" />
        <StepDot n={2} label="Pay" active={step === 2} done={false} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Step 1: Signup */}
          {step === 1 && !session && (
            <Card>
              <SectionHeader icon={UserIcon} title="Create your account" subtitle="Phone দিয়ে চ্যালেঞ্জে join করুন" />
              <form onSubmit={handleSignup} className="space-y-3">
                <Input icon={UserIcon} placeholder="আপনার পুরো নাম" value={name} onChange={setName} maxLength={100} />
                <Input icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} maxLength={200} />
                <Input icon={Phone} type="tel" placeholder="WhatsApp / Phone (e.g. 01XXXXXXXXX)" value={phone} onChange={setPhone} maxLength={20} />
                <Input icon={Lock} type="password" placeholder="Password (min 8 characters)" value={password} onChange={setPassword} maxLength={100} />
                <button disabled={creating} className={btnPrimary}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue to payment →
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" search={{ returnTo: "/challenge/join" } as any} className="text-primary-glow hover:underline">Sign in</Link>
                </p>
              </form>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && session && (
            <>
              <Card>
                <SectionHeader icon={Smartphone} title="Choose payment method" subtitle="যেকোনো একটি দিয়ে ৳299 পাঠান" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {METHODS.map((m) => {
                    const selected = method === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                          selected ? "border-primary shadow-glow" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${m.color}`} />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{m.label}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary-glow" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <SectionHeader
                  icon={Smartphone}
                  title={`Send ৳${PRICE} via ${METHODS.find((m) => m.key === method)?.label}`}
                  subtitle={settings.instructions_bn ?? "নাম্বারে টাকা পাঠান, তারপর Transaction ID দিন।"}
                />

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 p-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {METHODS.find((m) => m.key === method)?.label} Number {activeType ? `· ${activeType}` : ""}
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-gradient tabular-nums">{activeNumber}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(activeNumber)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                  >
                    {copied === activeNumber ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === activeNumber ? "Copied" : "Copy"}
                  </button>
                </div>

                <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <Step n={1}>Mobile banking app খুলুন → <b className="text-foreground">Send Money</b></Step>
                  <Step n={2}>উপরের নাম্বারে <b className="text-foreground">৳{PRICE}</b> পাঠান</Step>
                  <Step n={3}>Transaction ID copy করে নিচে paste করুন</Step>
                </ol>

                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction ID *</span>
                    <input
                      value={txn}
                      onChange={(e) => setTxn(e.target.value)}
                      maxLength={80}
                      placeholder="যেমন: 9A7BC2DXYZ"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 text-sm hover:bg-white/5">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{file ? file.name : "Screenshot upload করুন (optional)"}</div>
                      <div className="text-xs text-muted-foreground">Faster verification এর জন্য recommended</div>
                    </div>
                    <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <SectionHeader icon={Sparkles} title="Order summary" />
            <div className="space-y-1.5 text-sm">
              <Row label="The Success Code 30-Day Challenge" value={`৳${PRICE}`} />
              <Row label="Total" value={`৳${PRICE}`} bold />
            </div>
            {step === 2 && session && (
              <button
                onClick={handlePayment}
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3.5 text-base font-bold text-background shadow-glow hover:opacity-95 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting…" : "Submit payment"}
              </button>
            )}
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary-glow" /> Secure submission</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary-glow" /> Admin verifies within 24h</li>
              <li className="flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-primary-glow" /> Auto-enrolled after verify</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

const btnPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold text-background shadow-glow disabled:opacity-60";

function Card({ children }: { children: React.ReactNode }) {
  return <section className="glass rounded-2xl border border-white/10 p-5">{children}</section>;
}
function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary-glow">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
function Input({ icon: Icon, value, onChange, ...rest }: any) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="w-full rounded-xl border border-white/10 bg-background/40 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary-glow">{n}</span>
      <span>{children}</span>
    </li>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "border-t border-white/5 pt-2 text-base font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-gradient" : ""}>{value}</span>
    </div>
  );
}
function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
          done ? "bg-emerald-500 text-white" : active ? "bg-gradient-primary text-background shadow-glow" : "bg-white/10 text-muted-foreground"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}
