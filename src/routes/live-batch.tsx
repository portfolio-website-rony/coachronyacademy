import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { liveBatch } from "@/config/liveBatch";
import { SectionHeader } from "@/components/live-batch/SectionHeader";
import { Badge, Pill } from "@/components/live-batch/Badge";
import { CTA } from "@/components/live-batch/CTA";
import { FeatureCard } from "@/components/live-batch/FeatureCard";
import { ProjectCard } from "@/components/live-batch/ProjectCard";
import { ToolCard } from "@/components/live-batch/ToolCard";
import { Workflow, WorkflowStack } from "@/components/live-batch/Workflow";
import { PricingCard } from "@/components/live-batch/PricingCard";
import { FAQ } from "@/components/live-batch/FAQ";
import { Curriculum } from "@/components/live-batch/Curriculum";
import { GalleryCard } from "@/components/live-batch/GalleryCard";
import { StickyCTA } from "@/components/live-batch/StickyCTA";
import { TestimonialGrid, ShowcaseGrid } from "@/components/live-batch/Testimonials";

export const Route = createFileRoute("/live-batch")({
  head: () => ({
    meta: [
      { title: "AI Solution Builder — Live Batch | CoachRony Academy" },
      {
        name: "description",
        content:
          "AI, Vibe Coding, Automation ও AI Agent দিয়ে real solution build, launch ও sell করার complete live batch program।",
      },
      { property: "og:title", content: "AI Solution Builder — Live Batch | CoachRony Academy" },
      {
        property: "og:description",
        content: "Problem → Solution → Build → Automate → Launch → Sell → Grow।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveBatchPage,
});

function Wrap({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function LiveBatchPage() {
  const c = liveBatch;
  const d = c.experience.details;

  return (
    <div className="font-body pb-24 md:pb-0">
      {/* HERO */}
      <section className="relative overflow-hidden px-5 pt-24 pb-16 sm:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Badge tone="accent">{c.hero.label}</Badge>
            <h1 className="mt-6 font-mont text-4xl leading-[1.15] tracking-tight sm:text-5xl md:text-[3.4rem]">
              {c.hero.headline.map((l, i) => (
                <span key={i} className={i > 0 ? "block text-gradient" : "block"}>
                  {l}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {c.hero.sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTA href="#offer">{c.hero.primaryCta.label}</CTA>
              <CTA href={c.hero.secondaryCta.href} variant="ghost">
                {c.hero.secondaryCta.label}
              </CTA>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {c.hero.proof.map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          </motion.div>

          <div id="enroll">
            <PricingCard
              batchName={c.enrollment.batchName}
              price={c.enrollment.price}
              referencePrice={c.enrollment.referencePrice}
              startDate={c.enrollment.startDate}
              duration={c.enrollment.duration}
              seatsText={c.enrollment.seatsText}
              note={c.enrollment.note}
              includes={c.enrollment.includes}
              cta={c.enrollment.cta}
            />
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <Wrap>
        <SectionHeader label="Reality Check" lines={c.problems.headline} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.problems.items.map((p, i) => (
            <FeatureCard key={p.title} index={String(i + 1).padStart(2, "0")} title={p.title} desc={p.desc} />
          ))}
        </div>
        <p className="mt-8 max-w-3xl font-mont text-lg leading-relaxed tracking-tight">
          {c.problems.closing}
        </p>
      </Wrap>

      {/* TRANSFORMATION */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Transformation" lines={["Learning থেকে Revenue পর্যন্ত", "একটাই পরিষ্কার path"]} />
        <div className="mt-10">
          <Workflow steps={c.transformation} variant="bold" />
        </div>
      </Wrap>

      {/* CORE SYSTEM */}
      <Wrap id="system">
        <SectionHeader label="Core System" lines={["পাঁচটি Pillar—", "একটি Complete Building System"]} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.pillars.map((p) => (
            <FeatureCard key={p.no} index={p.no} title={p.title} desc={p.desc} />
          ))}
        </div>
      </Wrap>

      {/* CURRICULUM */}
      <Wrap id="curriculum" className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Curriculum" lines={c.curriculum.headline} />
        <div className="mt-10">
          <Curriculum modules={c.curriculum.modules} />
        </div>
      </Wrap>

      {/* VIBE CODING */}
      <Wrap>
        <SectionHeader label="Vibe Coding" lines={c.vibeCoding.headline} />
        <div className="mt-10">
          <Workflow steps={c.vibeCoding.steps} variant="numbered" />
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {c.vibeCoding.examples.map((e) => (
            <Pill key={e}>{e}</Pill>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {c.vibeCoding.disclaimer}
        </p>
      </Wrap>

      {/* AUTOMATION */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Automation" lines={c.automation.headline} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <Workflow steps={c.automation.flow} />
          <div className="grid gap-3 sm:grid-cols-2">
            {c.automation.useCases.map((u) => (
              <div key={u} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                {u}
              </div>
            ))}
          </div>
        </div>
      </Wrap>

      {/* AI AGENTS */}
      <Wrap>
        <SectionHeader label="AI Agents" lines={c.agent.headline} />
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <Workflow steps={c.agent.blocks} variant="bold" />
          <div className="flex flex-wrap gap-2">
            {c.agent.examples.map((e) => (
              <Pill key={e}>{e}</Pill>
            ))}
          </div>
        </div>
      </Wrap>

      {/* SAAS */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="SaaS" lines={c.saas.headline} />
        <div className="mt-10">
          <Workflow steps={c.saas.lifecycle} variant="numbered" />
        </div>
      </Wrap>

      {/* PROJECT GALLERY */}
      <Wrap id="projects">
        <SectionHeader label="Project Gallery" lines={c.gallery.headline} sub={c.gallery.sub} />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {c.gallery.items.map((item) => (
            <GalleryCard key={item.title} item={item} cta={c.gallery.caseStudyCta} />
          ))}
        </div>
      </Wrap>

      {/* BATCH PROJECTS */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Batch Projects" lines={["Batch-এ যেসব Solution", "নিজ হাতে Build করবেন"]} />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.projects.map((p) => (
            <ProjectCard key={p.title} project={p} ctaHref="#offer" />
          ))}
        </div>
      </Wrap>

      {/* LIVE BATCH EXPERIENCE */}
      <Wrap id="experience">
        <SectionHeader label="Live Batch Experience" lines={c.experience.headline} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.experience.steps.map((s) => (
            <FeatureCard key={s.no} index={s.no} title={s.title} desc={s.desc} />
          ))}
        </div>
        <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-7 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Included
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {c.experience.includes.map((i) => (
                <Pill key={i}>{i}</Pill>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Batch Details
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Batch Name", d.batchName],
                ["Start Date", d.startDate],
                ["Class Schedule", d.classSchedule],
                ["Duration", d.duration],
                ["Sessions", d.sessionCount],
                ["Support", d.supportDuration],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-1 font-mont font-semibold tracking-tight">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Wrap>

      {/* BONUS STACK */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Bonuses" lines={c.bonuses.headline} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.bonuses.items.map((b) => (
            <div
              key={b.name}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-primary/30"
            >
              <Badge>{b.value}</Badge>
              <h3 className="mt-4 font-mont text-base font-semibold tracking-tight">{b.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </Wrap>

      {/* WHO IS THIS FOR */}
      <Wrap>
        <SectionHeader label="Audience" lines={c.audience.headline} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.audience.items.map((a, i) => (
            <FeatureCard key={a.title} index={String(i + 1).padStart(2, "0")} title={a.title} desc={a.desc} />
          ))}
        </div>
      </Wrap>

      {/* WHY COACHRONY */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Why CoachRony" lines={c.why.headline} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.why.points.map((p) => (
            <FeatureCard key={p.no} index={p.no} title={p.title} desc={p.desc} />
          ))}
        </div>
      </Wrap>

      {/* BUSINESS PATHS */}
      <Wrap>
        <SectionHeader label="Business" lines={c.business.headline} />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.business.paths.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-mont text-base font-semibold tracking-tight text-primary">{p.title}</h3>
              <div className="mt-5">
                <WorkflowStack steps={p.steps} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-muted-foreground">{c.business.disclaimer}</p>
      </Wrap>

      {/* TOOLS */}
      <Wrap className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="Tools" lines={["যেসব Tool ও Stack", "ব্যবহার করা হবে"]} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {c.tools.map((t) => (
            <ToolCard key={t.category} category={t.category} items={t.items} />
          ))}
        </div>
      </Wrap>

      {/* SOCIAL PROOF */}
      <Wrap>
        <SectionHeader label="Social Proof" lines={c.socialProof.headline} sub={c.socialProof.sub} />
        <div className="mt-10">
          <TestimonialGrid
            testimonials={c.socialProof.testimonials}
            placeholderText={c.socialProof.placeholderText}
          />
        </div>
        <div className="mt-14">
          <h3 className="font-mont text-2xl font-semibold tracking-tight">
            {c.socialProof.showcase.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{c.socialProof.showcase.sub}</p>
          <div className="mt-6">
            <ShowcaseGrid
              projects={c.socialProof.showcase.projects}
              placeholderText={c.socialProof.showcase.placeholderText}
            />
          </div>
        </div>
      </Wrap>

      {/* OFFER */}
      <Wrap id="offer" className="border-y border-white/10 bg-white/[0.015]">
        <SectionHeader label="The Offer" lines={c.offer.headline} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              What you get
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {c.offer.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground/90"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <PricingCard
            batchName={c.offer.batchLabel}
            price={c.offer.programPrice}
            referencePrice={c.offer.referencePrice || undefined}
            startDate={c.offer.startDate}
            note={c.offer.discountText || undefined}
            includes={c.enrollment.includes}
            cta={{ label: c.offer.ctaText, href: c.offer.ctaHref }}
          />
        </div>
        <div className="mt-12">
          <Workflow steps={c.finalFlow} variant="bold" />
        </div>
      </Wrap>

      {/* FAQ */}
      <Wrap id="faq">
        <SectionHeader label="FAQ" lines={["সাধারণ প্রশ্ন", "ও উত্তর"]} />
        <div className="mt-10">
          <FAQ items={c.faq} />
        </div>
      </Wrap>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[oklch(0.12_0.02_270)] px-5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-mont text-3xl leading-[1.2] tracking-tight sm:text-4xl md:text-5xl">
            {c.finalCta.title}
          </h2>
          <p className="mt-6 text-base text-muted-foreground">{c.finalCta.sub}</p>
          <div className="mt-9 flex justify-center">
            <CTA href={c.finalCta.cta.href}>{c.finalCta.cta.label}</CTA>
          </div>
        </div>
      </section>

      <StickyCTA label={c.stickyCta.label} targetId="offer" />
    </div>
  );
}
