import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CoachRony" }] }),
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const { loading, session, isAdmin, isClient } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (isAdmin) navigate({ to: "/admin" });
    else if (isClient) navigate({ to: "/client" });
    else navigate({ to: "/student" });
  }, [loading, session, isAdmin, isClient, navigate]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
    </div>
  );
}
