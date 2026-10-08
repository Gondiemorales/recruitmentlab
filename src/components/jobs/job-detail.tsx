"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, Building2, CheckCircle2, Clock, Gift, ListChecks, MapPin, Share2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { EMPLOYMENT_TYPE_LABEL, WORK_MODE_LABEL } from "@/lib/labels";
import { formatSalary, timeAgo } from "@/lib/format";
import { CompanyLogo } from "@/components/shared/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";
import { JOBS_URL, applyUrl } from "@/lib/routes";

export function JobDetail({ slug }: { slug: string }) {
  const hydrated = useDemo((s) => s.hydrated);
  const { jobs, companies } = useDemo((s) => s.data);
  const job = jobs.find((j) => j.slug === slug || j.id === slug);
  const company = job && companies.find((c) => c.id === job.companyId);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!job || !company || job.status === "draft") {
    return (
      <div className="mx-auto max-w-xl px-6 pt-40 pb-24">
        <EmptyState
          icon={Briefcase}
          title="Esta oferta ya no está disponible"
          description="Puede que se haya cubierto el puesto. Echa un vistazo al resto de ofertas activas."
          action={
            <Link href={JOBS_URL} className={buttonVariants()}>
              Ver ofertas activas
            </Link>
          }
        />
      </div>
    );
  }

  const salary = formatSalary(job);
  const open = job.status === "active";
  const required = job.questions.filter((q) => q.required).length;
  const minutes = Math.max(1, Math.round(job.questions.length * 0.4 + 0.5));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="relative pt-28 pb-24">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[420px]"
        style={{ background: `linear-gradient(180deg, oklch(0.95 0.04 ${company.hue}) 0%, transparent 100%)` }}
      />
      <div className="mx-auto max-w-6xl px-6">
        <Link href={JOBS_URL} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" /> Todas las ofertas
        </Link>

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <CompanyLogo name={company.name} hue={company.hue} size="lg" />
          <div className="flex-1">
            <p className="font-medium text-muted-foreground">
              {company.name} · {company.sector}
            </p>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Meta icon={MapPin}>
                {job.city}, {job.region}
              </Meta>
              <Meta icon={Briefcase}>{WORK_MODE_LABEL[job.workMode]}</Meta>
              <Meta icon={Clock}>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Meta>
              {salary && <Meta icon={Wallet}>{salary}</Meta>}
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <article className="space-y-6">
            <Section title="Sobre el puesto">
              <p className="leading-relaxed text-slate-700">{job.description}</p>
            </Section>
            {job.responsibilities.length > 0 && (
              <Section title="Qué harás">
                <BulletList items={job.responsibilities} />
              </Section>
            )}
            {job.requirements.length > 0 && (
              <Section title="Qué buscamos">
                <BulletList items={job.requirements} />
              </Section>
            )}
            {job.benefits.length > 0 && (
              <Section title="Qué ofrecemos" icon={Gift}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {job.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {b}
                    </div>
                  ))}
                </div>
              </Section>
            )}
            <Section title={`Sobre ${company.name}`} icon={Building2}>
              <p className="text-slate-700">
                {company.name} es una empresa del sector {company.sector.toLowerCase()} con sede en {company.city}. Proceso de selección gestionado por
                Recruitment Lab: te contestaremos siempre, encajes o no.
              </p>
            </Section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border bg-white p-6 shadow-soft">
              {salary && (
                <>
                  <p className="text-sm text-muted-foreground">Salario</p>
                  <p className="font-display text-2xl font-semibold">{salary}</p>
                </>
              )}
              <div className="mt-5 space-y-3 rounded-2xl bg-secondary/60 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <ListChecks className="size-4 text-primary" />
                  <span>
                    {job.questions.length} preguntas{required ? ` (${required} obligatorias)` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-primary" />
                  <span>Aplicar te llevará ~{minutes} min</span>
                </div>
              </div>
              {open ? (
                <Link href={applyUrl(job.slug)} className={cn(buttonVariants({ size: "xl" }), "mt-5 w-full shadow-glow")}>
                  Aplicar ahora <ArrowRight data-icon="inline-end" />
                </Link>
              ) : (
                <div className="mt-5 rounded-xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-800">
                  {job.status === "paused" ? "Proceso en pausa temporalmente" : "Proceso cerrado"}
                </div>
              )}
              <Button variant="ghost" className="mt-2 w-full" onClick={share}>
                <Share2 data-icon="inline-start" /> Compartir oferta
              </Button>
              <p className="mt-4 text-center text-xs text-muted-foreground">Publicada {timeAgo(job.publishedAt)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {open && (
        <div className="glass fixed inset-x-3 bottom-3 z-40 rounded-2xl p-2 shadow-soft lg:hidden">
          <Link href={applyUrl(job.slug)} className={cn(buttonVariants({ size: "xl" }), "w-full")}>
            Aplicar en {minutes} min <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      )}
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1 text-slate-700">
      <Icon className="size-3.5 text-primary" />
      {children}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        {Icon && <Icon className="size-5 text-primary" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-slate-700">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          {i}
        </li>
      ))}
    </ul>
  );
}
