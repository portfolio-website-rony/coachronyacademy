import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, ArrowRight, CheckCircle2, XCircle, Sparkles, Brain, Rocket,
  Target, Users, Trophy, Gift, Clock, Award, MessageCircle, ChevronDown,
  Heart, ShieldCheck, BookOpen, Calendar, TrendingUp, Zap,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeName, safeEmail, safePhone } from "@/lib/security/schemas";
import heroImage from "@/assets/success-code-hero.jpg.asset.json";

export const Route = createFileRoute("/success-code-challenge")({
  head: () => ({
    meta: [
      { title: "30-Day Success Challenge — The Success Code™" },
      { name: "description", content: "৩০ দিনে নিজের Skill, Confidence ও Income Journey শুরু করুন। Daily Action Plan, Faith-Based Mindset, AI Learning Framework।" },
      { property: "og:title", content: "THE SUCCESS CODE™ 30-Day Challenge" },
      { property: "og:description", content: "প্রতিদিন একটি পরিষ্কার System Follow করে বাস্তব Progress করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChallengePage,
});

// Brand palette — Coachrony Academy (black + white + red)
// Legacy keys retained (emerald/gold/cream) so all downstream references remap without churn.
const t = {
  bg: "#0B0B0B", bgDeep: "#000000",
  emerald: "#4A0710", emeraldSoft: "#8B0A15", // deep crimson tones for gradient beds
  gold: "#EF2B2D", goldSoft: "#FF6A6C",       // brand red + soft red highlight
  cream: "#FFFFFF", white: "#FFFFFF",
};

const serif = "'Playfair Display', 'Hind Siliguri', serif";

function GlassCard({
  children,
  className = "",
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div
        className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-transform duration-500 lg:scale-[1.03] ${className}`}
        style={{
          background: `linear-gradient(180deg, ${t.emeraldSoft}cc, ${t.bgDeep})`,
          border: `1.5px solid ${t.gold}55`,
          boxShadow: `0 30px 70px -20px rgba(0,0,0,0.55), 0 0 0 1px ${t.gold}22 inset, 0 0 60px -20px ${t.gold}55`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-3xl"
          style={{ background: `${t.gold}33` }}
        />
        <div className="relative">{children}</div>
      </div>
    );
  }
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-0.5 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
        border: `1px solid ${t.gold}2e`,
        backdropFilter: "blur(14px)",
        boxShadow: "0 10px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `${t.gold}33` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function GoldPill({ children, pulse = false }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] backdrop-blur-md"
      style={{
        color: t.goldSoft,
        background: `${t.emerald}80`,
        border: `1px solid ${t.gold}55`,
        fontFamily: serif,
        fontStyle: "italic",
      }}
    >
      {pulse && (
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ background: t.gold, boxShadow: `0 0 8px ${t.gold}` }}
        />
      )}
      {children}
    </span>
  );
}

function GoldButton({ children, href = "#register" }: { children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-9 py-4 text-base font-black transition-all duration-300 hover:-translate-y-0.5 sm:text-lg"
      style={{
        color: t.emerald,
        background: `linear-gradient(135deg, ${t.cream} 0%, ${t.goldSoft} 40%, ${t.gold} 60%, ${t.goldSoft} 100%)`,
        boxShadow: `0 0 30px ${t.gold}55, 0 20px 50px -20px ${t.gold}88, inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.15)`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </a>
  );
}

function GhostButton({ children, href = "#register" }: { children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl px-9 py-4 text-base font-bold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:text-lg"
      style={{
        color: t.cream,
        background: "rgba(255,255,255,0.04)",
        border: `1.5px solid ${t.gold}44`,
      }}
    >
      {children}
    </a>
  );
}

function Heading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      {eyebrow && <GoldPill>{eyebrow}</GoldPill>}
      <h2
        className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl"
        style={{ color: t.white }}
      >
        {title}
      </h2>
      <div
        className="mx-auto mt-5 h-px w-24"
        style={{ background: `linear-gradient(90deg, transparent, ${t.gold}, transparent)` }}
      />
      {subtitle && (
        <p className="mt-5 text-base sm:text-lg" style={{ color: `${t.cream}cc` }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function ChallengePage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `radial-gradient(1200px 600px at 80% -10%, ${t.emeraldSoft}66, transparent 60%), radial-gradient(900px 500px at 10% 20%, ${t.gold}18, transparent 60%), linear-gradient(180deg, ${t.bg}, ${t.bgDeep})`,
        color: t.cream,
        fontFamily: "'Poppins','Hind Siliguri',system-ui,sans-serif",
      }}
    >
      {/* Ambient decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ background: `${t.emeraldSoft}` }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full blur-[130px]"
          style={{ background: `${t.gold}33` }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full blur-[130px]"
          style={{ background: `${t.emerald}66` }}
        />
      </div>

      <div className="relative">
        <Hero />
        <WhyFail />
        <WhyDifferent />
        <Roadmap />
        <WhatYouGet />
        <DailySystem />
        <WhoFor />
        <Transformation />
        <Bonus />
        <Community />
        <Membership />
        <Enrollment />
        <FAQ />
        <FinalCTA />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <GoldPill pulse>
            <Calendar className="h-3.5 w-3.5" /> Limited Enrollment · 30-Day Challenge
          </GoldPill>
          <h1
            className="mt-6 text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl"
            style={{ color: t.white }}
          >
            ৩০ দিনে নিজের{" "}
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(135deg, ${t.cream} 0%, ${t.goldSoft} 45%, ${t.gold} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: `drop-shadow(0 4px 24px ${t.gold}55)`,
              }}
            >
              Skill, Confidence ও Income
            </span>{" "}
            Journey শুরু করুন
          </h1>
          <p
            className="mt-5 text-lg font-bold tracking-wide sm:text-xl"
            style={{ color: t.goldSoft, fontFamily: serif, fontStyle: "italic" }}
          >
            THE SUCCESS CODE™ 30-Day Challenge
          </p>
          <p className="mt-4 text-base italic" style={{ color: `${t.cream}cc` }}>
            "পূর্ণ চেষ্টা আমার, ফলাফল আল্লাহর হাতে।"
          </p>
          <p className="mt-5 text-base sm:text-lg" style={{ color: t.cream }}>
            আপনি যদি শুধু Course কিনে রেখে না দিয়ে, প্রতিদিন একটি পরিষ্কার System Follow করে বাস্তব Progress করতে চান, তাহলে এই Challenge আপনার জন্য।
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              "Daily Action Plan",
              "Faith-Based Success Mindset",
              "Confidence Building System",
              "AI Learning Framework",
              "Portfolio Building Roadmap",
              "Income Preparation Strategy",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})`,
                    boxShadow: `0 0 12px ${t.gold}55`,
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: t.emerald }} />
                </span>
                <span style={{ color: t.cream }}>{x}</span>
              </li>
            ))}
          </ul>

          <p className="mt-7 text-lg font-bold" style={{ color: t.white }}>
            🎯 আজই শুরু করুন আপনার নতুন Journey।
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <GoldButton>
              <Flame className="h-5 w-5" /> Join the 30-Day Challenge
            </GoldButton>
            <GhostButton href="#membership-details">বিস্তারিত দেখুন</GhostButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          {/* gilded frame */}
          <div
            className="absolute -inset-2 rounded-[2rem] opacity-70 blur-2xl"
            style={{
              background: `linear-gradient(135deg, ${t.gold}55, transparent 40%, ${t.emeraldSoft}55)`,
            }}
          />
          <div
            className="relative overflow-hidden rounded-3xl aspect-video"
            style={{
              border: `1.5px solid ${t.gold}66`,
              boxShadow: `0 30px 80px -30px ${t.gold}77, inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            <img
              src={heroImage.url}
              alt="The Success Code 30-Day Challenge"
              className="h-full w-full object-cover"
            />
            {/* corner gold accents */}
            <div
              className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2"
              style={{ borderColor: t.gold }}
            />
            <div
              className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2"
              style={{ borderColor: t.gold }}
            />
            <div
              className="pointer-events-none absolute left-3 bottom-3 h-6 w-6 border-l-2 border-b-2"
              style={{ borderColor: t.gold }}
            />
            <div
              className="pointer-events-none absolute right-3 bottom-3 h-6 w-6 border-r-2 border-b-2"
              style={{ borderColor: t.gold }}
            />
          </div>
          {/* floating stats badge */}
          <div
            className="absolute -bottom-6 -left-4 rounded-2xl px-5 py-3 backdrop-blur-md"
            style={{
              background: `${t.bgDeep}dd`,
              border: `1px solid ${t.gold}55`,
              boxShadow: `0 20px 40px -20px ${t.gold}55`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})` }}
              >
                <Trophy className="h-5 w-5" style={{ color: t.emerald }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest" style={{ color: t.goldSoft }}>
                  Guided System
                </div>
                <div className="text-sm font-black" style={{ color: t.white }}>
                  ৪ Weeks · ২–৩ ঘণ্টা/দিন
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WhyFail() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading
        eyebrow="Why Most People Fail"
        title={<>সমস্যা Skill নয়, <span style={{ color: t.gold }}>System</span>-এর অভাব</>}
        subtitle="অনেকে ১০–২০টি Course কেনেন, YouTube-এ শত শত ভিডিও দেখেন, Motivation পান — তারপরও Income শুরু করতে পারেন না।"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "Daily Action নেই",
          "Accountability নেই",
          "Clear Roadmap নেই",
          "Mentorship নেই",
        ].map((x) => (
          <GlassCard key={x}>
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6" style={{ color: "#ff6b6b" }} />
              <div className="text-lg font-bold" style={{ color: t.white }}>{x}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function WhyDifferent() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading
        eyebrow="Why This Challenge Is Different"
        title={<>এটি শুধু একটি Course নয় — এটি একটি <span style={{ color: t.gold }}>Daily Execution System</span></>}
        subtitle="প্রতিদিন আপনি জানবেন—"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: BookOpen, text: "আজ কী শিখবেন" },
          { icon: Zap, text: "কী Practice করবেন" },
          { icon: Rocket, text: "কী Build করবেন" },
          { icon: MessageCircle, text: "কী Share করবেন" },
          { icon: TrendingUp, text: "কীভাবে Improve করবেন" },
        ].map(({ icon: Icon, text }) => (
          <GlassCard key={text}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${t.gold}22`, border: `1px solid ${t.gold}55` }}>
                <Icon className="h-6 w-6" style={{ color: t.gold }} />
              </div>
              <div className="text-sm font-bold" style={{ color: t.white }}>{text}</div>
            </div>
          </GlassCard>
        ))}
      </div>
      <p className="mt-10 text-center text-2xl font-black" style={{ color: t.goldSoft }}>
        🎯 Goal: ৩০ দিনে বাস্তব Progress।
      </p>
    </section>
  );
}

function Roadmap() {
  const weeks = [
    { n: "Week 1", title: "Foundation", items: ["Faith & Mindset", "Goal Setting", "Daily Routine", "Discipline"], icon: ShieldCheck },
    { n: "Week 2", title: "Skill Building", items: ["AI Learning", "Practice", "Mini Projects", "Confidence"], icon: Brain },
    { n: "Week 3", title: "Build & Brand", items: ["Portfolio", "Personal Branding", "Content Creation", "Feedback"], icon: Rocket },
    { n: "Week 4", title: "Income Readiness", items: ["Client Communication", "Offer Creation", "Proposal Basics", "Next 90-Day Plan"], icon: Trophy },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Your 30-Day Roadmap" title={<>৪ Week — একটি <span style={{ color: t.gold }}>পূর্ণাঙ্গ Journey</span></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {weeks.map(({ n, title, items, icon: Icon }) => (
          <GlassCard key={n}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${t.gold}22`, border: `1px solid ${t.gold}55` }}>
                <Icon className="h-6 w-6" style={{ color: t.gold }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>{n}</div>
                <div className="text-lg font-black" style={{ color: t.white }}>{title}</div>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm" style={{ color: t.cream }}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: t.goldSoft }} />
                  {it}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    "30-Day Challenge Dashboard",
    "Daily Mission",
    "Daily Tracker",
    "Success Workbook",
    "AI Prompt Collection",
    "Portfolio Templates",
    "Community Access",
    "Weekly Live Session",
    "Progress Review",
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="What You Will Receive" title="আপনার Enrollment-এর সঙ্গে পাবেন" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <GlassCard key={x}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: t.gold }} />
              <div className="font-bold" style={{ color: t.white }}>{x}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function DailySystem() {
  const steps = [
    { icon: BookOpen, label: "Learn", emoji: "📖" },
    { icon: Zap, label: "Practice", emoji: "🛠" },
    { icon: Rocket, label: "Build", emoji: "💻" },
    { icon: MessageCircle, label: "Share", emoji: "📤" },
    { icon: TrendingUp, label: "Improve", emoji: "📈" },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading
        eyebrow="Daily System"
        title={<>প্রতিদিন মাত্র <span style={{ color: t.gold }}>২–৩ ঘণ্টা</span></>}
        subtitle="এই Routine-ই Challenge-এর মূল শক্তি।"
      />
      <GlassCard>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="rounded-full px-5 py-3 text-base font-black"
                style={{ color: t.emerald, background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})` }}>
                {s.emoji} {s.label}
              </div>
              {i < steps.length - 1 && <ArrowRight className="h-5 w-5" style={{ color: t.gold }} />}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function WhoFor() {
  const general = ["Student", "Freelancer", "Job Holder", "Business Owner", "Beginner"];
  const specific = [
    "Skill শিখেও শুরু করতে পারছেন না",
    "ধারাবাহিক থাকতে পারেন না",
    "আত্মবিশ্বাস বাড়াতে চান",
    "AI ব্যবহার করে দ্রুত এগোতে চান",
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Who Is This For?" title="এই Challenge তাদের জন্য" />
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: t.gold }}>General</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {general.map((x) => (
              <span key={x} className="rounded-full px-4 py-2 text-sm font-bold"
                style={{ color: t.white, background: `${t.emeraldSoft}88`, border: `1px solid ${t.gold}44` }}>
                {x}
              </span>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: t.gold }}>বিশেষ করে</div>
          <ul className="mt-4 space-y-2">
            {specific.map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm" style={{ color: t.cream }}>
                <Target className="mt-0.5 h-4 w-4 shrink-0" style={{ color: t.goldSoft }} />
                {x}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </section>
  );
}

function Transformation() {
  const rows: { before: string; after: string; beforeEmoji: string; afterEmoji: string }[] = [
    { before: "Confused", after: "Confident", beforeEmoji: "😕", afterEmoji: "😎" },
    { before: "No Skill", after: "Skill Ready", beforeEmoji: "🫤", afterEmoji: "🚀" },
    { before: "No Portfolio", after: "Portfolio Ready", beforeEmoji: "📭", afterEmoji: "📁" },
    { before: "No Direction", after: "Clear Roadmap", beforeEmoji: "🧭", afterEmoji: "🗺️" },
    { before: "No Income Plan", after: "Income Roadmap", beforeEmoji: "💸", afterEmoji: "💰" },
  ];
  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-64 max-w-3xl rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle, ${t.gold}22, transparent 70%)` }}
      />
      <Heading
        eyebrow="30-Day Transformation"
        title={
          <>
            <span style={{ fontFamily: serif, fontStyle: "italic" }}>আজ</span>
            <span className="mx-3 inline-block align-middle" style={{ color: t.gold }}>→</span>
            <span style={{ color: t.gold }}>৩০ দিন পরে</span>
          </>
        }
      />
      <div className="space-y-4">
        {rows.map((r, i) => (
          <motion.div
            key={r.before}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-500 hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${t.emerald}cc, ${t.bgDeep})`,
              borderColor: `${t.gold}33`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px opacity-40"
              style={{ background: `linear-gradient(to bottom, transparent, ${t.gold}66, transparent)` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(600px circle at var(--x,50%) var(--y,50%), ${t.gold}22, transparent 40%)` }}
            />
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
              <div className="text-right">
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: `${t.cream}80`, fontFamily: serif, fontStyle: "italic", letterSpacing: "0.15em" }}
                >
                  আজ
                </div>
                <div className="mt-1 flex items-center justify-end gap-2 text-lg font-black sm:text-2xl" style={{ color: t.cream }}>
                  <span>{r.before}</span>
                  <span className="text-xl sm:text-2xl">{r.beforeEmoji}</span>
                </div>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:h-12 sm:w-12"
                style={{
                  borderColor: `${t.gold}55`,
                  background: `radial-gradient(circle, ${t.gold}22, transparent 70%)`,
                }}
              >
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1 sm:h-6 sm:w-6" style={{ color: t.gold }} />
              </div>
              <div className="text-left">
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: `${t.goldSoft}b0`, fontFamily: serif, fontStyle: "italic", letterSpacing: "0.15em" }}
                >
                  ৩০ দিন পরে
                </div>
                <div className="mt-1 flex items-center gap-2 text-lg font-black sm:text-2xl" style={{ color: t.gold }}>
                  <span>{r.after}</span>
                  <span className="text-xl sm:text-2xl">{r.afterEmoji}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Bonus() {
  const bonuses = [
    "Success Workbook",
    "Daily Planner",
    "Habit Tracker",
    "AI Prompt Vault",
    "Portfolio Templates",
    "Weekly Accountability",
    "Private WhatsApp Community",
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Bonus" title={<>আজ Join করলে <span style={{ color: t.gold }}>পাবেন</span></>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bonuses.map((b) => (
          <GlassCard key={b}>
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5" style={{ color: t.gold }} />
              <div className="font-bold" style={{ color: t.white }}>{b}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function Community() {
  const items = ["Daily Check-in", "Mentor Support", "Weekly Q&A", "Community Motivation", "Progress Sharing"];
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <Heading
        eyebrow="Community"
        title={<>আপনি <span style={{ color: t.gold }}>একা</span> থাকবেন না।</>}
        subtitle="আপনি যোগ দেবেন একটি Private WhatsApp Community-তে যেখানে—"
      />
      <GlassCard>
        <div className="flex items-center justify-center gap-3">
          <Users className="h-8 w-8" style={{ color: t.gold }} />
          <div className="text-lg font-bold" style={{ color: t.white }}>Private WhatsApp Community</div>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {items.map((x) => (
            <li key={x} className="flex items-center gap-2 text-sm" style={{ color: t.cream }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: t.goldSoft }} /> {x}
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}

function Membership() {
  const includes = [
    { icon: Calendar, label: "30-Day Challenge Roadmap", sub: "প্রতিদিনের clear task" },
    { icon: Target, label: "Daily Action Tasks", sub: "১৫–৩০ মিনিটের mission" },
    { icon: Users, label: "Weekly Live Coaching", sub: "সরাসরি guidance + Q&A" },
    { icon: MessageCircle, label: "Private WhatsApp Community", sub: "24/7 support network" },
    { icon: Brain, label: "AI Resources & Templates", sub: "Prompt vault + tools" },
    { icon: ShieldCheck, label: "Accountability System", sub: "Streak + check-ins" },
    { icon: Sparkles, label: "Monthly New Content", sub: "নতুন challenge প্রতি মাসে" },
    { icon: TrendingUp, label: "Progress Dashboard", sub: "Track your growth" },
  ];
  const steps = [
    {
      n: "প্রথম ধাপ",
      title: "মাত্র ৳২৯৯ দিয়ে Membership শুরু করুন",
      sub: "Instant access — এখনই সব unlock",
      items: ["Challenge Dashboard", "WhatsApp Group Access", "Day 1 Mission", "সকল Resources"],
    },
    {
      n: "দ্বিতীয় ধাপ",
      title: "৩০ দিনের Challenge complete করুন",
      sub: "Daily guidance-এ real transformation",
      items: ["Daily Guidance", "Community Support", "Weekly Live Session", "Habit Tracker"],
    },
    {
      n: "তৃতীয় ধাপ",
      title: "চাইলে পরবর্তী মাসেও চালিয়ে যান",
      sub: "Advanced level — deeper growth",
      items: ["নতুন Challenge", "Advanced Training", "নতুন AI Resources", "মাসিক Growth Plan"],
    },
  ];
  const valueStack = [
    { item: "30-Day Guided Roadmap", value: "৳৩,০০০" },
    { item: "Weekly Live Coaching (৪টি)", value: "৳৫,০০০" },
    { item: "Private WhatsApp Community", value: "৳২,০০০" },
    { item: "AI Prompt Vault + Templates", value: "৳২,৫০০" },
    { item: "Accountability System", value: "৳১,৫০০" },
    { item: "Progress Dashboard + Certificate", value: "৳১,০০০" },
  ];
  return (
    <section id="membership" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background: `radial-gradient(600px circle at 20% 20%, ${t.gold}18, transparent 60%), radial-gradient(600px circle at 80% 80%, ${t.emeraldSoft}55, transparent 60%)`,
        }}
      />

      <Heading
        eyebrow="💳 Membership & Pricing"
        title={
          <>
            শুধু একটি Course নয় — একটি{" "}
            <span style={{ color: t.gold, fontFamily: serif, fontStyle: "italic" }}>
              Guided Challenge Membership
            </span>
          </>
        }
        subtitle="আপনার Enrollment-এর মাধ্যমে আপনি শুধু ভিডিও পাবেন না, বরং একটি সম্পূর্ণ Guided Learning System-এ যুক্ত হবেন।"
      />

      {/* PRODUCT SHOWCASE — Featured hero card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="relative mb-16 overflow-hidden rounded-[2rem] border p-8 sm:p-12"
        style={{
          background: `linear-gradient(135deg, ${t.emerald}f0, ${t.bgDeep})`,
          borderColor: `${t.gold}55`,
          boxShadow: `0 30px 80px -20px ${t.gold}33, inset 0 1px 0 ${t.gold}22`,
        }}
      >
        {/* Corner gold accents */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <div
            key={corner}
            aria-hidden
            className="pointer-events-none absolute h-10 w-10"
            style={{
              top: corner.startsWith("t") ? 12 : undefined,
              bottom: corner.startsWith("b") ? 12 : undefined,
              left: corner.endsWith("l") ? 12 : undefined,
              right: corner.endsWith("r") ? 12 : undefined,
              borderTop: corner.startsWith("t") ? `2px solid ${t.gold}` : undefined,
              borderBottom: corner.startsWith("b") ? `2px solid ${t.gold}` : undefined,
              borderLeft: corner.endsWith("l") ? `2px solid ${t.gold}` : undefined,
              borderRight: corner.endsWith("r") ? `2px solid ${t.gold}` : undefined,
              opacity: 0.6,
            }}
          />
        ))}

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <GoldPill pulse>
              <Flame className="h-3.5 w-3.5" /> LIMITED LAUNCH OFFER
            </GoldPill>
            <h3
              className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl"
              style={{ color: t.white }}
            >
              THE SUCCESS CODE™
              <br />
              <span
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  background: `linear-gradient(135deg, ${t.cream}, ${t.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                30-Day Membership
              </span>
            </h3>
            <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: `${t.cream}dd` }}>
              Daily action + Weekly live + Community + AI toolkit — একটি সম্পূর্ণ ecosystem, যা আপনাকে ৩০ দিনে
              real result-এ নিয়ে যাবে।
            </p>

            {/* Trust row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold" style={{ color: `${t.cream}bb` }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: t.gold }} /> Secure Payment</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" style={{ color: t.gold }} /> Instant Access</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" style={{ color: t.gold }} /> 500+ Members</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4" style={{ color: t.gold }} /> Certificate</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href="#register"><Flame className="h-5 w-5" /> Start ৳২৯৯ Today</GoldButton>
              <GhostButton href="#value-stack">See Full Value</GhostButton>
            </div>
          </div>

          {/* Pricing card */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-3xl p-8"
              style={{
                background: `linear-gradient(160deg, ${t.gold}18, ${t.emeraldSoft}66)`,
                border: `1.5px solid ${t.gold}88`,
                boxShadow: `0 20px 60px -15px ${t.gold}55`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
                style={{ background: t.gold }}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: t.gold }}>
                  Launch Price
                </div>
                <div
                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                  style={{ background: t.gold, color: t.emerald }}
                >
                  Save 70%
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span
                  className="text-6xl font-black sm:text-7xl"
                  style={{
                    background: `linear-gradient(135deg, ${t.cream}, ${t.gold})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ৳২৯৯
                </span>
                <span className="text-lg font-bold line-through" style={{ color: `${t.cream}66` }}>
                  ৳৯৯৯
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold" style={{ color: `${t.cream}cc` }}>
                প্রথম মাস • এরপর ৳৯৯৯/মাস
              </div>

              <div className="my-6 h-px" style={{ background: `linear-gradient(to right, transparent, ${t.gold}55, transparent)` }} />

              <ul className="space-y-2.5">
                {["Instant Dashboard Access", "WhatsApp Community Invite", "Day 1 Mission Unlocked", "All Templates & Resources"].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: t.cream }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: t.gold }} /> {x}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl p-3 text-center text-[11px] font-bold uppercase tracking-widest" style={{ background: `${t.bgDeep}aa`, color: t.goldSoft, border: `1px solid ${t.gold}33` }}>
                🔒 No Long-Term Commitment — Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WHAT YOU GET — Feature grid with icons */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: t.gold, fontFamily: serif, fontStyle: "italic" }}>
            Everything Included
          </div>
          <h3 className="mt-2 text-2xl font-black sm:text-3xl" style={{ color: t.white }}>
            ৮টি Premium Product একসাথে
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {includes.map((x, i) => (
            <motion.div
              key={x.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1"
              style={{
                background: `linear-gradient(160deg, ${t.emerald}aa, ${t.bgDeep})`,
                borderColor: `${t.gold}33`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: t.gold }}
              />
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${t.gold}, ${t.goldSoft})`, boxShadow: `0 8px 24px -8px ${t.gold}88` }}
              >
                <x.icon className="h-6 w-6" style={{ color: t.emerald }} />
              </div>
              <div className="mt-4 text-base font-black" style={{ color: t.white }}>{x.label}</div>
              <div className="mt-1 text-xs" style={{ color: `${t.cream}aa` }}>{x.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — Vertical timeline */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: t.gold, fontFamily: serif, fontStyle: "italic" }}>
            How It Works
          </div>
          <h3 className="mt-2 text-2xl font-black sm:text-3xl" style={{ color: t.white }}>
            🎯 কীভাবে এটি কাজ করবে?
          </h3>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl border p-6"
              style={{
                background: `linear-gradient(160deg, ${t.emerald}cc, ${t.bgDeep})`,
                borderColor: `${t.gold}44`,
              }}
            >
              <div
                aria-hidden
                className="absolute right-4 top-4 text-6xl font-black opacity-10"
                style={{ color: t.gold, fontFamily: serif }}
              >
                0{i + 1}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-full text-base font-black"
                  style={{
                    color: t.emerald,
                    background: `linear-gradient(135deg, ${t.goldSoft}, ${t.gold})`,
                    boxShadow: `0 6px 20px -6px ${t.gold}aa`,
                  }}
                >
                  {i + 1}
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: t.gold }}>
                  {s.n}
                </div>
              </div>
              <div className="mt-4 text-lg font-black leading-snug" style={{ color: t.white }}>
                {s.title}
              </div>
              <div className="mt-1 text-xs italic" style={{ color: `${t.cream}99`, fontFamily: serif }}>
                {s.sub}
              </div>
              <div className="my-4 h-px" style={{ background: `linear-gradient(to right, ${t.gold}44, transparent)` }} />
              <ul className="space-y-2">
                {s.items.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm font-semibold" style={{ color: t.cream }}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: t.goldSoft }} /> {x}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* VALUE STACK */}
      <motion.div
        id="value-stack"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="mb-16 overflow-hidden rounded-3xl border"
        style={{
          background: `linear-gradient(160deg, ${t.bgDeep}, ${t.emerald}aa)`,
          borderColor: `${t.gold}55`,
        }}
      >
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="p-8 sm:p-10">
            <GoldPill><Trophy className="h-3.5 w-3.5" /> TOTAL VALUE</GoldPill>
            <h3 className="mt-4 text-2xl font-black sm:text-3xl" style={{ color: t.white }}>
              আপনি পাচ্ছেন ৳১৫,০০০+ Value
            </h3>
            <p className="mt-2 text-sm" style={{ color: `${t.cream}cc` }}>
              মাত্র ৳২৯৯-এ। এটাই Launch Offer-এর আসল সৌন্দর্য।
            </p>
            <ul className="mt-6 space-y-2.5">
              {valueStack.map((v) => (
                <li
                  key={v.item}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: `${t.emeraldSoft}55`, border: `1px solid ${t.gold}22` }}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: t.cream }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: t.gold }} /> {v.item}
                  </span>
                  <span className="text-sm font-black" style={{ color: t.goldSoft }}>{v.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="relative flex flex-col items-center justify-center gap-4 p-8 sm:p-10"
            style={{ background: `linear-gradient(160deg, ${t.gold}22, ${t.emeraldSoft}88)` }}
          >
            <div className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: `${t.cream}aa` }}>Total Value</div>
            <div className="text-3xl font-black line-through" style={{ color: `${t.cream}66` }}>৳১৫,০০০</div>
            <div className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: t.gold }}>Your Price Today</div>
            <div
              className="text-6xl font-black sm:text-7xl"
              style={{
                background: `linear-gradient(135deg, ${t.cream}, ${t.gold})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ৳২৯৯
            </div>
            <div className="text-xs font-semibold" style={{ color: `${t.cream}bb` }}>প্রথম মাস • Cancel Anytime</div>
            <div className="mt-2">
              <GoldButton><Rocket className="h-5 w-5" /> Claim Offer</GoldButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WHY MEMBERSHIP + NO COMMITMENT */}
      <div className="mb-12 grid gap-5 lg:grid-cols-2">
        <div
          className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
          style={{ background: `linear-gradient(135deg, ${t.emerald}cc, ${t.bgDeep})`, borderColor: `${t.gold}44` }}
        >
          <Heart className="h-8 w-8" style={{ color: t.gold }} />
          <div className="mt-4 text-xl font-black" style={{ color: t.white, fontFamily: serif }}>
            কেন Membership?
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: t.cream }}>
            কারণ বাস্তব পরিবর্তন একদিনে হয় না। ধারাবাহিক শেখা, নিয়মিত অনুশীলন এবং একটি সক্রিয় Community-এর মাধ্যমেই দীর্ঘমেয়াদী উন্নতি সম্ভব।
          </p>
        </div>
        <div
          className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
          style={{ background: `linear-gradient(135deg, ${t.emerald}cc, ${t.bgDeep})`, borderColor: `${t.gold}44` }}
        >
          <ShieldCheck className="h-8 w-8" style={{ color: t.gold }} />
          <div className="mt-4 text-xl font-black" style={{ color: t.white, fontFamily: serif }}>
            🔒 No Long-Term Commitment
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: t.cream }}>
            আপনি আপনার Membership যেকোনো সময় বন্ধ করতে পারবেন। কোনো দীর্ঘমেয়াদী বাধ্যবাধকতা নেই — শুধু value নেওয়া পর্যন্ত থাকুন।
          </p>
        </div>
      </div>

      {/* FINAL CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12"
        style={{
          background: `linear-gradient(135deg, ${t.emerald}, ${t.bgDeep})`,
          borderColor: `${t.gold}66`,
          boxShadow: `0 30px 80px -20px ${t.gold}44`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(circle at 50% 0%, ${t.gold}55, transparent 60%)` }}
        />
        <div className="relative">
          <GoldPill pulse><Flame className="h-3.5 w-3.5" /> Doors Open Now</GoldPill>
          <h3
            className="mx-auto mt-5 max-w-2xl text-2xl font-black leading-tight sm:text-4xl"
            style={{ color: t.white }}
          >
            🎯 আজই আপনার{" "}
            <span
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                background: `linear-gradient(135deg, ${t.cream}, ${t.gold})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              30-Day Success Journey
            </span>{" "}
            শুরু করুন
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: `${t.cream}dd` }}>
            মাত্র ৳২৯৯ দিয়ে এখনই Enrollment করুন — আজ থেকেই আপনার Dashboard, WhatsApp Community, এবং Day 1 Mission unlock হয়ে যাবে।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <GoldButton><Flame className="h-5 w-5" /> Start Membership — ৳২৯৯</GoldButton>
            <GhostButton>Talk to Us First</GhostButton>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold" style={{ color: `${t.cream}99` }}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" style={{ color: t.gold }} /> Secure Checkout</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" style={{ color: t.gold }} /> Instant Access</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" style={{ color: t.gold }} /> Cancel Anytime</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}



function Enrollment() {
  const steps = [
    "Payment করুন",
    "Confirmation সম্পন্ন করুন",
    "WhatsApp Group-এ Join করুন",
    "Dashboard Access পান",
    "Day 1 শুরু করুন",
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Heading eyebrow="Enrollment" title="আপনার Investment" />
      <GlassCard className="text-center">
        <div className="text-5xl font-black sm:text-6xl" style={{ color: t.gold }}>৳299</div>
        <p className="mt-3 text-sm" style={{ color: `${t.cream}aa` }}>Launch pricing — সব Bonus Included</p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s} className="rounded-2xl p-4"
              style={{ background: `${t.emeraldSoft}66`, border: `1px solid ${t.gold}33` }}>
              <div className="text-xs font-bold" style={{ color: t.gold }}>Step {i + 1}</div>
              <div className="mt-2 text-sm font-bold" style={{ color: t.white }}>{s}</div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <GoldButton><Flame className="h-5 w-5" /> Join the Challenge</GoldButton>
        </div>
      </GlassCard>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Beginner কি Join করতে পারবে?", a: "হ্যাঁ, একদম Beginner-দের জন্য designed — Day 1 থেকে ধাপে ধাপে শেখানো হবে।" },
    { q: "Mobile দিয়ে হবে?", a: "হ্যাঁ, পুরো Challenge Mobile থেকেই Follow করা যাবে।" },
    { q: "Live Session থাকবে?", a: "প্রতি সপ্তাহে Weekly Live Session থাকবে Q&A ও Progress Review-এর জন্য।" },
    { q: "Recording থাকবে?", a: "হ্যাঁ, সব Live Session-এর Recording Dashboard-এ পাবেন।" },
    { q: "Challenge মিস করলে কী হবে?", a: "কোনো দিন মিস হলে পরের দিন Catch-up করার System আছে — Daily Tracker সাহায্য করবে।" },
    { q: "কত সময় দিতে হবে?", a: "প্রতিদিন মাত্র ২–৩ ঘণ্টা — Learn, Practice, Build, Share, Improve।" },
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
      source: "success-code-30day-challenge",
      interest: "The Success Code 30-Day Challenge",
      message: "Challenge enrollment request",
    });
    setLoading(false);
    if (error) { toast.error("Enrollment ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"); return; }
    toast.success("ধন্যবাদ! আমরা payment instructions পাঠাবো শীঘ্রই।");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <section id="register" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="text-3xl font-black leading-tight sm:text-5xl" style={{ color: t.white }}>
          আগামী <span style={{ color: t.gold }}>৩০ দিন</span><br />
          আপনার জীবন বদলাতে পারে।
        </h2>
        <p className="mt-4 text-lg" style={{ color: `${t.cream}cc` }}>
          আজ সিদ্ধান্ত নিন। আজ Enrollment করুন। আজ থেকেই Action শুরু করুন।
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>Payment</div>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: t.white }}>Send Payment to</h3>
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
          <a
            href="https://wa.me/8801960254383?text=Assalamu%20Alaikum%2C%20I%20want%20to%20join%20The%20Success%20Code%2030-Day%20Challenge"
            target="_blank" rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            style={{ color: t.white, background: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" /> Join WhatsApp Group
          </a>
        </GlassCard>

        <GlassCard>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.gold }}>Reserve Your Seat</div>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: t.white }}>Enroll Now</h3>
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
              {loading ? "Sending..." : "🔥 Join 30-Day Challenge"}
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
