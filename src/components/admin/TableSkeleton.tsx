export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="grid border-b border-white/10 bg-white/[0.03] px-4 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 w-16 animate-pulse rounded bg-white/10" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid border-b border-white/5 px-4 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3 w-24 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ))}
    </div>
  );
}
