import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, ArrowRight, CheckCircle2, XCircle, Sparkles, BookOpen, Brain,
  Rocket, Target, Users, Trophy, Gift, ShieldCheck, Zap, Heart, Clock,
  Award, PlayCircle, MessageCircle, Wallet, ChevronDown, Star,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeName, safeEmail, safePhone } from "@/lib/security/schemas";
import heroImage from "@/assets/success-code-hero.jpg.asset.json";


export const Route = createFileRoute("/success-code")({
  head: () => ({
    meta: [
      { title: "The Success Code™ — 1-Day LIVE Workshop | CoachRony" },
      { name: "description", content: "Faith, Confidence, Skill, Action — মাত্র ১ দিনের LIVE Workshop-এ শিখুন কীভাবে আপনার Income Journey শুরু করবেন। মাত্র ৳২৯৯।" },
      { property: "og:title", content: "The Success Code™ — CoachRony LIVE Workshop" },
      { property: "og:description", content: "১ দিনের LIVE Workshop-এ আপনার Income Journey শুরু করুন — মাত্র ৳২৯৯।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessCodePage,
});

/* ---------- Theme (scoped) ---------- */
const theme = {
  bg: "#07231A",
  bgDeep: "#04140F",
  emerald: "#0B3D2E",
  emeraldSoft: "#0F5238",
  gold: "#D4AF37",
  goldSoft: "#E9C86A",
  cream: "#F6EFDD",
  white: "#FFFFFF",
};

/* ---------- Small primitives ---------- */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: `1px solid ${theme.gold}33`,
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
      style={{
        color: theme.gold,
        background: `${theme.gold}14`,
        border: `1px solid ${theme.gold}55`,
      }}
    >
      {children}
    </span>
  );
}

function GoldButton({ children, href = "#register", size = "lg" }: { children: React.ReactNode; href?: string; size?: "md" | "lg" }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-bold transition hover:scale-[1.02] ${
        size === "lg" ? "px-8 py-4 text-base sm:text-lg" : "px-6 py-3 text-sm"
      }`}
      style={{
        color: theme.emerald,
        background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
        boxShadow: `0 12px 40px -12px ${theme.gold}99, inset 0 1px 0 rgba(255,255,255,0.4)`,
      }}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      {eyebrow && <GoldPill>{eyebrow}</GoldPill>}
      <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl" style={{ color: theme.white }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg" style={{ color: `${theme.cream}cc` }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ---------- Page ---------- */
function SuccessCodePage() {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: `radial-gradient(1200px 600px at 80% -10%, ${theme.emeraldSoft}66, transparent 60%), radial-gradient(900px 500px at 10% 20%, ${theme.gold}18, transparent 60%), linear-gradient(180deg, ${theme.bg}, ${theme.bgDeep})`,
        color: theme.cream,
        fontFamily: "'Poppins','Hind Siliguri',system-ui,sans-serif",
      }}
    >
      {/* faint grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Hero />
      <RealityCheck />
      <WhyWorkshop />
      <WhatYoullLearn />
      <WhoIsThisFor />
      <Transformation />
      <SuccessFormula />
      <EverythingYouGet />
      <Bonuses />
      <Offer />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

/* ---------- 1. Hero ---------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <GoldPill>
            <Sparkles className="h-3.5 w-3.5" /> 1-Day LIVE Workshop
          </GoldPill>
          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl" style={{ color: theme.white }}>
            অনেক শিখেছেন...<br />
            কিন্তু এখনো{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Income শুরু
            </span>{" "}
            করতে পারেননি?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: `${theme.cream}cc` }}>
            মাত্র ১ দিনের LIVE Workshop-এ শিখুন কীভাবে <b style={{ color: theme.goldSoft }}>Faith, Confidence, Skill ও Action</b> —
            এই ৪টি step-এ আপনার Income Journey শুরু করবেন।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <GoldButton>
              <Flame className="h-5 w-5" />
              Register Now — মাত্র ৳২৯৯
            </GoldButton>
            <div className="flex items-center gap-2 text-sm" style={{ color: `${theme.cream}aa` }}>
              <Clock className="h-4 w-4" style={{ color: theme.gold }} />
              Limited Seats
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm" style={{ color: `${theme.cream}cc` }}>
            {[
              { icon: Users, label: "10,000+ Learners" },
              { icon: Star, label: "4.9 / 5 Rating" },
              { icon: ShieldCheck, label: "Trusted by CoachRony" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <s.icon className="h-4 w-4" style={{ color: theme.gold }} />
                {s.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero image / portrait card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div
            className="absolute -inset-6 rounded-[2rem] blur-2xl"
            style={{ background: `radial-gradient(circle, ${theme.gold}55, transparent 70%)` }}
          />
          <div
            className="relative overflow-hidden rounded-[2rem] p-1"
            style={{
              background: `linear-gradient(135deg, ${theme.gold}, ${theme.emeraldSoft})`,
              boxShadow: `0 30px 90px -30px ${theme.gold}77`,
            }}
          >
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[calc(2rem-4px)]"
              style={{
                background: `linear-gradient(180deg, ${theme.emeraldSoft}, ${theme.emerald})`,
              }}
            >
              <img
                src={heroImage.url}
                alt="The Success Code — Coach Rony"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />


              {/* corner badges */}
              <div className="absolute left-4 top-4">
                <GoldPill>
                  <Trophy className="h-3.5 w-3.5" /> Premium
                </GoldPill>
              </div>
              <div className="absolute bottom-4 right-4">
                <div
                  className="rounded-2xl px-4 py-2 text-xs font-bold"
                  style={{
                    color: theme.emerald,
                    background: `${theme.gold}`,
                  }}
                >
                  LIVE ৳২৯৯
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 2. Reality Check ---------- */
function RealityCheck() {
  const items = [
    { icon: "😟", title: "Fear", desc: "শুরু করতে গিয়ে ভয় পেয়ে থেমে যান" },
    { icon: "🤯", title: "Overthinking", desc: "কোনটা করব — অতিরিক্ত ভাবতে ভাবতে সময় শেষ" },
    { icon: "😴", title: "No Action", desc: "Course কিনে রেখে দেন, শুরুই করেন না" },
    { icon: "❌", title: "No Consistency", desc: "২-৩ দিন করে ছেড়ে দেন" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Reality Check"
        title={<>কেন <span style={{ color: theme.gold }}>৯০% মানুষ</span> Skill শিখেও Income করতে পারে না?</>}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassCard className="h-full text-center">
              <div className="text-5xl">{it.icon}</div>
              <h3 className="mt-4 text-xl font-bold" style={{ color: theme.white }}>{it.title}</h3>
              <p className="mt-2 text-sm" style={{ color: `${theme.cream}b0` }}>{it.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <div
          className="inline-block rounded-2xl px-6 py-4 text-lg font-bold sm:text-xl"
          style={{
            color: theme.emerald,
            background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
            boxShadow: `0 20px 50px -20px ${theme.gold}aa`,
          }}
        >
          Knowledge without Action = Zero Result
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Why This Workshop ---------- */
function WhyWorkshop() {
  const steps = [
    { label: "Faith", icon: Heart },
    { label: "Confidence", icon: ShieldCheck },
    { label: "Skill", icon: Brain },
    { label: "Action", icon: Zap },
    { label: "Income", icon: Wallet },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Why This Workshop" title={<>The Success <span style={{ color: theme.gold }}>Journey</span></>} />
      <div className="mx-auto max-w-2xl">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative flex items-center gap-5"
          >
            <div className="flex flex-col items-center">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
                  color: theme.emerald,
                  boxShadow: `0 10px 30px -10px ${theme.gold}aa`,
                }}
              >
                <s.icon className="h-6 w-6" />
              </div>
              {i < steps.length - 1 && (
                <div className="my-1 h-10 w-[2px]" style={{ background: `linear-gradient(to bottom, ${theme.gold}, transparent)` }} />
              )}
            </div>
            <div className="pb-8 pt-2 text-2xl font-black sm:text-3xl" style={{ color: theme.white }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. What You'll Learn ---------- */
function WhatYoullLearn() {
  const modules = [
    { icon: Heart, title: "Faith Mindset", desc: "ভয় জয় করে বিশ্বাস দিয়ে শুরু করার mindset" },
    { icon: ShieldCheck, title: "Confidence Code", desc: "নিজের উপর confidence তৈরির practical framework" },
    { icon: BookOpen, title: "Skill Blueprint", desc: "কোন skill শিখবেন — clear roadmap" },
    { icon: Brain, title: "AI Learning", desc: "AI দিয়ে ১০x দ্রুত শেখার technique" },
    { icon: Rocket, title: "Productivity", desc: "সময় management ও deep-work system" },
    { icon: Wallet, title: "Income Blueprint", desc: "প্রথম income এর step-by-step path" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="What You'll Learn" title={<>৬টি Premium <span style={{ color: theme.gold }}>Module</span></>} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <GlassCard className="h-full">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: `${theme.gold}22`, color: theme.gold, border: `1px solid ${theme.gold}55` }}
              >
                <m.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: theme.gold }}>
                Module {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-xl font-bold" style={{ color: theme.white }}>{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: `${theme.cream}b0` }}>{m.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 5. Who Is This For ---------- */
function WhoIsThisFor() {
  const items = ["Student", "Freelancer", "Job Holder", "Business Owner", "Beginner"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Who Is This For" title={<>এই Workshop <span style={{ color: theme.gold }}>আপনার জন্য</span></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <motion.div
            key={it}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <GlassCard className="text-center">
              <CheckCircle2 className="mx-auto h-8 w-8" style={{ color: theme.gold }} />
              <div className="mt-3 font-bold" style={{ color: theme.white }}>{it}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 6. Transformation ---------- */
function Transformation() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Transformation" title={<>আপনার <span style={{ color: theme.gold }}>Before → After</span></>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ff9c9c" }}>Before</div>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: theme.white }}>এখন যেখানে আছেন</h3>
          <ul className="mt-4 space-y-3">
            {["Fear", "Confusion", "No Income"].map((x) => (
              <li key={x} className="flex items-center gap-3">
                <XCircle className="h-5 w-5" style={{ color: "#ff9c9c" }} />
                <span style={{ color: `${theme.cream}cc` }}>{x}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard
          className="relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(circle at 80% 0%, ${theme.gold}44, transparent 60%)` }}
          />
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.gold }}>After</div>
            <h3 className="mt-2 text-2xl font-bold" style={{ color: theme.white }}>Workshop-এর পর</h3>
            <ul className="mt-4 space-y-3">
              {["Confidence", "Skill", "Portfolio", "Income Roadmap"].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" style={{ color: theme.gold }} />
                  <span style={{ color: theme.white }}>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

/* ---------- 7. Success Formula ---------- */
function SuccessFormula() {
  const parts = ["Faith", "Confidence", "Skill", "Action", "Consistency"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="The Formula" title={<>Success <span style={{ color: theme.gold }}>Formula</span></>} />
      <GlassCard className="mx-auto max-w-4xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-lg sm:text-xl">
          {parts.map((p, i) => (
            <span key={p} className="flex items-center gap-3">
              <span
                className="rounded-full px-4 py-2 font-bold"
                style={{
                  color: theme.white,
                  background: `${theme.emeraldSoft}`,
                  border: `1px solid ${theme.gold}55`,
                }}
              >
                {p}
              </span>
              {i < parts.length - 1 && <span style={{ color: theme.gold }}>+</span>}
            </span>
          ))}
          <span style={{ color: theme.gold }} className="text-2xl font-black">=</span>
          <span
            className="rounded-full px-6 py-2 text-xl font-black"
            style={{
              color: theme.emerald,
              background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
            }}
          >
            SUCCESS
          </span>
        </div>
      </GlassCard>
    </section>
  );
}

/* ---------- 8. Everything You Get ---------- */
function EverythingYouGet() {
  const items = [
    { icon: PlayCircle, title: "Live Workshop", desc: "১ দিনের full LIVE session" },
    { icon: BookOpen, title: "Workbook", desc: "Printable action workbook" },
    { icon: Target, title: "30-Day Challenge", desc: "Result-focused challenge" },
    { icon: Clock, title: "Daily Planner", desc: "Time-blocking planner" },
    { icon: Users, title: "Community", desc: "Private student community" },
    { icon: Award, title: "Mentorship", desc: "Live Q&A + guidance" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Everything Included" title={<>Workshop-এ যা <span style={{ color: theme.gold }}>পাবেন</span></>} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <GlassCard className="h-full">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: `${theme.gold}22`, color: theme.gold, border: `1px solid ${theme.gold}55` }}
              >
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold" style={{ color: theme.white }}>{it.title}</h3>
              <p className="mt-1 text-sm" style={{ color: `${theme.cream}b0` }}>{it.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 9. Bonuses ---------- */
function Bonuses() {
  const items = [
    { emoji: "🎁", title: "Workbook", value: "৳1,500" },
    { emoji: "🎁", title: "Prompt Pack", value: "৳2,000" },
    { emoji: "🎁", title: "Daily Planner", value: "৳1,000" },
    { emoji: "🎁", title: "Portfolio Template", value: "৳2,500" },
    { emoji: "🎁", title: "AI Prompt Library", value: "৳3,000" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Premium Bonuses" title={<>Exclusive <span style={{ color: theme.gold }}>Bonuses</span></>} subtitle="Total Bonus Value ৳10,000+ — সব FREE" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <GlassCard className="h-full text-center">
              <div className="text-4xl">{b.emoji}</div>
              <div className="mt-3 font-bold" style={{ color: theme.white }}>{b.title}</div>
              <div className="mt-2 text-sm line-through" style={{ color: `${theme.cream}80` }}>{b.value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: theme.gold }}>FREE</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 10. Offer ---------- */
function Offer() {
  return (
    <section id="register" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <GlassCard className="relative overflow-hidden !p-10 text-center">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: `radial-gradient(circle at 50% 0%, ${theme.gold}44, transparent 60%)` }}
          />
          <div className="relative">
            <GoldPill>Special Launch Offer</GoldPill>
            <h2 className="mt-5 text-3xl font-black sm:text-4xl" style={{ color: theme.white }}>
              Total Value
            </h2>
            <div className="mt-4 text-5xl font-black line-through sm:text-6xl" style={{ color: `${theme.cream}80` }}>
              ৳27,000+
            </div>
            <div className="mt-6 text-sm uppercase tracking-widest" style={{ color: theme.gold }}>Today Only</div>
            <div
              className="mt-2 text-6xl font-black sm:text-7xl"
              style={{
                background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ৳২৯৯
            </div>
            <div className="mt-8">
              <GoldButton>
                <Flame className="h-5 w-5" /> Register Now
              </GoldButton>
            </div>
            <div className="mt-4 text-xs" style={{ color: `${theme.cream}aa` }}>
              🔒 100% Safe Payment • Instant Confirmation
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

/* ---------- 11. FAQ ---------- */
function FAQ() {
  const items = [
    { q: "Workshop কত ঘণ্টা?", a: "প্রায় ৪-৫ ঘণ্টার একটি intensive LIVE session, সাথে Q&A." },
    { q: "Recording পাব?", a: "হ্যাঁ, ৩০ দিনের জন্য full session recording access পাবেন." },
    { q: "Beginner কি Join করতে পারবে?", a: "অবশ্যই। এটি সম্পূর্ণ beginner-friendly, কোনো prerequisite নেই." },
    { q: "Mobile দিয়ে হবে?", a: "হ্যাঁ, mobile / laptop / tablet — যেকোনো device দিয়ে join করা যাবে." },
    { q: "Certificate থাকবে?", a: "হ্যাঁ, digital certificate পাবেন workshop complete করার পর." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="FAQ" title={<>Common <span style={{ color: theme.gold }}>Questions</span></>} />
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((it, i) => (
          <GlassCard key={i} className="!p-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-bold" style={{ color: theme.white }}>{it.q}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 transition"
                style={{ color: theme.gold, transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-sm" style={{ color: `${theme.cream}cc` }}>
                {it.a}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

/* ---------- 12. Final CTA + Registration ---------- */
const regSchema = z.object({
  name: safeName,
  email: safeEmail,
  phone: safePhone,
});

function FinalCTA() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = regSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      source: "success-code-workshop",
      interest: "The Success Code Workshop",
      message: "Workshop registration request",
    });
    setLoading(false);
    if (error) {
      toast.error("Registration ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      return;
    }
    toast.success("ধন্যবাদ! আমরা payment instructions পাঠাবো শীঘ্রই।");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black leading-tight sm:text-5xl" style={{ color: theme.white }}>
            আজ সিদ্ধান্ত নিন।
          </h2>
          <p className="mt-4 text-lg italic" style={{ color: theme.goldSoft }}>
            পূর্ণ চেষ্টা আপনার, ফলাফল আল্লাহর হাতে।
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment info */}
          <GlassCard>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.gold }}>Payment Options</div>
            <h3 className="mt-2 text-2xl font-bold" style={{ color: theme.white }}>Send ৳২৯৯ to</h3>
            <div className="mt-5 space-y-3">
              {[
                { name: "bKash", number: "01960-254383", type: "Personal" },
                { name: "Nagad", number: "01960-254383", type: "Personal" },
                { name: "Rocket", number: "01960-254383-1", type: "Personal" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-2xl px-4 py-3"
                  style={{ background: `${theme.emeraldSoft}66`, border: `1px solid ${theme.gold}33` }}
                >
                  <div>
                    <div className="font-bold" style={{ color: theme.goldSoft }}>{p.name}</div>
                    <div className="text-xs" style={{ color: `${theme.cream}88` }}>{p.type}</div>
                  </div>
                  <div className="font-mono font-bold" style={{ color: theme.white }}>{p.number}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl p-4" style={{ background: `${theme.emeraldSoft}66`, border: `1px solid ${theme.gold}33` }}>
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-xs font-bold"
                style={{ background: theme.white, color: theme.emerald }}
              >
                QR Code
              </div>
              <div className="text-sm" style={{ color: `${theme.cream}cc` }}>
                Scan করে দ্রুত pay করুন। Payment এর পর নিচের form-এ transaction ID সহ WhatsApp করুন।
              </div>
            </div>
          </GlassCard>

          {/* Registration form */}
          <GlassCard>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.gold }}>Register Now</div>
            <h3 className="mt-2 text-2xl font-bold" style={{ color: theme.white }}>Reserve Your Seat</h3>
            <form onSubmit={onSubmit} className="mt-5 grid gap-3">
              <input
                name="name"
                required
                placeholder="আপনার নাম"
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: `${theme.emeraldSoft}66`,
                  border: `1px solid ${theme.gold}44`,
                  color: theme.white,
                }}
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: `${theme.emeraldSoft}66`,
                  border: `1px solid ${theme.gold}44`,
                  color: theme.white,
                }}
              />
              <input
                name="phone"
                required
                placeholder="WhatsApp Number"
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: `${theme.emeraldSoft}66`,
                  border: `1px solid ${theme.gold}44`,
                  color: theme.white,
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-black transition hover:scale-[1.02] disabled:opacity-60"
                style={{
                  color: theme.emerald,
                  background: `linear-gradient(135deg, ${theme.goldSoft}, ${theme.gold})`,
                  boxShadow: `0 12px 40px -12px ${theme.gold}99`,
                }}
              >
                {loading ? "Sending..." : "🔥 Join Workshop — ৳২৯৯"}
              </button>

              <a
                href="https://wa.me/8801960254383?text=Assalamu%20Alaikum%2C%20I%20want%20to%20join%20The%20Success%20Code%20Workshop"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
                style={{
                  color: theme.white,
                  background: "#25D366",
                }}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </form>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
