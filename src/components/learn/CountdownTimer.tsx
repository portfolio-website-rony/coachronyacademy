import { useEffect, useState } from "react";

export function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (diff === 0) return null;
  const parts = [
    { v: d, l: "Days" },
    { v: h, l: "Hours" },
    { v: m, l: "Min" },
    { v: s, l: "Sec" },
  ];
  return (
    <div className="flex items-center gap-2">
      {parts.map((p) => (
        <div key={p.l} className="glass min-w-[58px] rounded-xl px-2 py-2 text-center">
          <div className="font-display text-xl font-bold text-gradient tabular-nums">
            {String(p.v).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.l}</div>
        </div>
      ))}
    </div>
  );
}
