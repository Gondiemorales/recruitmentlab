"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Building2, Clock, Euro, FileWarning, Megaphone, Plus, ReceiptText, UserCheck, Users } from "lucide-react";
import { useDemo } from "@/lib/store";
import { allCompanyStats } from "@/lib/account-metrics";
import { dailySeries, trend } from "@/lib/metrics";
import { ACCOUNT_STATUS, PLANS } from "@/lib/plans";
import { formatEuro, formatEuroCents, formatNumber, timeAgo } from "@/lib/format";
import { PageHeader, Panel } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { ActivityChart, ChartLegend, CHART_COLORS } from "@/components/app/charts";
import { CompanyLogo } from "@/components/shared/brand";
import { ToneBadge } from "@/components/shared/tone-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

export function SuperDashboard() {
  const data = useDemo((s) => s.data);
  // Momento de referencia para los avisos (se fija al montar)
  const [now] = useState(() => Date.now());
  const stats = useMemo(() => allCompanyStats(data).filter((s) => s.company.plan !== "internal" || s.totalJobs > 0), [data]);

  const totals = useMemo(() => {
    const clients = stats.filter((s) => s.company.plan !== "internal");
    return {
      active: clients.filter((s) => s.company.accountStatus === "active").length,
      trial: clients.filter((s) => s.company.accountStatus === "trial").length,
      mrr: clients.reduce((s, x) => s + x.monthlyFee, 0),
      pending: clients.reduce((s, x) => s + x.pending, 0),
      overdue: clients.reduce((s, x) => s + x.overdue, 0),
      adSpend: stats.reduce((s, x) => s + x.adSpend, 0),
      hired: data.applications.filter((a) => a.status === "hired").length,
      leadTrend: trend(data.leads),
      appTrend: trend(data.applications),
      series: dailySeries(data.leads, data.applications, 30),
    };
  }, [stats, data]);

  // Avisos que requieren atención del administrador
  const alerts = useMemo(() => {
    const out: { icon: React.ComponentType<{ className?: string }>; tone: string; text: React.ReactNode; href: string }[] = [];
    for (const s of stats) {
      const c = s.company;
      if (s.overdue > 0)
        out.push({
          icon: FileWarning,
          tone: "bg-rose-50 text-rose-600",
          text: (
            <>
              <b>{c.name}</b> tiene {formatEuroCents(s.overdue)} en facturas vencidas
            </>
          ),
          href: `/admin/empresas/${c.id}`,
        });
      if (c.accountStatus === "trial")
        out.push({
          icon: Clock,
          tone: "bg-sky-50 text-sky-600",
          text: (
            <>
              <b>{c.name}</b> está en periodo de prueba: momento de convertirla a plan de pago
            </>
          ),
          href: `/admin/empresas/${c.id}`,
        });
      if (s.maxActiveJobs !== null && s.activeJobs >= s.maxActiveJobs)
        out.push({
          icon: AlertTriangle,
          tone: "bg-amber-50 text-amber-600",
          text: (
            <>
              <b>{c.name}</b> ha llegado al límite de ofertas activas de su plan ({s.activeJobs}/{s.maxActiveJobs})
            </>
          ),
          href: `/admin/empresas/${c.id}`,
        });
      if (c.plan !== "internal" && s.activeJobs === 0)
        out.push({
          icon: Building2,
          tone: "bg-slate-100 text-slate-600",
          text: (
            <>
              <b>{c.name}</b> no tiene ofertas activas
            </>
          ),
          href: `/admin/empresas/${c.id}`,
        });
      if (s.lastLoginAt && now - new Date(s.lastLoginAt).getTime() > 14 * DAY)
        out.push({
          icon: UserCheck,
          tone: "bg-violet-50 text-violet-600",
          text: (
            <>
              Nadie de <b>{c.name}</b> entra al panel desde {timeAgo(s.lastLoginAt)}
            </>
          ),
          href: `/admin/empresas/${c.id}`,
        });
    }
    return out;
  }, [stats, now]);

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description="Estado de las cuentas cliente, facturación y actividad de toda la plataforma."
        actions={
          <Link href="/admin/empresas?nueva=1" className={buttonVariants({ size: "lg" })}>
            <Plus data-icon="inline-start" /> Nueva empresa
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Empresas cliente activas" value={totals.active} icon={Building2} hint={`${totals.trial} en periodo de prueba`} />
        <StatCard label="Ingresos recurrentes" value={formatEuro(totals.mrr)} icon={Euro} hint="cuotas al mes (sin IVA)" />
        <StatCard
          label="Pendiente de cobro"
          value={formatEuroCents(totals.pending + totals.overdue)}
          icon={ReceiptText}
          hint={totals.overdue ? `${formatEuroCents(totals.overdue)} vencido` : "Todo al día"}
          className={cn(totals.overdue > 0 && "ring-1 ring-rose-200")}
        />
        <StatCard label="Inversión gestionada en Meta" value={formatEuro(totals.adSpend)} icon={Megaphone} hint="todas las campañas" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads (7 días)" value={totals.leadTrend.current} icon={Megaphone} delta={totals.leadTrend.delta} hint="todas las empresas" />
        <StatCard label="Candidaturas (7 días)" value={totals.appTrend.current} icon={Users} delta={totals.appTrend.delta} hint="todas las empresas" />
        <StatCard label="Contrataciones" value={totals.hired} icon={UserCheck} hint="desde el inicio" />
        <StatCard label="Usuarios de empresa" value={data.users.length} icon={Users} hint={`${data.companies.length} cuentas`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Actividad de la plataforma"
          description="Leads y candidaturas de todas las empresas · últimos 30 días"
          actions={
            <ChartLegend
              items={[
                { label: "Leads", color: CHART_COLORS.brand2 },
                { label: "Candidaturas", color: CHART_COLORS.brand },
              ]}
            />
          }
        >
          <ActivityChart data={totals.series} />
        </Panel>
        <Panel title="Avisos" description={`${alerts.length} cosas que revisar`} bodyClassName="p-0">
          {alerts.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Todo en orden.</p>
          ) : (
            <ul className="max-h-[300px] divide-y overflow-y-auto">
              {alerts.map((a, i) => (
                <li key={i}>
                  <Link href={a.href} className="flex gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/40">
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", a.tone)}>
                      <a.icon className="size-3.5" />
                    </span>
                    <span className="leading-snug text-slate-700 [&_b]:font-semibold [&_b]:text-foreground">{a.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        className="mt-4"
        title="Empresas cliente"
        bodyClassName="p-0"
        actions={
          <Link href="/admin/empresas" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 text-right font-medium">Ofertas activas</th>
                <th className="px-3 py-3 text-right font-medium">Leads (30 d)</th>
                <th className="px-3 py-3 text-right font-medium">Candidaturas</th>
                <th className="px-3 py-3 text-right font-medium">Contratados</th>
                <th className="px-5 py-3 text-right font-medium">Pendiente de cobro</th>
              </tr>
            </thead>
            <tbody>
              {[...stats]
                .sort((a, b) => b.overdue - a.overdue || b.leads30d - a.leads30d)
                .map((s) => (
                  <tr key={s.company.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/empresas/${s.company.id}`} className="flex items-center gap-3">
                        <CompanyLogo name={s.company.name} hue={s.company.hue} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.company.name}</p>
                          <p className="text-xs text-muted-foreground">{s.company.sector}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <ToneBadge tone={PLANS[s.company.plan].tone} dot={false}>
                          {PLANS[s.company.plan].name}
                        </ToneBadge>
                        {s.company.accountStatus !== "active" && <ToneBadge tone={ACCOUNT_STATUS[s.company.accountStatus].tone}>{ACCOUNT_STATUS[s.company.accountStatus].label}</ToneBadge>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {s.activeJobs}
                      {s.maxActiveJobs !== null && <span className="text-muted-foreground">/{s.maxActiveJobs}</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatNumber(s.leads30d)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatNumber(s.applications)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.hired}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {s.overdue > 0 ? (
                        <span className="font-semibold text-rose-600">{formatEuroCents(s.pending + s.overdue)}</span>
                      ) : s.pending > 0 ? (
                        formatEuroCents(s.pending)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
