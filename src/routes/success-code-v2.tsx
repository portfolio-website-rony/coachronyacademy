import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, ArrowRight, CheckCircle2, XCircle, Sparkles, Brain, Rocket,
  Target, Users, Trophy, Gift, Clock, Award, MessageCircle, ChevronDown,
  Star, Heart, Zap, ShieldCheck, BookOpen, PlayCircle,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeName, safeEmail, safePhone } from "@/lib/security/schemas";
import heroImage from "@/assets/success-code-hero.jpg.asset.json";

export const Route = createFileRoute("/success-code-v2")({
  head: () => ({
    meta: [
      { title: "The Success Code™ V2 — Faith • Confidence • Skills • Success" },
      { name: "description", content: "অনেক শিখেছেন কিন্তু Income শুরু করতে পারেননি? ১ দিনের LIVE Transformation Workshop — মাত্র ৳২৯৯।" },
      { property: "og:title", content: "The Success Code™ — Transformation Workshop" },
      { property: "og:description", content: "Faith → Confidence → Skill → Action → Income. মাত্র ৳২৯৯।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessCodeV2,
});

/* Theme */
const t = {
  bg: "#07231A", bgDeep: "#04140F",
  emerald: "#0B3D2E", emeraldSoft: "#0F5238",
  gold: "#D4AF37", goldSoft: "#E9C86A",
  cream: "#F6EFDD", white: "#FFFFFF",
};

/* Primitives */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: `1px solid ${t.gold}33`,
        backdropFilter: "blur(14px)",
        boxShadow: "0 10px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
      style={{ color: t.gold, background: `${t.gold}14`, border: `1px solid ${t.gold}55` }}
    >
      {children}
    </span>
  );
}

function GoldButton({ children, href = "#register" }: { children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-black transition hover:scale-[1.02] sm:text-lg"
      style={{
        color: t.emerald,
        background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})`,
        boxShadow: `0 12px 40px -12px ${t.gold}99, inset 0 1px 0 rgba(255,255,255,0.4)`,
      }}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function Heading({ eyebrow, title, subtitle }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      {eyebrow && <GoldPill>{eyebrow}</GoldPill>}
      <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl" style={{ color: t.white }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg" style={{ color: `${t.cream}cc` }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function Arrow() {
  return <div className="mx-auto my-2 text-2xl font-black" style={{ color: t.gold }}>↓</div>;
}

/* Page */
function SuccessCodeV2() {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: `radial-gradient(1200px 600px at 80% -10%, ${t.emeraldSoft}66, transparent 60%), radial-gradient(900px 500px at 10% 20%, ${t.gold}18, transparent 60%), linear-gradient(180deg, ${t.bg}, ${t.bgDeep})`,
        color: t.cream,
        fontFamily: "'Poppins','Hind Siliguri',system-ui,sans-serif",
      }}
    >
      <Hero />
      <RealityCheck />
      <Imagine />
      <WhyWorkshop />
      <WhatYoullLearn />
      <WhoFor />
      <WhatYoullGet />
      <Transformation />
      <WhyUs />
      <Bonus />
      <ValueStack />
      <Offer />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

/* 1. Hero */
function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <GoldPill><Sparkles className="h-3.5 w-3.5" /> 1-Day LIVE Workshop</GoldPill>
          <h1 className="mt-6 text-4xl font-black leading-[1.1] sm:text-5xl md:text-6xl" style={{ color: t.white }}>
            অনেক শিখেছেন...<br />
            কিন্তু এখনো{" "}
            <span style={{
              background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>
              Income শুরু
            </span>{" "}
            করতে পারেননি?
          </h1>
          <p className="mt-6 text-lg font-semibold tracking-wide" style={{ color: t.goldSoft }}>
            Faith • Confidence • Skills • Success
          </p>

          <ul className="mt-6 grid gap-3">
            {[
              "কেন Skill শিখেও অনেকেই Income করতে পারেন না",
              "কীভাবে Fear ও Self-Doubt দূর করবেন",
              "AI ব্যবহার করে দ্রুত Skill শিখবেন",
              "Portfolio তৈরি করার সহজ System",
              "Income শুরু করার বাস্তব Roadmap",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: t.gold }} />
                <span style={{ color: t.cream }}>{x}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="text-2xl font-black" style={{ color: t.white }}>
              🔥 মাত্র <span style={{ color: t.gold }}>৳২৯৯</span>
            </div>
          </div>
          <div className="mt-5">
            <GoldButton><Flame className="h-5 w-5" /> Register Now</GoldButton>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
          <div className="relative overflow-hidden rounded-3xl aspect-video"
            style={{ border: `1px solid ${t.gold}44`, boxShadow: `0 30px 80px -30px ${t.gold}55` }}>
            <img src={heroImage.url} alt="The Success Code — Coach Rony" className="h-full w-full object-cover" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* 2. Reality Check */
function RealityCheck() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Reality Check" title={<>সত্যিটা হলো...</>} subtitle="অনেক মানুষ..." />
      <div className="grid gap-4 sm:grid-cols-3">
        {["Course কেনে", "Video দেখে", "Note করে"].map((x) => (
          <GlassCard key={x}>
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6" style={{ color: "#ff6b6b" }} />
              <div className="text-lg font-bold" style={{ color: t.white }}>{x}</div>
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="mt-10 text-center">
        <p className="text-2xl font-black" style={{ color: t.white }}>কিন্তু কাজ শুরু করে না।</p>
        <p className="mt-3 text-lg" style={{ color: `${t.cream}cc` }}>
          ফলাফল? আরও একটি বছর চলে যায়... কিন্তু জীবন একই জায়গায় থাকে।
        </p>
      </div>

      <GlassCard className="mt-10">
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: t.goldSoft }}>
            সমস্যা Skill না — সমস্যা হলো:
          </p>
          <div className="mt-6 flex flex-col items-center">
            {["Fear", "Overthinking", "No Action", "No Consistency", "No Income"].map((x, i, a) => (
              <div key={x} className="flex flex-col items-center">
                <div className="rounded-full px-5 py-2 text-base font-black"
                  style={{ color: t.emerald, background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})` }}>
                  {x}
                </div>
                {i < a.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

/* 3. Imagine */
function Imagine() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Imagine" title={<>যদি... আগামী <span style={{ color: t.gold }}>৩০ দিন</span> পরে...</>} subtitle="আপনি —" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Heart, text: "আত্মবিশ্বাসী হন" },
          { icon: Brain, text: "একটি Skill শিখে ফেলেন" },
          { icon: BookOpen, text: "Portfolio তৈরি করেন" },
          { icon: Rocket, text: "Client Ready হন" },
        ].map(({ icon: Icon, text }) => (
          <GlassCard key={text}>
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${t.gold}22`, border: `1px solid ${t.gold}55` }}>
                <Icon className="h-6 w-6" style={{ color: t.gold }} />
              </div>
              <div className="text-lg font-bold" style={{ color: t.white }}>{text}</div>
            </div>
          </GlassCard>
        ))}
      </div>
      <p className="mt-10 text-center text-2xl font-black" style={{ color: t.goldSoft }}>
        তাহলে? আপনার জীবন কি আগের মতো থাকবে?
      </p>
    </section>
  );
}

/* 4. Why This Workshop */
function WhyWorkshop() {
  const steps = ["Faith", "Confidence", "Skill", "Action", "Income"];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading
        eyebrow="Why This Workshop"
        title={<>এটি একটি <span style={{ color: t.gold }}>Transformation</span> Workshop</>}
        subtitle="এটি কোনো Motivation Class নয়। এটি কোনো Theory Course নয়।"
      />
      <GlassCard>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className="rounded-full px-5 py-2 text-base font-black"
                style={{ color: t.emerald, background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})` }}>
                {s}
              </div>
              {i < steps.length - 1 && <ArrowRight className="h-5 w-5" style={{ color: t.gold }} />}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

/* 5. What You'll Learn */
function WhatYoullLearn() {
  const modules = [
    { n: "01", title: "Success Mindset", icon: Brain },
    { n: "02", title: "Islamic Success System", icon: ShieldCheck },
    { n: "03", title: "Confidence Building", icon: Heart },
    { n: "04", title: "Skill Mastery", icon: Target },
    { n: "05", title: "AI Learning Framework", icon: Sparkles },
    { n: "06", title: "Skill to Income Blueprint", icon: Rocket },
    { n: "07", title: "30-Day Success Challenge", icon: Trophy },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Curriculum" title="What You'll Learn" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ n, title, icon: Icon }) => (
          <GlassCard key={n}>
            <div className="flex items-start gap-4">
              <div className="text-3xl font-black" style={{ color: t.gold }}>{n}</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: `${t.cream}88` }}>Module</div>
                <div className="mt-1 text-lg font-bold" style={{ color: t.white }}>{title}</div>
              </div>
              <Icon className="ml-auto h-6 w-6" style={{ color: t.goldSoft }} />
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* 6. Who Is This For */
function WhoFor() {
  const items = [
    "Student", "Freelancer", "Job Holder", "Business Owner", "Beginner",
    "Skill শিখেও Income শুরু করতে পারেননি",
    "আত্মবিশ্বাস বাড়াতে চান",
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Who Is This For?" title="এই Workshop আপনার জন্য যদি —" />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((x) => (
          <div key={x} className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: `${t.emeraldSoft}55`, border: `1px solid ${t.gold}33` }}>
            <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: t.gold }} />
            <span style={{ color: t.cream }}>{x}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 7. What You'll Get */
