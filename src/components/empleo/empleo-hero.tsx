"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Clock3, MapPin, MessageCircleHeart, Search, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/store";
import { formatSalary } from "@/lib/format";
import { WORK_MODE_LABEL } from "@/lib/labels";
import { jobsSearchUrl } from "@/lib/routes";
import { CompanyLogo } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/section";

export function EmpleoHero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 lg:pb-24">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-2/20 via-brand/10 to-transparent blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs font-medium shadow-soft backdrop-blur">
              <span className="size-2 rounded-full bg-emerald-500" /> Empresas contratando ahora mismo
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-[4rem]">
              Tu próximo trabajo, <span className="text-gradient">a un minuto</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
              Ofertas reales de empresas que contratan ya. Sin registros eternos: adjuntas tu CV, respondes unas preguntas y te contestamos siempre.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(jobsSearchUrl({ q: q.trim() }));
              }}
              className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border bg-white p-2 shadow-glow sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Puesto, empresa o ciudad"
                  className="h-12 w-full rounded-xl bg-transparent pr-3 pl-11 text-base outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="xl">
                Buscar ofertas
              </Button>
            </form>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[
                { icon: Clock3, t: "Aplica en 1 minuto" },
                { icon: MessageCircleHeart, t: "Respuesta garantizada" },
                { icon: ShieldCheck, t: "Empresas verificadas" },
              ].map(({ icon: Icon, t }) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={30}>
          <JobsCarousel />
        </Reveal>
      </div>
    </section>
  );
}

/** Pila de ofertas reales que rota, con el aviso de "candidatura enviada" */
function JobsCarousel() {
  const hydrated = useDemo((s) => s.hydrated);
  const { jobs, companies } = useDemo((s) => s.data);
  const active = useMemo(() => jobs.filter((j) => j.status === "active").slice(0, 5), [jobs]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => x + 1), 2600);
    return () => clearInterval(t);
  }, []);

  if (!hydrated || active.length === 0) return <div className="h-[420px]" />;

  const visible = [0, 1, 2].map((k) => active[(i + k) % active.length]!);

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md">
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-brand/20 to-brand-2/25 blur-3xl" />
      <AnimatePresence initial={false}>
        {visible.map((job, k) => {
          const c = companies.find((x) => x.id === job.companyId);
          return (
            <motion.div
              key={`${job.id}-${i + k}`}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1 - k * 0.25, y: k * 22, scale: 1 - k * 0.05, zIndex: 3 - k }}
              exit={{ opacity: 0, x: -80, rotate: -6, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="absolute inset-x-0 top-10 rounded-3xl border bg-white p-6 shadow-xl shadow-slate-900/8"
            >
              <div className="flex items-start gap-3">
                {c && <CompanyLogo name={c.name} hue={c.hue} />}
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{c?.name}</p>
                  <p className="text-lg leading-snug font-semibold">{job.title}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <MapPin className="size-3" /> {job.city}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1">{WORK_MODE_LABEL[job.workMode]}</span>
                {formatSalary(job) && <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">{formatSalary(job)}</span>}
              </div>
              <div className="mt-5 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white">Aplicar en 1 minuto</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <motion.div
        key={`ok-${i}`}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute -right-2 bottom-4 z-10 flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 shadow-xl sm:-right-6"
      >
        <CheckCircle2 className="size-5 text-emerald-500" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Candidatura enviada</p>
          <p className="text-xs text-muted-foreground">Te respondemos en 48-72 h</p>
        </div>
      </motion.div>
    </div>
  );
}
