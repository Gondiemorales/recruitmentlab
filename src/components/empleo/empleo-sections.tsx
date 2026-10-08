"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, Briefcase, FileUp, HeartPulse, Hotel, Laptop, ListChecks, Lock, MailCheck, MessageCircleHeart, ShoppingBasket, Star, Sun, Truck, UserRoundCheck } from "lucide-react";
import { useDemo } from "@/lib/store";
import { JOBS_URL, SEND_CV_URL, jobsSearchUrl } from "@/lib/routes";
import { JobCard } from "@/components/jobs/job-card";
import { PersonAvatar } from "@/components/shared/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/marketing/section";
import { cn } from "@/lib/utils";

const SECTOR_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Hostelería: Hotel,
  Logística: Truck,
  Retail: ShoppingBasket,
  Salud: HeartPulse,
  Energía: Sun,
  Tecnología: Laptop,
};

/** Sectores con el número de ofertas activas de cada uno */
export function SectorsGrid() {
  const { jobs, companies } = useDemo((s) => s.data);
  const sectors = useMemo(() => {
    const count = new Map<string, number>();
    for (const j of jobs) {
      if (j.status !== "active") continue;
      const s = companies.find((c) => c.id === j.companyId)?.sector;
      if (s) count.set(s, (count.get(s) ?? 0) + 1);
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [jobs, companies]);

  return (
    <section className="border-y bg-white/60 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">Busca por sector</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sectors.map(([name, n]) => {
            const Icon = SECTOR_ICON[name] ?? Briefcase;
            return (
              <Link
                key={name}
                href={jobsSearchUrl({ sector: name })}
                className="group flex flex-col items-center gap-2 rounded-2xl border bg-white p-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {n} {n === 1 ? "oferta" : "ofertas"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedJobs() {
  const hydrated = useDemo((s) => s.hydrated);
  const { jobs, companies } = useDemo((s) => s.data);
  const latest = jobs
    .filter((j) => j.status === "active")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, 6);

  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" eyebrow="Recién publicadas" title="Ofertas activas ahora mismo" />
          <Link href={JOBS_URL} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Ver todas las ofertas <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {!hydrated
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
            : latest.map((job, i) => (
                <Reveal key={job.id} delay={i * 0.05}>
                  <JobCard job={job} company={companies.find((c) => c.id === job.companyId)} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Briefcase, title: "Encuentra tu oferta", text: "Aquí o en un anuncio de Instagram o Facebook. Si nos dejas tus datos en el anuncio, te enviamos el enlace por email." },
  { icon: FileUp, title: "Adjunta tu CV", text: "Tus datos de contacto ya vienen rellenados. Solo tienes que subir tu currículum, en PDF, Word o foto." },
  { icon: ListChecks, title: "Responde unas preguntas", text: "Preguntas cortas que pone la empresa: disponibilidad, experiencia… Nada de cartas de presentación." },
  { icon: MailCheck, title: "Te contestamos siempre", text: "Un reclutador revisa tu candidatura. Si encajas, te llamamos en 48-72 h. Si no, también te avisamos." },
];

export function HowToApply() {
  return (
    <section id="como-aplicar" className="scroll-mt-24 bg-gradient-to-b from-secondary/40 to-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Cómo aplicar"
          title={
            <>
              Aplicar no debería <span className="text-gradient">llevarte una tarde</span>
            </>
          }
          description="Hemos quitado todo lo que sobra. De media, una candidatura se completa en 1 minuto y 40 segundos."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="h-full rounded-3xl border bg-white p-6 shadow-soft">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-glow">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted-foreground">Paso {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROMISES = [
  { icon: MessageCircleHeart, title: "Respuesta garantizada", text: "Nunca te quedarás sin saber qué ha pasado con tu candidatura." },
  { icon: BadgeCheck, title: "Empresas verificadas", text: "Todas las ofertas son de empresas reales con las que trabajamos directamente." },
  { icon: UserRoundCheck, title: "Sin registro", text: "No necesitas crear una cuenta ni recordar contraseñas para aplicar." },
  { icon: Lock, title: "Tus datos, protegidos", text: "Solo compartimos tu CV con la empresa si tu perfil encaja en la oferta." },
];

export function Promises() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading align="left" eyebrow="Nuestro compromiso" title="Buscar trabajo ya es bastante duro" description="Por eso cuidamos cada candidatura como si fuera la única." />
          <div className="grid gap-4 sm:grid-cols-2">
            {PROMISES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border bg-white p-5 shadow-soft">
                  <p.icon className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STORIES = [
  { quote: "Vi el anuncio en Instagram por la noche, dejé mis datos y a los dos minutos tenía un email con la oferta. En una semana ya estaba trabajando.", name: "Lucía Martín", role: "Recepcionista · Marbella" },
  { quote: "Lo mejor es que te contestan. He mandado cientos de CV a portales y nunca sabía nada. Aquí me llamaron al día siguiente.", name: "Adrián Romero", role: "Carretillero · Zaragoza" },
  { quote: "Apliqué desde el móvil en el bus. Unas preguntas cortas, el CV y listo. Sin crear cuentas ni rellenar mil campos.", name: "Sara Sanz", role: "Desarrolladora · Remoto" },
];

export function CandidateStories() {
  return (
    <section className="bg-gradient-to-b from-white to-secondary/40 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Historias reales" title="Gente que ya encontró trabajo con nosotros" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <figure className="flex h-full flex-col rounded-3xl border bg-white p-7 shadow-soft">
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">“{s.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                  <PersonAvatar name={s.name} className="size-10" />
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const CANDIDATE_FAQS = [
  { q: "¿Tengo que registrarme para aplicar?", a: "No. Solo necesitas tu nombre, email, teléfono y tu CV. Si vienes desde un anuncio de Instagram o Facebook, tus datos ya vendrán rellenados." },
  { q: "¿Cuánto cuesta?", a: "Nada. Recruitment Lab es 100 % gratuito para los candidatos: son las empresas las que pagan por nuestro servicio." },
  { q: "¿Cuándo me contestaréis?", a: "Revisamos todas las candidaturas. Si encajas, te llamamos en 48-72 h. Si no, te escribimos igualmente para que no te quedes esperando." },
  { q: "¿Quién ve mi CV?", a: "Nuestro equipo de selección y, solo si tu perfil encaja, la empresa que ofrece el puesto. Nunca lo cedemos a terceros." },
  { q: "¿Puedo aplicar a varias ofertas?", a: "Claro. Puedes aplicar a todas las que te interesen; cada candidatura se revisa por separado." },
  { q: "No encuentro una oferta para mí, ¿qué hago?", a: "Envíanos tu CV desde «Envíanos tu CV» y te avisaremos cuando haya una oferta de tu zona y sector." },
];

export function SendCvCta() {
  return (
    <section className="px-3 py-24 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-blue-600 to-brand-2 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold text-balance sm:text-5xl">¿No encuentras tu oferta?</h2>
            <p className="mt-4 text-lg text-white/80">Déjanos tu CV y te avisamos en cuanto haya un puesto de tu zona y sector.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={SEND_CV_URL} className={cn(buttonVariants({ size: "xl", variant: "secondary" }), "bg-white text-primary hover:bg-white/90")}>
                <FileUp data-icon="inline-start" /> Envíanos tu CV
              </Link>
              <Link
                href={JOBS_URL}
                className={cn(buttonVariants({ size: "xl", variant: "outline" }), "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white")}
              >
                Ver todas las ofertas <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
