import { Quote } from "lucide-react";

export type Testimonial = { name: string; role?: string; quote: string };

export function TestimonialGrid({
  testimonials,
  placeholderText,
  placeholderCount = 3,
}: {
  testimonials: readonly Testimonial[];
  placeholderText: string;
  placeholderCount?: number;
}) {
  if (testimonials.length === 0) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-6"
          >
            <Quote className="h-5 w-5 text-primary/50" />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{placeholderText}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-24 rounded bg-white/[0.07]" />
                <div className="h-2 w-16 rounded bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {testimonials.map((t) => (
        <figure
          key={t.name + t.quote.slice(0, 12)}
          className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <Quote className="h-5 w-5 text-primary" />
          <blockquote className="mt-5 text-sm leading-relaxed text-foreground/90">
            {t.quote}
          </blockquote>
          <figcaption className="mt-6 text-sm">
            <span className="font-mont font-semibold tracking-tight">{t.name}</span>
            {t.role && <span className="block text-xs text-muted-foreground">{t.role}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ShowcaseGrid({
  projects,
  placeholderText,
}: {
  projects: readonly { title: string; category: string; url?: string }[];
  placeholderText: string;
}) {
  if (projects.length === 0) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-5"
          >
            <div className="h-28 rounded-xl bg-white/[0.04]" />
            <p className="mt-4 text-sm text-muted-foreground">{placeholderText}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {projects.map((p) => (
        <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {p.category}
          </div>
          <h4 className="mt-3 font-mont text-base font-semibold tracking-tight">{p.title}</h4>
          {p.url && (
            <a
              href={p.url}
              className="mt-3 inline-block text-sm font-semibold text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Visit →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
