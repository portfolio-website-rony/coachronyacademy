import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function FeatureCard({
  index,
  title,
  desc,
  icon,
  className = "",
}: {
  index?: string;
  title: string;
  desc?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:border-primary/30 hover:bg-white/[0.04] ${className}`}
    >
      {index && (
        <div className="font-mont text-sm font-semibold tracking-[0.2em] text-primary">{index}</div>
      )}
      {icon && <div className="mb-4 text-primary">{icon}</div>}
      <h3 className="mt-2 font-mont text-lg font-semibold tracking-tight">{title}</h3>
      {desc && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </motion.div>
  );
}
