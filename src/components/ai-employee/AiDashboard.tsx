import { Bot, CheckCircle2, ListChecks, MessageSquareText, Network, Zap } from "lucide-react";

const modules = [
  { label: "Customer Messages", value: "12", icon: MessageSquareText },
  { label: "Task Management", value: "08", icon: ListChecks },
  { label: "Automation", value: "06", icon: Zap },
] as const;

export function AiDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-xl rounded-lg border border-ai-cyan/25 bg-ai-panel p-3 shadow-ai sm:p-4">
      <div className="flex items-center justify-between border-b border-ai-line pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ai-blue text-ai-foreground"><Bot className="h-4 w-4" /></span>
          <div><p className="text-xs font-semibold">AI Employee OS</p><p className="text-[10px] text-ai-soft">Business operations</p></div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-ai-soft"><i className="h-1.5 w-1.5 rounded-full bg-ai-success" /> Live</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {modules.map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-0 rounded-md border border-ai-line bg-ai-surface p-3">
            <Icon className="h-4 w-4 text-ai-cyan" />
            <p className="mt-4 text-lg font-bold">{value}</p>
            <p className="mt-1 text-[9px] leading-tight text-ai-soft sm:text-[10px]">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-md border border-ai-line bg-ai-surface p-3">
          <div className="flex items-center justify-between"><p className="text-[11px] font-semibold">Business Workflow</p><Network className="h-3.5 w-3.5 text-ai-cyan" /></div>
          <div className="mt-4 flex items-center gap-1.5">
            {["Lead", "AI Agent", "Reply", "Task"].map((item, index) => (
              <div key={item} className="contents">
                <span className="flex-1 rounded-sm border border-ai-blue/25 bg-ai-blue/10 px-1 py-2 text-center text-[8px] text-ai-soft">{item}</span>
                {index < 3 && <span className="h-px w-2 bg-ai-cyan/60" />}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-ai-line bg-ai-surface p-3">
          <p className="text-[11px] font-semibold">AI Agent Activity</p>
          <div className="mt-3 space-y-2">
            {["Reply prepared", "Follow-up scheduled", "Lead updated"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[9px] text-ai-soft"><CheckCircle2 className="h-3 w-3 text-ai-success" />{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}