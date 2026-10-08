import { Star } from "lucide-react";
import { CompanyLogo } from "@/components/shared/brand";
import { Reveal, SectionHeading } from "../section";

const ITEMS = [
  {
    quote:
      "Abrimos un hotel nuevo y necesitábamos 18 personas en tres semanas. Con los portales no llegábamos. Con Recruitment Lab tuvimos la plantilla completa en 16 días.",
    name: "Beatriz Ocaña",
    role: "Directora de RRHH · Grupo Vela Hoteles",
    hue: 210,
  },
  {
    quote:
      "Lo que más valoro son los filtros: solo me llegan carretilleros con carnet y disponibilidad para turnos. He pasado de 60 llamadas a 8 entrevistas.",
    name: "Fernando Lasierra",
    role: "Jefe de Operaciones · LogiNorte",
    hue: 35,
  },
  {
    quote:
      "Pensaba que para perfiles técnicos Instagram no funcionaría. Contratamos a dos desarrolladores senior en un mes con un coste por candidatura ridículo.",
    name: "Marc Puig",
    role: "CTO · Kodea Software",
    hue: 285,
  },
];

export function Testimonials() {
  return (
    <section id="casos" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Casos reales" title="Empresas que ya no sufren para contratar" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {ITEMS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border bg-white p-7 shadow-soft">
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                  <CompanyLogo name={t.name} hue={t.hue} />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
