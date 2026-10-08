"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle2, CornerDownLeft, Loader2, Lock, Mail, PartyPopper, Phone, User, Wand2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { isAnswered, formatAnswer } from "@/lib/scoring";
import type { AnswerValue, Application, Job, Lead } from "@/lib/types";
import { CompanyLogo, InstagramIcon, FacebookIcon, Logo } from "@/components/shared/brand";
import { EmptyState } from "@/components/shared/states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EMPLEO, JOBS_URL, jobUrl, legalUrl } from "@/lib/routes";
import { QuestionField } from "./question-field";
import { CvDropzone, type SelectedCv } from "./cv-dropzone";

type Step = "personal" | "cv" | "questions" | "review" | "done";

const personalSchema = z.object({
  fullName: z.string().trim().min(3, "Escribe tu nombre y apellidos"),
  email: z.string().trim().email("Revisa el formato del email"),
  phone: z.string().trim().min(9, "Escribe un teléfono válido"),
  city: z.string().trim().min(2, "¿Dónde vives?"),
  linkedinUrl: z.string().trim().optional(),
});
type Personal = z.infer<typeof personalSchema>;

export function ApplyFlow({ slug, token }: { slug: string; token: string | null }) {
  const hydrated = useDemo((s) => s.hydrated);
  const { jobs, companies } = useDemo((s) => s.data);
  const job = jobs.find((j) => j.slug === slug || j.id === slug);
  const company = job && companies.find((c) => c.id === job.companyId);

  if (!hydrated) {
    return (
      <Shell>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-80 rounded-3xl" />
      </Shell>
    );
  }

  if (!job || !company || job.status !== "active") {
    return (
      <Shell>
        <EmptyState
          icon={Briefcase}
          title="Esta oferta no admite candidaturas"
          description="Puede que el proceso esté cerrado o en pausa."
          action={
            <Link href={JOBS_URL} className={buttonVariants()}>
              Ver ofertas activas
            </Link>
          }
        />
      </Shell>
    );
  }

  return <Flow job={job} companyName={company.name} companyHue={company.hue} token={token} />;
}

