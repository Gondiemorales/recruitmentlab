"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Briefcase, Copy, ExternalLink, MoreHorizontal, Pause, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { usePublishGuard, useScopedData } from "@/lib/workspace";
import { jobMetrics } from "@/lib/metrics";
import { JOB_STATUS } from "@/lib/labels";
import { formatEuroCents, formatPercent, timeAgo } from "@/lib/format";
import type { JobStatus } from "@/lib/types";
import { PageHeader } from "@/components/app/page-header";
import { CompanyLogo, MetaIcon } from "@/components/shared/brand";
import { JobStatusBadge } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { jobUrl } from "@/lib/routes";

const TABS: (JobStatus | "all")[] = ["all", "active", "draft", "paused", "closed"];

export function JobsList() {
  const router = useRouter();
  const { jobs, companies, leads, applications } = useScopedData();
  const setJobStatus = useDemo((s) => s.setJobStatus);
  const canPublish = usePublishGuard();
  const duplicateJob = useDemo((s) => s.duplicateJob);
  const deleteJob = useDemo((s) => s.deleteJob);
  const [tab, setTab] = useState<JobStatus | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => tab === "all" || j.status === tab)
      .map((job) => ({ job, company: companies.find((c) => c.id === job.companyId), m: jobMetrics(job, leads, applications) }))
      .filter(({ job, company }) => !q || `${job.title} ${company?.name} ${job.city}`.toLowerCase().includes(q))
      .sort((a, b) => b.job.updatedAt.localeCompare(a.job.updatedAt));
  }, [jobs, companies, leads, applications, tab, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [jobs]);

  return (
    <>
      <PageHeader
        title="Ofertas"
        description="Gestiona las ofertas, sus preguntas de filtrado y las campañas de Meta asociadas."
        actions={
          <Link href="/portal/ofertas/nueva" className={buttonVariants({ size: "lg" })}>
            <Plus data-icon="inline-start" /> Nueva oferta
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all",
                tab === t ? "bg-white shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "all" ? "Todas" : JOB_STATUS[t].label}
              <span className="text-xs text-muted-foreground tabular-nums">{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar oferta o empresa" className="h-9 bg-white pl-9" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Briefcase} title="No hay ofertas aquí" description="Crea una oferta nueva o cambia el filtro." />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Oferta</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Campaña</th>
                  <th className="px-3 py-3 text-right font-medium">Leads</th>
                  <th className="px-3 py-3 text-right font-medium">Candidaturas</th>
                  <th className="px-3 py-3 text-right font-medium">Conversión</th>
                  <th className="px-3 py-3 text-right font-medium">Coste/cand.</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ job, company, m }) => (
                  <tr
                    key={job.id}
                    onClick={() => router.push(`/portal/ofertas/${job.id}`)}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {company && <CompanyLogo name={company.name} hue={company.hue} size="sm" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{job.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {company?.name} · {job.city} · actualizada {timeAgo(job.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      {job.campaign ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <MetaIcon className="size-3.5 text-meta" />
                          {formatEuroCents(job.campaign.spend)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin campaña</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{m.funnel.leads}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{m.applications}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{m.funnel.leads ? formatPercent(m.conversion) : "—"}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{m.applications ? formatEuroCents(m.costPerApplication) : "—"}</td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="Acciones">
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => router.push(`/portal/ofertas/${job.id}/editar`)}>
                            <Pencil /> Editar
                          </DropdownMenuItem>
                          {job.status !== "draft" && (
                            <DropdownMenuItem onClick={() => window.open(jobUrl(job.slug), "_blank")}>
                              <ExternalLink /> Ver en la web
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateJob(job.id);
                              if (copy) {
                                toast.success("Oferta duplicada como borrador");
                                router.push(`/portal/ofertas/${copy.id}/editar`);
                              }
                            }}
                          >
                            <Copy /> Duplicar
                          </DropdownMenuItem>
                          {job.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setJobStatus(job.id, "paused");
                                toast("Oferta pausada");
                              }}
                            >
                              <Pause /> Pausar
                            </DropdownMenuItem>
                          ) : job.status !== "closed" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                const blocked = canPublish(job.id, job.companyId);
                                if (blocked) return toast.error("No se puede publicar", { description: blocked });
                                setJobStatus(job.id, "active");
                                toast.success("Oferta publicada");
                              }}
                            >
                              <Play /> Publicar
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteJob(job.id);
                              toast("Oferta eliminada");
                            }}
                          >
                            <Trash2 /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
