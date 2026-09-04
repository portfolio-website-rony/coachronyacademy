import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function SectionHeader({
  label,
  lines,
  sub,
  align = "left",
}: {
  label?: string;
  lines: string[];
  sub?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
    >
      {label && (
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {label}
        </div>
      )}
      <h2 className="font-mont text-3xl leading-[1.15] tracking-tight sm:text-4xl md:text-[2.75rem]">
        {lines.map((l, i) => (
          <span key={i} className={i > 0 ? "block text-muted-foreground" : "block"}>
            {l}
          </span>
        ))}
      </h2>
      {sub && <p className="mt-5 text-base leading-relaxed text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}
