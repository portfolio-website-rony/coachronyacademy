import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard } from "@/components/site/Section";
import { PROGRAMS } from "@/lib/site-data";
import { ArrowRight, Check, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Coachrony Academy" },
      { name: "description", content: "AI, content, vibe coding ও digital business — সব level-এর জন্য কোর্স।" },
      { property: "og:title", content: "Courses — Coachrony Academy" },
      { property: "og:description", content: "Free থেকে premium — আপনার level অনুযায়ী AI কোর্স বেছে নিন।" },
    ],
  }),
  component: Courses,
});

const PERKS = ["Lifetime access", "Bangla + English", "Live sessions", "Community", "Templates ও prompts"];

function Courses() {
  return (
    <>
      <Section
        eyebrow="Courses"
        title={<>Learn with <span className="text-gradient">Coachrony</span></>}
        subtitle="Beginner থেকে advanced — practical, project-based AI কোর্স।"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <GlassCard key={p.title} className="flex flex-col">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-glow">
                <GraduationCap className="h-4 w-4" /> {p.tag}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {PERKS.slice(0, 4).map((b) => (
                  <li key={b} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-gold-gradient">{p.price}</span>
                <Link to={p.href as "/book"} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-glow hover:underline">
                  {p.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>
    </>
  );
}
