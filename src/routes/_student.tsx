import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, BookOpen, GraduationCap, Users, Library, LayoutDashboard, UserCircle2 } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_student")({
  component: StudentLayout,
});

const NAV: NavItem[] = [
  { to: "/student", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/student/courses", label: "Courses", icon: BookOpen },
  { to: "/student/progress", label: "Progress", icon: GraduationCap },
  { to: "/student/community", label: "Community", icon: Users },
  { to: "/student/resources", label: "Resources", icon: Library },
  { to: "/student/profile", label: "Profile", icon: UserCircle2 },
];

function StudentLayout() {
  const { loading, session, isStudent, isAdmin } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (!isStudent && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, session, isStudent, isAdmin, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }
  return (
    <DashboardShell brand="Student" nav={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
