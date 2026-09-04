import { motion } from "framer-motion";

/** Horizontal / wrapping step flow used across the page. */
export function Workflow({
  steps,
  variant = "default",
}: {
  steps: readonly string[];
  variant?: "default" | "numbered" | "bold";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}
          className="flex items-center gap-2.5 sm:gap-3"
        >
          <div
            className={
              variant === "bold"
                ? "rounded-xl border border-primary/25 bg-primary/[0.07] px-4 py-3 font-mont text-sm font-semibold tracking-tight sm:text-base"
                : "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground/90"
            }
          >
            {variant === "numbered" && (
              <span className="mr-2 text-xs font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            {s}
          </div>
          {i < steps.length - 1 && <span className="text-primary/60">→</span>}
        </motion.div>
      ))}
    </div>
  );
}

/** Vertical stacked flow for narrow columns. */
export function WorkflowStack({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="relative space-y-3 border-l border-white/10 pl-6">
      {steps.map((s, i) => (
        <li key={s} className="relative text-sm text-muted-foreground">
          <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="mr-2 text-xs font-semibold text-primary">
            {String(i + 1).padStart(2, "0")}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}
