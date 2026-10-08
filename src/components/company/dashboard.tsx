"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Euro, Megaphone, Percent, Plus, Users, Zap } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import { dailySeries, jobMetrics, leadFunnel, trend } from "@/lib/metrics";
import { formatEuroCents, formatPercent, timeAgo } from "@/lib/format";
import { PageHeader, Panel } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { ActivityChart, ChartLegend, CHART_COLORS, FunnelBars } from "@/components/app/charts";
import { CompanyLogo, MetaIcon, PersonAvatar } from "@/components/shared/brand";
import { ApplicationStatusBadge, JobStatusBadge, ScoreBadge } from "@/components/shared/tone-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { SimulateLeadDialog } from "./simulate-lead-dialog";
import { ActivityFeed } from "./activity-feed";

export function CompanyDashboard() {
  const session = useDemo((s) => s.session);
  const { jobs, leads, applications, companies } = useScopedData();
  const [simOpen, setSimOpen] = useState(false);

  const stats = useMemo(() => {
    const leadTrend = trend(leads);
    const appTrend = trend(applications);
    const spend = jobs.reduce((s, j) => s + (j.campaign?.spend ?? 0), 0);
    const funnel = leadFunnel(leads);
    return {
      leadTrend,
      appTrend,
      spend,
      funnel,
      conversion: funnel.leads ? funnel.applied / funnel.leads : 0,
      cpa: applications.length ? spend / applications.length : 0,
      series: dailySeries(leads, applications, 14),
    };
  }, [jobs, leads, applications]);

  // Todas las ofertas con campaña: primero las activas, luego por volumen de leads
  const campaignJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.campaign || j.status === "active")
        .map((j) => ({ job: j, company: companies.find((c) => c.id === j.companyId), m: jobMetrics(j, leads, applications) }))
        .sort((a, b) => Number(b.job.status === "active") - Number(a.job.status === "active") || b.m.funnel.leads - a.m.funnel.leads),
    [jobs, companies, leads, applications],
  );
  const activeCount = campaignJobs.filter((x) => x.job.status === "active").length;

  const newCount = applications.filter((a) => a.status === "new").length;
  const toReview = applications.filter((a) => a.status === "new" && !a.knockoutFailed).slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 13 ? "Buenos días" : hour < 21 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${session?.name ?? ""} 👋`}
        description={`Tienes ${newCount} candidaturas nuevas y ${activeCount} ${activeCount === 1 ? "oferta activa" : "ofertas activas"}.`}
        actions={
          <>
            <Button variant="outline" size="lg" onClick={() => setSimOpen(true)}>
              <MetaIcon className="text-meta" /> Lead de prueba
            </Button>
            <Link href="/portal/ofertas/nueva" className={buttonVariants({ size: "lg" })}>
              <Plus data-icon="inline-start" /> Nueva oferta
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads (7 días)" value={stats.leadTrend.current} icon={Megaphone} delta={stats.leadTrend.delta} hint="vs semana anterior" />
        <StatCard label="Candidaturas (7 días)" value={stats.appTrend.current} icon={Users} delta={stats.appTrend.delta} hint="vs semana anterior" />
        <StatCard label="Conversión lead → candidatura" value={formatPercent(stats.conversion)} icon={Percent} hint="Portales: ~10 %" />
        <StatCard label="Coste por candidatura" value={formatEuroCents(stats.cpa)} icon={Euro} hint={`Inversión total ${formatEuroCents(stats.spend)}`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Actividad de las campañas"
          description="Últimos 14 días"
          actions={
            <ChartLegend
              items={[
                { label: "Leads", color: CHART_COLORS.brand2 },
                { label: "Candidaturas", color: CHART_COLORS.brand },
              ]}
            />
          }
        >
          <ActivityChart data={stats.series} />
        </Panel>
        <Panel title="Embudo global" description="De lead de Meta a candidatura completada">
          <FunnelBars funnel={stats.funnel} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Campañas"
          bodyClassName="p-0"
          actions={
            <Link href="/portal/ofertas" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Oferta</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 text-right font-medium">Leads</th>
                  <th className="px-3 py-3 text-right font-medium">Candidaturas</th>
                  <th className="px-3 py-3 text-right font-medium">Conversión</th>
                  <th className="px-5 py-3 text-right font-medium">Coste/lead</th>
                </tr>
              </thead>
              <tbody>
                {campaignJobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Aún no tienes campañas. Crea una oferta y activa su campaña de Meta.
                    </td>
                  </tr>
                )}
                {campaignJobs.map(({ job, company, m }) => (
                  <tr key={job.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link href={`/portal/ofertas/${job.id}`} className="flex items-center gap-3">
                        {company && <CompanyLogo name={company.name} hue={company.hue} size="sm" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{job.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{company?.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{m.funnel.leads}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {m.applications}
                      {m.newApplications > 0 && <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-700">+{m.newApplications}</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPercent(m.conversion)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatEuroCents(m.cpl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Actividad reciente" bodyClassName="p-0">
          <ActivityFeed limit={7} />
        </Panel>
      </div>

      <Panel
        className="mt-4"
        title="Pendientes de revisar"
        description="Candidaturas nuevas que cumplen los requisitos eliminatorios"
        bodyClassName="p-0"
        actions={
          <Link href="/portal/candidaturas?estado=new" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        }
      >
        {toReview.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-muted-foreground">
            ¡Todo revisado! No hay candidaturas nuevas pendientes.
            <Button size="sm" onClick={() => setSimOpen(true)}>
              <Zap data-icon="inline-start" /> Lead de prueba
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {toReview.map((a) => {
              const job = jobs.find((j) => j.id === a.jobId);
              return (
                <li key={a.id}>
                  <Link href={`/portal/candidaturas/${a.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40">
                    <PersonAvatar name={a.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job?.title} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                    <ScoreBadge score={a.score} knockout={a.knockoutFailed} />
                    <span className="hidden sm:block">
                      <ApplicationStatusBadge status={a.status} />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <SimulateLeadDialog open={simOpen} onOpenChange={setSimOpen} />
    </>
  );
}
