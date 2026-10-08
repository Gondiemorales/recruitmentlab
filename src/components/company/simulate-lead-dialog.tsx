"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Mail, Sparkles, Zap } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyLogo, FacebookIcon, InstagramIcon, MetaIcon, PersonAvatar } from "@/components/shared/brand";
import { cn } from "@/lib/utils";
import { EmailPreview } from "./email-preview";

type Phase = "config" | "incoming" | "emailing" | "sent";

/** Simula la llegada de un lead desde Meta Lead Ads y el envío automático del email */
export function SimulateLeadDialog({
  open,
  onOpenChange,
  defaultJobId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultJobId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        {/* El cuerpo se monta al abrir, así su estado empieza limpio cada vez */}
        {open && <SimulateLeadBody defaultJobId={defaultJobId} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function SimulateLeadBody({ defaultJobId, onDone }: { defaultJobId?: string; onDone: () => void }) {
  const { jobs, companies, leads } = useScopedData();
  const simulateLead = useDemo((s) => s.simulateLead);
  const sendInvite = useDemo((s) => s.sendInvite);

  const eligible = useMemo(() => jobs.filter((j) => j.status === "active"), [jobs]);
  const [jobId, setJobId] = useState(() => (defaultJobId && eligible.some((j) => j.id === defaultJobId) ? defaultJobId : (eligible[0]?.id ?? "")));
  const [platform, setPlatform] = useState<Lead["platform"]>("instagram");
  const [phase, setPhase] = useState<Phase>("config");
  const [leadId, setLeadId] = useState<string | null>(null);

  const lead = leads.find((l) => l.id === leadId) ?? null;
  const job = jobs.find((j) => j.id === (lead?.jobId ?? jobId));
  const company = job && companies.find((c) => c.id === job.companyId);

  const run = async () => {
    if (!jobId) return;
    const l = simulateLead(jobId, { platform });
    setLeadId(l.id);
    setPhase("incoming");
    await wait(1300);
    setPhase("emailing");
    await wait(1100);
    sendInvite(l.id);
    setPhase("sent");
  };

  return (
    <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="flex size-7 items-center justify-center rounded-lg bg-meta text-white">
              <MetaIcon className="size-4" />
            </span>
            Lead de prueba de Meta
          </DialogTitle>
          <DialogDescription>
            Envía un lead de prueba como el de la herramienta de pruebas de Lead Ads de Meta. Recorre el mismo circuito que uno real, con el email automático incluido.
          </DialogDescription>
        </DialogHeader>

        {phase === "config" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">Campaña / oferta</p>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {eligible.map((j) => {
                  const c = companies.find((x) => x.id === j.companyId);
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setJobId(j.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-colors",
                        jobId === j.id ? "border-primary bg-primary/[0.03]" : "hover:border-primary/30",
                      )}
                    >
                      {c && <CompanyLogo name={c.name} hue={c.hue} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{j.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c?.name} · {j.campaign?.name ?? "Sin campaña"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Plataforma</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "instagram", label: "Instagram", icon: InstagramIcon },
                    { id: "facebook", label: "Facebook", icon: FacebookIcon },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "flex h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-medium transition-colors",
                      platform === p.id ? "border-primary bg-primary/[0.03] text-primary" : "hover:border-primary/30",
                    )}
                  >
                    <p.icon /> {p.label}
                  </button>
                ))}
              </div>
            </div>
            <Button size="xl" className="w-full" onClick={run} disabled={!jobId}>
              <Zap data-icon="inline-start" /> Enviar lead de prueba
            </Button>
          </div>
        )}

        {phase !== "config" && lead && job && company && (
          <div className="space-y-4">
            <Timeline phase={phase} />

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-soft"
              >
                <PersonAvatar name={lead.fullName} className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{lead.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.email} · {lead.phone}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                  {lead.platform === "instagram" ? <InstagramIcon className="size-3.5" /> : <FacebookIcon className="size-3.5" />}
                  {lead.platform === "instagram" ? "Instagram" : "Facebook"}
                </span>
              </motion.div>
            </AnimatePresence>

            {phase === "sent" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <EmailPreview lead={lead} job={job} company={company} />
                <p className="flex items-start gap-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                  Pulsa el botón del email para ver lo que recibe el candidato: se abre la oferta con sus datos ya rellenados.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setPhase("config")}>
                    Enviar otro
                  </Button>
                  <Button className="flex-1" onClick={onDone}>
                    Hecho
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
    </>
  );
}

function Timeline({ phase }: { phase: Phase }) {
  const steps = [
    { id: "incoming", label: "Lead recibido", icon: MetaIcon },
    { id: "emailing", label: "Enviando email", icon: Mail },
    { id: "sent", label: "Email entregado", icon: CheckCircle2 },
  ] as const;
  const idx = steps.findIndex((s) => s.id === phase);
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => {
        const done = i < idx || phase === "sent";
        const current = i === idx && phase !== "sent";
        return (
          <div
            key={s.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
              done && "border-emerald-200 bg-emerald-50 text-emerald-700",
              current && "border-primary/30 bg-primary/5 text-primary",
              !done && !current && "text-muted-foreground",
            )}
          >
            {current ? <Loader2 className="size-3.5 animate-spin" /> : <s.icon className="size-3.5" />}
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
