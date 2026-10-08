"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Columns3, Rows3, Search, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import type { Application, ApplicationStatus } from "@/lib/types";
import { APPLICATION_PIPELINE, APPLICATION_STATUS, LEAD_SOURCE_LABEL } from "@/lib/labels";
import { timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { PersonAvatar } from "@/components/shared/brand";
import { ApplicationStatusBadge, ScoreBadge, toneDot } from "@/components/shared/tone-badge";
import { EmptyState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type View = "board" | "table";

let lastDragEndAt = 0;
type Sort = "recent" | "score";

export function ApplicationsBoard({ initialJobId, initialStatus }: { initialJobId: string; initialStatus: ApplicationStatus | "all" }) {
  const { applications, jobs } = useScopedData();
  const [view, setView] = useState<View>(initialStatus !== "all" ? "table" : "board");
  const [jobId, setJobId] = useState(initialJobId);
  const [status, setStatus] = useState<ApplicationStatus | "all">(initialStatus);
  const [query, setQuery] = useState("");
  const [hideKnockout, setHideKnockout] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");

  const jobTitle = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j.title])), [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => jobId === "all" || a.jobId === jobId)
      .filter((a) => view === "board" || status === "all" || a.status === status)
      .filter((a) => !hideKnockout || !a.knockoutFailed)
      .filter((a) => !q || `${a.fullName} ${a.email} ${a.phone}`.toLowerCase().includes(q))
      .sort((a, b) => (sort === "score" ? (b.score ?? -1) - (a.score ?? -1) : b.createdAt.localeCompare(a.createdAt)));
  }, [applications, jobId, status, query, hideKnockout, sort, view]);

  return (
    <>
      <PageHeader
        title="Candidaturas"
        description={`${applications.length} candidaturas · ${applications.filter((a) => a.status === "new").length} sin revisar`}
        actions={
          <div className="flex rounded-xl bg-muted p-1">
            {(
              [
                { id: "board", label: "Tablero", icon: Columns3 },
                { id: "table", label: "Lista", icon: Rows3 },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all",
                  view === v.id ? "bg-white shadow-soft" : "text-muted-foreground",
                )}
              >
                <v.icon className="size-4" /> {v.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative lg:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar candidato" className="h-9 bg-white pl-9" />
        </div>
        <SimpleSelect
          value={jobId}
          onChange={setJobId}
          className="h-9 lg:w-72"
          options={[{ value: "all", label: "Todas las ofertas" }, ...jobs.map((j) => ({ value: j.id, label: j.title }))]}
        />
        {view === "table" && (
          <SimpleSelect<ApplicationStatus | "all">
            value={status}
            onChange={setStatus}
            className="h-9 lg:w-48"
            options={[{ value: "all", label: "Todos los estados" }, ...APPLICATION_PIPELINE.map((s) => ({ value: s, label: APPLICATION_STATUS[s].label }))]}
          />
        )}
        <SimpleSelect<Sort>
          value={sort}
          onChange={setSort}
          className="h-9 lg:w-44"
          options={[
            { value: "recent", label: "Más recientes" },
            { value: "score", label: "Mayor puntuación" },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground lg:ml-auto">
          <Switch checked={hideKnockout} onCheckedChange={setHideKnockout} /> Ocultar «no cumple»
        </label>
      </div>

      {filtered.length === 0 && view === "table" ? (
        <EmptyState icon={Users} title="Sin candidaturas" description="No hay candidaturas con estos filtros." />
      ) : view === "board" ? (
        <Kanban apps={filtered} jobTitle={jobTitle} />
      ) : (
        <ApplicationsTable apps={filtered} jobTitle={jobTitle} />
      )}
    </>
  );
}

// ───────────────────────── Tabla ─────────────────────────

function ApplicationsTable({ apps, jobTitle }: { apps: Application[]; jobTitle: Record<string, string> }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Candidato</th>
              <th className="px-3 py-3 font-medium">Oferta</th>
              <th className="px-3 py-3 font-medium">Puntuación</th>
              <th className="px-3 py-3 font-medium">Estado</th>
              <th className="px-3 py-3 font-medium">Origen</th>
              <th className="px-5 py-3 text-right font-medium">Aplicó</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} onClick={() => router.push(`/portal/candidaturas/${a.id}`)} className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={a.fullName} className="size-8" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-medium">
                        {a.fullName}
                        {a.rating > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                            <Star className="size-3 fill-current" />
                            {a.rating}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-56 truncate px-3 py-3 text-muted-foreground">{jobTitle[a.jobId]}</td>
                <td className="px-3 py-3">
                  <ScoreBadge score={a.score} knockout={a.knockoutFailed} />
                </td>
                <td className="px-3 py-3">
                  <ApplicationStatusBadge status={a.status} />
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{LEAD_SOURCE_LABEL[a.source]}</td>
                <td className="px-5 py-3 text-right text-xs whitespace-nowrap text-muted-foreground">{timeAgo(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───────────────────────── Kanban ─────────────────────────

function Kanban({ apps, jobTitle }: { apps: Application[]; jobTitle: Record<string, string> }) {
  const setStatus = useDemo((s) => s.setApplicationStatus);
  const [dragging, setDragging] = useState<Application | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(APPLICATION_PIPELINE.map((s) => [s, [] as Application[]])) as Record<ApplicationStatus, Application[]>;
    for (const a of apps) map[a.status].push(a);
    return map;
  }, [apps]);

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    lastDragEndAt = Date.now();
    const to = e.over?.id as ApplicationStatus | undefined;
    const app = apps.find((a) => a.id === e.active.id);
    if (!to || !app || app.status === to) return;
    setStatus(app.id, to);
    toast.success(`${app.fullName.split(" ")[0]} → ${APPLICATION_STATUS[to].label}`, {
      description: to === "shortlisted" ? "Lista para entrevistar con el responsable" : undefined,
    });
  };

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setDragging(apps.find((a) => a.id === e.active.id) ?? null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        <div className="flex gap-3">
          {APPLICATION_PIPELINE.map((s) => (
            <Column key={s} status={s} count={byStatus[s].length}>
              {byStatus[s].map((a) => (
                <DraggableCard key={a.id} app={a} jobTitle={jobTitle[a.jobId] ?? ""} />
              ))}
            </Column>
          ))}
        </div>
      </div>
      <DragOverlay>{dragging && <CardBody app={dragging} jobTitle={jobTitle[dragging.jobId] ?? ""} className="rotate-2 shadow-glow" />}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, count, children }: { status: ApplicationStatus; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = APPLICATION_STATUS[status];
  return (
    <div
      ref={setNodeRef}
      className={cn("flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/40 transition-colors", isOver && "border-primary/40 bg-primary/5")}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={cn("size-2 rounded-full", toneDot(meta.tone))} />
        <p className="text-sm font-semibold">{meta.label}</p>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="flex max-h-[calc(100vh-280px)] min-h-32 flex-col gap-2 overflow-y-auto px-2 pb-2">{children}</div>
    </div>
  );
}

function DraggableCard({ app, jobTitle }: { app: Application; jobTitle: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("touch-none", isDragging && "opacity-30")}>
      <CardBody app={app} jobTitle={jobTitle} link />
    </div>
  );
}

function CardBody({ app, jobTitle, link, className }: { app: Application; jobTitle: string; link?: boolean; className?: string }) {
  const content = (
    <div className={cn("cursor-grab rounded-xl border bg-white p-3 shadow-soft transition-shadow hover:shadow-md active:cursor-grabbing", className)}>
      <div className="flex items-start gap-2.5">
        <PersonAvatar name={app.fullName} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{app.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{jobTitle}</p>
        </div>
        <ScoreBadge score={app.score} knockout={app.knockoutFailed} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{timeAgo(app.createdAt)}</span>
        <span className="flex items-center gap-2">
          {app.companyFeedback && (
            <span className={cn("rounded px-1.5 py-px font-medium", app.companyFeedback.verdict === "interested" ? "bg-emerald-50 text-emerald-700" : app.companyFeedback.verdict === "maybe" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700")}>
              Resp.: {app.companyFeedback.verdict === "interested" ? "👍" : app.companyFeedback.verdict === "maybe" ? "🤔" : "👎"}
            </span>
          )}
          {app.rating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="size-3 fill-current" /> {app.rating}
            </span>
          )}
        </span>
      </div>
    </div>
  );
  return link ? (
    <Link
      href={`/portal/candidaturas/${app.id}`}
      draggable={false}
      onClickCapture={(e) => {
        // Al soltar tras arrastrar no queremos navegar
        if (Date.now() - lastDragEndAt < 250) e.preventDefault();
      }}
    >
      {content}
    </Link>
  ) : (
    content
  );
}
