import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: StudentsPage,
});

type Row = {
  id: string;
  user_id: string;
  status: string;
  enrolled_at: string;
  course: { title: string } | null;
  profile: { display_name: string | null } | null;
  progress: number;
};

function StudentsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  async function load() {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id,user_id,status,enrolled_at,course:courses(title)")
      .order("enrolled_at", { ascending: false });
    const enrollments = (enr ?? []) as any[];
    if (enrollments.length === 0) {
      setRows([]);
      return;
    }
    const userIds = Array.from(new Set(enrollments.map((e) => e.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,display_name")
      .in("id", userIds);
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    // compute simple progress: completed lessons / total lessons in course
    const enriched: Row[] = await Promise.all(
      enrollments.map(async (e) => {
        const [{ count: total }, { count: done }] = await Promise.all([
          supabase
            .from("course_lessons")
            .select("id, course_modules!inner(course_id)", { count: "exact", head: true })
            .eq("course_modules.course_id", e.course_id ?? ""),
          supabase
            .from("lesson_progress")
            .select("id", { count: "exact", head: true })
            .eq("enrollment_id", e.id)
            .not("completed_at", "is", null),
        ]);
        return {
          ...e,
          profile: pmap.get(e.user_id) ?? null,
          progress: total && total > 0 ? Math.round(((done ?? 0) / total) * 100) : 0,
        };
      })
    );
    setRows(enriched);
  }
  useEffect(() => {
    void load();
  }, []);

  async function revoke(id: string) {
    if (!confirm("Revoke this enrollment?")) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Revoked");
    void load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Students</h1>
        <p className="text-sm text-muted-foreground">All enrollments and their progress.</p>
      </div>

      {rows === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students yet" description="Enrollments will appear here." />
      ) : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{r.profile?.display_name ?? r.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{r.course?.title ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full bg-gradient-primary" style={{ width: `${r.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{r.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => revoke(r.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