function WhatYoullGet() {
  const items = [
    { icon: PlayCircle, text: "Live Workshop" },
    { icon: Trophy, text: "30-Day Challenge" },
    { icon: BookOpen, text: "Success Workbook" },
    { icon: Clock, text: "Daily Planner" },
    { icon: ShieldCheck, text: "Confidence Checklist" },
    { icon: Sparkles, text: "AI Prompt Library" },
    { icon: Award, text: "Portfolio Guide" },
    { icon: Users, text: "Community Access" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Heading eyebrow="What You'll Get" title="আপনি পাবেন" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, text }) => (
          <GlassCard key={text}>
            <Icon className="h-7 w-7" style={{ color: t.gold }} />
            <div className="mt-3 text-base font-bold" style={{ color: t.white }}>{text}</div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* 8. 30-Day Transformation */
function Transformation() {
  const rows = [
    { before: "Confused 😔", after: "Confident 😎" },
    { before: "No Skill", after: "Skill Ready" },
    { before: "No Portfolio", after: "Portfolio Ready" },
    { before: "No Income Plan", after: "Income Roadmap" },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="30-Day Transformation" title={<>আজ → <span style={{ color: t.gold }}>৩০ দিন পরে</span></>} />
      <div className="grid gap-4">
        {rows.map((r) => (
          <GlassCard key={r.before}>
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <div className="text-center sm:text-right">
                <div className="text-xs uppercase tracking-widest" style={{ color: `${t.cream}88` }}>আজ</div>
                <div className="mt-1 text-lg font-bold" style={{ color: t.cream }}>{r.before}</div>
              </div>
              <ArrowRight className="mx-auto h-6 w-6" style={{ color: t.gold }} />
              <div className="text-center sm:text-left">
                <div className="text-xs uppercase tracking-widest" style={{ color: `${t.cream}88` }}>৩০ দিন পরে</div>
                <div className="mt-1 text-lg font-black" style={{ color: t.gold }}>{r.after}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* 9. Why Us */
function WhyUs() {
  const others = ["শুধু Video", "কোনো Mentorship নেই", "Practice নেই", "Accountability নেই"];
  const us = ["Live", "Mentor", "Community", "Project", "Portfolio", "Accountability"];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Why Us?" title="তুলনা করুন" />
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ff9a9a" }}>বেশিরভাগ Course</div>
          <ul className="mt-4 space-y-3">
            {others.map((x) => (
              <li key={x} className="flex items-center gap-3">
                <XCircle className="h-5 w-5" style={{ color: "#ff6b6b" }} />
                <span style={{ color: t.cream }}>{x}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>THE SUCCESS CODE™</div>
          <ul className="mt-4 space-y-3">
            {us.map((x) => (
              <li key={x} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" style={{ color: t.gold }} />
                <span className="font-bold" style={{ color: t.white }}>{x}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </section>
  );
}

/* 10. Bonus */
function Bonus() {
  const items = [
    "30-Day Action Challenge",
    "AI Prompt Vault",
    "Daily Planner",
    "Portfolio Templates",
    "Success Checklist",
    "Private Community",
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Bonus" title="আজই Join করলে" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <GlassCard key={x}>
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6" style={{ color: t.gold }} />
              <div className="text-base font-bold" style={{ color: t.white }}>{x}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* 11. Value Stack */
function ValueStack() {
  const items = [
    "Mindset Training", "AI Skill System", "Portfolio Building", "Community",
    "Mentorship", "Challenge", "Templates", "Roadmap", "Bonus",
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Value Stack" title="আজ আপনি পাচ্ছেন" />
      <GlassCard>
        <ul className="divide-y" style={{ borderColor: `${t.gold}22` }}>
          {items.map((x) => (
            <li key={x} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4" style={{ color: t.gold }} />
                <span style={{ color: t.cream }}>{x}</span>
              </div>
              <CheckCircle2 className="h-5 w-5" style={{ color: t.gold }} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ background: `${t.gold}18`, border: `1px solid ${t.gold}66` }}>
          <div className="text-lg font-bold" style={{ color: t.white }}>Total Value</div>
          <div className="text-3xl font-black" style={{ color: t.gold }}>৳২৭,০০০+</div>
        </div>
      </GlassCard>
    </section>
  );
}

/* 12. Today's Offer */
function Offer() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <GlassCard className="text-center">
        <GoldPill><Flame className="h-3.5 w-3.5" /> আজকের Special Price</GoldPill>
        <div className="mt-6 text-2xl line-through" style={{ color: `${t.cream}66` }}>৳২৭,০০০+</div>
        <div className="mt-2 text-6xl font-black sm:text-7xl" style={{ color: t.gold }}>৳২৯৯</div>
        <p className="mt-4 text-lg" style={{ color: `${t.cream}cc` }}>
          আজ Join করলে <b style={{ color: t.goldSoft }}>সব Bonus Included</b>
        </p>
        <div className="mt-8">
          <GoldButton><Flame className="h-5 w-5" /> JOIN NOW</GoldButton>
        </div>
      </GlassCard>
    </section>
  );
}

/* 13. FAQ */
function FAQ() {
  const faqs = [
    { q: "Workshop কত ঘণ্টা?", a: "১ দিনের LIVE Workshop — প্রায় ৩–৪ ঘণ্টা, সঙ্গে Q&A session।" },
    { q: "Mobile দিয়ে Join করা যাবে?", a: "হ্যাঁ, Zoom / Google Meet — যেকোনো device থেকে join করা যাবে।" },
    { q: "Recording পাব?", a: "হ্যাঁ, Workshop-এর Recording ৭ দিনের জন্য access পাবেন।" },
    { q: "Beginner কি পারবে?", a: "হ্যাঁ। এটি Beginner-friendly — একদম শুরু থেকে ধাপে ধাপে শেখানো হবে।" },
    { q: "Certificate থাকবে?", a: "হ্যাঁ, Workshop complete করলে Digital Certificate পাবেন।" },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Heading eyebrow="FAQ" title="Frequently Asked Questions" />
      <div className="grid gap-3">
        {faqs.map((f, i) => (
          <GlassCard key={f.q} className="!p-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-base font-bold sm:text-lg" style={{ color: t.white }}>{f.q}</span>
              <ChevronDown className={`h-5 w-5 transition ${open === i ? "rotate-180" : ""}`} style={{ color: t.gold }} />
            </button>
            {open === i && (
              <div className="px-6 pb-6 text-sm sm:text-base" style={{ color: `${t.cream}cc` }}>{f.a}</div>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* 14. Final CTA + Registration */
const regSchema = z.object({ name: safeName, email: safeEmail, phone: safePhone });

function FinalCTA() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = regSchema.safeParse({
      name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone,
      source: "success-code-workshop-v2",
      interest: "The Success Code Workshop V2",
      message: "Workshop registration request",
    });
    setLoading(false);
    if (error) { toast.error("Registration ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"); return; }
    toast.success("ধন্যবাদ! আমরা payment instructions পাঠাবো শীঘ্রই।");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <section id="register" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="text-3xl font-black leading-tight sm:text-5xl" style={{ color: t.white }}>
          আপনার ভবিষ্যৎ...<br />
          আজকের সিদ্ধান্তের উপর নির্ভর করছে।
        </h2>
        <p className="mt-4 text-lg" style={{ color: `${t.cream}cc` }}>
          আজই Join করুন। আজই Action শুরু করুন। আজই নিজের উপর Invest করুন।
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* Payment */}
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>Registration</div>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: t.white }}>Send ৳২৯৯ to</h3>
          <div className="mt-5 space-y-3">
            {[
              { name: "bKash", number: "01960254383" },
              { name: "Nagad", number: "01960254383" },
              { name: "Rocket", number: "01960254383" },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: `${t.emeraldSoft}66`, border: `1px solid ${t.gold}33` }}>
                <div className="font-bold" style={{ color: t.goldSoft }}>{p.name}</div>
                <div className="font-mono font-bold" style={{ color: t.white }}>{p.number}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 rounded-2xl p-4"
            style={{ background: `${t.emeraldSoft}66`, border: `1px solid ${t.gold}33` }}>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-xs font-bold"
              style={{ background: t.white, color: t.emerald }}>QR Code</div>
            <div className="text-sm" style={{ color: `${t.cream}cc` }}>
              Payment এর পর transaction ID সহ WhatsApp করুন।
            </div>
          </div>
          <a
            href="https://wa.me/8801960254383?text=Assalamu%20Alaikum%2C%20I%20want%20to%20join%20The%20Success%20Code%20Workshop"
            target="_blank" rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            style={{ color: t.white, background: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" /> Join WhatsApp Group
          </a>
        </GlassCard>

        {/* Form */}
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>Reserve Your Seat</div>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: t.white }}>Register Now</h3>
          <form onSubmit={onSubmit} className="mt-5 grid gap-3">
            {[
              { name: "name", placeholder: "আপনার নাম", type: "text" },
              { name: "email", placeholder: "Email", type: "email" },
              { name: "phone", placeholder: "WhatsApp Number", type: "tel" },
            ].map((f) => (
              <input key={f.name} name={f.name} type={f.type} required placeholder={f.placeholder}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: `${t.emeraldSoft}66`, border: `1px solid ${t.gold}44`, color: t.white }} />
            ))}
            <button type="submit" disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-black transition hover:scale-[1.02] disabled:opacity-60"
              style={{ color: t.emerald,
                background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})`,
                boxShadow: `0 12px 40px -12px ${t.gold}99` }}>
              {loading ? "Sending..." : "🔥 Join Workshop — ৳২৯৯"}
            </button>
          </form>
        </GlassCard>
      </div>

      <p className="mx-auto mt-14 max-w-2xl text-center text-xl italic sm:text-2xl" style={{ color: t.goldSoft }}>
        "পূর্ণ চেষ্টা আমার, ফলাফল আল্লাহর হাতে।"
      </p>
    </section>
  );
}
