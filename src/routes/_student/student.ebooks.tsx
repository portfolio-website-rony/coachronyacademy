import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/student/ComingSoon";

export const Route = createFileRoute("/_student/student/ebooks")({
  head: () => ({ meta: [{ title: "My Ebooks — CoachRony" }] }),
  component: () => (
    <ComingSoon
      title="My Ebooks"
      description="Read your purchased ebooks online or download as PDF. Launching in the next phase."
      icon={FileText}
    />
  ),
});
