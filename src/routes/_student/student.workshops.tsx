import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { ComingSoon } from "@/components/student/ComingSoon";

export const Route = createFileRoute("/_student/student/workshops")({
  head: () => ({ meta: [{ title: "Workshops — CoachRony" }] }),
  component: () => (
    <ComingSoon
      title="My Workshops"
      description="Live workshops, replays, and workshop registrations will appear here. Launching in the next phase."
      icon={CalendarClock}
    />
  ),
});
