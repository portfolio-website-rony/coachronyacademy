import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_student/student/courses")({
  head: () => ({ meta: [{ title: "Course Catalog — CoachRony" }] }),
  component: CatalogPage,
});

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  level: string;
  category: string | null;
};

function CatalogPage() {
  const { session } = useAuthUser();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  async function load() {
    const [{ data: c }, { data: e }] = await Promise.all([
      supabase
        .from("courses")
        .select("id,title,slug,description,cover_url,level,category")
        .eq("published", true)
        .order("display_order"),
      session
        ? supabase.from("enrollments").select("course_id").eq("user_id", session.user.id)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    setCourses((c as Course[]) ?? []);
    setEnrolledIds(new Set((e ?? []).map((x: any) => x.course_id)));
  }
  useEffect(() => {
    void load();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Course catalog</h1>
        <p className="text-sm text-muted-foreground">Free enrollment — pick a course and start learning.</p>
      </div>
      {courses === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : courses.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No courses available yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const isEnrolled = enrolledIds.has(c.id);
            return (
              <div key={c.id} className="glass overflow-hidden rounded-2xl">
                <div className="aspect-video relative bg-gradient-primary/30">
                  {c.cover_url ? (
                    <img src={c.cover_url} alt={c.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-primary-glow/60">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-display text-lg font-bold">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 capitalize">{c.level}</span>
                    {c.category && <span>· {c.category}</span>}
                  </div>
                  {isEnrolled ? (
                    <Link
                      to="/student/courses/$slug"
                      params={{ slug: c.slug }}
                      className="block rounded-xl bg-gradient-primary px-3 py-2 text-center text-sm font-semibold text-background"
                    >
                      Continue →
                    </Link>
                  ) : (
                    <Link
                      to="/course/$slug"
                      params={{ slug: c.slug }}
                      className="block rounded-xl border border-primary/40 px-3 py-2 text-center text-sm font-semibold text-primary-glow hover:bg-primary/10"
                    >
                      View details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
