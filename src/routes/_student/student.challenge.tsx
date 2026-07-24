import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Flame, Trophy, Target, Sparkles, Loader2, PlayCircle, MessageCircle, Users, Share2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";
import { youtubeEmbedUrl } from "@/lib/format";

const CHALLENGE_SLUG = "success-code-30day";
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/coachrony-success-code";

export const Route = createFileRoute("/_student/student/challenge")({
  head: () => ({
    meta: [
      { title: "30-Day Challenge Dashboard — CoachRony" },
      { name: "description", content: "THE SUCCESS CODE™ 30-Day Challenge — daily check-ins, streak & progress." },
    ],
  }),
  component: ChallengeDashboard,
});

type Enrollment = { id: string; started_at: string };
type Progress = { day_number: number; completed_at: string; note: string | null };
type Week = { week_number: number; title: string; description: string | null };
type Day = {
  day_number: number;
  week_number: number;
  title: string;
  task: string | null;
  content: string | null;
  video_url: string | null;
  unlock_offset_days: number;
};

function ChallengeDashboard() {
  const { session, loading: authLoading } = useAuthUser();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [taskDone, setTaskDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      setLoading(true);
      const [{ data: enr }, { data: prog }, { data: wk }, { data: dy }] = await Promise.all([
        supabase.from("challenge_enrollments").select("id,started_at").eq("user_id", session.user.id).eq("challenge_slug", CHALLENGE_SLUG).maybeSingle(),
        supabase.from("challenge_progress").select("day_number,completed_at,note").eq("user_id", session.user.id).eq("challenge_slug", CHALLENGE_SLUG).order("day_number"),
        supabase.from("challenge_weeks").select("week_number,title,description").eq("challenge_slug", CHALLENGE_SLUG).order("week_number"),
        supabase.from("challenge_days").select("day_number,week_number,title,task,content,video_url,unlock_offset_days").eq("challenge_slug", CHALLENGE_SLUG).order("day_number"),
      ]);
      setEnrollment(enr as Enrollment | null);
      setProgress((prog as Progress[]) ?? []);
      setWeeks((wk as Week[]) ?? []);
      setDays((dy as Day[]) ?? []);
      setLoading(false);
    })();
  }, [session]);


  const totalDays = days.length || 30;
  const completed = useMemo(() => new Set(progress.map((p) => p.day_number)), [progress]);
  const completedCount = completed.size;
  const percent = Math.round((completedCount / totalDays) * 100);

  const daysSinceStart = useMemo(() => {
    if (!enrollment) return 0;
    return Math.floor((Date.now() - new Date(enrollment.started_at).getTime()) / (1000 * 60 * 60 * 24));
  }, [enrollment]);

  const currentDay = useMemo(() => {
    if (!enrollment || days.length === 0) return 0;
    const unlocked = days.filter((d) => d.unlock_offset_days <= daysSinceStart);
    if (unlocked.length === 0) return days[0].day_number;
    return unlocked[unlocked.length - 1].day_number;
  }, [enrollment, days, daysSinceStart]);

  const streak = useMemo(() => {
    let s = 0;
    for (let d = currentDay; d >= 1; d--) {
      if (completed.has(d)) s++;
      else break;
    }
    return s;
  }, [completed, currentDay]);


  async function startChallenge() {
    if (!session) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("challenge_enrollments")
      .insert({ user_id: session.user.id, challenge_slug: CHALLENGE_SLUG })
      .select("id,started_at")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setEnrollment(data as Enrollment);
    toast.success("Challenge শুরু হলো! 🔥");
  }

  function openDay(day: number) {
    setSelectedDay(day);
    const existing = progress.find((p) => p.day_number === day);
    setNote(existing?.note ?? "");
    setTaskDone(!!existing);
  }

  async function checkIn() {
    if (!session || selectedDay == null) return;
    setSaving(true);
    const { error } = await supabase.from("challenge_progress").upsert(
      {
        user_id: session.user.id,
        challenge_slug: CHALLENGE_SLUG,
        day_number: selectedDay,
        note: note.slice(0, 500),
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,challenge_slug,day_number" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    const { data: prog } = await supabase
      .from("challenge_progress")
      .select("day_number,completed_at,note")
      .eq("user_id", session.user.id)
      .eq("challenge_slug", CHALLENGE_SLUG)
      .order("day_number");
    setProgress((prog as Progress[]) ?? []);
    toast.success(`Day ${selectedDay} complete! 🎉`);
    setSelectedDay(null);
    setNote("");
    setTaskDone(false);
  }

  if (authLoading || loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">30-Day Challenge</h1>
          <p className="text-sm text-muted-foreground">THE SUCCESS CODE™ 30-Day Success Challenge।</p>
        </div>
        <div className="glass relative overflow-hidden rounded-2xl border border-white/10 p-8 text-center">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-amber-300" />
            <h2 className="font-display text-2xl font-bold">Ready to start your journey?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              ৩০ দিনের transformation program-এ যোগ দিন। প্রতিদিন check-in করুন, streak build করুন, reward জিতুন।
            </p>
            <button
              onClick={startChallenge}
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Start 30-Day Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">30-Day Challenge Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Started {new Date(enrollment.started_at).toLocaleDateString()} • Today is Day {currentDay}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Progress</span>
            <Target className="h-4 w-4 text-primary-glow" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{completedCount}/30</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{percent}% complete</div>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Current Streak</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{streak} 🔥</div>
          <div className="mt-1 text-xs text-muted-foreground">Keep it going!</div>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Days Left</span>
            <Trophy className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{Math.max(0, totalDays - completedCount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">to finish line</div>
        </div>
      </div>

      {/* Private WhatsApp Community + Accountability */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* WhatsApp Community */}
        <div className="glass relative overflow-hidden rounded-2xl border border-emerald-400/20 p-5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Private WhatsApp Community</h3>
                <p className="text-xs text-muted-foreground">শুধু challenge members-দের জন্য</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              প্রতিদিন live support, peer accountability, mentor Q&A এবং exclusive resources পেতে community-তে যোগ দিন।
            </p>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-90"
            >
              <Users className="h-4 w-4" />
              Join WhatsApp Community
            </a>
          </div>
        </div>

        {/* Accountability Partner */}
        <AccountabilityCard
          currentDay={currentDay}
          streak={streak}
          completedCount={completedCount}
          totalDays={totalDays}
        />
      </div>

      {/* Weekly grid */}
      <div className="space-y-4">
        {weeks.map((wk) => {
          const wkDays = days.filter((d) => d.week_number === wk.week_number);
          return (
            <div key={wk.week_number} className="glass rounded-2xl border border-white/10 p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{wk.title}</h3>
                <span className="text-xs text-muted-foreground">{wk.description}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {wkDays.map((d) => {
                  const day = d.day_number;
                  const done = completed.has(day);
                  const isToday = day === currentDay;
                  const locked = d.unlock_offset_days > daysSinceStart;
                  return (
                    <button
                      key={day}
                      onClick={() => !locked && openDay(day)}
                      disabled={locked}
                      title={d.title}
                      className={`group relative aspect-square rounded-xl border p-2 text-left transition ${
                        done
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : isToday
                          ? "border-red-400/50 bg-red-500/10"
                          : locked
                          ? "border-white/5 bg-white/5 opacity-40"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] uppercase text-muted-foreground">Day</span>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-1 font-display text-lg font-bold">{day}</div>
                      {isToday && !done && <div className="text-[10px] font-semibold text-red-300">Today</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>

      {/* Check-in modal */}
      {selectedDay != null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setSelectedDay(null)}>
          <div className="glass w-full max-w-md rounded-2xl border border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">Day {selectedDay}</span>
              {completed.has(selectedDay) && <span className="text-xs text-emerald-400">✓ Already done</span>}
            </div>
            {(() => {
              const d = days.find((x) => x.day_number === selectedDay);
              if (!d) return <h3 className="font-display text-xl font-bold">Daily check-in</h3>;
              return (
                <>
                  <h3 className="font-display text-xl font-bold">{d.title}</h3>
                  {d.task && <p className="mt-2 text-sm font-semibold text-amber-300">🎯 {d.task}</p>}
                  {d.content && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{d.content}</p>}
                  {d.video_url && (() => {
                    const embed = youtubeEmbedUrl(d.video_url);
                    return embed ? (
                      <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                        <iframe
                          src={embed}
                          title={`Day ${d.day_number} video`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <a href={d.video_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-primary-glow underline">
                        Watch video →
                      </a>
                    );
                  })()}
                  <p className="mt-3 text-xs text-muted-foreground">Note রাখুন (optional):</p>
                </>
              );
            })()}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="আজকে যা করেছি / শিখেছি..."
              className="glass mt-4 w-full rounded-xl px-4 py-3 text-sm outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedDay(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                Cancel
              </button>
              <button
                onClick={checkIn}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {completed.has(selectedDay) ? "Update" : "Mark Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountabilityCard({
  currentDay,
  streak,
  completedCount,
  totalDays,
}: {
  currentDay: number;
  streak: number;
  completedCount: number;
  totalDays: number;
}) {
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("accountability_partner");
      if (raw) {
        const p = JSON.parse(raw);
        setPartnerName(p.name ?? "");
        setPartnerPhone(p.phone ?? "");
      }
    } catch {}
  }, []);

  function save() {
    localStorage.setItem("accountability_partner", JSON.stringify({ name: partnerName, phone: partnerPhone }));
    setSaved(true);
    toast.success("Accountability partner saved!");
    setTimeout(() => setSaved(false), 2000);
  }

  function shareProgress() {
    const msg = `🔥 Success Code Challenge Update!\n\nDay ${currentDay}/${totalDays}\n✅ Completed: ${completedCount} days\n🔥 Streak: ${streak} days\n\n#TheSuccessCode #CoachRony`;
    const phone = partnerPhone.replace(/[^0-9]/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-amber-400/20 p-5">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Accountability Partner</h3>
            <p className="text-xs text-muted-foreground">প্রতিদিন progress share করুন</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="Partner name"
            maxLength={60}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            placeholder="WhatsApp number (8801...)"
            maxLength={20}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved ✓" : "Save Partner"}
          </button>
          <button
            onClick={shareProgress}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90"
          >
            <Share2 className="h-4 w-4" />
            Share Today's Progress
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          💡 Tip: প্রতিদিন check-in এর পর partner-কে progress পাঠান — accountability = consistency।
        </p>
      </div>
    </div>
  );
}
