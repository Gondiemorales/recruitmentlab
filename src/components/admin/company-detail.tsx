"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Ban, Briefcase, Building2, Euro, Globe, LogIn, Mail, Megaphone, ReceiptText, RotateCcw, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import type { PlanId } from "@/lib/types";
import { companyStats } from "@/lib/account-metrics";
import { jobMetrics } from "@/lib/metrics";
import { ACCOUNT_STATUS, PLANS, USER_ROLE } from "@/lib/plans";
import { formatDate, formatEuro, formatEuroCents, formatPercent, timeAgo } from "@/lib/format";
import { PageHeader, Panel } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { SimpleSelect } from "@/components/app/simple-select";
import { CompanyLogo, MetaIcon, PersonAvatar } from "@/components/shared/brand";
import { JobStatusBadge, ToneBadge } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/states";
import { Button, buttonVariants } from "@/components/ui/button";
import { InvoicesTable } from "./invoices-table";
import { useImpersonate } from "./use-impersonate";

export function CompanyDetail({ id }: { id: string }) {
  const data = useDemo((s) => s.data);
  const updateCompany = useDemo((s) => s.updateCompany);
  const impersonate = useImpersonate();
  const company = data.companies.find((c) => c.id === id);
  const stats = useMemo(() => (company ? companyStats(company, data) : null), [company, data]);

  if (!company || !stats) {
    return (
      <EmptyState
        icon={Building2}
        title="Empresa no encontrada"
        action={
          <Link href="/admin/empresas" className={buttonVariants()}>
            Ver empresas
          </Link>
        }
      />
    );
  }

  const jobs = data.jobs.filter((j) => j.companyId === id);
  const invoices = data.invoices.filter((i) => i.companyId === id);
  const users = data.users.filter((u) => u.companyId === id);
  const plan = PLANS[company.plan];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/empresas", label: "Empresas" }}
        title={
          <span className="flex items-center gap-3">
            <CompanyLogo name={company.name} hue={company.hue} />
            <span className="min-w-0">
              <span className="block truncate">{company.name}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-2 font-sans text-sm font-normal text-muted-foreground">
                {company.sector} · {company.city} · cliente desde {formatDate(company.createdAt, "MMMM yyyy")}
                <ToneBadge tone={ACCOUNT_STATUS[company.accountStatus].tone}>{ACCOUNT_STATUS[company.accountStatus].label}</ToneBadge>
              </span>
            </span>
          </span>
        }
        actions={
          <>
            {company.accountStatus === "suspended" ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  updateCompany(id, { accountStatus: "active" });
                  toast.success("Cuenta reactivada");
                }}
              >
                <RotateCcw data-icon="inline-start" /> Reactivar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  updateCompany(id, { accountStatus: "suspended" });
                  toast("Cuenta suspendida", { description: "La empresa no podrá publicar ofertas hasta reactivarla." });
                }}
              >
                <Ban data-icon="inline-start" /> Suspender
              </Button>
            )}
            <Button size="lg" onClick={() => impersonate(id)}>
              <LogIn data-icon="inline-start" /> Entrar en su panel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cuota mensual" value={plan.monthlyFee ? formatEuro(plan.monthlyFee) : "—"} icon={Euro} hint={`Plan ${plan.name}`} />
        <StatCard
          label="Pendiente de cobro"
          value={formatEuroCents(stats.pending + stats.overdue)}
          icon={ReceiptText}
          hint={stats.overdue ? `${formatEuroCents(stats.overdue)} vencido` : `Facturado ${formatEuroCents(stats.billed)}`}
          className={stats.overdue ? "ring-1 ring-rose-200" : undefined}
        />
        <StatCard label="Leads en sus campañas" value={stats.leads} icon={Megaphone} hint={`Inversión ${formatEuroCents(stats.adSpend)}`} />
        <StatCard label="Contrataciones" value={stats.hired} icon={UserCheck} hint={`${stats.applications} candidaturas`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Ofertas" description={`${stats.activeJobs} activas${stats.maxActiveJobs !== null ? ` de ${stats.maxActiveJobs} que permite su plan` : ""}`} bodyClassName="p-0">
            {jobs.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Todavía no ha publicado ofertas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Oferta</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                      <th className="px-3 py-3 text-right font-medium">Leads</th>
                      <th className="px-3 py-3 text-right font-medium">Candidaturas</th>
                      <th className="px-3 py-3 text-right font-medium">Conversión</th>
                      <th className="px-5 py-3 text-right font-medium">Inversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => {
                      const m = jobMetrics(j, data.leads, data.applications);
                      return (
                        <tr key={j.id} className="border-b last:border-0">
                          <td className="px-5 py-3">
                            <p className="font-medium">{j.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {j.city}
                              {j.campaign && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <MetaIcon className="size-3 text-meta" /> {j.campaign.name}
                                </span>
                              )}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <JobStatusBadge status={j.status} />
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">{m.funnel.leads}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{m.applications}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{m.funnel.leads ? formatPercent(m.conversion) : "—"}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{m.spend ? formatEuroCents(m.spend) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Facturas" description={`${invoices.length} emitidas`} bodyClassName="p-0">
            <InvoicesTable invoices={invoices} showCompany={false} />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Plan y cuenta">
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Plan contratado</p>
                <SimpleSelect<PlanId>
                  value={company.plan}
                  onChange={(p) => {
                    updateCompany(id, { plan: p });
                    toast.success(`Plan cambiado a ${PLANS[p].name}`);
                  }}
                  options={(Object.keys(PLANS) as PlanId[]).map((p) => ({
                    value: p,
                    label: PLANS[p].monthlyFee ? `${PLANS[p].name} · ${formatEuro(PLANS[p].monthlyFee)}/mes` : PLANS[p].name,
                  }))}
                />
              </div>
              <dl className="space-y-2">
                <Row label="Ofertas activas permitidas">{plan.maxActiveJobs ?? "Ilimitadas"}</Row>
                <Row label="Facturado en total">{formatEuroCents(stats.billed)}</Row>
                <Row label="Cobrado">{formatEuroCents(stats.paid)}</Row>
                <Row label="Último acceso">{stats.lastLoginAt ? timeAgo(stats.lastLoginAt) : "Nunca"}</Row>
              </dl>
            </div>
          </Panel>

          <Panel title="Contacto">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <UserCheck className="size-4 text-muted-foreground" /> {company.contactName}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-muted-foreground" />
                <a href={`mailto:${company.contactEmail}`} className="truncate hover:text-primary">
                  {company.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="size-4 text-muted-foreground" /> {company.website}
              </li>
            </ul>
          </Panel>

          <Panel title="Usuarios" description={`${users.length} con acceso al panel`} bodyClassName="p-0">
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <PersonAvatar name={u.name} className="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{USER_ROLE[u.role]}</p>
                    <p className="text-[11px] text-muted-foreground">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Sin acceder"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Resultados">
            <dl className="space-y-2 text-sm">
              <Row label="Ofertas publicadas">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5 text-muted-foreground" /> {stats.totalJobs}
                </span>
              </Row>
              <Row label="Leads (30 días)">{stats.leads30d}</Row>
              <Row label="Candidaturas">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 text-muted-foreground" /> {stats.applications}
                </span>
              </Row>
              <Row label="Coste por lead">{stats.leads ? formatEuroCents(stats.adSpend / stats.leads) : "—"}</Row>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{children}</dd>
    </div>
  );
}
