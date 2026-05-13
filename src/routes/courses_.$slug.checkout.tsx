import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Upload, Loader2, Copy, CheckCircle2, Tag,
  Smartphone, CreditCard, ShieldCheck, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/courses/$slug/checkout")({
  head: () => ({ meta: [{ title: "Checkout — CoachRony" }] }),
  component: CheckoutPage,
});

type Course = {
  id: string; title: string; slug: string;
  price: number; discount_price: number | null; currency: string;
  payment_methods_enabled: Record<string, boolean>; cover_url: string | null;
};
type CouponResult = { id: string | null; kind: string | null; value: number | null; valid: boolean; reason: string };
type PaymentSettings = {
  bkash_number?: string; bkash_type?: string;
  nagad_number?: string; nagad_type?: string;
  instructions_bn?: string;
};

const METHOD_META: Record<
  string,
  { label: string; sublabel: string; live: boolean; brand: string; icon: typeof Smartphone }
> = {
  bkash:      { label: "bKash",      sublabel: "Send Money / Payment", live: true,  brand: "from-pink-500/30 to-rose-500/20",     icon: Smartphone },
  nagad:      { label: "Nagad",      sublabel: "Send Money / Payment", live: true,  brand: "from-orange-500/30 to-amber-500/20",  icon: Smartphone },
  manual:     { label: "Other Mobile Banking", sublabel: "Rocket / Upay / Bank — manual proof", live: true, brand: "from-sky-500/25 to-cyan-500/15", icon: CreditCard },
  stripe:     { label: "Card (Stripe)",  sublabel: "International cards",  live: false, brand: "from-indigo-500/30 to-blue-500/20",   icon: CreditCard },
  sslcommerz: { label: "SSLCommerz",  sublabel: "All BD cards & banks",  live: false, brand: "from-emerald-500/30 to-teal-500/20",  icon: CreditCard },
};

