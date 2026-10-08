import type { Application, Job, Lead } from "./types";
import { COMPANY_VISIBLE_STATUSES } from "./labels";

export type Funnel = {
  leads: number;
  emailed: number;
  opened: number;
  clicked: number;
  applied: number;
};

export function leadFunnel(leads: Lead[]): Funnel {
  const f: Funnel = { leads: leads.length, emailed: 0, opened: 0, clicked: 0, applied: 0 };
  for (const l of leads) {
    if (l.emailedAt && l.status !== "bounced") f.emailed++;
    if (l.openedAt) f.opened++;
    if (l.clickedAt) f.clicked++;
    if (l.appliedAt) f.applied++;
  }
  return f;
}

export function jobMetrics(job: Job, leads: Lead[], applications: Application[]) {
  const jl = leads.filter((l) => l.jobId === job.id);
  const ja = applications.filter((a) => a.jobId === job.id);
  const funnel = leadFunnel(jl);
  const spend = job.campaign?.spend ?? 0;
  const scored = ja.filter((a) => a.score != null);
  return {
    funnel,
    applications: ja.length,
    newApplications: ja.filter((a) => a.status === "new").length,
    shortlisted: ja.filter((a) => COMPANY_VISIBLE_STATUSES.includes(a.status)).length,
    hired: ja.filter((a) => a.status === "hired").length,
    knockedOut: ja.filter((a) => a.knockoutFailed).length,
    avgScore: scored.length ? Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length) : null,
    conversion: funnel.leads ? funnel.applied / funnel.leads : 0,
    spend,
    cpl: funnel.leads ? spend / funnel.leads : 0,
    costPerApplication: ja.length ? spend / ja.length : 0,
  };
}

export type DailyPoint = { date: string; label: string; leads: number; applications: number };

export function dailySeries(leads: Lead[], applications: Application[], days = 14): DailyPoint[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const points: DailyPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      leads: 0,
      applications: 0,
    };
  });
  const idx = (iso: string) => Math.floor((new Date(iso).getTime() - start.getTime()) / 86_400_000);
  for (const l of leads) {
    const i = idx(l.createdAt);
    if (i >= 0 && i < days) points[i]!.leads++;
  }
  for (const a of applications) {
    const i = idx(a.createdAt);
    if (i >= 0 && i < days) points[i]!.applications++;
  }
  return points;
}

/** Variación % entre los últimos N días y los N anteriores */
export function trend(items: { createdAt: string }[], days = 7) {
  const now = Date.now();
  const span = days * 86_400_000;
  const cur = items.filter((i) => now - new Date(i.createdAt).getTime() < span).length;
  const prev = items.filter((i) => {
    const age = now - new Date(i.createdAt).getTime();
    return age >= span && age < 2 * span;
  }).length;
  return { current: cur, previous: prev, delta: prev ? (cur - prev) / prev : cur ? 1 : 0 };
}
