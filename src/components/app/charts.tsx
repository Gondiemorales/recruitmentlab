"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint, Funnel } from "@/lib/metrics";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const BRAND = "oklch(0.55 0.21 262)";
const BRAND_2 = "oklch(0.74 0.14 215)";

export function ActivityChart({ data, height = 260 }: { data: DailyPoint[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="g-leads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_2} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND_2} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-apps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="oklch(0.92 0.012 255)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.52 0.025 260)" }} interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.52 0.025 260)" }} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "oklch(0.88 0.02 255)" }} />
          <Area type="monotone" dataKey="leads" name="Leads" stroke={BRAND_2} strokeWidth={2} fill="url(#g-leads)" />
          <Area type="monotone" dataKey="applications" name="Candidaturas" stroke={BRAND} strokeWidth={2} fill="url(#g-apps)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type TooltipPayload = { name?: string; value?: number; color?: string };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export const CHART_COLORS = { brand: BRAND, brand2: BRAND_2 };

const FUNNEL_STEPS: { key: keyof Funnel; label: string; color: string }[] = [
  { key: "leads", label: "Leads recibidos", color: "bg-brand-2" },
  { key: "emailed", label: "Emails entregados", color: "bg-sky-500" },
  { key: "opened", label: "Emails abiertos", color: "bg-blue-500" },
  { key: "clicked", label: "Clic en la oferta", color: "bg-indigo-500" },
  { key: "applied", label: "Candidaturas", color: "bg-brand" },
];

export function FunnelBars({ funnel, compact }: { funnel: Funnel; compact?: boolean }) {
  const max = Math.max(1, funnel.leads);
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {FUNNEL_STEPS.map((s, i) => {
        const v = funnel[s.key];
        const prev = i === 0 ? v : funnel[FUNNEL_STEPS[i - 1]!.key];
        return (
          <div key={s.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">{v}</span>
                {i > 0 && <span className="w-12 text-right text-muted-foreground tabular-nums">{formatPercent(prev ? v / prev : 0)}</span>}
              </span>
            </div>
            <div className={cn("overflow-hidden rounded-md bg-muted", compact ? "h-2" : "h-2.5")}>
              <div className={cn("h-full rounded-md transition-all duration-700", s.color)} style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
