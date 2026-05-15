import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Section, GlassCard } from "@/components/site/Section";
import { WorkExperience } from "@/components/site/WorkExperience";
import { Button } from "@/components/ui/button";
import portrait from "@/assets/coach-rony-portrait.webp";
import {
  Sparkles, Layout, ShoppingBag, Bot, User, Megaphone, Code2,
  ArrowRight, BadgeCheck, Star, Trophy, Users,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমি কে — CoachRony | AI Creator & Digital Coach" },
      { name: "description", content: "CoachRony — AI Content Creation, Digital Products, Website Design, Vibe Coding ও Online Business Setup নিয়ে কাজ করি। AI দিয়ে আপনার Brand ও Income তৈরি করুন।" },
      { property: "og:title", content: "আমি কে — CoachRony" },
      { property: "og:description", content: "AI ও Modern Technology দিয়ে Online Skill, Brand এবং Income তৈরি করার পথ।" },
    ],
  }),
  component: About,
});

const SKILL_CARDS = [
  { icon: Sparkles, title: "AI Content Creation", desc: "Scalable, high-quality content with AI." },
  { icon: Layout, title: "Website & Landing Page", desc: "Modern, fast, conversion-focused design." },
  { icon: ShoppingBag, title: "Digital Product Business", desc: "Idea থেকে launch পর্যন্ত roadmap।" },
  { icon: Bot, title: "AI Automation", desc: "Workflows, agents ও smart systems।" },
  { icon: User, title: "Personal Branding", desc: "Authority brand globally গ্রো করানো।" },
  { icon: Megaphone, title: "Facebook Marketing", desc: "Pixel, CAPI, full-funnel ads system।" },
  { icon: Code2, title: "Vibe Coding", desc: "AI দিয়ে SaaS ও apps বানানো।" },
] as const;

const TRUST_BADGES = [
  { icon: Users, value: "10,000+", label: "Students Trained" },
  { icon: Trophy, value: "500+", label: "Projects Delivered" },
  { icon: Star, value: "5+ Years", label: "AI & Digital" },
  { icon: BadgeCheck, value: "Verified", label: "AI Educator" },
] as const;

function About() {
  return (
    <>
      {/* Hero intro split */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — Profile image with glow + glass frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-md"
          >
            {/* Halo glow */}
            <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-primary opacity-40 blur-2xl animate-pulse-glow" />

            {/* Frame */}
            <div className="glass-strong neon-border relative overflow-hidden rounded-[2rem] p-2 shadow-glow">
              <img
                src={portrait}
                alt="CoachRony portrait"
                loading="eager"
                className="aspect-[4/5] w-full rounded-[1.6rem] object-cover"
              />
              {/* Corner shimmer */}
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/0 via-primary-glow/10 to-transparent" />
            </div>

            {/* Floating chips */}
            <div className="glass-strong animate-float absolute -left-4 top-10 hidden rounded-2xl px-3 py-2 text-xs font-semibold shadow-glow sm:block">
              <span className="text-gradient">● AI Creator</span>
            </div>
            <div
              className="glass-strong animate-float absolute -right-4 bottom-12 hidden rounded-2xl px-3 py-2 text-xs font-semibold shadow-gold sm:block"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="text-gold-gradient">★ Coach & Mentor</span>
            </div>
          </motion.div>

          {/* Right — Intro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-6"
          >
            <span className="glass inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-glow">
              About Me
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              আমি কে — <span className="text-gradient">CoachRony</span>
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              আমি <b className="text-foreground">CoachRony</b> — AI Content Creation, Website Design,
              Vibe Coding এবং Digital Business Setup নিয়ে কাজ করি। AI এবং Modern Technology ব্যবহার করে
              মানুষকে <b className="text-foreground">Skill, Brand এবং Online Income</b> তৈরি করতে সাহায্য করছি।
            </p>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-glow">
                আমি মূলত কাজ করি
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILL_CARDS.map((s, i) => (
                  <motion.span
                    key={s.title}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition hover:border-primary/50 hover:shadow-glow"
                  >
                    <s.icon className="h-3.5 w-3.5 text-primary-glow" />
                    {s.title}
                  </motion.span>
                ))}
              </div>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              আমার লক্ষ্য — <b className="text-foreground">AI এবং Modern Technology</b> ব্যবহার করে
              মানুষকে Online Skill, Brand এবং Income তৈরি করতে সাহায্য করা।
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/book">
                  Book a Call <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass border-primary/30">
                <Link to="/courses">View Courses</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Social proof badges */}
      <Section className="!py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-strong border-gold-soft shadow-gold flex flex-wrap items-center justify-center gap-x-8 gap-y-5 rounded-2xl px-6 py-5"
        >
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <div className="glass flex h-10 w-10 items-center justify-center rounded-xl">
                <b.icon className="h-5 w-5 text-primary-glow" />
              </div>
              <div>
                <div className="font-display text-base font-bold text-gold-gradient leading-none">{b.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{b.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* Skill / Expertise grid */}
      <Section
        eyebrow="Expertise"
        title={<>What I <span className="text-gradient">help you build</span></>}
        subtitle="AI-driven systems, designed for creators ও modern entrepreneurs।"
      >
        <div className="relative">
          <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-blob" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SKILL_CARDS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <GlassCard className="h-full">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Mission CTA band */}
      <Section className="!pt-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center shadow-glow sm:p-14"
        >
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gradient-gold opacity-20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

          <h2 className="relative text-3xl font-bold sm:text-4xl md:text-5xl">
            Let's build your <span className="text-gold-gradient">AI-powered brand</span> together
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-muted-foreground">
            একটা discovery call-এ আপনার goal শুনি, তারপর AI দিয়ে একটা clear roadmap বানিয়ে দিই।
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/book">
                Book a Call <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-primary/30">
              <Link to="/courses">Explore Courses</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </>
  );
}
