import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/student/progress")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Learning Progress</h1>
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Module-wise progress will appear here once you start a course.</p>
      </div>
    </div>
  ),
});
