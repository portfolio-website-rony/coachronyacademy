import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, BookOpen, Eye, EyeOff, Users } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";

export const Route = createFileRoute("/_admin/admin/courses")({
  head: () => ({ meta: [{ title: "Courses — Admin" }] }),
  component: CoursesPage,
});

type Course = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  level: string;
  category: string | null;
  display_order: number;
};

function CoursesPage() {
  const [rows, setRows] = useState<Course[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  async function load() {
    const { data } = await supabase
      .from("courses")
      .select("id,title,slug,published,level,category,display_order")
      .order("display_order")
      .order("created_at", { ascending: false });
    setRows((data as Course[]) ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!title.trim()) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const { data, error } = await supabase
      .from("courses")
      .insert({ title: title.trim(), slug: `${slug}-${Date.now().toString(36).slice(-4)}` })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    toast.success("Course created");
    setTitle("");
    setCreating(false);
    await load();
    if (data?.id) {
      window.location.href = `/admin/courses/${data.id}`;
    }
  }

  async function togglePublish(c: Course) {
    const { error } = await supabase
      .from("courses")
      .update({ published: !c.published })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Courses</h1>
          <p className="text-sm text-muted-foreground">Create and manage your course catalog.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
        >
          <Plus className="h-4 w-4" /> New course
        </button>
      </div>

      {creating && (
        <div className="glass space-y-3 rounded-2xl p-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
            className="w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button onClick={create} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background">
              Create
            </button>
            <button onClick={() => setCreating(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {rows === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started." />
      ) : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link to="/admin/courses/$courseId" params={{ courseId: c.id }} className="font-medium hover:text-primary-glow">
                      {c.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{c.level}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(c)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.published ? "bg-primary/20 text-primary-glow" : "bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {c.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {c.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/courses/$courseId"
                      params={{ courseId: c.id }}
                      className="text-xs text-primary-glow hover:underline"
                    >
                      Edit →
                    </Link>
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
