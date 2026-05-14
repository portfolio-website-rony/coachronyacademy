import { useInView, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

function parseValue(raw: ReactNode): { target: number; format: (n: number) => string } | null {
  if (typeof raw !== "string") return null;
  const m = raw.match(/^([\d,.]+)\s*([KMB]?)([+%]*)$/i);
  if (!m) return null;
  const base = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(base)) return null;
  const mult = m[2].toUpperCase();
  const suffix = m[3] ?? "";
  const multiplier = mult === "K" ? 1_000 : mult === "M" ? 1_000_000 : mult === "B" ? 1_000_000_000 : 1;
  const target = base * multiplier;
  const format = (n: number) => {
    if (mult === "K") return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}K${suffix}`;
    if (mult === "M") return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
    if (mult === "B") return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B${suffix}`;
    return `${Math.round(n).toLocaleString()}${suffix}`;
  };
  return { target, format };
}

export function CountUp({ raw }: { raw: ReactNode }) {
  const parsed = parseValue(raw);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(parsed ? parsed.format(0) : "");

  useEffect(() => {
    if (!parsed) return;
    if (reduce) {
      setDisplay(parsed.format(parsed.target));
      return;
    }
    if (!inView) return;
    const controls = animate(mv, parsed.target, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(parsed.format(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, parsed?.target]);

  if (!parsed) return <>{raw}</>;
  return <span ref={ref}>{display}</span>;
}
