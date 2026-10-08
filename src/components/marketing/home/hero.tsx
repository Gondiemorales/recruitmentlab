import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MetaIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";
import { FlowShowcase } from "../flow-showcase";
import { Reveal } from "../section";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 lg:pb-24">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand/15 via-brand-2/10 to-transparent blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 py-1 pr-3 pl-1 text-xs font-medium shadow-soft backdrop-blur">
              <span className="flex items-center gap-1 rounded-full bg-meta px-2 py-0.5 text-[11px] font-semibold text-white">
                <MetaIcon className="size-3.5" /> Meta Ads
              </span>
              Reclutamiento donde está el talento
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-[4.1rem]">
              Llena tus vacantes en <span className="text-gradient">días</span>, no en meses.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
              Lanzamos campañas en Instagram y Facebook que captan candidatos, los invitamos automáticamente a completar su candidatura y
              los filtramos con tus preguntas. Tú solo entrevistas a los mejores.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#contacto" className={cn(buttonVariants({ size: "xl" }), "shadow-glow")}>
                Quiero contratar
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link href="/#como-funciona" className={cn(buttonVariants({ size: "xl", variant: "outline" }), "bg-white/70")}>
                Cómo funciona
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              {[
                { icon: Clock3, value: "7 días", label: "a la primera entrevista" },
                { icon: Zap, value: "41 %", label: "de leads aplican" },
                { icon: ShieldCheck, value: "100 %", label: "RGPD" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <Icon className="mb-2 size-4 text-primary" />
                  <p className="font-display text-xl font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={30}>
          {/* En móvil se escala; el margen negativo recupera el alto que deja el escalado */}
          <FlowShowcase className="-mb-24 origin-top scale-[0.82] sm:mb-0 sm:scale-100" />
        </Reveal>
      </div>
    </section>
  );
}
