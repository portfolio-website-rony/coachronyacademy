import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BrowserMockup, MockPreview } from "./BrowserMockup";
import { Badge, Pill } from "./Badge";

export type ProjectItem = {
  title: string;
  category: string;
  desc: string;
  tags: readonly string[];
  preview: { url: string; kind: "site" | "chat" | "flow" | "dashboard" };
};

export function ProjectCard({ project, ctaHref = "#enroll" }: { project: ProjectItem; ctaHref?: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition duration-300 hover:border-primary/30"
    >
      <div className="p-5 pb-0">
        <BrowserMockup url={project.preview.url}>
          <MockPreview kind={project.preview.kind} />
        </BrowserMockup>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Badge>{project.category}</Badge>
        <h3 className="mt-3 font-mont text-lg font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
        <a
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
        >
          Build this in batch <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </motion.article>
  );
}
