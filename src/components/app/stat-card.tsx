import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  invertDelta,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  /** Variación relativa (0.12 = +12 %) */
  delta?: number;
  hint?: string;
  /** Si bajar es bueno (p. ej. coste) */
  invertDelta?: boolean;
  className?: string;
}) {
  const positive = delta !== undefined && (invertDelta ? delta <= 0 : delta >= 0);
  return (
    <div className={cn("rounded-2xl border bg-white p-5 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", positive ? "text-emerald-600" : "text-rose-600")}>
            {delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {delta >= 0 ? "+" : ""}
            {Math.round(delta * 100)} %
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
