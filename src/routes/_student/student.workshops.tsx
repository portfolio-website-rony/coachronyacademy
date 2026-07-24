import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, ArrowRight, Sparkles, Trophy, Target } from "lucide-react";

export const Route = createFileRoute("/_student/student/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — CoachRony" },
      { name: "description", content: "Join THE SUCCESS CODE™ 30-Day Success Challenge and other live workshops." },
    ],
  }),
  component: WorkshopsPage,
});

function WorkshopsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">My Workshops</h1>
        <p className="text-sm text-muted-foreground">Live workshops, challenges & replays.</p>
      </div>

      {/* Featured workshop */}
      <div className="glass relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
              <Sparkles className="h-3.5 w-3.5" /> Featured Workshop
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              THE SUCCESS CODE™ <br />
              <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
                30-Day Success Challenge
              </span>
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              ৩০ দিনে নিজের Skill, Confidence ও Income Journey শুরু করুন। Daily task, mentorship এবং rewards সহ complete transformation program।
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <CalendarClock className="h-4 w-4 text-red-300" /> 30 Days
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <Target className="h-4 w-4 text-amber-300" /> Daily Tasks
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <Trophy className="h-4 w-4 text-primary-glow" /> Rewards
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/success-code-challenge"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-90"
              >
                Join Challenge <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <img
              src="https://gxyejjexnntgkjianybj.supabase.co/storage/v1/object/public/cms-media/success-code-hero.jpg"
              alt="THE SUCCESS CODE 30-Day Challenge"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Upcoming placeholder */}
      <div className="glass rounded-2xl border border-white/10 p-6 text-center">
        <CalendarClock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="font-semibold">More workshops coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          New live workshops and replays will appear here. Stay tuned!
        </p>
      </div>
    </div>
  );
}
