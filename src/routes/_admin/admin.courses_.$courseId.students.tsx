import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";

export const Route = createFileRoute("/_admin/admin/courses_/$courseId/students")({
  head: () => ({ meta: [{ title: "Enrolled Students — Admin" }] }),
  component: CourseStudentsPage,
});

type Row = {
  id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  user_id: string;
  profile: { display_name: string | null; avatar_url: string | null; phone: string | null } | null;
};

function CourseStudentsPage() {
  const { courseId } = Route.useParams();
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    void (async () => {
      const [{ data: c }, { data: e }] = await Promise.all([
        supabase.from("courses").select("title").eq("id", courseId).maybeSingle(),
        supabase
          .from("enrollments")
          .select("id,status,enrolled_at,completed_at,user_id,profile:profiles(display_name,avatar_url,phone)")
          .eq("course_id", courseId)
          .order("enrolled_at", { ascending: false }),
      ]);
      setCourseTitle((c as { title?: string } | null)?.title ?? "Course");
      setRows((e as unknown as Row[]) ?? []);
    })();
  }, [courseId]);

  const total = rows?.length ?? 0;
  const completed = (rows ?? []).filter((r) => r.status === "completed" || r.completed_at).length;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/courses" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary-glow">
          <ArrowLeft className="h-3.5 w-3.5" /> All courses
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{courseTitle}</h1>
            <p className="text-sm text-muted-foreground">Enrolled students</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow">
              <Users className="h-3.5 w-3.5" /> {total} enrolled
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> {completed} completed
            </span>
          </div>
        </div>
      </div>

      {rows === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title="No enrollments yet" description="Students will appear here once they enroll." />
      ) : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Completed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const name = r.profile?.display_name ?? "Unnamed";
                const initial = name.charAt(0).toUpperCase();
                const done = r.status === "completed" || r.completed_at;
                return (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.profile?.avatar_url ? (
                          <img src={r.profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-background">
                            {initial}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-[10px] text-muted-foreground">{r.user_id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.profile?.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          done ? "bg-primary/20 text-primary-glow" : "bg-white/5 text-muted-foreground"
                        }`}
                      >
                        {done ? "Completed" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
