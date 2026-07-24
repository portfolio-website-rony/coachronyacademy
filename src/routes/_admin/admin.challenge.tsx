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
