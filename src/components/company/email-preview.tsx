"use client";

import { ExternalLink, MapPin, Wallet } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Company, Job, Lead } from "@/lib/types";
import { formatDateTime, formatSalary } from "@/lib/format";
import { CompanyLogo, LogoMark } from "@/components/shared/brand";
import { WORK_MODE_LABEL } from "@/lib/labels";
import { applyUrl } from "@/lib/routes";

export function applyLink(job: Job, lead: Lead) {
  return applyUrl(job.slug, lead.token);
}

/** Vista previa del email automático que recibe cada lead */
export function EmailPreview({ lead, job, company }: { lead: Lead; job: Job; company: Company }) {
  const markLeadOpened = useDemo((s) => s.markLeadOpened);
  const first = lead.fullName.split(" ")[0];
  const salary = formatSalary(job);

  const open = () => {
    markLeadOpened(lead.id);
    window.open(applyLink(job, lead), "_blank", "noopener");
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white text-sm shadow-soft">
      <div className="space-y-1 border-b bg-muted/40 px-4 py-3 text-xs">
        <p>
          <span className="text-muted-foreground">De:</span> <span className="font-medium">Recruitment Lab</span>{" "}
          <span className="text-muted-foreground">&lt;ofertas@recruitmentlab.es&gt;</span>
        </p>
        <p>
          <span className="text-muted-foreground">Para:</span> {lead.email}
        </p>
        <p className="text-sm font-semibold">
          {first}, completa tu candidatura para {job.title}
        </p>
        {lead.emailedAt && <p className="text-muted-foreground">{formatDateTime(lead.emailedAt)}</p>}
      </div>
      <div className="bg-secondary/40 p-4 sm:p-6">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <LogoMark className="size-7" />
            <CompanyLogo name={company.name} hue={company.hue} size="sm" />
          </div>
          <p className="mt-6 text-base font-semibold">¡Hola {first}! 👋</p>
          <p className="mt-2 leading-relaxed text-slate-600">
            Gracias por tu interés en el puesto de <strong className="text-foreground">{job.title}</strong> en {company.name}. Solo te falta un paso:
            adjuntar tu CV y responder {job.questions.length} preguntas rápidas.
          </p>
          <div className="mt-4 space-y-1.5 rounded-lg bg-secondary/60 p-3 text-xs">
            <p className="flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" /> {job.city} · {WORK_MODE_LABEL[job.workMode]}
            </p>
            {salary && (
              <p className="flex items-center gap-2">
                <Wallet className="size-3.5 text-primary" /> {salary}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={open}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Completar mi candidatura (1 min) <ExternalLink className="size-4" />
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Tus datos ya están rellenados. El enlace es personal.</p>
        </div>
      </div>
    </div>
  );
}
