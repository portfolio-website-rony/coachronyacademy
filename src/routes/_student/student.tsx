import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Bell, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_student/student")({
  head: () => ({ meta: [{ title: "Student Dashboard — CoachRony" }] }),
  component: StudentOverview,
});

function StudentOverview() {
  const { profile, session } = useAuthUser();
  const [notifs, setNotifs] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("notifications")
      .select("id,title,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setNotifs(data ?? []));
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Hi {profile?.display_name ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Continue your AI learning journey.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value={0} icon={BookOpen} hint="Courses" />
        <StatCard label="Progress" value="0%" icon={GraduationCap} hint="Average completion" />
        <StatCard label="Notifications" value={notifs.length} icon={Bell} />
        <StatCard label="Streak" value="0d" icon={Sparkles} hint="Keep it up" />
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Recent notifications</h2>
        <ul className="mt-3 divide-y divide-white/5">
          {notifs.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">No notifications yet.</li>
          )}
          {notifs.map((n) => (
            <li key={n.id} className="py-3 text-sm">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
