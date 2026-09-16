import { useEffect, useRef, useState } from "react";
import { Bot, Check, MessageSquareText, Play, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const results = ["Customer Reply", "Follow-up", "Task Created", "Lead Added"] as const;

export function AiEmployeeDemo() {
  const [stage, setStage] = useState(4);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const run = () => {
    stop();
    setStage(0);
    timer.current = setInterval(() => {
      setStage((current) => {
        if (current >= 4) {
          stop();
          return 4;
        }
        return current + 1;
      });
    }, 650);
  };

  useEffect(() => stop, []);

  return (
    <div className="overflow-hidden rounded-lg border border-ai-cyan/25 bg-ai-panel shadow-ai">
      <div className="flex items-center justify-between border-b border-ai-line px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ai-blue/15 text-ai-cyan">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mont text-sm font-semibold">AI Employee</p>
            <p className="flex items-center gap-1.5 text-xs text-ai-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-ai-success" /> Online · Ready
            </p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-ai-cyan" />
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ai-surface text-ai-soft">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="max-w-xl rounded-md border border-ai-line bg-ai-surface px-4 py-3 text-sm leading-relaxed">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-ai-soft">User</span>
            একজন Customer আমার Service সম্পর্কে জানতে চেয়েছে।
          </div>
        </div>

        {stage > 0 && (
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ai-blue/15 text-ai-cyan">
              <Bot className="h-4 w-4" />
            </span>
            <div className="max-w-xl rounded-md border border-ai-cyan/20 bg-ai-blue/10 px-4 py-3 text-sm leading-relaxed">
              <span className="mb-1 block text-[10px] font-semibold uppercase text-ai-cyan">AI Employee</span>
              অবশ্যই। আমি Customer-এর প্রশ্ন অনুযায়ী একটি Professional Reply তৈরি করছি।
            </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((result, index) => {
            const complete = stage > index;
            return (
              <div
                key={result}
                className={`flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm transition-colors ${
                  complete
                    ? "border-ai-success/25 bg-ai-success/10 text-ai-foreground"
                    : "border-ai-line bg-ai-surface text-ai-soft"
                }`}
              >
                {complete ? <Check className="h-4 w-4 text-ai-success" /> : <span className="h-4 w-4 rounded-full border border-ai-line" />}
                {result}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-ai-line pt-5 sm:flex-row">
          <Button onClick={run} className="h-11 bg-ai-blue px-5 text-ai-foreground hover:bg-ai-blue/90">
            <Play className="h-4 w-4" /> Run Demo
          </Button>
          <Button onClick={run} variant="outline" className="h-11 border-ai-line bg-ai-surface px-5 text-ai-foreground hover:bg-ai-blue/10">
            {stage === 4 ? <MessageSquareText className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Try AI Employee
          </Button>
        </div>
      </div>
    </div>
  );
}