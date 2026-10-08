import { cn } from "@/lib/utils";

export function ScoreRing({ score, size = 72, className }: { score: number | null; size?: number; className?: string }) {
  const r = 15.5;
  const circ = 2 * Math.PI * r;
  const value = score ?? 0;
  const color = score == null ? "oklch(0.8 0.01 255)" : value >= 75 ? "oklch(0.64 0.15 155)" : value >= 50 ? "oklch(0.75 0.15 70)" : "oklch(0.6 0.22 25)";
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="oklch(0.94 0.008 255)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-xl font-semibold tabular-nums">{score ?? "—"}</span>
        {score != null && <span className="text-[9px] text-muted-foreground">/100</span>}
      </span>
    </div>
  );
}
