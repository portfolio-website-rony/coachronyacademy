import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Flame,
  Trophy,
  Star,
  Rocket,
  Award,
  Crown,
  Sparkles,
  Target,
  Zap,
  Medal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Progress = { day_number: number; completed_at: string | null };

type Badge = {
  id: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  earned: boolean;
  tone: string; // tailwind color group
  earnedAt?: string;
};

function computeBadges(rows: Progress[]): Badge[] {
  const done = rows.filter((r) => r.completed_at).sort((a, b) => a.day_number - b.day_number);
  const doneDays = new Set(done.map((r) => r.day_number));
  const total = done.length;

  // best streak (consecutive day_number)
  let best = 0, cur = 0, prev = -1;
  for (const r of done) {
    if (r.day_number === prev + 1) cur += 1;
    else cur = 1;
    if (cur > best) best = cur;
    prev = r.day_number;
  }

  const earnedAtDay = (n: number) =>
    done.find((r) => r.day_number === n)?.completed_at ?? undefined;

  const weekComplete = (w: number) => {
    const start = (w - 1) * 7 + 1;
    for (let d = start; d < start + 7 && d <= 30; d++) if (!doneDays.has(d)) return undefined;
    // earned at last day of week
    const last = Math.min(start + 6, 30);
    return earnedAtDay(last);
  };

  const w1 = weekComplete(1);
  const w2 = weekComplete(2);
  const w3 = weekComplete(3);
  const w4 = weekComplete(4);

  return [
    {
      id: "first-step",
      title: "First Step",
      desc: "Complete Day 1",
      Icon: Rocket,
      earned: doneDays.has(1),
      earnedAt: earnedAtDay(1),
      tone: "from-sky-400 to-blue-600 text-sky-100",
    },
    {
      id: "streak-3",
      title: "On Fire",
      desc: "3-day streak",
      Icon: Flame,
      earned: best >= 3,
      tone: "from-orange-400 to-red-600 text-orange-100",
    },
    {
      id: "week-1",
      title: "Week 1 Champion",
      desc: "Complete all 7 days of Week 1",
      Icon: Star,
      earned: !!w1,
      earnedAt: w1,
      tone: "from-emerald-400 to-teal-600 text-emerald-100",
    },
    {
      id: "streak-7",
      title: "Streak Master",
      desc: "7-day streak",
      Icon: Zap,
      earned: best >= 7,
      tone: "from-yellow-400 to-amber-600 text-yellow-100",
    },
    {
      id: "week-2",
      title: "Week 2 Warrior",
      desc: "Complete all 7 days of Week 2",
      Icon: Medal,
      earned: !!w2,
      earnedAt: w2,
      tone: "from-cyan-400 to-blue-600 text-cyan-100",
    },
    {
      id: "halfway",
      title: "Halfway Hero",
      desc: "Complete 15 days",
      Icon: Target,
      earned: total >= 15,
      tone: "from-fuchsia-400 to-purple-600 text-fuchsia-100",
    },
    {
      id: "week-3",
      title: "Week 3 Achiever",
      desc: "Complete all 7 days of Week 3",
      Icon: Award,
      earned: !!w3,
      earnedAt: w3,
      tone: "from-rose-400 to-pink-600 text-rose-100",
    },
    {
      id: "week-4",
      title: "Week 4 Legend",
      desc: "Complete all days of Week 4",
      Icon: Crown,
      earned: !!w4,
      earnedAt: w4,
      tone: "from-amber-300 to-yellow-600 text-amber-100",
    },
    {
      id: "streak-14",
      title: "Unstoppable",
      desc: "14-day streak",
      Icon: Sparkles,
      earned: best >= 14,
      tone: "from-violet-400 to-indigo-600 text-violet-100",
    },
    {
      id: "complete-30",
      title: "Success Code Graduate",
      desc: "Complete all 30 days",
      Icon: Trophy,
      earned: total >= 30,
      tone: "from-yellow-300 via-amber-400 to-orange-600 text-yellow-50",
    },
  ];
}

export function AchievementBadges({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const [rows, setRows] = useState<Progress[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from("challenge_progress")
      .select("day_number,completed_at")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!cancelled) setRows((data as Progress[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const badges = useMemo(() => computeBadges(rows ?? []), [rows]);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">🏆 Achievement Badges</h3>
          <p className="text-xs text-muted-foreground">
            {rows === null ? "Loading…" : `${earnedCount} of ${badges.length} unlocked`}
          </p>
        </div>
        {earnedCount > 0 && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow">
            Level {Math.max(1, Math.ceil(earnedCount / 2))}
          </span>
        )}
      </div>

      <div
        className={`grid gap-3 ${
          compact ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        }`}
      >
        {badges.map((b) => {
          const Icon = b.Icon;
          return (
            <div
              key={b.id}
              title={b.earnedAt ? `${b.desc} · ${new Date(b.earnedAt).toLocaleDateString()}` : b.desc}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                b.earned
                  ? "border-white/15 bg-white/5 hover:scale-[1.03]"
                  : "border-white/5 bg-white/[0.02] opacity-50 grayscale"
              }`}
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br shadow-lg ${
                  b.earned ? b.tone : "from-white/10 to-white/5 text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-h-0 leading-tight">
                <div className="text-[11px] font-semibold">{b.title}</div>
                <div className="text-[10px] text-muted-foreground">{b.desc}</div>
              </div>
              {b.earned && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
