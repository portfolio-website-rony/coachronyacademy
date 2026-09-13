import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export type ProjectItem = {
  title: string;
  desc: string;
  label: string;
};

export function ProjectCard({ project, ctaHref = "#enroll" }: { project: ProjectItem; ctaHref?: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className="group flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {project.label}
      </div>
      <h3 className="mt-5 font-mont text-lg font-semibold tracking-tight">{project.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.desc}</p>
      <a
        href={ctaHref}
        className="mt-6 inline-flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-foreground transition group-hover:text-primary"
      >
        বিস্তারিত দেখুন
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition group-hover:border-primary/40 group-hover:bg-primary/10">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </a>
    </motion.article>
  );
}
