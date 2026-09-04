import { motion } from "framer-motion";

export function ToolCard({ category, items }: { category: string; items: readonly string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{category}</div>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            {i}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
