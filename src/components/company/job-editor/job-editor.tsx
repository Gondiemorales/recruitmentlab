"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, FileText, ListChecks, Loader2, Megaphone, Save, Send, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useDemo, type JobInput } from "@/lib/store";
import { usePublishGuard, useScopedData } from "@/lib/workspace";
import type { EmploymentType, Job, MetaCampaign, MetaCreative, SalaryPeriod, WorkMode } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABEL, SALARY_PERIOD_LABEL, WORK_MODE_LABEL } from "@/lib/labels";
import { uid } from "@/lib/id";
import { PageHeader } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetaIcon } from "@/components/shared/brand";
import { QuestionField } from "@/components/apply/question-field";
import { cn } from "@/lib/utils";
import { QuestionBuilder } from "./question-builder";
import { AdPreview } from "./ad-preview";

type Errors = Partial<Record<"title" | "summary" | "city" | "description" | "companyId", string>>;

function emptyCampaign(title: string, city: string, hue: number): MetaCampaign {
  return {
    id: uid("cmp"),
    name: `${title || "Nueva oferta"} · Lead Ads`,
    status: "learning",
    objective: "lead_generation",
    dailyBudget: 20,
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    leads: 0,
    audience: `18-50 años · 30 km alrededor de ${city || "tu ciudad"}`,
    placements: ["facebook", "instagram"],
    primaryText: "",
    creatives: [{ id: uid("crv"), kind: "image", headline: title, hue }],
    startedAt: new Date().toISOString(),
  };
}

function toInput(job: Job): JobInput {
  const { id: _i, slug: _s, createdAt: _c, updatedAt: _u, publishedAt: _p, views: _v, ...rest } = job;
  return rest;
}

