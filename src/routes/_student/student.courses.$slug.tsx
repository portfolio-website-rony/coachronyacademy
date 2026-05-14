import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_student/student/courses/$slug")({
  component: () => <Outlet />,
});
