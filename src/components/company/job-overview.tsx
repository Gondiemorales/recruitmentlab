"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Euro, ExternalLink, Gauge, Megaphone, Pause, Pencil, Percent, Play, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { usePublishGuard, useScopedData } from "@/lib/workspace";
import { jobMetrics } from "@/lib/metrics";
import { APPLICATION_PIPELINE, APPLICATION_STATUS, EMPLOYMENT_TYPE_LABEL, QUESTION_TYPE, WORK_MODE_LABEL } from "@/lib/labels";
import { formatCompact, formatEuroCents, formatPercent, formatSalary, timeAgo } from "@/lib/format";
import { PageHeader, Panel } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { FunnelBars } from "@/components/app/charts";
import { CompanyLogo, MetaIcon, PersonAvatar } from "@/components/shared/brand";
import { JobStatusBadge, ScoreBadge, ToneBadge, toneDot } from "@/components/shared/tone-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { jobUrl } from "@/lib/routes";
import { SimulateLeadDialog } from "./simulate-lead-dialog";
import { ActivityFeed } from "./activity-feed";
import { AdPreview } from "./job-editor/ad-preview";
import { QUESTION_ICON } from "./job-editor/question-builder";
import { JobNotFound } from "./job-editor/job-editor-pages";

export function JobOverview({ id }: { id: string }) {
  const { jobs, companies, leads, applications } = useScopedData();
  const setJobStatus = useDemo((s) => s.setJobStatus);
  const canPublish = usePublishGuard();
  const [simOpen, setSimOpen] = useState(false);

  const job = jobs.find((j) => j.id === id);
  const company = job && companies.find((c) => c.id === job.companyId);
  const m = useMemo(() => (job ? jobMetrics(job, leads, applications) : null), [job, leads, applications]);
  const jobApps = useMemo(() => applications.filter((a) => a.jobId === id), [applications, id]);

  if (!job || !company || !m) return <JobNotFound />;

  const top = [...jobApps].filter((a) => !a.knockoutFailed && a.status !== "rejected").sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5);
  const c = job.campaign;

  return (
    <>
      <PageHeader
        back={{ href: "/portal/ofertas", label: "Ofertas" }}
        title={
          <span className="flex items-center gap-3">
            <CompanyLogo name={company.name} hue={company.hue} />
            <span className="min-w-0">
              <span className="block truncate">{job.title}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-2 font-sans text-sm font-normal text-muted-foreground">
                {company.name} · {job.city} · {WORK_MODE_LABEL[job.workMode]} · {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
                <JobStatusBadge status={job.status} />
              </span>
            </span>
          </span>
        }
        actions={
          <>
            {job.status === "active" && (
              <Button variant="outline" size="lg" onClick={() => setSimOpen(true)}>
                <MetaIcon className="text-meta" /> Lead de prueba
              </Button>
            )}
            {job.status !== "draft" && (
              <a href={jobUrl(job.slug)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
                <ExternalLink data-icon="inline-start" /> Ver en la web
              </a>
            )}
            {job.status === "active" ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setJobStatus(job.id, "paused");
                  toast("Oferta y campaña pausadas");
                }}
              >
                <Pause data-icon="inline-start" /> Pausar
              </Button>
            ) : job.status !== "closed" ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const blocked = canPublish(job.id, job.companyId);
                  if (blocked) return toast.error("No se puede publicar", { description: blocked });
                  setJobStatus(job.id, "active");
                  toast.success("Oferta publicada");
                }}
              >
                <Play data-icon="inline-start" /> Publicar
              </Button>
            ) : null}
            <Link href={`/portal/ofertas/${job.id}/editar`} className={buttonVariants({ size: "lg" })}>
              <Pencil data-icon="inline-start" /> Editar
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads de Meta" value={m.funnel.leads} icon={Megaphone} hint={c ? `${formatEuroCents(m.cpl)} por lead` : "Sin campaña"} />
        <StatCard label="Candidaturas" value={m.applications} icon={Users} hint={`${m.newApplications} sin revisar`} />
        <StatCard label="Conversión" value={m.funnel.leads ? formatPercent(m.conversion) : "—"} icon={Percent} hint="lead → candidatura" />
        <StatCard
          label="Coste por candidatura"
          value={m.applications ? formatEuroCents(m.costPerApplication) : "—"}
          icon={Euro}
          hint={m.avgScore != null ? `Puntuación media ${m.avgScore}` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel
            title="Pipeline de candidatos"
            actions={
              <Link href={`/portal/candidaturas?oferta=${job.id}`} className="text-sm font-medium text-primary hover:underline">
                Abrir en tablero
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {APPLICATION_PIPELINE.map((s) => {
                const n = jobApps.filter((a) => a.status === s).length;
                return (
                  <Link
                    key={s}
                    href={`/portal/candidaturas?oferta=${job.id}&estado=${s}`}
                    className="min-w-0 rounded-xl border p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground" title={APPLICATION_STATUS[s].label}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", toneDot(APPLICATION_STATUS[s].tone))} />
                      <span className="truncate">{APPLICATION_STATUS[s].label}</span>
                    </span>
                    <span className="mt-1 block font-display text-2xl font-semibold tabular-nums">{n}</span>
                  </Link>
                );
              })}
            </div>
            {m.knockedOut > 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="size-3.5 text-rose-500" />
                {m.knockedOut} candidaturas no cumplieron algún requisito eliminatorio y se filtraron automáticamente.
              </p>
            )}
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Embudo de conversión">
              <FunnelBars funnel={m.funnel} />
            </Panel>
            <Panel title="Mejores candidatos" bodyClassName="p-0">
              {top.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">Aún no hay candidaturas.</p>
              ) : (
                <ul className="divide-y">
                  {top.map((a) => (
                    <li key={a.id}>
                      <Link href={`/portal/candidaturas/${a.id}`} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40">
                        <PersonAvatar name={a.fullName} className="size-8" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground">{APPLICATION_STATUS[a.status].label}</p>
                        </div>
                        <ScoreBadge score={a.score} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Preguntas de filtrado" description={`${job.questions.length} preguntas`}>
            {job.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Esta oferta no tiene preguntas.</p>
            ) : (
              <ol className="space-y-2">
                {job.questions.map((q, i) => {
                  const Icon = QUESTION_ICON[q.type];
                  return (
                    <li key={q.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                      <span className="text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                      <Icon className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{q.label}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{QUESTION_TYPE[q.type].label}</span>
                      {q.knockout && <ToneBadge tone="danger">Eliminatoria</ToneBadge>}
                      {!!q.points && <ToneBadge tone="success" dot={false}>{q.points} pts</ToneBadge>}
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title={
              <span className="flex items-center gap-2">
                <MetaIcon className="text-meta" /> Campaña en Meta
              </span>
            }
            description={c ? c.name : undefined}
            actions={
              c && (
                <ToneBadge tone={c.status === "active" ? "success" : c.status === "learning" ? "info" : "muted"}>
                  {c.status === "active" ? "Activa" : c.status === "learning" ? "En aprendizaje" : c.status === "ended" ? "Finalizada" : "Desactivada"}
                </ToneBadge>
              )
            }
          >
            {c ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Inversión" value={formatEuroCents(c.spend)} />
                  <Metric label="Presupuesto/día" value={formatEuroCents(c.dailyBudget)} />
                  <Metric label="Impresiones" value={formatCompact(c.impressions)} />
                  <Metric label="Alcance" value={formatCompact(c.reach)} />
                  <Metric label="Clics" value={formatCompact(c.clicks)} />
                  <Metric label="CTR" value={formatPercent(c.impressions ? c.clicks / c.impressions : 0, 2)} />
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                  <Gauge className="mt-px size-3.5 shrink-0" /> {c.audience}
                </p>
                <div className="mt-4">
                  <AdPreview
                    companyName={company.name}
                    companyHue={company.hue}
                    primaryText={c.primaryText}
                    creative={c.creatives[0] ?? { kind: "image", headline: job.title, hue: company.hue }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Esta oferta no tiene campaña activa.
                <Link href={`/portal/ofertas/${job.id}/editar`} className="mt-3 flex items-center gap-1 font-medium text-primary hover:underline">
                  Configurar campaña <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </Panel>
          <Panel title="Actividad" bodyClassName="p-0" description={`Publicada ${timeAgo(job.publishedAt)} · ${formatSalary(job) ?? "Salario no indicado"}`}>
            <ActivityFeed jobId={job.id} limit={8} />
          </Panel>
        </div>
      </div>

      <SimulateLeadDialog open={simOpen} onOpenChange={setSimOpen} defaultJobId={job.id} />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}
