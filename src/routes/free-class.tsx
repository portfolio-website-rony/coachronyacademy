import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard } from "@/components/site/Section";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/free-class")({
  head: () => ({
    meta: [
      { title: "Free AI Class — CoachRony" },
      { name: "description", content: "Register free — 90 মিনিটের live AI workshop। শিখুন কিভাবে শুরু করবেন।" },
      { property: "og:title", content: "Free AI Class — CoachRony" },
      { property: "og:description", content: "90-min live AI workshop." },
    ],
  }),
  component: FreeClass,
});

import { safeName, safeEmail, safeOptionalPhone } from "@/lib/security/schemas";

const schema = z.object({
  name: safeName,
  email: safeEmail,
  phone: safeOptionalPhone,
});

const PERKS = [
  "AI tools beginners-দের জন্য",
  "Live Q&A সেশন",
  "Free resource pack",
  "Community access",
];

function FreeClass() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const [{ error: leadErr }, { error: subErr }] = await Promise.all([
      supabase.from("leads").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        source: "free_class",
        interest: "Free AI Class",
      }),
      supabase.from("subscribers").upsert({ email: parsed.data.email, tag: "free_class" }, { onConflict: "email" }),
    ]);
    setLoading(false);
    if (leadErr || subErr) {
      toast.error("Registration failed. Please try again.");
      return;
    }
    toast.success("Registered! Confirmation email শীঘ্রই পাবেন।");
    window.location.href = "/thank-you";
  }

  return (
    <Section
      eyebrow="Free Class"
      title={<>Register for the <span className="text-gradient">Free AI Class</span></>}
      subtitle="90 minutes live — শুরু করুন AI journey, একদম zero থেকে।"
    >
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <GlassCard className="!p-7" hover={false}>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-background shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold">What you'll learn</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-glow" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            ইতিমধ্যে enrolled? <Link to="/contact" className="text-primary-glow hover:underline">Contact us</Link>
          </p>
        </GlassCard>

        <GlassCard className="!p-7" hover={false}>
          <h3 className="font-display text-xl font-semibold">Reserve your seat</h3>
          <form onSubmit={onSubmit} className="mt-5 grid gap-3">
            <input name="name" required placeholder="Full name" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
            <input name="email" type="email" required placeholder="Email" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
            <input name="phone" placeholder="WhatsApp / Phone (optional)" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Register Free
            </button>
            <p className="text-[11px] text-muted-foreground">
              Registering means you agree to receive class updates via email/WhatsApp.
            </p>
          </form>
        </GlassCard>
      </div>
    </Section>
  );
}
