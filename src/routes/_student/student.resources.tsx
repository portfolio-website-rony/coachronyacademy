import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/student/resources")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Resources</h1>
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Curated downloads and links from CoachRony.</p>
      </div>
    </div>
  ),
});
