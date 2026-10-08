"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, FileSpreadsheet, Mail, Megaphone, MoreHorizontal, RefreshCw, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import type { Lead, LeadStatus } from "@/lib/types";
import { LEAD_SOURCE_LABEL, LEAD_STATUS } from "@/lib/labels";
import { leadFunnel } from "@/lib/metrics";
import { formatPercent, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { FacebookIcon, InstagramIcon, MetaIcon, PersonAvatar } from "@/components/shared/brand";
import { LeadStatusBadge } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SimulateLeadDialog } from "./simulate-lead-dialog";
import { EmailPreview, applyLink } from "./email-preview";
import { ImportLeadsDialog, AddLeadDialog } from "./lead-dialogs";

const PAGE = 25;

export function LeadsPage() {
  const { leads, jobs, companies } = useScopedData();
  const sendInvite = useDemo((s) => s.sendInvite);
  const markLeadOpened = useDemo((s) => s.markLeadOpened);
  const [jobId, setJobId] = useState("all");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [simOpen, setSimOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => jobId === "all" || l.jobId === jobId)
      .filter((l) => status === "all" || l.status === status)
      .filter((l) => !q || `${l.fullName} ${l.email} ${l.phone}`.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [leads, jobId, status, query]);

  const funnel = useMemo(() => leadFunnel(jobId === "all" ? leads : leads.filter((l) => l.jobId === jobId)), [leads, jobId]);

  const emailJob = emailLead && jobById[emailLead.jobId];
  const emailCompany = emailJob && companies.find((c) => c.id === emailJob.companyId);
  // Lead "vivo" para que el diálogo refleje cambios (p. ej. al reenviar)
  const liveEmailLead = emailLead && (leads.find((l) => l.id === emailLead.id) ?? emailLead);

  return (
    <>
      <PageHeader
        title="Leads de Meta"
        description="Personas que dejaron sus datos en un formulario instantáneo. Cada una recibe automáticamente un email con su enlace personal."
        actions={
          <>
            <Button variant="outline" size="lg" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet data-icon="inline-start" /> Importar CSV
            </Button>
            <Button variant="outline" size="lg" onClick={() => setAddOpen(true)}>
              <UserPlus data-icon="inline-start" /> Añadir
            </Button>
            <Button size="lg" onClick={() => setSimOpen(true)}>
              <MetaIcon /> Lead de prueba
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["Leads", funnel.leads, null],
            ["Emails entregados", funnel.emailed, funnel.leads],
            ["Abiertos", funnel.opened, funnel.emailed],
            ["Clic en oferta", funnel.clicked, funnel.opened],
            ["Han aplicado", funnel.applied, funnel.leads],
          ] as const
        ).map(([label, v, base]) => (
          <div key={label} className="rounded-2xl border bg-white p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{v}</p>
            {base !== null && <p className="text-xs text-muted-foreground">{formatPercent(base ? v / base : 0)}</p>}
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar lead" className="h-9 bg-white pl-9" />
        </div>
        <SimpleSelect
          value={jobId}
          onChange={setJobId}
          className="h-9 md:w-72"
          options={[{ value: "all", label: "Todas las campañas" }, ...jobs.filter((j) => j.campaign).map((j) => ({ value: j.id, label: j.title }))]}
        />
        <SimpleSelect<LeadStatus | "all">
          value={status}
          onChange={setStatus}
          className="h-9 md:w-48"
          options={[{ value: "all", label: "Todos los estados" }, ...(Object.keys(LEAD_STATUS) as LeadStatus[]).map((s) => ({ value: s, label: LEAD_STATUS[s].label }))]}
        />
        <span className="text-sm text-muted-foreground md:ml-auto">{filtered.length} leads</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Sin leads" description="Los leads de tus campañas de Meta aparecerán aquí en cuanto lleguen." />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-3 py-3 font-medium">Oferta</th>
                  <th className="px-3 py-3 font-medium">Origen</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Recibido</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, limit).map((l) => {
                  const job = jobById[l.jobId];
                  return (
                    <tr key={l.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <PersonAvatar name={l.fullName} className="size-8" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{l.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {l.email} · {l.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-52 truncate px-3 py-3 text-muted-foreground">{job?.title}</td>
                      <td className="px-3 py-3 text-xs">
                        {l.source === "meta_lead_ad" ? (
                          <span className="inline-flex items-center gap-1.5">
                            {l.platform === "instagram" ? <InstagramIcon className="size-3.5" /> : <FacebookIcon className="size-3.5" />}
                            {l.platform === "instagram" ? "Instagram" : "Facebook"}
                          </span>
                        ) : (
                          LEAD_SOURCE_LABEL[l.source]
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <LeadStatusBadge status={l.status} />
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap text-muted-foreground">{timeAgo(l.createdAt)}</td>
                      <td className="px-3 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="Acciones">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {l.emailedAt && (
                              <DropdownMenuItem onClick={() => setEmailLead(l)}>
                                <Mail /> Ver email enviado
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                sendInvite(l.id);
                                toast.success(l.emailedAt ? "Recordatorio enviado" : "Email enviado", { description: l.email });
                              }}
                            >
                              <RefreshCw /> {l.emailedAt ? "Reenviar recordatorio" : "Enviar email"}
                            </DropdownMenuItem>
                            {job && job.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  markLeadOpened(l.id);
                                  window.open(applyLink(job, l), "_blank");
                                }}
                              >
                                <ExternalLink /> Abrir enlace del candidato
                              </DropdownMenuItem>
                            )}
                            {l.applicationId && (
                              <DropdownMenuItem render={<Link href={`/portal/candidaturas/${l.applicationId}`} />}>
                                <Users /> Ver candidatura
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > limit && (
            <div className="border-t p-3 text-center">
              <Button variant="ghost" onClick={() => setLimit((n) => n + PAGE)}>
                Mostrar más ({filtered.length - limit} restantes)
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!emailLead} onOpenChange={(o) => !o && setEmailLead(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Email enviado automáticamente</DialogTitle>
          </DialogHeader>
          {liveEmailLead && emailJob && emailCompany && <EmailPreview lead={liveEmailLead} job={emailJob} company={emailCompany} />}
        </DialogContent>
      </Dialog>

      <SimulateLeadDialog open={simOpen} onOpenChange={setSimOpen} defaultJobId={jobId !== "all" ? jobId : undefined} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} />
      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
