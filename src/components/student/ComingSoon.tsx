import type { ComponentType } from "react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary-glow">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Coming soon</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
