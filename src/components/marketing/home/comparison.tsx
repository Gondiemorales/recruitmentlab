import { Check, Minus } from "lucide-react";
import { LogoMark } from "@/components/shared/brand";
import { Reveal, SectionHeading } from "../section";

const ROWS: [string, string, string][] = [
  ["Llega a candidatos que no están buscando activamente", "No", "Sí"],
  ["Tiempo hasta la primera entrevista", "3-6 semanas", "5-7 días"],
  ["Candidatos que completan la candidatura", "~10 %", "~41 %"],
  ["Filtros eliminatorios y test puntuados", "Limitado", "Ilimitados"],
  ["Shortlist revisada por reclutadores", "No", "Sí"],
  ["Pagas por anuncio aunque no contrates", "Sí", "No"],
];

export function Comparison() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          eyebrow="La diferencia"
          title="Por qué funciona mejor que un portal de empleo"
          description="El 70 % del talento no busca trabajo activamente, pero pasa 2 horas al día en Instagram y Facebook."
        />
        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border bg-white shadow-soft">
            <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b bg-secondary/50 text-sm font-semibold">
              <div className="p-4 sm:p-5" />
              <div className="p-4 text-center text-muted-foreground sm:p-5">Portales de empleo</div>
              <div className="flex items-center justify-center gap-2 bg-primary/5 p-4 text-primary sm:p-5">
                <LogoMark className="hidden size-5 sm:block" /> Recruitment Lab
              </div>
            </div>
            {ROWS.map(([label, them, us]) => (
              <div key={label} className="grid grid-cols-[1.6fr_1fr_1fr] border-b text-sm last:border-0">
                <div className="p-4 sm:p-5">{label}</div>
                <div className="flex items-center justify-center gap-1.5 p-4 text-center text-muted-foreground sm:p-5">
                  {them === "No" ? <Minus className="size-4" /> : them}
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-primary/[0.03] p-4 text-center font-semibold sm:p-5">
                  {us === "Sí" ? <Check className="size-4 text-emerald-600" strokeWidth={3} /> : us}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
