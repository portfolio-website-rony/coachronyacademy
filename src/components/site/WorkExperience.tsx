import { Section } from "@/components/site/Section";
import { useWorkExperience } from "@/lib/site-settings";
import { Briefcase } from "lucide-react";

export function WorkExperience() {
  const items = useWorkExperience();
  if (items.length === 0) return null;

  const renderCard = (it: { name: string; logo_url: string }, k: string) => (
    <div
      key={k}
      className="glass shrink-0 flex h-28 w-44 flex-col items-center justify-center gap-2 rounded-2xl border-gold-soft px-4 py-3 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow sm:w-52"
    >
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white/5">
        {it.logo_url ? (
          <img src={it.logo_url} alt={it.name} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <Briefcase className="h-5 w-5 text-primary-glow" />
        )}
      </div>
      <div className="text-center text-xs font-medium leading-tight">{it.name}</div>
    </div>
  );

  return (
    <Section
      eyebrow="Experience"
      title={<>Where I've <span className="text-gradient">worked</span></>}
      subtitle="Banks, schools, government offices থেকে international freelancing — diverse domain experience।"
    >
      <div className="group/marquee marquee-mask overflow-hidden">
        <div className="flex w-max gap-5 animate-marquee-right group-hover/marquee:[animation-play-state:paused]">
          {[...items, ...items].map((it, i) => renderCard(it, `we-${i}`))}
        </div>
      </div>
    </Section>
  );
}
