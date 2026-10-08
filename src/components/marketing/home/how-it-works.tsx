import { ClipboardList, Mail, Megaphone, UserCheck } from "lucide-react";
import { Reveal, SectionHeading } from "../section";

const STEPS = [
  {
    icon: Megaphone,
    title: "Lanzamos tu campaña en Meta",
    text: "Creatividades en vídeo e imagen, segmentación por zona e intereses y formulario instantáneo. El candidato deja sus datos en 2 toques sin salir de Instagram.",
  },
  {
    icon: Mail,
    title: "Email automático al instante",
    text: "Cada lead recibe en menos de un minuto un email personalizado con la oferta completa y un enlace único con sus datos ya rellenados.",
  },
  {
    icon: ClipboardList,
    title: "Aplica en 1 minuto con tus filtros",
    text: "Adjunta el CV y responde a tus preguntas: requisitos eliminatorios, test de conocimientos o preguntas abiertas. Todo puntuado automáticamente.",
  },
  {
    icon: UserCheck,
    title: "Recibes solo a los mejores",
    text: "Revisamos cada candidatura y te compartimos una shortlist en tu portal. Tú das feedback con un clic y entrevistas a quien de verdad encaja.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Cómo funciona"
          title={
            <>
              Del anuncio a la entrevista, <span className="text-gradient">en piloto automático</span>
            </>
          }
          description="Un flujo diseñado para no perder a ningún candidato por el camino. La mayoría de portales pierden al 80 % de los interesados en el formulario. Nosotros no."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-8 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-3xl border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-glow">
                    <s.icon className="size-6" />
                  </div>
                  <span className="font-display text-5xl font-semibold text-slate-100 transition-colors group-hover:text-primary/15">
                    0{i + 1}
                  </span>
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
