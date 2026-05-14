import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const DAILY_LIMIT = 20;

type LessonContext = {
  lessonId: string;
  lessonTitle: string;
  lessonDescription: string | null;
  courseTitle: string;
  courseDescription: string | null;
};

async function loadLessonContext(supabase: any, lessonId: string): Promise<LessonContext> {
  const { data: lesson, error } = await supabase
    .from("course_lessons")
    .select("id,title,description,module:course_modules(course:courses(title,description))")
    .eq("id", lessonId)
    .maybeSingle();
  if (error || !lesson) throw new Error("Lesson not found or access denied");
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonDescription: lesson.description ?? null,
    courseTitle: lesson.module?.course?.title ?? "Course",
    courseDescription: lesson.module?.course?.description ?? null,
  };
}

async function callGateway(messages: { role: string; content: string }[]) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (res.status === 429) throw new Error("AI rate limit reached. Try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
  if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return content as string;
}

export const summarizeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;

    // Cache check (RLS-protected)
    const { data: cached } = await supabase
      .from("lesson_ai_summaries")
      .select("summary,model,created_at")
      .eq("lesson_id", data.lessonId)
      .maybeSingle();
    if (cached) return { cached: true, ...cached };

    const ctx = await loadLessonContext(supabase, data.lessonId);
    const prompt = `You are an expert tutor. For the lesson below, produce JSON with keys:
- "summary": array of exactly 5 concise bullet strings
- "takeaways": array of exactly 3 key takeaway strings
- "quiz": array of exactly 3 short quiz question strings (no answers)

Course: ${ctx.courseTitle}
${ctx.courseDescription ? `Course context: ${ctx.courseDescription}\n` : ""}Lesson: ${ctx.lessonTitle}
${ctx.lessonDescription ? `Lesson description: ${ctx.lessonDescription}` : ""}

Return ONLY valid JSON, no markdown fences.`;

    const raw = await callGateway([
      { role: "system", content: "You return only valid JSON. No markdown, no commentary." },
      { role: "user", content: prompt },
    ]);

    let parsed: any;
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: [raw], takeaways: [], quiz: [] };
    }

    // Write cache via the same authenticated client (RLS allows authenticated insert? No — we need service role)
    // Use admin client for the cache write
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("lesson_ai_summaries").upsert({
      lesson_id: data.lessonId,
      summary: parsed,
      model: MODEL,
    });

    return { cached: false, summary: parsed, model: MODEL, created_at: new Date().toISOString() };
  });

export const askLessonQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      lessonId: z.string().uuid(),
      question: z.string().min(1).max(2000),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .max(20)
        .optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    // Daily quota
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("lesson_ai_queries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= DAILY_LIMIT) {
      throw new Error(`Daily AI question limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`);
    }

    const ctx = await loadLessonContext(supabase, data.lessonId);
    const system = `You are an AI tutor for the lesson "${ctx.lessonTitle}" in the course "${ctx.courseTitle}". ${ctx.lessonDescription ? `Lesson description: ${ctx.lessonDescription}.` : ""} Stay focused on this lesson's topic. If a question is off-topic, gently redirect. Use markdown for clarity.`;

    const messages = [
      { role: "system", content: system },
      ...(data.history ?? []),
      { role: "user", content: data.question },
    ];

    const answer = await callGateway(messages);

    // Log usage
    await supabase.from("lesson_ai_queries").insert({ user_id: userId, lesson_id: data.lessonId });

    return { answer, remaining: Math.max(0, DAILY_LIMIT - (count ?? 0) - 1) };
  });
