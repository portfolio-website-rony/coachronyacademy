import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";

type Booking = { id: string; topic: string | null; preferred_date: string; preferred_time: string; meeting_status: string; meeting_link: string | null };

export const Route = createFileRoute("/_client/client/meetings")({
  component: MeetingsPage,
});

function MeetingsPage() {
  const { session } = useAuthUser();
  const [items, setItems] = useState<Booking[]>([]);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("bookings")
      .select("id,topic,preferred_date,preferred_time,meeting_status,meeting_link")
      .eq("email", session.user.email!)
      .order("preferred_date", { ascending: false })
      .then(({ data }) => setItems((data as Booking[]) ?? []));
  }, [session]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Meetings</h1>
      <div className="glass rounded-2xl p-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No meetings yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{b.topic ?? "Coaching session"}</div>
                  <div className="text-xs text-muted-foreground">{b.preferred_date} • {b.preferred_time}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs">{b.meeting_status}</span>
                  {b.meeting_link && (
                    <a href={b.meeting_link} target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background shadow-glow">Join</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
