import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";
import { Section, GlassCard } from "@/components/site/Section";
import { LeadForm } from "@/components/site/LeadForm";
import { SERVICES, PROGRAMS, PORTFOLIO, TESTIMONIALS, STATS, SKILLS } from "@/lib/site-data";
import { SpaceHero } from "@/components/site/hero/SpaceHero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <SpaceHero />

      {/* STATS */}
      <Section className="!py-12">
        <div className="border-gold-soft shadow-gold mx-auto rounded-2xl bg-[oklch(0.05_0.02_270)]/80 p-2 backdrop-blur-md sm:p-3">
          <div className="grid grid-cols-2 divide-y divide-[oklch(0.78_0.13_75/0.18)] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`relative px-4 py-5 text-center sm:px-6 sm:py-6 ${
                  i !== STATS.length - 1
                    ? "lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:h-12 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-gold-divider"
                    : ""
                }`}
              >
                <div className="font-display text-2xl font-bold tracking-tight text-gold-gradient sm:text-3xl lg:text-[1.75rem] xl:text-3xl">
                  {s.value}
                </div>
                <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-foreground/80 sm:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ABOUT preview */}
      <Section
        eyebrow="About"
        title={<>আমি কে — <span className="text-gradient">CoachRony</span></>}
        subtitle="আমি CoachRony — AI Content Creation, Website Design, Vibe Coding এবং Digital Business Setup নিয়ে কাজ করি। AI এবং Modern Technology ব্যবহার করে মানুষকে Skill, Brand এবং Online Income তৈরি করতে সাহায্য করছি।"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s) => (
            <GlassCard key={s} className="text-sm font-medium">
              <span className="text-gradient">●</span> {s}
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-glow hover:underline">
            Read full story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* SERVICES */}
      <Section
        eyebrow="Services"
        title={<>What I do — <span className="text-gradient">end to end</span></>}
        subtitle="AI-powered services that help creators ও brands grow faster।"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <GlassCard key={s.title}>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-background shadow-glow">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-glow hover:underline">
                Learn more <ArrowRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* PROGRAMS */}
      <Section
        eyebrow="Programs"
        title={<>Learn with <span className="text-gradient">CoachRony</span></>}
        subtitle="From free classes to premium mentorship — শুরু করুন আপনার level থেকে।"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <GlassCard key={p.title}>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
                  {p.tag}
                </span>
                <p.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-end justify-between">
                <div className="text-xl font-bold text-gradient">{p.price}</div>
                <Link to={p.href} className="rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background">
                  {p.cta}
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* PORTFOLIO */}
      <Section
        eyebrow="Portfolio"
        title="Recent work"
        subtitle="Landing pages, videos, ads, funnels — real projects, real results।"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO.map((p) => (
            <div key={p.title} className="group relative overflow-hidden rounded-2xl border border-white/10">
              <div className={`aspect-[4/3] w-full bg-gradient-to-br ${p.color}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
                  {p.tag}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-glow hover:underline">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section
        eyebrow="Testimonials"
        title="Students ও clients বলছেন"
      >
        {(() => {
          const half = Math.ceil(TESTIMONIALS.length / 2);
          const rowA = TESTIMONIALS.slice(0, half);
          const rowB = TESTIMONIALS.slice(half);
          const renderCard = (t: typeof TESTIMONIALS[number], k: string) => (
            <div key={k} className="w-[300px] shrink-0 sm:w-[360px]">
              <GlassCard>
                <Quote className="h-6 w-6 text-primary-glow" />
                <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
          return (
            <div className="group/marquee space-y-5 marquee-mask overflow-hidden">
              <div className="flex w-max gap-5 animate-marquee-right group-hover/marquee:[animation-play-state:paused]">
                {[...rowA, ...rowA].map((t, i) => renderCard(t, `a-${i}`))}
              </div>
              <div className="flex w-max gap-5 animate-marquee-left group-hover/marquee:[animation-play-state:paused]">
                {[...rowB, ...rowB].map((t, i) => renderCard(t, `b-${i}`))}
              </div>
            </div>
          );
        })()}
      </Section>

      {/* LEAD CAPTURE */}
      <Section
        eyebrow="Get Started"
        title={<>Ready to <span className="text-gradient">level up</span>?</>}
        subtitle="Free consultation ও resources পেতে নিচের form-টি fill করুন।"
      >
        <div className="mx-auto max-w-xl">
          <GlassCard className="!p-8">
            <LeadForm source="home_hero" buttonLabel="Get Free Consultation" />
          </GlassCard>
        </div>
      </Section>
    </>
  );
}
