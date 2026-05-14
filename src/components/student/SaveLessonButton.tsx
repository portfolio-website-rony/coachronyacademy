import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";

export function SaveLessonButton({ lessonId }: { lessonId: string }) {
  const { session } = useAuthUser();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("lesson_saves")
      .select("lesson_id")
      .eq("user_id", session.user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [session, lessonId]);

  async function toggle() {
    if (!session) return toast.error("Sign in required");
    setBusy(true);
    const wasSaved = saved;
    setSaved(!wasSaved);
    const { error } = wasSaved
      ? await supabase.from("lesson_saves").delete().eq("user_id", session.user.id).eq("lesson_id", lessonId)
      : await supabase.from("lesson_saves").insert({ user_id: session.user.id, lesson_id: lessonId });
    setBusy(false);
    if (error) {
      setSaved(wasSaved);
      toast.error(error.message);
    } else {
      toast.success(wasSaved ? "Removed from saved" : "Saved for later");
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
    >
      {saved ? <BookmarkCheck className="h-4 w-4 text-primary-glow" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
