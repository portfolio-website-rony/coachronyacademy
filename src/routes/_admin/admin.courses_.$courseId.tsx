import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_admin/admin/courses_/$courseId")({
  head: () => ({ meta: [{ title: "Edit Course — Admin" }] }),
  component: CourseEditor,
});

type PaymentMethods = {
  bkash?: boolean;
  nagad?: boolean;
  manual?: boolean;
  stripe?: boolean;
  sslcommerz?: boolean;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  cover_url: string | null;
  promo_video_url: string | null;
  level: string;
  category: string | null;
  language: string;
  currency: string;
  price: number;
  discount_price: number | null;
  duration_minutes: number;
  instructor_name: string | null;
  instructor_bio: string | null;
  instructor_avatar_url: string | null;
  learn_outcomes: string[];
  who_for: string[];
  requirements: string[];
  offer_ends_at: string | null;
  payment_methods_enabled: PaymentMethods;
  display_order: number;
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
type Faq = { id: string; course_id: string; question: string; answer: string; display_order: number };

function CourseEditor() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: c }, { data: m }, { data: f }] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
      supabase.from("course_modules").select("*").eq("course_id", courseId).order("display_order"),
      supabase.from("course_faqs").select("*").eq("course_id", courseId).order("display_order"),
    ]);
    if (c) {
      const cc = c as Course;
      setCourse({
        ...cc,
        learn_outcomes: cc.learn_outcomes ?? [],
        who_for: cc.who_for ?? [],
        requirements: cc.requirements ?? [],
        payment_methods_enabled: cc.payment_methods_enabled ?? {},
      });
    }
    setModules((m as Module[]) ?? []);
    setFaqs((f as Faq[]) ?? []);
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
        slug: course.slug,
        tagline: course.tagline,
        description: course.description,
        long_description: course.long_description,
        cover_url: course.cover_url,
        promo_video_url: course.promo_video_url,
        level: course.level,
        category: course.category,
        language: course.language,
        currency: course.currency,
        price: course.price,
        discount_price: course.discount_price,
        duration_minutes: course.duration_minutes,
        instructor_name: course.instructor_name,
        instructor_bio: course.instructor_bio,
        instructor_avatar_url: course.instructor_avatar_url,
        learn_outcomes: course.learn_outcomes,
        who_for: course.who_for,
        requirements: course.requirements,
        offer_ends_at: course.offer_ends_at,
        payment_methods_enabled: course.payment_methods_enabled,
        display_order: course.display_order,
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

  async function renameModule(m: Module) {
    const title = prompt("Module title", m.title);
    if (!title || title === m.title) return;
    const { error } = await supabase.from("course_modules").update({ title }).eq("id", m.id);
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
        description: l.description,
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

  async function addFaq() {
    const question = prompt("Question");
    if (!question) return;
    const answer = prompt("Answer") ?? "";
    const { error } = await supabase
      .from("course_faqs")
      .insert({ course_id: courseId, question, answer, display_order: faqs.length });
    if (error) return toast.error(error.message);
    void load();
  }

  async function updateFaq(f: Faq) {
    const { error } = await supabase
      .from("course_faqs")
      .update({ question: f.question, answer: f.answer })
      .eq("id", f.id);
    if (error) toast.error(error.message);
    else toast.success("FAQ saved");
  }

  async function removeFaq(id: string) {
    if (!confirm("Delete FAQ?")) return;
    await supabase.from("course_faqs").delete().eq("id", id);
    void load();
  }

  if (!course) return <div className="glass h-40 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <a
          href={`/courses/${course.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary-glow hover:underline"
        >
          View landing page <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Basics */}
      <Card title="Basics">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TextInput value={course.title} onChange={(v) => setCourse({ ...course, title: v })} />
          </Field>
          <Field label="Slug (URL)">
            <TextInput value={course.slug} onChange={(v) => setCourse({ ...course, slug: v })} />
          </Field>
          <Field label="Tagline">
            <TextInput value={course.tagline ?? ""} onChange={(v) => setCourse({ ...course, tagline: v })} />
          </Field>
          <Field label="Category">
            <TextInput value={course.category ?? ""} onChange={(v) => setCourse({ ...course, category: v })} />
          </Field>
          <Field label="Level">
            <Select
              value={course.level}
              onChange={(v) => setCourse({ ...course, level: v })}
              options={[
                ["beginner", "Beginner"],
                ["intermediate", "Intermediate"],
                ["advanced", "Advanced"],
              ]}
            />
          </Field>
          <Field label="Language">
            <Select
              value={course.language}
              onChange={(v) => setCourse({ ...course, language: v })}
              options={[
                ["bn", "Bangla"],
                ["en", "English"],
              ]}
            />
          </Field>
          <Field label="Duration (minutes)">
            <NumberInput
              value={course.duration_minutes}
              onChange={(v) => setCourse({ ...course, duration_minutes: v })}
            />
          </Field>
          <Field label="Display order">
            <NumberInput
              value={course.display_order}
              onChange={(v) => setCourse({ ...course, display_order: v })}
            />
          </Field>
          <Field label="Cover image URL">
            <TextInput value={course.cover_url ?? ""} onChange={(v) => setCourse({ ...course, cover_url: v })} />
          </Field>
          <Field label="Promo video URL (YouTube)">
            <TextInput
              value={course.promo_video_url ?? ""}
              onChange={(v) => setCourse({ ...course, promo_video_url: v })}
            />
          </Field>
        </div>
        <Field label="Short description">
          <Textarea
            rows={2}
            value={course.description ?? ""}
            onChange={(v) => setCourse({ ...course, description: v })}
          />
        </Field>
        <Field label="Long description">
          <Textarea
            rows={5}
            value={course.long_description ?? ""}
            onChange={(v) => setCourse({ ...course, long_description: v })}
          />
        </Field>
      </Card>

      {/* Pricing */}
      <Card title="Pricing & offer">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Currency">
            <Select
              value={course.currency}
              onChange={(v) => setCourse({ ...course, currency: v })}
              options={[
                ["BDT", "BDT"],
                ["USD", "USD"],
              ]}
            />
          </Field>
          <Field label="Regular price">
            <NumberInput value={course.price} onChange={(v) => setCourse({ ...course, price: v })} />
          </Field>
          <Field label="Discount price">
            <NumberInput
              value={course.discount_price ?? 0}
              onChange={(v) => setCourse({ ...course, discount_price: v || null })}
            />
          </Field>
          <Field label="Offer ends at">
            <TextInput
              value={course.offer_ends_at ? course.offer_ends_at.slice(0, 16) : ""}
              onChange={(v) => setCourse({ ...course, offer_ends_at: v ? new Date(v).toISOString() : null })}
              type="datetime-local"
            />
          </Field>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Payment methods enabled
          </span>
          <div className="mt-2 flex flex-wrap gap-3">
            {(["bkash", "nagad", "manual", "stripe", "sslcommerz"] as const).map((m) => (
              <label key={m} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={!!course.payment_methods_enabled?.[m]}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      payment_methods_enabled: { ...course.payment_methods_enabled, [m]: e.target.checked },
                    })
                  }
                />
                <span className="capitalize">{m}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Instructor */}
      <Card title="Instructor">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Instructor name">
            <TextInput
              value={course.instructor_name ?? ""}
              onChange={(v) => setCourse({ ...course, instructor_name: v })}
            />
          </Field>
          <Field label="Instructor avatar URL">
            <TextInput
              value={course.instructor_avatar_url ?? ""}
              onChange={(v) => setCourse({ ...course, instructor_avatar_url: v })}
            />
          </Field>
        </div>
        <Field label="Instructor bio">
          <Textarea
            rows={3}
            value={course.instructor_bio ?? ""}
            onChange={(v) => setCourse({ ...course, instructor_bio: v })}
          />
        </Field>
      </Card>

      {/* Lists */}
      <Card title="Outcomes & audience">
        <ListEditor
          label="What students will learn"
          items={course.learn_outcomes}
          onChange={(items) => setCourse({ ...course, learn_outcomes: items })}
        />
        <ListEditor
          label="Who this course is for"
          items={course.who_for}
          onChange={(items) => setCourse({ ...course, who_for: items })}
        />
        <ListEditor
          label="Requirements"
          items={course.requirements}
          onChange={(items) => setCourse({ ...course, requirements: items })}
        />
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/80 p-3 backdrop-blur">
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background shadow-glow disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save course"}
        </button>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Modules & lessons</h2>
          <button
            onClick={addModule}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm"
          >
            <Plus className="h-4 w-4" /> Add module
          </button>
        </div>

        {modules.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No modules yet.</div>
        )}

        {modules.map((m) => (
          <div key={m.id} className="glass space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <button onClick={() => renameModule(m)} className="font-semibold hover:text-primary-glow">
                {m.title}
              </button>
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

      {/* FAQs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">FAQs</h2>
          <button
            onClick={addFaq}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm"
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>
        {faqs.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No FAQs yet.</div>
        )}
        {faqs.map((f) => (
          <FaqRow key={f.id} faq={f} onSave={updateFaq} onDelete={() => removeFaq(f.id)} />
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass space-y-4 rounded-2xl p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children}
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

function TextInput({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-sm"
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="Add item and press Enter"
          className="flex-1 rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-sm"
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs text-primary-glow"
        >
          Add
        </button>
      </div>
    </div>
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
      <textarea
        rows={2}
        value={l.description ?? ""}
        onChange={(e) => setL({ ...l, description: e.target.value })}
        placeholder="Lesson description (optional)"
        className="w-full rounded-lg border border-white/10 bg-background/40 px-2 py-1.5 text-sm"
      />
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

function FaqRow({ faq, onSave, onDelete }: { faq: Faq; onSave: (f: Faq) => void; onDelete: () => void }) {
  const [f, setF] = useState(faq);
  return (
    <div className="glass space-y-2 rounded-2xl p-4">
      <input
        value={f.question}
        onChange={(e) => setF({ ...f, question: e.target.value })}
        placeholder="Question"
        className="w-full rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-sm font-medium"
      />
      <textarea
        rows={3}
        value={f.answer}
        onChange={(e) => setF({ ...f, answer: e.target.value })}
        placeholder="Answer"
        className="w-full rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-sm"
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => onSave(f)} className="rounded-lg bg-primary/20 px-3 py-1 text-xs text-primary-glow">
          Save
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
