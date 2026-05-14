import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { ComingSoon } from "@/components/student/ComingSoon";

export const Route = createFileRoute("/_student/student/saved")({
  head: () => ({ meta: [{ title: "Saved Lessons — CoachRony" }] }),
  component: () => (
    <ComingSoon
      title="Saved Lessons"
      description="Bookmark lessons to revisit later. Launching in the next phase."
      icon={Bookmark}
    />
  ),
});
