import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, CalendarDays, CreditCard, MessageSquare } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_client/client")({
  head: () => ({ meta: [{ title: "Client Dashboard — CoachRony" }] }),
  component: ClientOverview,
});

function ClientOverview() {
  const { profile } = useAuthUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Welcome {profile?.display_name ?? "back"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Your projects and meetings at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={0} icon={Briefcase} />
        <StatCard label="Upcoming meetings" value={0} icon={CalendarDays} />
        <StatCard label="Payments due" value="0" icon={CreditCard} />
        <StatCard label="New messages" value={0} icon={MessageSquare} />
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Activity feed</h2>
        <p className="mt-2 text-sm text-muted-foreground">Project updates will appear here.</p>
      </div>
    </div>
  );
}
