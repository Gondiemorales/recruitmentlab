"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  Download,
  FileText,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserX,
  HelpCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import type { Application, ApplicationStatus, CompanyFeedback, Job } from "@/lib/types";
import { APPLICATION_PIPELINE, APPLICATION_STATUS, FEEDBACK_LABEL, LEAD_SOURCE_LABEL } from "@/lib/labels";
import { evaluateQuestion, formatAnswer } from "@/lib/scoring";
import { formatBytes, formatDateTime, timeAgo } from "@/lib/format";
import { PersonAvatar, LinkedinIcon } from "@/components/shared/brand";
import { ApplicationStatusBadge, ToneBadge } from "@/components/shared/tone-badge";
import { PageHeader, Panel } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CvDocument } from "./cv-document";
import { ScoreRing } from "./score-ring";

/** Ficha completa del candidato para el equipo de selección de la empresa */
export function CandidateView({ app, job, backHref, jobHref }: { app: Application; job: Job; backHref: string; jobHref: string }) {
  const liveCvUrl = useDemo((s) => s.liveCvUrls[app.id]);
  const [tab, setTab] = useState<"cv" | "answers" | "history">("cv");

  return (
    <>
      <PageHeader
        back={{ href: backHref, label: "Candidaturas" }}
        title={
          <span className="flex items-center gap-4">
            <PersonAvatar name={app.fullName} className="size-14 text-base" />
            <span className="min-w-0">
              <span className="block truncate">{app.fullName}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 font-sans text-sm font-normal text-muted-foreground">
                {app.profile.headline} ·{" "}
                <Link href={jobHref} className="text-primary hover:underline">
                  {job.title}
                </Link>
                <ApplicationStatusBadge status={app.status} />
              </span>
            </span>
          </span>
        }
        actions={<ManageActions app={app} />}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { id: "cv", label: "Currículum", icon: FileText },
                { id: "answers", label: `Respuestas (${job.questions.length})`, icon: MessageSquare },
                { id: "history", label: "Historial", icon: History },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all",
                  tab === t.id ? "bg-white shadow-soft" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="size-4" /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {tab === "cv" && (
            <Panel
              title={app.cv.name}
              description={`${formatBytes(app.cv.sizeBytes)} · subido ${timeAgo(app.createdAt)}`}
              actions={
                liveCvUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(liveCvUrl, "_blank")}>
                    <Download data-icon="inline-start" /> Descargar
                  </Button>
                )
              }
              bodyClassName="bg-muted/40 p-4 sm:p-8"
            >
              {liveCvUrl && app.cv.mimeType === "application/pdf" ? (
                <iframe src={liveCvUrl} title="CV" className="h-[80vh] w-full rounded-md bg-white" />
              ) : liveCvUrl && app.cv.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={liveCvUrl} alt="CV" className="mx-auto max-h-[80vh] rounded-md" />
              ) : (
                <CvDocument app={app} />
              )}
            </Panel>
          )}

          {tab === "answers" && <AnswersPanel app={app} job={job} />}

          {tab === "history" && (
            <Panel title="Historial del candidato">
              <ol className="relative space-y-5 border-l pl-5">
                {[...app.events].reverse().map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute top-1 -left-[25px] size-2.5 rounded-full border-2 border-white bg-primary ring-1 ring-primary/30" />
                    <p className="text-sm font-medium">{e.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(e.at)}</p>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <ScorePanel app={app} job={job} />

          <Panel title="Contacto">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-muted-foreground" />
                <a href={`mailto:${app.email}`} className="truncate hover:text-primary">
                  {app.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-muted-foreground" /> {app.phone}
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 text-muted-foreground" /> {app.city}
              </li>
              {app.linkedinUrl && (
                <li className="flex items-center gap-2.5">
                  <LinkedinIcon className="text-muted-foreground" /> <span className="truncate">{app.linkedinUrl}</span>
                </li>
              )}
            </ul>
          </Panel>

          <ManagerVerdictPanel app={app} />

          <NotesPanel app={app} />

          <Panel title="Origen y consentimientos">
            <dl className="space-y-2 text-sm">
              <Row label="Origen">{LEAD_SOURCE_LABEL[app.source]}</Row>
              <Row label="Aplicó">{formatDateTime(app.createdAt)}</Row>
              <Row label="Privacidad">{app.consents.privacy ? <Yes /> : <No />}</Row>
              <Row label="Conservar 2 años">{app.consents.retention ? <Yes /> : <No />}</Row>
              <Row label="Comunicaciones">{app.consents.marketing ? <Yes /> : <No />}</Row>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}

// ───────────────────────── Acciones del equipo de selección ─────────────────────────

function ManageActions({ app }: { app: Application }) {
  const setStatus = useDemo((s) => s.setApplicationStatus);
  const rate = useDemo((s) => s.rateApplication);

  const change = (status: ApplicationStatus) => {
    if (status === app.status) return;
    setStatus(app.id, status);
    toast.success(`Movida a «${APPLICATION_STATUS[status].label}»`);
  };

  return (
    <>
      <div className="flex items-center gap-0.5 rounded-lg border bg-white px-2 py-1.5" aria-label="Valoración">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => rate(app.id, (app.rating === n ? 0 : n) as Application["rating"])} aria-label={`${n} estrellas`}>
            <Star className={cn("size-4 transition-colors", n <= app.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300")} />
          </button>
        ))}
      </div>
      <SimpleSelect<ApplicationStatus>
        value={app.status}
        onChange={change}
        className="h-10 w-44"
        options={APPLICATION_PIPELINE.map((s) => ({ value: s, label: APPLICATION_STATUS[s].label }))}
      />
      {(app.status === "new" || app.status === "reviewing") && (
        <>
          <Button variant="outline" size="lg" onClick={() => change("rejected")}>
            <UserX data-icon="inline-start" /> Descartar
          </Button>
          <Button size="lg" onClick={() => change("shortlisted")}>
            <Send data-icon="inline-start" /> Preseleccionar
          </Button>
        </>
      )}
      {app.status === "shortlisted" && (
        <Button size="lg" onClick={() => change("interview")}>
          Agendar entrevista
        </Button>
      )}
    </>
  );
}

// ───────────────────────── Puntuación ─────────────────────────

function ScorePanel({ app, job }: { app: Application; job: Job }) {
  const results = job.questions.map((q) => ({ q, r: evaluateQuestion(q, app.answers[q.id] ?? null) }));
  const scored = results.filter((x) => x.r.scored);
  const knockouts = results.filter((x) => x.q.knockout);
  return (
    <Panel title="Encaje con la oferta">
      <div className="flex items-center gap-4">
        <ScoreRing score={app.score} />
        <div className="text-sm">
          {app.knockoutFailed ? (
            <p className="flex items-center gap-1.5 font-semibold text-rose-600">
              <ShieldAlert className="size-4" /> No cumple requisitos
            </p>
          ) : (
            <p className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <ShieldCheck className="size-4" /> Cumple los requisitos
            </p>
          )}
          <p className="mt-0.5 text-muted-foreground">
            {scored.filter((x) => x.r.earned > 0).length}/{scored.length} respuestas de test correctas
          </p>
        </div>
      </div>
      {knockouts.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t pt-4">
          {knockouts.map(({ q, r }) => (
            <li key={q.id} className="flex items-start gap-2 text-xs">
              {r.knockoutFailed ? <X className="mt-px size-3.5 shrink-0 text-rose-600" /> : <Check className="mt-px size-3.5 shrink-0 text-emerald-600" />}
              <span className="text-slate-700">{q.label}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AnswersPanel({ app, job }: { app: Application; job: Job }) {
  if (!job.questions.length) return <Panel title="Respuestas">La oferta no tenía preguntas.</Panel>;
  return (
    <Panel title="Respuestas a las preguntas de la oferta" bodyClassName="p-0">
      <ol className="divide-y">
        {job.questions.map((q, i) => {
          const value = app.answers[q.id];
          const r = evaluateQuestion(q, value ?? null);
          return (
            <li key={q.id} className="flex gap-4 p-5">
              <span className="text-sm text-muted-foreground tabular-nums">{i + 1}.</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{q.label}</p>
                <p className={cn("mt-1 font-medium", q.type === "long_text" && "font-normal leading-relaxed text-slate-700")}>{formatAnswer(q, value)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {r.knockoutFailed && <ToneBadge tone="danger">No cumple</ToneBadge>}
                {r.scored && (
                  <ToneBadge tone={r.earned > 0 ? "success" : "muted"} dot={false}>
                    {r.earned}/{r.possible} pts
                  </ToneBadge>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

// ───────────────────────── Notas y feedback ─────────────────────────

function NotesPanel({ app }: { app: Application }) {
  const addNote = useDemo((s) => s.addNote);
  const [body, setBody] = useState("");
  return (
    <Panel title="Notas internas" description="Solo visibles para tu equipo">
      <div className="space-y-3">
        {app.notes.length === 0 && <p className="text-sm text-muted-foreground">Sin notas todavía.</p>}
        {app.notes.map((n) => (
          <div key={n.id} className="rounded-xl bg-muted/60 p-3 text-sm">
            <p className="leading-relaxed">{n.body}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {n.author} · {timeAgo(n.at)}
            </p>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            addNote(app.id, body.trim());
            setBody("");
          }}
          className="space-y-2"
        >
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ej.: Llamada de screening OK, disponible en 15 días…" className="min-h-20 bg-white" />
          <Button type="submit" size="sm" disabled={!body.trim()}>
            Añadir nota
          </Button>
        </form>
      </div>
    </Panel>
  );
}

/** Valoración rápida del responsable de contratación (p. ej. el jefe del área que entrevista) */
function ManagerVerdictPanel({ app }: { app: Application }) {
  const session = useDemo((s) => s.session);
  const setFeedback = useDemo((s) => s.setCompanyFeedback);
  const current = app.companyFeedback;

  const give = (verdict: CompanyFeedback["verdict"]) => {
    setFeedback(app.id, { verdict, comment: current?.comment ?? "", by: session?.name ?? "Responsable" });
    toast.success(`Valoración guardada: ${FEEDBACK_LABEL[verdict].label}`);
  };

  return (
    <Panel title="Valoración del responsable" description="Opinión de quien decide la contratación">
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { v: "interested", label: "Me interesa", icon: ThumbsUp, active: "border-emerald-300 bg-emerald-50 text-emerald-700" },
            { v: "maybe", label: "Quizá", icon: HelpCircle, active: "border-amber-300 bg-amber-50 text-amber-800" },
            { v: "not_fit", label: "No encaja", icon: ThumbsDown, active: "border-rose-300 bg-rose-50 text-rose-700" },
          ] as const
        ).map((b) => (
          <button
            key={b.v}
            onClick={() => give(b.v)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors",
              current?.verdict === b.v ? b.active : "bg-white hover:bg-muted",
            )}
          >
            <b.icon className="size-4" /> {b.label}
          </button>
        ))}
      </div>
      {current && (
        <p className="mt-3 text-xs text-muted-foreground">
          {current.comment && <span className="mb-1 block text-sm text-foreground">“{current.comment}”</span>}
          {current.by} · {timeAgo(current.at)}
        </p>
      )}
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

const Yes = () => <Check className="ml-auto size-4 text-emerald-600" />;
const No = () => <X className="ml-auto size-4 text-slate-400" />;
