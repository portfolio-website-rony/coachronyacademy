import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeLesson, askLessonQuestion } from "@/lib/lesson-ai.functions";
import { Sparkles, Send, Loader2, BookOpenCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type SummaryShape = { summary?: string[]; takeaways?: string[]; quiz?: string[] };
type Msg = { role: "user" | "assistant"; content: string };

export function AiTutorPanel({ lessonId }: { lessonId: string }) {
  const [tab, setTab] = useState<"summary" | "ask">("summary");
  const summarize = useServerFn(summarizeLesson);
  const ask = useServerFn(askLessonQuestion);

  const [summary, setSummary] = useState<SummaryShape | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSummary(null);
    setMessages([]);
  }, [lessonId]);

  async function loadSummary() {
    setLoadingSummary(true);
    try {
      const res: any = await summarize({ data: { lessonId } });
      setSummary(res.summary as SummaryShape);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load summary");
    } finally {
      setLoadingSummary(false);
    }
  }

  useEffect(() => {
    if (tab === "summary" && !summary && !loadingSummary) void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, lessonId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, asking]);

  async function send() {
    const q = input.trim();
    if (!q || asking) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setAsking(true);
    try {
      const res: any = await ask({
        data: { lessonId, question: q, history: messages.slice(-10) },
      });
      setMessages([...next, { role: "assistant", content: res.answer }]);
    } catch (e: any) {
      toast.error(e?.message ?? "AI error");
      setMessages(next); // keep user msg
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="glass flex h-fit flex-col rounded-2xl p-3 lg:sticky lg:top-4">
      <div className="flex items-center gap-2 px-1 pb-2">
        <Sparkles className="h-4 w-4 text-primary-glow" />
        <h3 className="font-display text-sm font-bold">AI Tutor</h3>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1 text-xs">
        <button
          onClick={() => setTab("summary")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 ${tab === "summary" ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BookOpenCheck className="h-3.5 w-3.5" /> Summary
        </button>
        <button
          onClick={() => setTab("ask")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 ${tab === "ask" ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Ask
        </button>
      </div>

      {tab === "summary" ? (
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 text-sm">
          {loadingSummary && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </div>
          )}
          {summary && (
            <>
              {!!summary.summary?.length && (
                <Section title="Summary">
                  <ul className="ml-4 list-disc space-y-1.5">
                    {summary.summary.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </Section>
              )}
              {!!summary.takeaways?.length && (
                <Section title="Key takeaways">
                  <ul className="ml-4 list-decimal space-y-1.5">
                    {summary.takeaways.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </Section>
              )}
              {!!summary.quiz?.length && (
                <Section title="Quick quiz">
                  <ul className="ml-4 list-decimal space-y-1.5">
                    {summary.quiz.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </Section>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <div ref={scrollRef} className="max-h-[55vh] min-h-32 space-y-3 overflow-y-auto pr-1 text-sm">
            {messages.length === 0 && !asking && (
              <p className="text-muted-foreground">Ask anything about this lesson.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "rounded-xl bg-primary/15 p-2.5" : "rounded-xl bg-white/5 p-2.5"}>
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
              placeholder="Ask the AI tutor…"
              disabled={asking}
              className="flex-1 rounded-xl border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50 disabled:opacity-50"
            />
            <button
              onClick={() => void send()}
              disabled={asking || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-background disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-primary-glow">{title}</div>
      {children}
    </div>
  );
}
