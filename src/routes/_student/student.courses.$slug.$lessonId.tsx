import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/learn/YouTubePlayer";
import {
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, Circle, PlayCircle, Lock,
  Bookmark, BookmarkPlus, Trash2, Save, ListVideo, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SaveLessonButton } from "@/components/student/SaveLessonButton";
import { AiTutorPanel } from "@/components/learn/AiTutorPanel";

export const Route = createFileRoute("/_student/student/courses/$slug/$lessonId")({
  component: LessonPage,
});

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

type Bookmark = { id: string; seconds: number; label: string | null };

function fmtTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function LessonPage() {
  const { slug, lessonId } = Route.useParams();
  const { session } = useAuthUser();
  const navigate = useNavigate();
  const playerRef = useRef<YouTubePlayerHandle>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [startAt, setStartAt] = useState(0);
  const [duration, setDuration] = useState(0);
  const completedRef = useRef(false);

  const [autoNext, setAutoNext] = useState(true);
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const idx = useMemo(() => allLessons.findIndex((l) => l.id === (lesson?.id ?? "")), [allLessons, lesson]);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  const done = completedSet.has(lesson?.id ?? "");
  const accessible = !!enrollmentId || !!lesson?.is_preview;

  // Load lesson + course context
  useEffect(() => {
    void (async () => {
      const { data: c } = await supabase.from("courses").select("id").eq("slug", slug).maybeSingle();
      if (!c) return;
      const { data: m } = await supabase.from("course_modules").select("id,display_order").eq("course_id", c.id).order("display_order");
      const moduleIds = (m ?? []).map((x: any) => x.id);
      if (moduleIds.length === 0) return;
      const { data: l } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("display_order");
      const lessonsList = (l as Lesson[]) ?? [];
      const orderMap = new Map((m ?? []).map((mm: any) => [mm.id, mm.display_order]));
      lessonsList.sort((a, b) => {
        const moa = orderMap.get(a.module_id) ?? 0;
        const mob = orderMap.get(b.module_id) ?? 0;
        if (moa !== mob) return moa - mob;
        return a.display_order - b.display_order;
      });
      setAllLessons(lessonsList);
      const cur = lessonsList.find((x) => x.id === lessonId) ?? null;
      setLesson(cur);

      if (session) {
        const { data: e } = await supabase
          .from("enrollments").select("id").eq("user_id", session.user.id).eq("course_id", c.id).maybeSingle();
        if (e) {
          setEnrollmentId(e.id);
          const { data: lp } = await supabase
            .from("lesson_progress")
            .select("lesson_id,watched_seconds,completed_at")
            .eq("enrollment_id", e.id);
          const cs = new Set<string>();
          let startSec = 0;
          for (const row of (lp ?? []) as any[]) {
            if (row.completed_at) cs.add(row.lesson_id);
            if (row.lesson_id === lessonId) startSec = row.watched_seconds ?? 0;
          }
          setCompletedSet(cs);
          setStartAt(startSec);
          completedRef.current = cs.has(lessonId);
        }
      }
    })();
  }, [slug, lessonId, session]);

  // Load notes + bookmarks for this lesson
  useEffect(() => {
    if (!session || !lesson) return;
    void (async () => {
      const [{ data: n }, { data: b }] = await Promise.all([
        supabase.from("lesson_notes").select("content").eq("user_id", session.user.id).eq("lesson_id", lesson.id).maybeSingle(),
        supabase.from("lesson_bookmarks").select("id,seconds,label").eq("user_id", session.user.id).eq("lesson_id", lesson.id).order("seconds"),
      ]);
      setNotes((n as any)?.content ?? "");
      setNotesDirty(false);
      setBookmarks((b as Bookmark[]) ?? []);
    })();
  }, [session, lesson]);

  const lastSaveRef = useRef(0);
  async function saveProgress(seconds: number, total: number) {
    if (!enrollmentId || !lesson) return;
    const dur = total > 0 ? total : (lesson.duration_seconds > 0 ? lesson.duration_seconds : 0);
    const isComplete = dur > 0 && seconds / dur >= 0.9;
    // Throttle: only write if 15s elapsed since last save, or completion fires
    const now = Date.now();
    if (!isComplete && !completedRef.current && now - lastSaveRef.current < 15000) return;
    lastSaveRef.current = now;
    await supabase.from("lesson_progress").upsert(
      {
        enrollment_id: enrollmentId,
        lesson_id: lesson.id,
        watched_seconds: Math.floor(seconds),
        last_watched_at: new Date().toISOString(),
        completed_at: isComplete || completedRef.current ? new Date().toISOString() : null,
      },
      { onConflict: "enrollment_id,lesson_id" }
    );
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      setCompletedSet((s) => new Set(s).add(lesson.id));
      toast.success("Lesson complete!");
    }
  }

  async function markComplete() {
    if (!enrollmentId || !lesson) return toast.error("Enroll required");
    completedRef.current = true;
    setCompletedSet((s) => new Set(s).add(lesson.id));
    await supabase.from("lesson_progress").upsert(
      {
        enrollment_id: enrollmentId,
        lesson_id: lesson.id,
        watched_seconds: Math.floor(playerRef.current?.getCurrentTime() ?? 0),
        last_watched_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
      { onConflict: "enrollment_id,lesson_id" }
    );
    toast.success("Marked complete");
  }

  function handleEnded() {
    if (autoNext && next) {
      navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: next.id } });
    }
  }

  async function saveNotes() {
    if (!session || !lesson) return;
    setSavingNotes(true);
    const { error } = await supabase.from("lesson_notes").upsert(
      { user_id: session.user.id, lesson_id: lesson.id, content: notes },
      { onConflict: "user_id,lesson_id" }
    );
    setSavingNotes(false);
    if (error) return toast.error(error.message);
    setNotesDirty(false);
    toast.success("Notes saved");
  }

  function insertTimestamp() {
    const t = playerRef.current?.getCurrentTime() ?? 0;
    setNotes((n) => `${n}${n && !n.endsWith("\n") ? " " : ""}[${fmtTime(t)}] `);
    setNotesDirty(true);
  }

  async function addBookmark() {
    if (!session || !lesson) return;
    const seconds = Math.floor(playerRef.current?.getCurrentTime() ?? 0);
    const label = window.prompt("Bookmark label (optional)") ?? "";
    const { data, error } = await supabase
      .from("lesson_bookmarks")
      .insert({ user_id: session.user.id, lesson_id: lesson.id, seconds, label: label || null })
      .select("id,seconds,label")
      .single();
    if (error) return toast.error(error.message);
    setBookmarks((bs) => [...bs, data as Bookmark].sort((a, b) => a.seconds - b.seconds));
    toast.success("Bookmarked");
  }

  async function deleteBookmark(id: string) {
    const { error } = await supabase.from("lesson_bookmarks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setBookmarks((bs) => bs.filter((b) => b.id !== id));
  }

  if (!lesson) return <div className="glass h-40 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-4">
      <Link to="/student/courses/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left: player + controls */}
        <div className="space-y-4">
          {!accessible ? (
            <div className="glass rounded-2xl p-8 text-center">
              <h2 className="font-display text-xl font-bold">Enroll to access this lesson</h2>
            </div>
          ) : (
            <YouTubePlayer
              ref={playerRef}
              url={lesson.youtube_url ?? ""}
              startAt={startAt}
              onProgress={(s) => saveProgress(s, duration)}
              onDuration={(d) => setDuration(d)}
              onEnded={handleEnded}
            />
          )}

          {/* Action bar */}
          {accessible && (
            <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-3 text-sm">
              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
                Auto-play next
              </label>
              <button
                onClick={addBookmark}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
              >
                <BookmarkPlus className="h-4 w-4" /> Bookmark
              </button>
              <SaveLessonButton lessonId={lesson.id} />
              <button
                onClick={markComplete}
                disabled={done}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-1.5 font-semibold text-background disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> {done ? "Completed" : "Mark complete"}
              </button>
            </div>
          )}

          {/* Title */}
          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">{lesson.title}</h1>
                {lesson.description && <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>}
              </div>
              {done && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs text-primary-glow">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </span>
              )}
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button
                disabled={!prev}
                onClick={() => prev && navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: prev.id } })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                disabled={!next}
                onClick={() => next && navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: next.id } })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-sm font-semibold text-background disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          {accessible && (
            <div className="glass space-y-2 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">My Notes</h3>
                <div className="flex gap-2">
                  <button
                    onClick={insertTimestamp}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
                  >
                    + Timestamp
                  </button>
                  <button
                    onClick={saveNotes}
                    disabled={!notesDirty || savingNotes}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-background disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Write notes while watching… use + Timestamp to insert current time."
                className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-background/40 p-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
          )}

          {/* Bookmarks */}
          {accessible && bookmarks.length > 0 && (
            <div className="glass space-y-2 rounded-2xl p-5">
              <h3 className="font-display text-lg font-bold">Bookmarks</h3>
              <ul className="divide-y divide-white/5">
                {bookmarks.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2 py-2">
                    <button
                      onClick={() => playerRef.current?.seekTo(b.seconds)}
                      className="inline-flex items-center gap-2 text-left text-sm hover:text-primary-glow"
                    >
                      <Bookmark className="h-4 w-4 text-primary-glow" />
                      <span className="font-mono text-xs text-muted-foreground">{fmtTime(b.seconds)}</span>
                      <span>{b.label || "Bookmark"}</span>
                    </button>
                    <button onClick={() => deleteBookmark(b.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: lesson list sidebar */}
        <aside className="glass h-fit space-y-2 rounded-2xl p-3 lg:sticky lg:top-4">
          <div className="flex items-center gap-2 px-2 pb-1 pt-1">
            <ListVideo className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display text-sm font-bold">Course lessons</h3>
            <span className="ml-auto text-xs text-muted-foreground">
              {completedSet.size}/{allLessons.length}
            </span>
          </div>
          <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
            {allLessons.map((l, i) => {
              const isCurrent = l.id === lesson.id;
              const isDone = completedSet.has(l.id);
              const canOpen = !!enrollmentId || l.is_preview;
              return (
                <li key={l.id}>
                  <button
                    disabled={!canOpen}
                    onClick={() => navigate({ to: "/student/courses/$slug/$lessonId", params: { slug, lessonId: l.id } })}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                      isCurrent ? "bg-primary/15 text-primary-glow" : "hover:bg-white/5"
                    } ${!canOpen ? "opacity-50" : ""}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-glow" />
                    ) : canOpen ? (
                      isCurrent ? <PlayCircle className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="line-clamp-2 flex-1">{i + 1}. {l.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
