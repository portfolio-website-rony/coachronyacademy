import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Sparkles, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const CHALLENGE_SLUG = "success-code-30day";

type Week = {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
};

type Day = {
  id: string;
  day_number: number;
  week_number: number;
  title: string;
  task: string | null;
  content: string | null;
  video_url: string | null;
  unlock_offset_days: number;
};

export const Route = createFileRoute("/_admin/admin/challenge")({
  head: () => ({
    meta: [{ title: "30-Day Challenge — Admin" }],
  }),
  component: ChallengeAdmin,
});

function ChallengeAdmin() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: w }, { data: d }] = await Promise.all([
      supabase
        .from("challenge_weeks")
        .select("id,week_number,title,description")
        .eq("challenge_slug", CHALLENGE_SLUG)
        .order("week_number"),
      supabase
        .from("challenge_days")
        .select("id,day_number,week_number,title,task,content,video_url,unlock_offset_days")
        .eq("challenge_slug", CHALLENGE_SLUG)
        .order("day_number"),
    ]);
    setWeeks((w as Week[]) ?? []);
    setDays((d as Day[]) ?? []);
    if (activeWeek == null && w && w.length) setActiveWeek((w[0] as Week).week_number);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveWeek(week: Week) {
    setSavingId(week.id);
    const { error } = await supabase
      .from("challenge_weeks")
      .update({ title: week.title, description: week.description })
      .eq("id", week.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Week ${week.week_number} saved`);
  }

  async function addWeek() {
    const next = (weeks.at(-1)?.week_number ?? 0) + 1;
    const { data, error } = await supabase
      .from("challenge_weeks")
      .insert({
        challenge_slug: CHALLENGE_SLUG,
        week_number: next,
        title: `Week ${next}`,
        description: "",
      })
      .select("id,week_number,title,description")
      .single();
    if (error) return toast.error(error.message);
    setWeeks((prev) => [...prev, data as Week]);
    setActiveWeek(next);
  }

  async function deleteWeek(w: Week) {
    if (!confirm(`Delete ${w.title}? Days assigned to this week must be reassigned first.`)) return;
    const { error } = await supabase.from("challenge_weeks").delete().eq("id", w.id);
    if (error) return toast.error(error.message);
    setWeeks((prev) => prev.filter((x) => x.id !== w.id));
    if (activeWeek === w.week_number) setActiveWeek(weeks[0]?.week_number ?? null);
    toast.success("Week deleted");
  }

  async function saveDay(day: Day) {
    setSavingId(day.id);
    const { error } = await supabase
      .from("challenge_days")
      .update({
        title: day.title,
        task: day.task,
        content: day.content,
        video_url: day.video_url,
        week_number: day.week_number,
        unlock_offset_days: day.unlock_offset_days,
      })
      .eq("id", day.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Day ${day.day_number} saved`);
  }

  async function addDay() {
    const next = (days.at(-1)?.day_number ?? 0) + 1;
    const week = activeWeek ?? weeks[0]?.week_number ?? 1;
    const { data, error } = await supabase
      .from("challenge_days")
      .insert({
        challenge_slug: CHALLENGE_SLUG,
        day_number: next,
        week_number: week,
        title: `Day ${next}`,
        unlock_offset_days: next - 1,
      })
      .select("id,day_number,week_number,title,task,content,video_url,unlock_offset_days")
      .single();
    if (error) return toast.error(error.message);
    setDays((prev) => [...prev, data as Day]);
  }

  async function deleteDay(d: Day) {
    if (!confirm(`Delete Day ${d.day_number}?`)) return;
    const { error } = await supabase.from("challenge_days").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    setDays((prev) => prev.filter((x) => x.id !== d.id));
    toast.success("Day deleted");
  }

  function updateDayLocal(id: string, patch: Partial<Day>) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }
  function updateWeekLocal(id: string, patch: Partial<Week>) {
    setWeeks((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  const visibleDays = activeWeek == null ? days : days.filter((d) => d.week_number === activeWeek);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">30-Day Challenge</h1>
          <p className="text-sm text-muted-foreground">
            Weeks, daily content, and unlock schedule for THE SUCCESS CODE™ 30-Day Challenge.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addWeek}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <Plus className="h-4 w-4" /> Add week
          </button>
          <button
            onClick={addDay}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-3 py-2 text-sm font-semibold text-background shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add day
          </button>
        </div>
      </div>

      {/* Weeks */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-glow" />
          <h2 className="font-display text-lg font-bold">Weekly themes</h2>
        </div>
        <div className="space-y-3">
          {weeks.map((w) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="grid gap-3 sm:grid-cols-[80px_1fr_2fr_auto]">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Week #</label>
                  <div className="mt-1 rounded-lg bg-black/30 px-3 py-2 font-display text-lg font-bold">
                    {w.week_number}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Title</label>
                  <input
                    value={w.title}
                    onChange={(e) => updateWeekLocal(w.id, { title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Description</label>
                  <input
                    value={w.description ?? ""}
                    onChange={(e) => updateWeekLocal(w.id, { description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => saveWeek(w)}
                    disabled={savingId === w.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/20 px-3 py-2 text-xs text-primary-glow hover:bg-primary/30 disabled:opacity-60"
                  >
                    {savingId === w.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                  <button
                    onClick={() => deleteWeek(w)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300 hover:bg-red-500/25"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveWeek(null)}
          className={`rounded-lg px-3 py-1.5 text-xs ${
            activeWeek == null ? "bg-primary text-background" : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          All days
        </button>
        {weeks.map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveWeek(w.week_number)}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              activeWeek === w.week_number
                ? "bg-primary text-background"
                : "border border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            Week {w.week_number}
          </button>
        ))}
      </div>

      {/* Create daily challenge form */}
      <NewDayForm
        weeks={weeks}
        defaultWeek={activeWeek ?? weeks[0]?.week_number ?? 1}
        nextDayNumber={(days.at(-1)?.day_number ?? 0) + 1}
        onCreated={(d) => setDays((prev) => [...prev, d])}
      />

      {/* Days */}
      <div className="space-y-3">
        {visibleDays.map((d) => (
          <div key={d.id} className="glass rounded-2xl border border-white/10 p-4">
            <div className="grid gap-3 md:grid-cols-[90px_1fr]">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-amber-500 font-display text-2xl font-bold text-white md:h-full md:w-full">
                {d.day_number}
              </div>
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">Title</label>
                    <input
                      value={d.title}
                      onChange={(e) => updateDayLocal(d.id, { title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">Week</label>
                    <select
                      value={d.week_number}
                      onChange={(e) => updateDayLocal(d.id, { week_number: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                    >
                      {weeks.map((w) => (
                        <option key={w.id} value={w.week_number}>
                          Week {w.week_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">
                      Unlock offset (days after enroll)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={d.unlock_offset_days}
                      onChange={(e) =>
                        updateDayLocal(d.id, { unlock_offset_days: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Task (one-line)</label>
                  <input
                    value={d.task ?? ""}
                    onChange={(e) => updateDayLocal(d.id, { task: e.target.value })}
                    placeholder="আজকের একটাই কাজ..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Content / instructions</label>
                  <textarea
                    value={d.content ?? ""}
                    onChange={(e) => updateDayLocal(d.id, { content: e.target.value })}
                    rows={3}
                    placeholder="বিস্তারিত instructions, tips, resources..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">Video URL (optional)</label>
                  <input
                    value={d.video_url ?? ""}
                    onChange={(e) => updateDayLocal(d.id, { video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => deleteDay(d)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/25"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <button
                    onClick={() => saveDay(d)}
                    disabled={savingId === d.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-4 py-1.5 text-xs font-semibold text-background shadow-glow disabled:opacity-60"
                  >
                    {savingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {visibleDays.length === 0 && (
          <div className="glass rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No days in this week yet. Click "Add day" above.
          </div>
        )}
      </div>
    </div>
  );
}

function NewDayForm({
  weeks,
  defaultWeek,
  nextDayNumber,
  onCreated,
}: {
  weeks: Week[];
  defaultWeek: number;
  nextDayNumber: number;
  onCreated: (d: Day) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dayNumber, setDayNumber] = useState(nextDayNumber);
  const [weekNumber, setWeekNumber] = useState(defaultWeek);
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDayNumber(nextDayNumber);
  }, [nextDayNumber]);
  useEffect(() => {
    setWeekNumber(defaultWeek);
  }, [defaultWeek]);

  const unlockOffset = releaseDate
    ? Math.max(0, Math.round((releaseDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000))
    : dayNumber - 1;

  async function submit() {
    if (!title.trim()) return toast.error("Title দিন");
    setSaving(true);
    const { data, error } = await supabase
      .from("challenge_days")
      .insert({
        challenge_slug: CHALLENGE_SLUG,
        day_number: dayNumber,
        week_number: weekNumber,
        title: title.trim(),
        task: task.trim() || null,
        video_url: videoUrl.trim() || null,
        content: content.trim() || null,
        unlock_offset_days: unlockOffset,
      })
      .select("id,day_number,week_number,title,task,content,video_url,unlock_offset_days")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    onCreated(data as Day);
    toast.success(`Day ${dayNumber} created`);
    setTitle("");
    setTask("");
    setVideoUrl("");
    setContent("");
    setDayNumber((n) => n + 1);
  }

  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary-glow" />
          <span className="font-display text-lg font-bold">Create a daily challenge</span>
        </span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Release date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "mt-1 flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left text-sm outline-none",
                      !releaseDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {releaseDate ? format(releaseDate, "PPP") : "Pick a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={releaseDate}
                    onSelect={setReleaseDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Unlocks {unlockOffset} day{unlockOffset === 1 ? "" : "s"} after enrollment
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Day #</label>
              <input
                type="number"
                min={1}
                value={dayNumber}
                onChange={(e) => setDayNumber(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Week</label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
              >
                {weeks.map((w) => (
                  <option key={w.week_number} value={w.week_number}>
                    Week {w.week_number} — {w.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Day title..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-muted-foreground">Task (one-line)</label>
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="আজকের একটাই কাজ..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-muted-foreground">Video URL (YouTube)</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-muted-foreground">Content / instructions</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="বিস্তারিত instructions, tips, resources..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create day
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
