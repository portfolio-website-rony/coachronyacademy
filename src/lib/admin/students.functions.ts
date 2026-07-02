import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export type StudentCourse = {
  enrollment_id: string;
  course_id: string;
  title: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  progress: number;
};

export type StudentRow = {
  user_id: string;
  email: string | null;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  courses: StudentCourse[];
};

export const listAllStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentRow[]> => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const { data: enrollments, error: enrErr } = await supabase
      .from("enrollments")
      .select("id,user_id,course_id,status,enrolled_at,completed_at,course:courses(id,title)")
      .order("enrolled_at", { ascending: false });
    if (enrErr) throw new Error(enrErr.message);
    if (!enrollments || enrollments.length === 0) return [];

    const userIds = Array.from(new Set(enrollments.map((e: any) => e.user_id)));
    const courseIds = Array.from(new Set(enrollments.map((e: any) => e.course_id).filter(Boolean) as string[]));

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: lessons }, { data: progress }, authRes] = await Promise.all([
      supabase.from("profiles").select("id,display_name,phone,avatar_url,created_at").in("id", userIds),
      supabase
        .from("course_lessons")
        .select("id, course_modules!inner(course_id)")
        .in("course_modules.course_id", courseIds.length ? courseIds : ["00000000-0000-0000-0000-000000000000"]),
      supabase
        .from("lesson_progress")
        .select("enrollment_id, completed_at")
        .in("enrollment_id", enrollments.map((e: any) => e.id))
        .not("completed_at", "is", null),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const emailMap = new Map((authRes.data?.users ?? []).map((u: any) => [u.id, u.email ?? null]));

    const lessonsPerCourse = new Map<string, number>();
    (lessons ?? []).forEach((l: any) => {
      const cid = l.course_modules?.course_id;
      if (!cid) return;
      lessonsPerCourse.set(cid, (lessonsPerCourse.get(cid) ?? 0) + 1);
    });

    const donePerEnrollment = new Map<string, number>();
    (progress ?? []).forEach((p: any) => {
      donePerEnrollment.set(p.enrollment_id, (donePerEnrollment.get(p.enrollment_id) ?? 0) + 1);
    });

    const byUser = new Map<string, StudentRow>();
    for (const e of enrollments as any[]) {
      const profile: any = pmap.get(e.user_id);
      let row = byUser.get(e.user_id);
      if (!row) {
        row = {
          user_id: e.user_id,
          email: (emailMap.get(e.user_id) as string | null) ?? null,
          name: profile?.display_name ?? "Unnamed",
          phone: profile?.phone ?? null,
          avatar_url: profile?.avatar_url ?? null,
          created_at: profile?.created_at ?? null,
          courses: [],
        };
        byUser.set(e.user_id, row);
      }
      const total = e.course_id ? lessonsPerCourse.get(e.course_id) ?? 0 : 0;
      const done = donePerEnrollment.get(e.id) ?? 0;
      row.courses.push({
        enrollment_id: e.id,
        course_id: e.course_id ?? "",
        title: (e.course as any)?.title ?? "—",
        status: e.status,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      });
    }

    return Array.from(byUser.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

export const revokeEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ enrollmentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("enrollments").delete().eq("id", data.enrollmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCoursesForEnroll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("courses")
      .select("id,title,slug,published")
      .order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const manualEnroll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().toLowerCase().email().max(255),
      courseId: z.string().uuid(),
      status: z.enum(["active", "completed"]).default("active"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const { data: foundId, error: lookupErr } = await supabase.rpc("get_user_id_by_email", { _email: data.email });
    if (lookupErr) throw new Error(lookupErr.message);
    if (!foundId) {
      throw new Error("No user found with this email. Ask them to sign up first.");
    }


    const { data: existing } = await supabase
      .from("enrollments")
      .select("id,status")
      .eq("user_id", foundId)
      .eq("course_id", data.courseId)
      .maybeSingle();

    if (existing) {
      if (existing.status !== data.status) {
        const patch: { status: string; completed_at?: string | null } = { status: data.status };
        if (data.status === "completed") patch.completed_at = new Date().toISOString();
        const { error } = await supabase.from("enrollments").update(patch).eq("id", existing.id);
        if (error) throw new Error(error.message);
      }
      return { ok: true, alreadyEnrolled: true };
    }

    const { error: insErr } = await supabase.from("enrollments").insert({
      user_id: foundId,
      course_id: data.courseId,
      status: data.status,
      completed_at: data.status === "completed" ? new Date().toISOString() : null,
    });
    if (insErr) throw new Error(insErr.message);
    return { ok: true, alreadyEnrolled: false };
  });
