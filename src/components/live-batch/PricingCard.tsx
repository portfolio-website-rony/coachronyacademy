import { Check, CalendarDays, Users } from "lucide-react";
import { CTA } from "./CTA";
import { Badge } from "./Badge";

export function PricingCard({
  batchName,
  price,
  referencePrice,
  startDate,
  duration,
  seatsText,
  note,
  includes,
  cta,
  className = "",
}: {
  batchName: string;
  price: string;
  referencePrice?: string;
  startDate: string;
  duration?: string;
  seatsText?: string;
  note?: string;
  includes?: readonly string[];
  cta: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/12 bg-[oklch(0.13_0.02_270)]/80 p-7 shadow-card backdrop-blur-xl ${className}`}
    >
      <Badge tone="accent">Enrollment Open</Badge>
      <h3 className="mt-4 font-mont text-xl font-semibold tracking-tight">{batchName}</h3>

      <div className="mt-5 flex items-end gap-3">
        <span className="font-mont text-4xl font-bold tracking-tight text-gradient">{price}</span>
        {referencePrice && (
          <span className="pb-1 text-sm text-muted-foreground line-through">{referencePrice}</span>
        )}
      </div>

      <div className="mt-5 grid gap-2.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          Start: {startDate}
          {duration ? ` · ${duration}` : ""}
        </div>
        {seatsText && (
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-primary" />
            {seatsText}
          </div>
        )}
      </div>

      {includes && includes.length > 0 && (
        <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
          {includes.map((i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {i}
            </li>
          ))}
        </ul>
      )}

      <CTA href={cta.href} className="mt-6 w-full">
        {cta.label}
      </CTA>
      {note && <p className="mt-3 text-center text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
