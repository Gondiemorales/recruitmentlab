"use client";

import { useMemo, useState } from "react";
import { Building2, Globe, Inbox, Mail, Phone, UserRound, Users } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { ContactRequest, MetaCampaign } from "@/lib/types";
import type { Tone } from "@/lib/labels";
import { formatDateTime, formatEuroCents, formatNumber, timeAgo } from "@/lib/format";
import { MetaIcon } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { ToneBadge } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

const STATUS: Record<ContactRequest["status"], { label: string; tone: Tone }> = {
  new: { label: "Nueva", tone: "info" },
  contacted: { label: "Contactada", tone: "warning" },
  won: { label: "Cliente", tone: "success" },
  lost: { label: "Descartada", tone: "muted" },
};

const PAGE = 20;

export function RequestsPage() {
  const requests = useDemo((s) => s.data.contactRequests);
  const campaigns = useDemo((s) => s.data.agencyCampaigns);
  const setStatus = useDemo((s) => s.setContactRequestStatus);
  const [kind, setKind] = useState<"all" | ContactRequest["kind"]>("all");
  const [source, setSource] = useState<"all" | "web" | "meta_lead_ad">("all");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(
    () =>
      requests
        .filter((r) => kind === "all" || r.kind === kind)
        .filter((r) => source === "all" || (r.source ?? "web") === source)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests, kind, source],
  );

  return (
    <>
      <PageHeader
        title="Solicitudes"
        description="Empresas interesadas y candidatos espontáneos: formularios de la web y leads de nuestras campañas de captación en Meta."
      />

      {campaigns.map((c) => (
        <AgencyCampaignPanel key={c.id} campaign={c} requests={requests.filter((r) => r.campaignId === c.id)} />
      ))}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
      <div className="flex gap-1 rounded-xl bg-muted p-1 sm:w-fit">
        {(
          [
            { id: "all", label: "Todas", icon: Inbox },
            { id: "company", label: "Empresas", icon: Building2 },
            { id: "candidate", label: "Candidatos", icon: UserRound },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setKind(t.id)}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all",
              kind === t.id ? "bg-white shadow-soft" : "text-muted-foreground",
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>
        <SimpleSelect<"all" | "web" | "meta_lead_ad">
          value={source}
          onChange={setSource}
          className="h-9 sm:w-52"
          options={[
            { value: "all", label: "Todos los orígenes" },
            { value: "web", label: "Formulario web" },
            { value: "meta_lead_ad", label: "Campaña de Meta" },
          ]}
        />
        <span className="text-sm text-muted-foreground sm:ml-auto sm:self-center">{filtered.length} solicitudes</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Sin solicitudes" description="Aquí aparecerán los formularios de contacto y los leads de las campañas de captación." />
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, limit).map((r) => (
            <article key={r.id} className="rounded-2xl border bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    r.kind === "company" ? "bg-primary/8 text-primary" : "bg-violet-50 text-violet-600",
                  )}
                >
                  {r.kind === "company" ? <Building2 className="size-5" /> : <UserRound className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.companyName ?? r.name}</p>
                    <ToneBadge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</ToneBadge>
                    {r.hiringVolume && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <Users className="size-3" /> {r.hiringVolume}
                      </span>
                    )}
                    {r.source === "meta_lead_ad" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-meta">
                        <MetaIcon className="size-3" /> Meta Lead Ads
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <Globe className="size-3" /> Web
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {r.companyName && <span>{r.name}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3.5" /> {r.email}
                    </span>
                    {r.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5" /> {r.phone}
                      </span>
                    )}
                  </p>
                  <p className="mt-3 rounded-xl bg-muted/50 p-3 text-sm leading-relaxed">{r.message}</p>
                </div>
                <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                  <span className="text-xs text-muted-foreground" title={formatDateTime(r.createdAt)}>
                    {timeAgo(r.createdAt)}
                  </span>
                  <SimpleSelect<ContactRequest["status"]>
                    value={r.status}
                    onChange={(s) => setStatus(r.id, s)}
                    size="sm"
                    className="w-36"
                    options={(Object.keys(STATUS) as ContactRequest["status"][]).map((s) => ({ value: s, label: STATUS[s].label }))}
                  />
                </div>
              </div>
            </article>
          ))}
          {filtered.length > limit && (
            <div className="text-center">
              <Button variant="ghost" onClick={() => setLimit((n) => n + PAGE)}>
                Mostrar más ({filtered.length - limit} restantes)
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Rendimiento de una campaña propia de captación de empresas */
function AgencyCampaignPanel({ campaign: c, requests }: { campaign: MetaCampaign; requests: ContactRequest[] }) {
  const won = requests.filter((r) => r.status === "won").length;
  const metrics = [
    { label: "Leads de empresas", value: formatNumber(c.leads) },
    { label: "Coste por lead", value: formatEuroCents(c.leads ? c.spend / c.leads : 0) },
    { label: "Importe gastado", value: formatEuroCents(c.spend) },
    { label: "Impresiones", value: formatNumber(c.impressions) },
    { label: "Clientes conseguidos", value: formatNumber(won) },
    { label: "Coste por cliente", value: won ? formatEuroCents(c.spend / won) : "—" },
  ];
  return (
    <section className="mb-6 rounded-2xl border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <span className="flex size-9 items-center justify-center rounded-xl bg-meta text-white">
          <MetaIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            Campaña de captación de empresas · {c.audience}
          </p>
        </div>
        <ToneBadge tone={c.status === "active" ? "success" : "muted"}>{c.status === "active" ? "Activa" : "Desactivada"}</ToneBadge>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white px-5 py-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">{m.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
