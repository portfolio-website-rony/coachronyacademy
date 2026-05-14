import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, BookOpen, GraduationCap, Users, Library, LayoutDashboard, Bell, Award, FileText, Package, CalendarClock, Bookmark, Receipt } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/_student")({
  component: StudentLayout,
});

const NAV: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/student/courses", label: "My Courses", icon: BookOpen },
  { to: "/student/workshops", label: "Workshops", icon: CalendarClock },
  { to: "/student/ebooks", label: "Ebooks", icon: FileText },
  { to: "/student/bundles", label: "Bundles", icon: Package },
  { to: "/student/certificates", label: "Certificates", icon: Award },
  { to: "/student/orders", label: "My Orders", icon: Receipt },
  { to: "/student/progress", label: "Progress", icon: GraduationCap },
  { to: "/student/saved", label: "Saved", icon: Bookmark },
  
  { to: "/student/community", label: "Community", icon: Users },
  { to: "/student/resources", label: "Resources", icon: Library },
];

function StudentLayout() {
  const { loading, session, isStudent, isAdmin } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      const returnTo = window.location.pathname + window.location.search;
      navigate({ to: "/login", search: { returnTo } as any });
    } else if (!isStudent && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, session, isStudent, isAdmin, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <DashboardShell brand="Student" nav={NAV}>
        <Outlet />
      </DashboardShell>
      <Footer />
    </div>
  );
}
