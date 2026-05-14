import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { ComingSoon } from "@/components/student/ComingSoon";

export const Route = createFileRoute("/_student/student/certificates")({
  head: () => ({ meta: [{ title: "Certificates — CoachRony" }] }),
  component: () => (
    <ComingSoon
      title="Certificates"
      description="Download and share completion certificates for finished courses. Launching in the next phase."
      icon={Award}
    />
  ),
});
