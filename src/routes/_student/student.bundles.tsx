import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { ComingSoon } from "@/components/student/ComingSoon";

export const Route = createFileRoute("/_student/student/bundles")({
  head: () => ({ meta: [{ title: "My Bundles — CoachRony" }] }),
  component: () => (
    <ComingSoon
      title="My Bundles"
      description="Course + ebook + workshop bundles you have access to. Launching in the next phase."
      icon={Package}
    />
  ),
});
