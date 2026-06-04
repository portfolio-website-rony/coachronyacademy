import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GraduationCap, Trash2, Search, Mail, Phone, BookOpen, CheckCircle2, Download } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { toast } from "sonner";
import { listAllStudents, revokeEnrollment, type StudentRow } from "@/lib/admin/students.functions";

export const Route = createFileRoute("/_admin/admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const fetchStudents = useServerFn(listAllStudents);
  const revokeFn = useServerFn(revokeEnrollment);
  const [q, setQ] = useState("");

  const { data: rows, isLoading, refetch } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => fetchStudents(),
  });

  async function onRevoke(enrollmentId: string) {
    if (!confirm("Revoke this enrollment?")) return;
    try {
      await revokeFn({ data: { enrollmentId } });
      toast.success("Enrollment revoked");
      void refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke");
    }
  }

  const needle = q.trim().toLowerCase();
  const filtered = (rows ?? []).filter((s: StudentRow) => {
    if (!needle) return true;
    return (
      s.name.toLowerCase().includes(needle) ||
      (s.email ?? "").toLowerCase().includes(needle) ||
      (s.phone ?? "").toLowerCase().includes(needle) ||
      s.courses.some((c) => c.title.toLowerCase().includes(needle))
    );
  });

  const totalStudents = rows?.length ?? 0;
  const totalEnrollments = (rows ?? []).reduce((acc, s) => acc + s.courses.length, 0);

  function exportCsv() {
    const data = filtered.length ? filtered : (rows ?? []);
    if (!data.length) {
      toast.error("কোনো ডেটা নেই");
      return;
    }
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = [
      "Name", "Email", "Phone", "Course", "Status", "Progress %",
      "Enrolled At", "Completed At", "User ID", "Enrollment ID",
    ];
    const lines: string[] = [headers.join(",")];
    for (const s of data) {
      if (s.courses.length === 0) {
        lines.push([s.name, s.email ?? "", s.phone ?? "", "", "", "", "", "", s.user_id, ""].map(esc).join(","));
        continue;
      }
      for (const c of s.courses) {
        lines.push([
          s.name, s.email ?? "", s.phone ?? "",
          c.title, c.status, c.progress,
          c.enrolled_at ? new Date(c.enrolled_at).toISOString() : "",
          c.completed_at ? new Date(c.completed_at).toISOString() : "",
          s.user_id, c.enrollment_id,
        ].map(esc).join(","));
      }
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV ডাউনলোড শুরু হয়েছে");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Students</h1>
          <p className="text-sm text-muted-foreground">
            সব স্টুডেন্ট, তাদের যোগাযোগের তথ্য এবং এনরোল করা কোর্সসমূহ এক জায়গায়।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={!rows?.length}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-1.5 text-xs font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Download CSV
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow">
            <GraduationCap className="h-3.5 w-3.5" /> {totalStudents} students
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold">
            <BookOpen className="h-3.5 w-3.5" /> {totalEnrollments} enrollments
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন বা কোর্স দিয়ে সার্চ করুন…"
          className="w-full rounded-xl border border-white/10 bg-background/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : (rows ?? []).length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students yet" description="Enrollments will appear here." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।" />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const initial = s.name.charAt(0).toUpperCase();
            const completed = s.courses.filter((c) => c.completed_at || c.status === "completed").length;
            return (
              <div key={s.user_id} className="glass rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  {/* Student info */}
                  <div className="flex items-start gap-3 lg:w-72 lg:shrink-0">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-base font-bold text-background">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{s.name}</div>
                      {s.email && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </div>
                      )}
                      {s.phone && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{s.phone}</span>
                        </div>
                      )}
                      <div className="mt-1.5 flex gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px]">
                          <BookOpen className="h-3 w-3" /> {s.courses.length}
                        </span>
                        {completed > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary-glow">
                            <CheckCircle2 className="h-3 w-3" /> {completed} done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="flex-1 space-y-2">
                    {s.courses.map((c) => {
                      const done = c.completed_at || c.status === "completed";
                      return (
                        <div
                          key={c.enrollment_id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{c.title}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Enrolled: {new Date(c.enrolled_at).toLocaleDateString()}
                              {c.completed_at && ` · Completed: ${new Date(c.completed_at).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                              <div className="h-full bg-gradient-primary" style={{ width: `${c.progress}%` }} />
                            </div>
                            <span className="w-8 text-right text-[10px] text-muted-foreground">{c.progress}%</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              done ? "bg-primary/20 text-primary-glow" : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            {done ? "Completed" : c.status}
                          </span>
                          <button
                            onClick={() => onRevoke(c.enrollment_id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Revoke enrollment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
