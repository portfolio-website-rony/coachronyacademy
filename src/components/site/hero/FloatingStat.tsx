import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { CountUp } from "@/components/site/CountUp";

export function FloatingStat({
  value,
  label,
  icon,
  delay = 0,
  className = "",
}: {
  value: ReactNode;
  label: string;
  icon?: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`glass-strong neon-border rounded-2xl px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary-glow">{icon}</div>}
        <div>
          <div className="font-display text-lg font-bold text-gradient leading-none">
            <CountUp raw={value} />
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
