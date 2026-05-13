import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_client/client/projects")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Projects</h1>
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Your active and completed projects will be listed here.</p>
      </div>
    </div>
  ),
});