function Flow({ job, companyName, companyHue, token }: { job: Job; companyName: string; companyHue: number; token: string | null }) {
  const trackLeadClick = useDemo((s) => s.trackLeadClick);
  const submitApplication = useDemo((s) => s.submitApplication);

  // Lead del enlace del email (?t=token): sus datos rellenan el formulario
  const [lead] = useState<Lead | null>(
    () => (token && useDemo.getState().data.leads.find((l) => l.token === token && l.jobId === job.id)) || null,
  );
  const [step, setStep] = useState<Step>("personal");
  const [personal, setPersonal] = useState<Personal>(() => ({
    fullName: lead?.fullName ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    city: lead?.city ?? "",
    linkedinUrl: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Personal | "cv" | "privacy" | "question", string>>>({});
  const [cv, setCv] = useState<SelectedCv | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [qIndex, setQIndex] = useState(0);
  const [consents, setConsents] = useState({ privacy: false, retention: false, marketing: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Application | null>(null);

  // Registrar el clic en el enlace del email (una sola vez)
  const tracked = useRef(false);
  useEffect(() => {
    if (!lead || tracked.current) return;
    tracked.current = true;
    trackLeadClick(lead.token);
  }, [lead, trackLeadClick]);

  const questions = job.questions;
  const steps: { id: Step; label: string }[] = useMemo(
    () => [
      { id: "personal", label: "Tus datos" },
      { id: "cv", label: "CV" },
      ...(questions.length ? [{ id: "questions" as const, label: "Preguntas" }] : []),
      { id: "review", label: "Enviar" },
    ],
    [questions.length],
  );
  const stepIdx = steps.findIndex((s) => s.id === step);
  const progress =
    step === "done"
      ? 100
      : step === "questions"
        ? ((stepIdx + (qIndex + 1) / Math.max(1, questions.length)) / steps.length) * 100
        : ((stepIdx + (step === "review" ? 0.5 : 0)) / steps.length) * 100;

  const goNext = useCallback(() => {
    setErrors({});
    if (step === "personal") {
      const parsed = personalSchema.safeParse(personal);
      if (!parsed.success) {
        const e: typeof errors = {};
        for (const issue of parsed.error.issues) e[issue.path[0] as keyof Personal] = issue.message;
        setErrors(e);
        return;
      }
      setStep("cv");
    } else if (step === "cv") {
      if (!cv) return setErrors({ cv: "Adjunta tu CV para continuar" });
      setStep(questions.length ? "questions" : "review");
    } else if (step === "questions") {
      const q = questions[qIndex]!;
      if (q.required && !isAnswered(q, answers[q.id])) return setErrors({ question: "Esta pregunta es obligatoria" });
      if (qIndex < questions.length - 1) setQIndex((i) => i + 1);
      else setStep("review");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, personal, cv, questions, qIndex, answers]);

  const goBack = () => {
    setErrors({});
    if (step === "cv") setStep("personal");
    else if (step === "questions") {
      if (qIndex > 0) setQIndex((i) => i - 1);
      else setStep("cv");
    } else if (step === "review") {
      if (questions.length) {
        setQIndex(questions.length - 1);
        setStep("questions");
      } else setStep("cv");
    }
  };

  // Atajos de teclado en preguntas tipo test: letras para elegir, Enter para avanzar
  useEffect(() => {
    if (step !== "questions") return;
    const q = questions[qIndex];
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        if (e.key === "Enter" && target.tagName === "INPUT") goNext();
        return;
      }
      if (e.key === "Enter") return goNext();
      if (!q) return;
      const key = e.key.toUpperCase();
      if (q.type === "yes_no" && (key === "S" || key === "N")) setAnswers((a) => ({ ...a, [q.id]: key === "S" }));
      if ((q.type === "single_choice" || q.type === "multiple_choice") && q.options) {
        const opt = q.options[key.charCodeAt(0) - 65];
        if (!opt || key.length !== 1) return;
        setAnswers((a) => {
          if (q.type === "single_choice") return { ...a, [q.id]: opt.id };
          const cur = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : [];
          return { ...a, [q.id]: cur.includes(opt.id) ? cur.filter((x) => x !== opt.id) : [...cur, opt.id] };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, qIndex, questions, goNext]);

  const submit = async () => {
    if (!consents.privacy) return setErrors({ privacy: "Necesitamos tu consentimiento para tramitar la candidatura" });
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100)); // latencia simulada
    const app = submitApplication({
      jobId: job.id,
      leadToken: lead?.token ?? null,
      fullName: personal.fullName,
      email: personal.email,
      phone: personal.phone,
      city: personal.city,
      linkedinUrl: personal.linkedinUrl ?? "",
      answers,
      cv: { name: cv!.file.name, sizeBytes: cv!.file.size, mimeType: cv!.file.type || "application/pdf" },
      cvObjectUrl: cv!.url,
      consents,
    });
    setResult(app);
    setSubmitting(false);
    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const firstName = personal.fullName.split(" ")[0];

  return (
    <Shell
      header={
        <div className="flex items-center gap-3">
          <CompanyLogo name={companyName} hue={companyHue} size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{job.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {companyName} · {job.city}
            </p>
          </div>
        </div>
      }
      progress={progress}
    >
      {step !== "done" && (
        <ol className="mb-8 flex items-center gap-2 text-xs font-medium">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-[11px] transition-colors",
                  i < stepIdx ? "bg-emerald-500 text-white" : i === stepIdx ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {i < stepIdx ? <CheckCircle2 className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("hidden sm:inline", i === stepIdx ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < steps.length - 1 && <span className="h-px w-4 bg-border sm:w-8" />}
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step === "questions" ? `q-${qIndex}` : step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {step === "personal" && (
            <div>
              {lead && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <Wand2 className="mt-0.5 size-5 shrink-0 text-violet-600" />
                  <div className="text-sm">
                    <p className="font-semibold text-violet-900">¡Hola {lead.fullName.split(" ")[0]}! Ya tenemos tus datos</p>
                    <p className="text-violet-800/80">
                      Los hemos rellenado con lo que nos enviaste desde{" "}
                      {lead.platform === "instagram" ? (
                        <InstagramIcon className="inline size-3.5 align-[-2px]" />
                      ) : (
                        <FacebookIcon className="inline size-3.5 align-[-2px]" />
                      )}{" "}
                      {lead.platform === "instagram" ? "Instagram" : "Facebook"}. Revisa que estén bien.
                    </p>
                  </div>
                </div>
              )}
              <StepTitle title="Cuéntanos quién eres" subtitle="Solo lo necesario para contactarte." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre y apellidos" error={errors.fullName} icon={User} className="sm:col-span-2" prefilled={!!lead}>
                  <Input
                    value={personal.fullName}
                    onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                    placeholder="Lucía Martín Ruiz"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" error={errors.email} icon={Mail} prefilled={!!lead}>
                  <Input
                    type="email"
                    value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Teléfono" error={errors.phone} icon={Phone} prefilled={!!lead}>
                  <Input
                    type="tel"
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    placeholder="+34 600 000 000"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Ciudad de residencia" error={errors.city} prefilled={!!lead && !!lead.city}>
                  <Input value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} placeholder="Málaga" />
                </Field>
                <Field label="LinkedIn (opcional)">
                  <Input
                    value={personal.linkedinUrl}
                    onChange={(e) => setPersonal({ ...personal, linkedinUrl: e.target.value })}
                    placeholder="linkedin.com/in/…"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === "cv" && (
            <div>
              <StepTitle title="Adjunta tu CV" subtitle="Lo compartiremos únicamente con la empresa si tu perfil encaja." />
              <CvDropzone value={cv} onChange={setCv} error={errors.cv} />
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" /> Tu CV se guarda de forma privada y cifrada.
              </p>
            </div>
          )}

          {step === "questions" && questions[qIndex] && (
            <div>
              <p className="mb-3 text-sm font-medium text-primary">
                Pregunta {qIndex + 1} de {questions.length}
                {questions[qIndex]!.required && <span className="text-muted-foreground"> · obligatoria</span>}
              </p>
              <h2 className="text-2xl leading-snug font-semibold sm:text-3xl">{questions[qIndex]!.label}</h2>
              {questions[qIndex]!.helpText && <p className="mt-2 text-muted-foreground">{questions[qIndex]!.helpText}</p>}
              <div className="mt-8">
                <QuestionField
                  autoFocus
                  question={questions[qIndex]!}
                  value={answers[questions[qIndex]!.id]}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, [questions[qIndex]!.id]: v }));
                    setErrors({});
                  }}
                />
              </div>
              {errors.question && <p className="mt-3 text-sm text-destructive">{errors.question}</p>}
              <p className="mt-6 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                Pulsa <kbd className="rounded border bg-white px-1.5 py-0.5 font-mono">Enter</kbd> <CornerDownLeft className="size-3" /> para continuar
              </p>
            </div>
          )}

          {step === "review" && (
            <div>
              <StepTitle title="Revisa y envía" subtitle="Comprueba que todo está correcto." />
              <div className="divide-y rounded-2xl border bg-white">
                <ReviewRow label="Datos" onEdit={() => setStep("personal")}>
                  <p className="font-medium">{personal.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {personal.email} · {personal.phone} · {personal.city}
                  </p>
                </ReviewRow>
                <ReviewRow label="CV" onEdit={() => setStep("cv")}>
                  <p className="font-medium">{cv?.file.name}</p>
                </ReviewRow>
                {questions.length > 0 && (
                  <ReviewRow
                    label="Respuestas"
                    onEdit={() => {
                      setQIndex(0);
                      setStep("questions");
                    }}
                  >
                    <ul className="space-y-1.5 text-sm">
                      {questions.map((q) => (
                        <li key={q.id}>
                          <span className="text-muted-foreground">{q.label}</span>{" "}
                          <span className="font-medium">{formatAnswer(q, answers[q.id])}</span>
                        </li>
                      ))}
                    </ul>
                  </ReviewRow>
                )}
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-secondary/50 p-5">
                <Consent
                  checked={consents.privacy}
                  onChange={(v) => {
                    setConsents({ ...consents, privacy: v });
                    setErrors({});
                  }}
                  error={errors.privacy}
                >
                  He leído y acepto la{" "}
                  <Link href={legalUrl("empleo", "privacidad-candidatos")} target="_blank" className="font-medium text-primary underline underline-offset-2">
                    política de privacidad para candidatos
                  </Link>{" "}
                  *
                </Consent>
                <Consent checked={consents.retention} onChange={(v) => setConsents({ ...consents, retention: v })}>
                  Quiero que conservéis mi CV durante 2 años para futuras ofertas.
                </Consent>
                <Consent checked={consents.marketing} onChange={(v) => setConsents({ ...consents, marketing: v })}>
                  Quiero recibir ofertas de empleo similares por email.
                </Consent>
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <PartyPopper className="size-9" />
              </motion.div>
              <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">¡Candidatura enviada, {firstName}!</h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Hemos recibido tu candidatura para <strong className="text-foreground">{job.title}</strong>. Te hemos enviado un email de confirmación
                a {personal.email}.
              </p>

              <div className="mx-auto mt-10 max-w-md space-y-3 text-left">
                {[
                  { t: "Ahora", d: "Nuestro equipo revisa tu perfil y tus respuestas." },
                  { t: "En 48-72 h", d: "Si encajas, te llamamos para una breve entrevista." },
                  { t: "Siempre", d: "Te escribiremos con la decisión final, sea cual sea." },
                ].map((s, i) => (
                  <div key={s.t} className="flex gap-4 rounded-2xl border bg-white p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold">{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={JOBS_URL} className={buttonVariants({ size: "lg", variant: "outline" })}>
                  Ver más ofertas
                </Link>
                <Link href={EMPLEO} className={buttonVariants({ size: "lg", variant: "ghost" })}>
                  Ir al inicio
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step !== "done" && (
        <div className="mt-10 flex items-center justify-between gap-3 border-t pt-6">
          {step !== "personal" ? (
            <Button variant="ghost" size="lg" onClick={goBack} disabled={submitting}>
              <ArrowLeft data-icon="inline-start" /> Atrás
            </Button>
          ) : (
            <Link href={jobUrl(job.slug)} className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Ver oferta
            </Link>
          )}
          {step === "review" ? (
            <Button size="xl" onClick={submit} disabled={submitting} className="shadow-glow">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" /> Enviando…
                </>
              ) : (
                <>
                  Enviar candidatura <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          ) : (
            <Button size="xl" onClick={goNext}>
              Continuar <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      )}
    </Shell>
  );
}

// ───────────────────────── Piezas ─────────────────────────

function Shell({ children, header, progress }: { children: React.ReactNode; header?: React.ReactNode; progress?: number }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          {header ?? <Logo href={EMPLEO} tag="Empleo" />}
          <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Lock className="size-3.5" /> Conexión segura
          </span>
        </div>
        {progress !== undefined && (
          <div className="h-1 bg-muted">
            <motion.div className="h-full bg-gradient-to-r from-brand to-brand-2" animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
        <div className="rounded-3xl border bg-white/90 p-6 shadow-soft sm:p-10">{children}</div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Proceso gestionado por <span className="font-semibold">Recruitment Lab</span>
        </p>
      </main>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  error,
  icon: Icon,
  prefilled,
  className,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  prefilled?: boolean;
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {label}
        {prefilled && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
            <Wand2 className="size-3" /> Autorrellenado
          </span>
        )}
      </Label>
      <div className={cn("[&_input]:h-12 [&_input]:rounded-xl [&_input]:bg-white [&_input]:text-base", error && "[&_input]:border-destructive")}>{children}</div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-4 sm:p-5">
      <div className="flex-1">
        <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        {children}
      </div>
      <button type="button" onClick={onEdit} className="self-start text-sm font-medium text-primary hover:underline">
        Editar
      </button>
    </div>
  );
}

function Consent({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1 ml-7 text-sm text-destructive">{error}</p>}
    </div>
  );
}