function CheckoutPage() {
  const { slug } = Route.useParams();
  const { session, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [method, setMethod] = useState<string>("bkash");
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/login", search: { returnTo: `/courses/${slug}/checkout` } as any });
    }
  }, [authLoading, session, slug, navigate]);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from("courses").select("*").eq("slug", slug).eq("published", true).maybeSingle(),
        supabase.from("cms_site_settings").select("value").eq("key", "payments").maybeSingle(),
      ]);
      setCourse(c as unknown as Course);
      if (s?.value) setSettings(s.value as PaymentSettings);
      // default method: first enabled & live
      const enabled = (c as any)?.payment_methods_enabled ?? {};
      const firstLive = Object.keys(METHOD_META).find((k) => enabled[k] && METHOD_META[k].live);
      if (firstLive) setMethod(firstLive);
      setLoading(false);
    })();
  }, [slug]);

  if (loading || authLoading) return <Skeleton />;
  if (!course) return (
    <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Course not found</h1>
      <Link to="/programs" className="mt-6 inline-block text-primary-glow hover:underline">← Browse programs</Link>
    </div>
  );
  if (!session) return null;

  const basePrice = course.discount_price ?? course.price;
  let finalPrice = basePrice;
  if (coupon?.valid && coupon.value !== null) {
    if (coupon.kind === "percent") finalPrice = Math.max(0, basePrice - basePrice * (coupon.value / 100));
    else finalPrice = Math.max(0, basePrice - coupon.value);
  }
  finalPrice = Math.round(finalPrice);
  const isFree = finalPrice === 0;

  const enabledMethods = Object.entries(course.payment_methods_enabled).filter(([, v]) => v).map(([k]) => k);
  const activeMeta = METHOD_META[method];
  const activeNumber =
    method === "bkash" ? settings.bkash_number :
    method === "nagad" ? settings.nagad_number : null;
  const activeAccountType =
    method === "bkash" ? settings.bkash_type :
    method === "nagad" ? settings.nagad_type : null;

  async function applyCoupon() {
    if (!code.trim()) return;
    const { data, error } = await supabase.rpc("validate_coupon", { _code: code.trim(), _course_id: course!.id });
    if (error) return toast.error(error.message);
    const row = (data as any[])?.[0] as CouponResult | undefined;
    if (!row) { toast.error("Invalid coupon"); return; }
    setCoupon(row);
    if (row.valid) toast.success("Coupon applied!");
    else toast.error(`Coupon ${row.reason}`);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success("Copied!");
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  async function submit() {
    if (!session) return;
    setSubmitting(true);
    try {
      if (isFree) {
        const { data: pay, error: pe } = await supabase.from("payments").insert({
          course_id: course!.id, user_id: session.user.id,
          amount: 0, currency: course!.currency, method: "free", gateway: "manual",
          status: "pending", coupon_id: coupon?.id ?? null,
        }).select("id").single();
        if (pe) throw pe;
        const { error: ue } = await supabase.from("payments").update({ status: "verified", paid_at: new Date().toISOString() }).eq("id", pay.id);
        if (ue) throw ue;
        toast.success("Enrolled! Redirecting…");
        navigate({ to: "/student/courses/$slug", params: { slug: course!.slug } });
        return;
      }
      if (!txn.trim()) { toast.error("Transaction ID দিন"); setSubmitting(false); return; }

      let screenshot_path: string | null = null;
      if (file) {
        const path = `${session.user.id}/${course!.id}/${Date.now()}-${file.name}`;
        const { error: ue } = await supabase.storage.from("payment-screenshots").upload(path, file);
        if (ue) throw ue;
        screenshot_path = path;
      }
      const { error: pe } = await supabase.from("payments").insert({
        course_id: course!.id, user_id: session.user.id,
        amount: finalPrice, currency: course!.currency, method, gateway: "manual",
        status: "pending", transaction_id: txn.trim(), screenshot_path,
        coupon_id: coupon?.id ?? null,
      });
      if (pe) throw pe;
      toast.success("Payment submitted! Admin verify করার পর enroll হয়ে যাবে।");
      navigate({ to: "/student" });
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Link to="/courses/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Complete your enrollment</h1>
        <p className="mt-2 text-sm text-muted-foreground">Secure checkout · Auto-enroll on verification</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Coupon */}
          <Card>
            <SectionHeader icon={Tag} title="Coupon code" subtitle="যদি promo code থাকে" />
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="flex-1 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-primary"
              />
              <button onClick={applyCoupon} className="rounded-xl border border-primary/40 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary-glow hover:bg-primary/10">
                Apply
              </button>
            </div>
            {coupon?.valid && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Coupon applied
              </div>
            )}
          </Card>

          {/* Payment method selector */}
          {!isFree && (
            <Card>
              <SectionHeader icon={CreditCard} title="Payment method" subtitle="যেভাবে পাঠাবেন সেটা সিলেক্ট করুন" />
              <div className="grid gap-3 sm:grid-cols-2">
                {enabledMethods.map((key) => {
                  const meta = METHOD_META[key];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const selected = method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => meta.live && setMethod(key)}
                      disabled={!meta.live}
                      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                        selected ? "border-primary shadow-glow" : "border-white/10 hover:border-white/20"
                      } ${!meta.live ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${meta.brand}`} />
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/40 backdrop-blur">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{meta.label}</span>
                            {!meta.live && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">Soon</span>}
                            {selected && meta.live && <CheckCircle2 className="ml-auto h-4 w-4 text-primary-glow" />}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{meta.sublabel}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Send-money instructions */}
          {!isFree && activeMeta?.live && (
            <Card>
              <SectionHeader
                icon={Smartphone}
                title={`Send ${formatPrice(finalPrice, course.currency)} via ${activeMeta.label}`}
                subtitle={settings.instructions_bn ?? "নাম্বারে টাকা পাঠান, তারপর Transaction ID দিন।"}
              />

              {activeNumber ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 p-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{activeMeta.label} Number {activeAccountType ? `· ${activeAccountType}` : ""}</div>
                      <div className="mt-1 font-display text-2xl font-bold text-gradient tabular-nums">{activeNumber}</div>
                    </div>
                    <button
                      onClick={() => copy(activeNumber)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                    >
                      {copied === activeNumber ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === activeNumber ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <Step n={1}>{activeMeta.label} app খুলুন → <b className="text-foreground">Send Money</b> select করুন</Step>
                    <Step n={2}>উপরের নাম্বারে <b className="text-foreground">{formatPrice(finalPrice, course.currency)}</b> পাঠান</Step>
                    <Step n={3}>Transaction ID copy করে নিচে paste করুন (screenshot upload করলে faster verify হবে)</Step>
                  </ol>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
                  Manual payment proof — admin আপনার transaction যাচাই করে enroll করবে।
                </div>
              )}

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction ID *</span>
                  <input
                    value={txn}
                    onChange={(e) => setTxn(e.target.value)}
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
          )}
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <SectionHeader icon={Sparkles} title="Order summary" />
            <div className="flex gap-3">
              {course.cover_url && <img src={course.cover_url} alt="" className="h-16 w-24 rounded-lg object-cover" />}
              <div>
                <div className="text-sm font-semibold leading-tight">{course.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">Lifetime access</div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(basePrice, course.currency)} />
              {coupon?.valid && <Row label="Discount" value={`− ${formatPrice(basePrice - finalPrice, course.currency)}`} accent />}
              <Row label="Total" value={formatPrice(finalPrice, course.currency)} bold />
            </div>
            <button
              onClick={submit}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3.5 text-base font-bold text-background shadow-glow transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFree ? "Enroll free" : submitting ? "Submitting…" : "Submit payment"}
            </button>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary-glow" /> Secure & encrypted submission</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary-glow" /> Admin verifies within 24h</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary-glow" /> Auto-enroll on approval</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-2xl p-5 sm:p-6">{children}</div>;
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Smartphone; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-glow">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] font-bold text-primary-glow">{n}</span>
      <span>{children}</span>
    </li>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-white/5 pt-2 text-base font-bold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-gradient" : accent ? "text-emerald-400" : ""}>{value}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="glass h-32 animate-pulse rounded-2xl" />
          <div className="glass h-48 animate-pulse rounded-2xl" />
          <div className="glass h-64 animate-pulse rounded-2xl" />
        </div>
        <div className="glass h-72 animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}
