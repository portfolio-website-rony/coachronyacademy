import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section, GlassCard } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatDuration } from "@/lib/format";
import { ArrowRight, Clock, GraduationCap, Sparkles, BarChart3, Radio, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/courses/")({
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

type Course = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cover_url: string | null;
  level: string;
  category: string | null;
  duration_minutes: number;
  price: number;
  discount_price: number | null;
  currency: string;
};

function Courses() {
  const [rows, setRows] = useState<Course[] | null>(null);

  useEffect(() => {
    supabase
      .from("courses")
      .select("id,title,slug,tagline,description,cover_url,level,category,duration_minutes,price,discount_price,currency")
      .eq("published", true)
      .order("display_order")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Course[]) ?? []));
  }, []);

  return (
    <Section
      eyebrow="Courses"
      title={<>Learn with <span className="text-gradient">Coachrony</span></>}
      subtitle="Beginner থেকে advanced — practical, project-based AI কোর্স।"
    >
      {rows === null ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-80 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-primary-glow" />
          <h3 className="mt-3 font-display text-xl font-bold">কোর্স শীঘ্রই আসছে</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            আমরা নতুন কোর্স প্রকাশ করছি — আপডেট পেতে subscribe করুন।
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => {
            const finalPrice = c.discount_price ?? c.price;
            const isFree = Number(finalPrice) === 0;
            const hasDiscount = c.discount_price !== null && Number(c.discount_price) < Number(c.price);
            return (
              <GlassCard key={c.id} className="flex flex-col overflow-hidden p-0">
                <Link to="/courses/$slug" params={{ slug: c.slug }} className="block">
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/30 to-fuchsia-500/20">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <GraduationCap className="h-12 w-12 text-primary-glow/60" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                      {isFree ? (
                        <span className="text-emerald-400">Free</span>
                      ) : (
                        <span className="text-primary-glow inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Premium
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <span className="capitalize">{c.level}</span>
                    {c.category && <><span>·</span><span>{c.category}</span></>}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold leading-tight">
                    <Link to="/courses/$slug" params={{ slug: c.slug }} className="hover:text-primary-glow">
                      {c.title}
                    </Link>
                  </h3>
                  {c.tagline && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.tagline}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {c.duration_minutes > 0 && (
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(c.duration_minutes)}</span>
                    )}
                    <span className="inline-flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {c.level}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      {isFree ? (
                        <span className="font-display text-lg font-bold text-emerald-400">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-bold text-gradient">{formatPrice(finalPrice, c.currency)}</span>
                          {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(c.price, c.currency)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/courses/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-glow hover:underline"
                    >
                      View <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </Section>
  );
}
