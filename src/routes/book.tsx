import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, GlassCard } from "@/components/site/Section";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CalendarCheck } from "lucide-react";
import { safeName, safeEmail, safeOptionalPhone, safeOptionalText } from "@/lib/security/schemas";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Call — CoachRony" },
      { name: "description", content: "Free 30-minute consultation booking — আপনার project বা learning path discuss করুন।" },
      { property: "og:title", content: "Book a Call — CoachRony" },
      { property: "og:description", content: "Free 30-min discovery call." },
    ],
  }),
  component: BookPage,
});

const TIMES = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "8:00 PM"];

const schema = z.object({
  name: safeName,
  email: safeEmail,
  phone: safeOptionalPhone,
  topic: safeOptionalText(255),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  preferred_time: z.string().min(1).max(20),
  notes: safeOptionalText(1000),
});

function BookPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      topic: parsed.data.topic || null,
      preferred_date: parsed.data.preferred_date,
      preferred_time: parsed.data.preferred_time,
      notes: parsed.data.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Booking failed. Try again.");
      return;
    }
    setDone(true);
    toast.success("Booking received! আমরা confirm করতে যোগাযোগ করবো।");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Section
      eyebrow="Booking"
      title={<>Book a <span className="text-gradient">free 30-min call</span></>}
      subtitle="Project, program বা mentorship — আমরা কথা বলবো এবং সঠিক path suggest করবো।"
    >
      <div className="mx-auto max-w-2xl">
        <GlassCard className="!p-8" hover={false}>
          {done ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-background shadow-glow">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">Booking received</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                আমরা ইমেইল ও WhatsApp-এ confirm করবো শীঘ্রই।
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Full name" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
                <input name="email" type="email" required placeholder="Email" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
              </div>
              <input name="phone" placeholder="WhatsApp / Phone" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
              <input name="topic" placeholder="Topic — e.g. AI Coaching, Vibe Coding" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="preferred_date"
                  type="date"
                  min={today}
                  required
                  className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
                />
                <select name="preferred_time" required className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60">
                  <option value="">Select time</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <textarea name="notes" rows={3} placeholder="Any extra notes..." className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Booking
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </Section>
  );
}
