import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { WeeklyChart, type DayPoint } from "@/components/learn/WeeklyChart";
import { Flame, Trophy, Clock, PlayCircle, BookOpen, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_student/student/progress")({
  head: () => ({ meta: [{ title: "Progress — CoachRony" }] }),
  component: ProgressPage,
});

type CourseRow = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  slug: string;
  cover: string | null;
  total: number;
  done: number;
  totalSeconds: number;
  lastWatchedAt: string | null;
  lastLessonId: string | null;
};

type HistoryRow = {
  lesson_id: string;
  last_watched_at: string;
  lesson: { title: string; module: { course: { slug: string; title: string } } };
};

function dayKey(d: Date) { return d.toISOString().slice(0, 10); }

function ProgressPage() {
  const { session } = useAuthUser();
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [activity, setActivity] = useState<{ ts: string; seconds: number }[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  async function load(userId: string) {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id,course_id,course:courses(id,title,slug,cover_url)")
      .eq("user_id", userId);

    const enrolls = (enr ?? []) as any[];
    const enrollmentIds = enrolls.map((e) => e.id);

    if (enrollmentIds.length === 0) {
      setCourses([]);
      setActivity([]);
      setHistory([]);
      return;
    }

    const courseIds = enrolls.map((e) => e.course_id);

    const [{ data: lessons }, { data: progress }, { data: hist }] = await Promise.all([
      supabase
        .from("course_lessons")
        .select("id, course_modules!inner(course_id)")
        .in("course_modules.course_id", courseIds),
      supabase
        .from("lesson_progress")
        .select("enrollment_id,lesson_id,watched_seconds,completed_at,last_watched_at")
        .in("enrollment_id", enrollmentIds),
      supabase
        .from("lesson_progress")
        .select("lesson_id,last_watched_at,lesson:course_lessons(title,module:course_modules(course:courses(slug,title)))")
        .in("enrollment_id", enrollmentIds)
        .order("last_watched_at", { ascending: false })
        .limit(10),
    ]);

    // Build course rows
    const totalsByCourse = new Map<string, number>();
    for (const l of (lessons ?? []) as any[]) {
      const cid = l.course_modules.course_id;
      totalsByCourse.set(cid, (totalsByCourse.get(cid) ?? 0) + 1);
    }

    const aggByEnrollment = new Map<string, { done: number; sec: number; last: string | null; lastLesson: string | null }>();
    for (const p of (progress ?? []) as any[]) {
      const cur = aggByEnrollment.get(p.enrollment_id) ?? { done: 0, sec: 0, last: null, lastLesson: null };
      if (p.completed_at) cur.done += 1;
      cur.sec += p.watched_seconds ?? 0;
      if (!cur.last || (p.last_watched_at && p.last_watched_at > cur.last)) {
        cur.last = p.last_watched_at;
        cur.lastLesson = p.lesson_id;
      }
      aggByEnrollment.set(p.enrollment_id, cur);
    }

    setCourses(
      enrolls.map((e) => {
        const agg = aggByEnrollment.get(e.id) ?? { done: 0, sec: 0, last: null, lastLesson: null };
        return {
          enrollmentId: e.id,
          courseId: e.course_id,
          courseTitle: e.course?.title ?? "Course",
          slug: e.course?.slug ?? "",
          cover: e.course?.cover_url ?? null,
          total: totalsByCourse.get(e.course_id) ?? 0,
          done: agg.done,
          totalSeconds: agg.sec,
          lastWatchedAt: agg.last,
          lastLessonId: agg.lastLesson,
        };
      }),
    );

    setActivity(
      ((progress ?? []) as any[])
        .filter((p) => p.last_watched_at)
        .map((p) => ({ ts: p.last_watched_at, seconds: p.watched_seconds ?? 0 })),
    );

    setHistory((hist as any[]) ?? []);
  }

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;
    void load(userId);

    // Realtime: refresh on any progress change
    const ch = supabase
      .channel(`progress-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_progress" },
        () => void load(userId),
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [session]);

  const { weekly, currentStreak, longestStreak, totalMinutes } = useMemo(() => {
    // Last 14 days bar chart
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets[dayKey(d)] = 0;
    }
    const daySet = new Set<string>();
    let totalSec = 0;
    for (const a of activity) {
      const k = dayKey(new Date(a.ts));
      daySet.add(k);
      if (k in buckets) buckets[k] += a.seconds;
      totalSec += a.seconds;
    }
    const weekly: DayPoint[] = Object.entries(buckets).map(([k, sec]) => ({
      day: new Date(k).toLocaleDateString(undefined, { weekday: "short" }),
      minutes: Math.round(sec / 60),
    }));

    // Streaks
    let cur = 0;
    const cursor = new Date(today);
    while (daySet.has(dayKey(cursor))) {
      cur += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    let longest = 0;
    let run = 0;
    const sortedDays = Array.from(daySet).sort();
    let prev: Date | null = null;
    for (const k of sortedDays) {
      const d = new Date(k);
      if (prev && (d.getTime() - prev.getTime()) === 86400000) run += 1;
      else run = 1;
      if (run > longest) longest = run;
      prev = d;
    }

    return { weekly, currentStreak: cur, longestStreak: longest, totalMinutes: Math.round(totalSec / 60) };
  }, [activity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Learning Progress</h1>
        <p className="text-sm text-muted-foreground">Track your watch time, streak, and completion across all courses.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Current streak" value={`${currentStreak}d`} icon={Flame} hint="Consecutive days" />
        <Stat label="Longest streak" value={`${longestStreak}d`} icon={Trophy} />
        <Stat label="Total watched" value={`${Math.round(totalMinutes / 60 * 10) / 10}h`} icon={Clock} hint={`${totalMinutes} min`} />
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Activity (last 14 days)</h2>
        <WeeklyChart data={weekly} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold">Course progress</h2>
        {courses === null ? (
          <div className="glass h-40 animate-pulse rounded-2xl" />
        ) : courses.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No enrollments yet.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {courses.map((c) => {
              const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
              return (
                <div key={c.enrollmentId} className="glass space-y-3 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-background">
                      {c.cover ? (
                        <img src={c.cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center"><BookOpen className="h-5 w-5 text-primary-glow/40" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 font-semibold">{c.courseTitle}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {c.done}/{c.total} lessons · {pct}% · {Math.round(c.totalSeconds / 60)}m watched
                      </div>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {c.lastWatchedAt ? `Last watched ${formatDistanceToNow(new Date(c.lastWatchedAt), { addSuffix: true })}` : "Not started"}
                    </span>
                    {c.lastLessonId ? (
                      <Link
                        to="/student/courses/$slug/$lessonId"
                        params={{ slug: c.slug, lessonId: c.lastLessonId }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Continue
                      </Link>
                    ) : (
                      <Link
                        to="/student/courses/$slug"
                        params={{ slug: c.slug }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                      >
                        Open course
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-primary-glow" />
            <h2 className="font-display text-lg font-bold">Recent watch history</h2>
          </div>
          <ul className="divide-y divide-white/5">
            {history.map((h, i) => {
              const slug = (h.lesson as any)?.module?.course?.slug;
              const courseTitle = (h.lesson as any)?.module?.course?.title;
              return (
                <li key={`${h.lesson_id}-${i}`}>
                  <Link
                    to="/student/courses/$slug/$lessonId"
                    params={{ slug: slug ?? "", lessonId: h.lesson_id }}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary-glow"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 font-medium">{(h.lesson as any)?.title ?? "Lesson"}</div>
                      <div className="text-xs text-muted-foreground">{courseTitle}</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(h.last_watched_at), { addSuffix: true })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, hint }: { label: string; value: string; icon: any; hint?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary-glow" /> {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