export function JobEditor({ job }: { job?: Job }) {
  const router = useRouter();
  const companies = useScopedData().companies;
  const createJob = useDemo((s) => s.createJob);
  const updateJob = useDemo((s) => s.updateJob);
  const canPublish = usePublishGuard();

  const [draft, setDraft] = useState<JobInput>(
    () =>
      (job && toInput(job)) ?? {
        companyId: companies[0]?.id ?? "",
        title: "",
        summary: "",
        description: "",
        responsibilities: [],
        requirements: [],
        benefits: [],
        city: "",
        region: "",
        workMode: "onsite",
        employmentType: "full_time",
        salaryMin: null,
        salaryMax: null,
        salaryPeriod: "month",
        tags: [],
        status: "draft",
        questions: [],
        campaign: null,
      },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const company = companies.find((c) => c.id === draft.companyId);
  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setCampaign = (patch: Partial<MetaCampaign>) => setDraft((d) => (d.campaign ? { ...d, campaign: { ...d.campaign, ...patch } } : d));
  const setCreative = (patch: Partial<MetaCreative>) =>
    setDraft((d) =>
      d.campaign ? { ...d, campaign: { ...d.campaign, creatives: [{ ...d.campaign.creatives[0]!, ...patch }, ...d.campaign.creatives.slice(1)] } } : d,
    );

  const validate = () => {
    const e: Errors = {};
    if (!draft.companyId) e.companyId = "Elige una empresa";
    if (draft.title.trim().length < 4) e.title = "Mínimo 4 caracteres";
    if (draft.summary.trim().length < 10) e.summary = "Una frase que resuma el puesto";
    if (draft.city.trim().length < 2) e.city = "Indica la ciudad";
    if (draft.description.trim().length < 30) e.description = "Describe el puesto (mín. 30 caracteres)";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Revisa los campos marcados");
      document.getElementById("datos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return !Object.keys(e).length;
  };

  const save = async (mode: "draft" | "publish") => {
    if (!validate()) return;
    const emptyQuestion = draft.questions.find((q) => !q.label.trim());
    if (emptyQuestion) {
      toast.error("Hay preguntas sin título");
      return;
    }
    if (mode === "publish") {
      const blocked = canPublish(job?.id ?? null, draft.companyId);
      if (blocked) {
        toast.error("No se puede publicar", { description: blocked });
        return;
      }
    }
    setSaving(mode);
    await new Promise((r) => setTimeout(r, 500));
    const status = mode === "publish" ? "active" : job?.status === "active" ? "active" : "draft";
    const payload: JobInput = { ...draft, status };
    if (job) {
      updateJob(job.id, payload);
      toast.success(mode === "publish" ? "Oferta publicada" : "Cambios guardados");
      router.push(`/portal/ofertas/${job.id}`);
    } else {
      const created = createJob(payload);
      toast.success(mode === "publish" ? "¡Oferta publicada y campaña en revisión en Meta!" : "Borrador guardado");
      router.push(`/portal/ofertas/${created.id}`);
    }
  };

  const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <PageHeader
        back={{ href: job ? `/portal/ofertas/${job.id}` : "/portal/ofertas", label: job ? "Volver a la oferta" : "Ofertas" }}
        title={job ? "Editar oferta" : "Nueva oferta"}
        description="Define el puesto, las preguntas de filtrado y la campaña de Meta."
        actions={
          <>
            <Button variant="outline" size="lg" onClick={() => setPreviewOpen(true)}>
              <Eye data-icon="inline-start" /> Vista candidato
            </Button>
            <Button variant="outline" size="lg" onClick={() => save("draft")} disabled={!!saving}>
              {saving === "draft" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              Guardar
            </Button>
            {draft.status !== "active" && (
              <Button size="lg" onClick={() => save("publish")} disabled={!!saving}>
                {saving === "publish" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Send data-icon="inline-start" />}
                Publicar
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card id="datos" icon={Settings2} title="Datos del puesto">
            <div className="grid gap-4 sm:grid-cols-2">
              {companies.length > 1 && (
                <Field label="Empresa" error={errors.companyId}>
                  <SimpleSelect value={draft.companyId} onChange={(v) => set("companyId", v)} options={companies.map((c) => ({ value: c.id, label: c.name }))} />
                </Field>
              )}
              <Field label="Título del puesto" error={errors.title} className={companies.length > 1 ? undefined : "sm:col-span-2"}>
                <Input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej.: Camarero/a de sala" />
              </Field>
              <Field label="Resumen (aparece en la tarjeta)" error={errors.summary} className="sm:col-span-2">
                <Input value={draft.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Una frase atractiva que resuma la oferta" />
              </Field>
              <Field label="Ciudad" error={errors.city}>
                <Input value={draft.city} onChange={(e) => set("city", e.target.value)} placeholder="Málaga" />
              </Field>
              <Field label="Provincia / región">
                <Input value={draft.region} onChange={(e) => set("region", e.target.value)} placeholder="Andalucía" />
              </Field>
              <Field label="Modalidad">
                <SimpleSelect<WorkMode>
                  value={draft.workMode}
                  onChange={(v) => set("workMode", v)}
                  options={(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((k) => ({ value: k, label: WORK_MODE_LABEL[k] }))}
                />
              </Field>
              <Field label="Tipo de contrato">
                <SimpleSelect<EmploymentType>
                  value={draft.employmentType}
                  onChange={(v) => set("employmentType", v)}
                  options={(Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[]).map((k) => ({ value: k, label: EMPLOYMENT_TYPE_LABEL[k] }))}
                />
              </Field>
              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                <Field label="Salario mín. (€)">
                  <Input
                    type="number"
                    value={draft.salaryMin ?? ""}
                    onChange={(e) => set("salaryMin", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="1500"
                  />
                </Field>
                <Field label="Salario máx. (€)">
                  <Input
                    type="number"
                    value={draft.salaryMax ?? ""}
                    onChange={(e) => set("salaryMax", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="1800"
                  />
                </Field>
                <Field label="Periodo">
                  <SimpleSelect<SalaryPeriod>
                    value={draft.salaryPeriod}
                    onChange={(v) => set("salaryPeriod", v)}
                    options={(Object.keys(SALARY_PERIOD_LABEL) as SalaryPeriod[]).map((k) => ({ value: k, label: `Por ${SALARY_PERIOD_LABEL[k]}` }))}
                  />
                </Field>
              </div>
              <Field label="Etiquetas (separadas por comas)" className="sm:col-span-2">
                <Input
                  defaultValue={draft.tags.join(", ")}
                  onBlur={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="Hostelería, Inglés, Temporada"
                />
              </Field>
            </div>
          </Card>

          <Card icon={FileText} title="Descripción">
            <div className="grid gap-4">
              <Field label="Sobre el puesto" error={errors.description}>
                <Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} className="min-h-28" placeholder="Describe la empresa, el equipo y el puesto…" />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Qué harás" hint="Una por línea">
                  <Textarea defaultValue={draft.responsibilities.join("\n")} onBlur={(e) => set("responsibilities", lines(e.target.value))} className="min-h-32" />
                </Field>
                <Field label="Qué buscamos" hint="Una por línea">
                  <Textarea defaultValue={draft.requirements.join("\n")} onBlur={(e) => set("requirements", lines(e.target.value))} className="min-h-32" />
                </Field>
                <Field label="Qué ofrecemos" hint="Una por línea">
                  <Textarea defaultValue={draft.benefits.join("\n")} onBlur={(e) => set("benefits", lines(e.target.value))} className="min-h-32" />
                </Field>
              </div>
            </div>
          </Card>

          <Card
            icon={ListChecks}
            title="Preguntas y test"
            description="El candidato las responde al aplicar. Las eliminatorias y los test se puntúan automáticamente."
          >
            <QuestionBuilder questions={draft.questions} onChange={(q) => set("questions", q)} />
          </Card>

          <Card
            icon={Megaphone}
            title="Campaña de Meta Lead Ads"
            description="Anuncio en Facebook e Instagram con formulario instantáneo. Cada lead recibe el email automático."
            action={
              <Switch
                checked={!!draft.campaign}
                onCheckedChange={(v) => set("campaign", v ? (job?.campaign ?? emptyCampaign(draft.title, draft.city, company?.hue ?? 250)) : null)}
              />
            }
          >
            {draft.campaign ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de la campaña" className="sm:col-span-2">
                  <Input value={draft.campaign.name} onChange={(e) => setCampaign({ name: e.target.value })} />
                </Field>
                <Field label="Presupuesto diario (€)">
                  <Input type="number" min={5} value={draft.campaign.dailyBudget} onChange={(e) => setCampaign({ dailyBudget: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Formato de la creatividad">
                  <SimpleSelect<MetaCreative["kind"]>
                    value={draft.campaign.creatives[0]?.kind ?? "image"}
                    onChange={(v) => setCreative({ kind: v })}
                    options={[
                      { value: "image", label: "Imagen" },
                      { value: "video", label: "Vídeo" },
                      { value: "carousel", label: "Carrusel" },
                    ]}
                  />
                </Field>
                <Field label="Público objetivo" className="sm:col-span-2">
                  <Input value={draft.campaign.audience} onChange={(e) => setCampaign({ audience: e.target.value })} />
                </Field>
                <Field label="Titular de la creatividad" className="sm:col-span-2">
                  <Input value={draft.campaign.creatives[0]?.headline ?? ""} onChange={(e) => setCreative({ headline: e.target.value })} placeholder="Trabaja frente al mar" />
                </Field>
                <Field label="Texto principal" className="sm:col-span-2">
                  <Textarea
                    value={draft.campaign.primaryText}
                    onChange={(e) => setCampaign({ primaryText: e.target.value })}
                    placeholder="🌊 ¿Te imaginas trabajar frente al mar? Buscamos…"
                    className="min-h-24"
                  />
                </Field>
                <Field label="Color de la creatividad" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {[210, 250, 285, 330, 15, 35, 85, 145, 175].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setCreative({ hue: h })}
                        className={cn("size-8 rounded-full ring-offset-2 transition", draft.campaign?.creatives[0]?.hue === h && "ring-2 ring-primary")}
                        style={{ background: `linear-gradient(150deg, oklch(0.72 0.14 ${h}), oklch(0.42 0.18 ${h + 30}))` }}
                        aria-label={`Color ${h}`}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin campaña: la oferta solo se publicará en la web y podrás importar leads manualmente.
              </p>
            )}
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {draft.campaign && company ? (
            <div className="rounded-2xl border bg-white p-4 shadow-soft">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MetaIcon className="text-meta" /> Vista previa del anuncio
              </p>
              <AdPreview
                companyName={company.name}
                companyHue={company.hue}
                primaryText={draft.campaign.primaryText}
                creative={draft.campaign.creatives[0] ?? { kind: "image", headline: draft.title, hue: company.hue }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Activa la campaña de Meta para ver la vista previa del anuncio.
            </div>
          )}
          <div className="rounded-2xl border bg-white p-4 text-sm shadow-soft">
            <p className="font-semibold">Checklist</p>
            <ul className="mt-3 space-y-2">
              {[
                ["Título y resumen", draft.title.length >= 4 && draft.summary.length >= 10],
                ["Descripción completa", draft.description.length >= 30],
                ["Al menos una pregunta de filtro", draft.questions.length > 0],
                ["Pregunta eliminatoria", draft.questions.some((q) => q.knockout)],
                ["Campaña de Meta configurada", !!draft.campaign?.primaryText],
              ].map(([label, ok]) => (
                <li key={label as string} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", ok ? "bg-emerald-500" : "bg-slate-300")} />
                  <span className={ok ? "" : "text-muted-foreground"}>{label as string}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Así verá el candidato las preguntas</DialogTitle>
            <DialogDescription>Vista previa interactiva (no se guarda ninguna respuesta).</DialogDescription>
          </DialogHeader>
          <PreviewQuestions questions={draft.questions} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreviewQuestions({ questions }: { questions: JobInput["questions"] }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  if (!questions.length) return <p className="text-sm text-muted-foreground">Esta oferta no tiene preguntas.</p>;
  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={q.id}>
          <p className="mb-1 text-xs font-medium text-primary">
            Pregunta {i + 1} {q.required && "· obligatoria"}
          </p>
          <p className="mb-3 font-semibold">{q.label || "Pregunta sin título"}</p>
          <QuestionField question={q} value={answers[q.id] as never} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
        </div>
      ))}
    </div>
  );
}

function Card({
  id,
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border bg-white shadow-soft">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="flex-1">
          <h2 className="font-display font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-baseline justify-between">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      <div className={cn("[&_input]:bg-white [&_textarea]:bg-white", error && "[&_input]:border-destructive [&_textarea]:border-destructive")}>{children}</div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
