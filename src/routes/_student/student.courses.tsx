import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/student/courses")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">My Courses</h1>
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">You're not enrolled in any course yet.</p>
        <Link to="/courses" className="mt-4 inline-flex rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow">
          Browse courses
        </Link>
      </div>
    </div>
  ),
});
