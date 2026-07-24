import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Flame, Medal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "30-Day Challenge Leaderboard — CoachRony" },
      { name: "description", content: "THE SUCCESS CODE™ 30-Day Challenge leaderboard — top students by completed days and best streak." },
      { property: "og:title", content: "30-Day Challenge Leaderboard — CoachRony" },
      { property: "og:description", content: "See who is leading THE SUCCESS CODE™ 30-Day Challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderboardPage,
});

type Row = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  completed_days: number;
  best_streak: number;
};

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.rpc("challenge_leaderboard", {
        _slug: "success-code-30day",
        _limit: 25,
      });
      if (error) setError(error.message);
      else setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const byStreak = [...rows].sort((a, b) => b.best_streak - a.best_streak || b.completed_days - a.completed_days).slice(0, 10);
  const byCompleted = [...rows].sort((a, b) => b.completed_days - a.completed_days || b.best_streak - a.best_streak).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 shadow-glow">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">30-Day Challenge Leaderboard</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            THE SUCCESS CODE™ 30-Day Challenge-এ শীর্ষে থাকা শিক্ষার্থীরা। প্রতিদিনের check-in থেকে live update।
          </p>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
            এখনো কেউ check-in করেনি। প্রথম হতে চান? Challenge join করুন।
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Board title="Top Completed Days" icon={<Medal className="h-4 w-4 text-amber-300" />} rows={byCompleted} metric="completed" />
            <Board title="Top Streaks" icon={<Flame className="h-4 w-4 text-orange-400" />} rows={byStreak} metric="streak" />
          </div>
        )}
      </div>
    </div>
  );
}

function Board({
  title,
  icon,
  rows,
  metric,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Row[];
  metric: "completed" | "streak";
}) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      <ol className="space-y-2">
        {rows.map((r, i) => {
          const value = metric === "completed" ? r.completed_days : r.best_streak;
          const suffix = metric === "completed" ? "days" : "🔥";
          return (
            <li
              key={r.user_id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                i === 0
                  ? "border-amber-400/40 bg-amber-500/10"
                  : i === 1
                    ? "border-white/20 bg-white/10"
                    : i === 2
                      ? "border-orange-400/30 bg-orange-500/10"
                      : "border-white/10 bg-white/5"
              }`}
            >
              <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">{i + 1}</span>
              {r.avatar_url ? (
                <img src={r.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-xs font-bold text-white">
                  {r.display_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="flex-1 truncate text-sm">{r.display_name}</span>
              <span className="font-display text-sm font-bold">
                {value} <span className="text-xs text-muted-foreground">{suffix}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
