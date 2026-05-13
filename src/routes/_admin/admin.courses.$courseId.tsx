import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/courses/$courseId")({
  head: () => ({ meta: [{ title: "Edit Course — Admin" }] }),
  component: CourseEditor,
});

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  level: string;
  category: string | null;
  published: boolean;
};
type Module = { id: string; title: string; display_order: number };
type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  duration_seconds: number;
  display_order: number;
  is_preview: boolean;
};

function CourseEditor() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: c }, { data: m }] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
      supabase.from("course_modules").select("*").eq("course_id", courseId).order("display_order"),
    ]);
    setCourse(c as Course);
    setModules((m as Module[]) ?? []);
    if (m && m.length > 0) {
      const { data: l } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", m.map((x: Module) => x.id))
        .order("display_order");
      setLessons((l as Lesson[]) ?? []);
    } else {
      setLessons([]);
    }
  }
  useEffect(() => {
    void load();
  }, [courseId]);

  async function saveCourse() {
    if (!course) return;
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        cover_url: course.cover_url,
        level: course.level,
        category: course.category,
        published: course.published,
      })
      .eq("id", course.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Course saved");
  }

  async function addModule() {
    const title = prompt("Module title");
    if (!title) return;
    const { error } = await supabase
      .from("course_modules")
      .insert({ course_id: courseId, title, display_order: modules.length });
    if (error) return toast.error(error.message);
    void load();
  }

  async function removeModule(id: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    await supabase.from("course_modules").delete().eq("id", id);
    void load();
  }

  async function addLesson(moduleId: string) {
    const title = prompt("Lesson title");
    if (!title) return;
    const count = lessons.filter((l) => l.module_id === moduleId).length;
    const { error } = await supabase
      .from("course_lessons")
      .insert({ module_id: moduleId, title, display_order: count });
    if (error) return toast.error(error.message);
    void load();
  }

  async function updateLesson(l: Lesson) {
    const { error } = await supabase
      .from("course_lessons")
      .update({
        title: l.title,
        youtube_url: l.youtube_url,
        duration_seconds: l.duration_seconds,
        is_preview: l.is_preview,
      })
      .eq("id", l.id);
    if (error) toast.error(error.message);
    else toast.success("Lesson saved");
  }

  async function removeLesson(id: string) {
    if (!confirm("Delete lesson?")) return;
    await supabase.from("course_lessons").delete().eq("id", id);
    void load();
  }

  if (!course) return <div className="glass h-40 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-6">
      <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div className="glass space-y-4 rounded-2xl p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <input
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Level">
            <select
              value={course.level}
              onChange={(e) => setCourse({ ...course, level: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Category">
            <input
              value={course.category ?? ""}
              onChange={(e) => setCourse({ ...course, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Cover image URL">
            <input
              value={course.cover_url ?? ""}
              onChange={(e) => setCourse({ ...course, cover_url: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={3}
            value={course.description ?? ""}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Field>
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={course.published}
              onChange={(e) => setCourse({ ...course, published: e.target.checked })}
            />
            Published
          </label>
          <button
            onClick={saveCourse}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save course"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Modules & lessons</h2>
          <button onClick={addModule} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm">
            <Plus className="h-4 w-4" /> Add module
          </button>
        </div>

        {modules.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No modules yet.</div>
        )}

        {modules.map((m) => (
          <div key={m.id} className="glass space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{m.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => addLesson(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Lesson
                </button>
                <button onClick={() => removeModule(m.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {lessons
                .filter((l) => l.module_id === m.id)
                .map((l) => (
                  <LessonRow key={l.id} lesson={l} onSave={updateLesson} onDelete={() => removeLesson(l.id)} />
                ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .input { @apply w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function LessonRow({
  lesson,
  onSave,
  onDelete,
}: {
  lesson: Lesson;
  onSave: (l: Lesson) => void;
  onDelete: () => void;
}) {
  const [l, setL] = useState(lesson);
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-background/30 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
        <input
          value={l.title}
          onChange={(e) => setL({ ...l, title: e.target.value })}
          placeholder="Lesson title"
          className="rounded-lg border border-white/10 bg-background/40 px-2 py-1.5 text-sm"
        />
        <input
          value={l.youtube_url ?? ""}
          onChange={(e) => setL({ ...l, youtube_url: e.target.value })}
          placeholder="YouTube unlisted URL"
          className="rounded-lg border border-white/10 bg-background/40 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          value={l.duration_seconds}
          onChange={(e) => setL({ ...l, duration_seconds: Number(e.target.value) })}
          placeholder="Duration (s)"
          className="rounded-lg border border-white/10 bg-background/40 px-2 py-1.5 text-sm"
        />
        <div className="flex items-center gap-2">
          <button onClick={() => onSave(l)} className="rounded-lg bg-primary/20 px-2.5 py-1 text-xs text-primary-glow">
            Save
          </button>
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={l.is_preview}
          onChange={(e) => setL({ ...l, is_preview: e.target.checked })}
        />
        Preview lesson (visible without enrollment)
      </label>
    </div>
  );
}
