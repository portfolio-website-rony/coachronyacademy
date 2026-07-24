import { createFileRoute, Navigate } from "@tanstack/react-router";

// The 30-Day Challenge now uses the standard course enrollment system.
// Redirect to the unified checkout page for the linked course.
export const Route = createFileRoute("/challenge/join")({
  head: () => ({
    meta: [
      { title: "Join The Success Code 30-Day Challenge — CoachRony" },
      { name: "description", content: "Register and pay via bKash/Nagad to start the 30-day success challenge." },
    ],
  }),
  component: () => (
    <Navigate to="/courses_/$slug/checkout" params={{ slug: "success-code-30day" }} replace />
  ),
});
