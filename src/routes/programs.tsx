import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard } from "@/components/site/Section";
import { PROGRAMS } from "@/lib/site-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs & Courses — CoachRony" },
      { name: "description", content: "Free classes, masterclasses, premium courses ও 1:1 mentorship — শুরু করুন আপনার level থেকে।" },
      { property: "og:title", content: "Programs & Courses — CoachRony" },
      { property: "og:description", content: "Free to premium AI creator programs." },
    ],
  }),
  component: Programs,
});

const BENEFITS = ["Lifetime access", "Bangla + English", "Live sessions", "Community access", "Templates ও prompts"];

function Programs() {
  return (
    <Section
      eyebrow="Programs"
      title={<>Pick your <span className="text-gradient">learning path</span></>}
      subtitle="Free থেকে premium — সবার জন্য কিছু না কিছু আছে।"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {PROGRAMS.map((p) => (
          <GlassCard key={p.title} className="!p-7">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
                {p.tag}
              </span>
              <p.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>

            <ul className="mt-5 space-y-2 text-sm">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary-glow" /> {b}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="text-2xl font-bold text-gradient">{p.price}</div>
              </div>
              {p.href.startsWith("/student/courses/") ? (
                <Link
                  to="/student/courses/$slug"
                  params={{ slug: p.href.replace("/student/courses/", "") }}
                  className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background shadow-glow"
                >
                  {p.cta}
                </Link>
              ) : (
                <Link
                  to={p.href}
                  className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background shadow-glow"
                >
                  {p.cta}
                </Link>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
