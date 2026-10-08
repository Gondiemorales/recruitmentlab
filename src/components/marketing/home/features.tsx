import { BarChart3, Building2, Check, FileCheck2, ListChecks, MapPin, ShieldCheck, ThumbsDown, ThumbsUp, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "../section";

function BentoCard({
  icon: Icon,
  title,
  text,
  className,
  children,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-soft">
        <div className="flex-1 border-b bg-gradient-to-b from-secondary/70 to-white p-5">{children}</div>
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="size-4 text-primary" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
    </Reveal>
  );
}

const FUNNEL: [string, number, string][] = [
  ["Leads de Meta", 100, "bg-brand"],
  ["Emails abiertos", 78, "bg-brand/80"],
  ["Clic en la oferta", 57, "bg-brand-2"],
  ["Candidaturas", 41, "bg-emerald-500"],
];

const FILTERS: [string, boolean][] = [
  ["¿Carnet de carretillero?", true],
  ["¿Turnos rotativos?", true],
  ["Inglés B2 o superior", false],
];

export function Features() {
  return (
    <section id="ventajas" className="scroll-mt-24 bg-gradient-to-b from-white to-secondary/40 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Todo incluido"
          title="Una plataforma pensada para contratar rápido"
          description="Tecnología propia + equipo de reclutadores. Tú decides cuánto quieres involucrarte."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <BentoCard
            className="md:col-span-2"
            icon={BarChart3}
            title="Panel en tiempo real"
            text="Sigue cada campaña: leads, coste por candidato, tasa de conversión y estado de cada persona en el proceso."
          >
            <div className="grid h-full grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2.5">
                {FUNNEL.map(([label, pct, color]) => (
                  <div key={label} className="flex items-center gap-3 text-xs">
                    <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                    <div className="h-6 flex-1 rounded-md bg-white">
                      <div className={cn("h-full rounded-md", color)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-9 text-right font-semibold tabular-nums">{pct}%</span>
                  </div>
                ))}
              </div>
              <div className="hidden rounded-2xl border bg-white p-4 text-center shadow-soft sm:block">
                <p className="text-xs text-muted-foreground">Coste por candidatura</p>
                <p className="font-display text-3xl font-semibold">6,40 €</p>
                <p className="text-xs font-medium text-emerald-600">−62 % vs portales</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            delay={0.05}
            icon={ListChecks}
            title="Filtros y test a medida"
            text="Preguntas eliminatorias, tipo test o abiertas. Cada candidatura llega puntuada."
          >
            <div className="space-y-2">
              {FILTERS.map(([q, ok]) => (
                <div key={q} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-xs">
                  {q}
                  <span className={cn("flex size-5 items-center justify-center rounded-full", ok ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                    {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            delay={0.1}
            icon={Wand2}
            title="Autorrelleno mágico"
            text="El candidato llega desde el email con sus datos ya puestos. Aplicar cuesta 1 minuto."
          >
            <div className="space-y-2">
              {[
                ["Nombre", "Lucía Martín Ruiz"],
                ["Email", "lucia.martin@gmail.com"],
                ["Teléfono", "+34 612 345 678"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl border bg-white px-3 py-1.5">
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                  <p className="flex items-center justify-between text-xs font-medium">
                    {v} <Wand2 className="size-3 text-violet-500" />
                  </p>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            delay={0.15}
            icon={Building2}
            title="Portal para tu empresa"
            text="Accede a la shortlist cuando quieras y da feedback con un clic. Sin emails interminables."
          >
            <div className="rounded-2xl border bg-white p-3.5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">AR</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Adrián Romero</p>
                  <p className="text-[11px] text-muted-foreground">Carretillero · 6 años</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">88</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <span className="flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-1.5 text-[11px] font-semibold text-white">
                  <ThumbsUp className="size-3" /> Me interesa
                </span>
                <span className="flex items-center justify-center gap-1 rounded-lg border py-1.5 text-[11px] font-medium">
                  <ThumbsDown className="size-3" /> No encaja
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            delay={0.2}
            icon={MapPin}
            title="Segmentación hiperlocal"
            text="Anuncios a personas que viven cerca de tu centro de trabajo. Menos abandonos, más compromiso."
          >
            <div className="relative flex h-full min-h-32 items-center justify-center overflow-hidden">
              {[1, 2, 3].map((r) => (
                <div key={r} className="absolute rounded-full border border-primary/20 bg-primary/[0.03]" style={{ width: r * 64, height: r * 64 }} />
              ))}
              <div className="relative flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-glow">
                <MapPin className="size-4" />
              </div>
              {[
                [-70, -20],
                [60, -35],
                [40, 40],
                [-45, 45],
                [85, 10],
              ].map(([x, y], i) => (
                <span key={i} className="absolute size-2.5 rounded-full border-2 border-white bg-brand-2 shadow" style={{ transform: `translate(${x}px, ${y}px)` }} />
              ))}
            </div>
          </BentoCard>

          <BentoCard
            delay={0.25}
            className="md:col-span-3"
            icon={ShieldCheck}
            title="RGPD desde el diseño"
            text="Consentimientos registrados, retención configurable y CVs almacenados de forma privada."
          >
            <div className="grid gap-2 md:grid-cols-3">
              {["Política de privacidad aceptada", "Conservación 2 años (opcional)", "CV cifrado en reposo"].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs">
                  <FileCheck2 className="size-3.5 text-emerald-600" /> {t}
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
