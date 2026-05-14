import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Briefcase, CalendarDays, CreditCard, MessageSquare, LayoutDashboard, UserCircle2 } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/_client")({
  component: ClientLayout,
});

const NAV: NavItem[] = [
  { to: "/client", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/client/projects", label: "Projects", icon: Briefcase },
  { to: "/client/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/client/payments", label: "Payments", icon: CreditCard },
  { to: "/client/messages", label: "Messages", icon: MessageSquare },
  { to: "/client/profile", label: "Profile", icon: UserCircle2 },
];

function ClientLayout() {
  const { loading, session, isClient, isAdmin } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (!isClient && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, session, isClient, isAdmin, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }
  return (
    <DashboardShell brand="Client" nav={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
