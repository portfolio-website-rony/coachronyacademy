import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, Check, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/courses_/$slug/checkout")({
  head: () => ({ meta: [{ title: "Checkout — CoachRony" }] }),
  component: CheckoutPage,
});

type Course = {
  id: string; title: string; slug: string; price: number; discount_price: number | null; currency: string;
  payment_methods_enabled: Record<string, boolean>; cover_url: string | null;
};
type CouponResult = { id: string | null; kind: string | null; value: number | null; valid: boolean; reason: string };

const METHOD_LABELS: Record<string, { label: string; hint: string; live: boolean }> = {
  manual: { label: "Manual (bKash/Nagad screenshot)", hint: "Send to 01XXXXXXXXX, then upload screenshot.", live: true },
  bkash: { label: "bKash (live)", hint: "Coming soon — use manual upload for now.", live: false },
  nagad: { label: "Nagad (live)", hint: "Coming soon — use manual upload for now.", live: false },
  stripe: { label: "Stripe (card)", hint: "Coming soon.", live: false },
  sslcommerz: { label: "SSLCommerz", hint: "Coming soon.", live: false },
};

function CheckoutPage() {
  const { slug } = Route.useParams();
  const { session, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [method, setMethod] = useState<string>("manual");
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/login", search: { returnTo: `/courses/${slug}/checkout` } as any });
    }
  }, [authLoading, session, slug, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      setCourse(data as unknown as Course);
      setLoading(false);
    })();
  }, [slug]);

  if (loading || authLoading) return <div className="container mx-auto max-w-3xl px-4 py-20"><div className="glass h-72 animate-pulse rounded-2xl" /></div>;
  if (!course) return <div className="container mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="font-display text-2xl font-bold">Course not found</h1></div>;
  if (!session) return null;

  const basePrice = course.discount_price ?? course.price;
  let finalPrice = basePrice;
  if (coupon?.valid && coupon.value !== null) {
    if (coupon.kind === "percent") finalPrice = Math.max(0, basePrice - basePrice * (coupon.value / 100));
    else finalPrice = Math.max(0, basePrice - coupon.value);
  }
  finalPrice = Math.round(finalPrice);
  const isFree = finalPrice === 0;

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

  async function submit() {
    if (!session) return;
    setSubmitting(true);
    try {
      // FREE path
      if (isFree) {
        const { data: pay, error: pe } = await supabase.from("payments").insert({
          course_id: course!.id, user_id: session.user.id,
          amount: 0, currency: course!.currency, method: "free", gateway: "manual",
          status: "pending", coupon_id: coupon?.id ?? null,
        }).select("id").single();
        if (pe) throw pe;
        // immediately mark verified to trigger enrollment
        const { error: ue } = await supabase.from("payments").update({ status: "verified", paid_at: new Date().toISOString() }).eq("id", pay.id);
        if (ue) throw ue;
        toast.success("Enrolled! Redirecting…");
        navigate({ to: "/student/courses/$slug", params: { slug: course!.slug } });
        return;
      }

      if (!METHOD_LABELS[method]?.live) {
        toast.error("This method is not yet live. Please use manual upload.");
        return;
      }

      // MANUAL path
      if (!txn.trim()) { toast.error("Transaction ID required"); return; }
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
      toast.success("Payment submitted! Admin will verify shortly.");
      navigate({ to: "/student" });
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link to="/courses/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Coupon */}
          <div className="glass space-y-3 rounded-2xl p-5">
            <h3 className="font-semibold">Have a coupon code?</h3>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE"
                className="flex-1 rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm uppercase tracking-wider outline-none focus:border-primary" />
              <button onClick={applyCoupon} className="rounded-xl border border-primary/40 px-4 py-2 text-sm font-semibold text-primary-glow hover:bg-primary/10">Apply</button>
            </div>
            {coupon?.valid && <div className="text-xs text-primary-glow">✓ Coupon applied</div>}
          </div>

          {/* Payment method */}
          {!isFree && (
            <div className="glass space-y-3 rounded-2xl p-5">
              <h3 className="font-semibold">Choose payment method</h3>
              {Object.entries(course.payment_methods_enabled).filter(([, v]) => v).map(([key]) => {
                const meta = METHOD_LABELS[key];
                if (!meta) return null;
                return (
                  <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${method === key ? "border-primary bg-primary/5" : "border-white/10"}`}>
                    <input type="radio" name="method" value={key} checked={method === key} onChange={() => setMethod(key)} className="mt-1" />
                    <div>
                      <div className="font-medium">{meta.label}{!meta.live && <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">SOON</span>}</div>
                      <div className="text-xs text-muted-foreground">{meta.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Manual fields */}
          {!isFree && method === "manual" && (
            <div className="glass space-y-3 rounded-2xl p-5">
              <h3 className="font-semibold">Payment proof</h3>
              <p className="text-xs text-muted-foreground">bKash/Nagad-এ {formatPrice(finalPrice, course.currency)} send করুন, তারপর transaction ID + screenshot upload করুন।</p>
              <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Transaction ID"
                className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground hover:bg-white/5">
                <Upload className="h-4 w-4" />
                <span>{file ? file.name : "Upload screenshot (optional)"}</span>
                <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="glass space-y-4 rounded-2xl p-5">
            <h3 className="font-semibold">Order summary</h3>
            <div className="flex gap-3">
              {course.cover_url && <img src={course.cover_url} alt="" className="h-16 w-24 rounded-lg object-cover" />}
              <div className="text-sm font-medium">{course.title}</div>
            </div>
            <div className="space-y-1 border-t border-white/5 pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(basePrice, course.currency)} />
              {coupon?.valid && <Row label="Discount" value={`− ${formatPrice(basePrice - finalPrice, course.currency)}`} />}
              <Row label="Total" value={formatPrice(finalPrice, course.currency)} bold />
            </div>
            <button onClick={submit} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-base font-semibold text-background shadow-glow disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFree ? "Enroll free" : submitting ? "Submitting…" : "Submit payment"}
            </button>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary-glow" /> Secure submission</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary-glow" /> Auto-enroll on verification</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary-glow" /> Lifetime access</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "pt-2 text-base font-bold" : "text-muted-foreground"}`}>
      <span>{label}</span><span className={bold ? "text-gradient" : ""}>{value}</span>
    </div>
  );
}
