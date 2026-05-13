import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/student/community")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Community</h1>
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Discussions and peer learning coming soon.</p>
      </div>
    </div>
  ),
});
