"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "../section";

const FAQS = [
  {
    q: "¿Qué tipo de perfiles podéis encontrar?",
    a: "Funcionamos especialmente bien en perfiles de volumen y operativos (hostelería, logística, retail, salud, comercial, instalaciones) y cada vez más en perfiles técnicos. Si tu candidato ideal usa Instagram o Facebook, podemos llegar a él.",
  },
  {
    q: "¿Cuánto tarda en llegar el primer candidato?",
    a: "Las campañas se activan en 24-48 h desde que aprobamos la oferta. Normalmente los primeros leads llegan el mismo día del lanzamiento y la primera shortlist en 3-5 días.",
  },
  {
    q: "¿Quién paga la inversión en anuncios?",
    a: "Definimos contigo la inversión según el volumen de contratación y la zona. Siempre sabrás cuánto se invierte en cada campaña y qué resultados está dando, en tiempo real desde tu portal.",
  },
  {
    q: "¿Puedo poner mis propias preguntas y pruebas?",
    a: "Sí. Puedes definir preguntas eliminatorias (por ejemplo, carnet o disponibilidad), test con respuestas correctas que puntúan, y preguntas abiertas. Cada candidatura llega con su puntuación.",
  },
  {
    q: "¿Cómo veo a los candidatos?",
    a: "Tienes acceso a un portal privado donde aparecen los candidatos preseleccionados con su CV, respuestas y notas de nuestro equipo. Puedes marcar «Me interesa» o «No encaja» con un clic.",
  },
  {
    q: "¿Es compatible con el RGPD?",
    a: "Sí. Registramos los consentimientos de cada candidato, aplicamos plazos de conservación y los CV se almacenan de forma privada. Firmamos contrato de encargado de tratamiento con cada cliente.",
  },
];

export function Faq({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  return (
    <section className="bg-gradient-to-b from-secondary/40 to-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Lo que nos suelen preguntar" />
        <Reveal delay={0.1}>
          <Accordion className="mt-12 rounded-3xl border bg-white px-2 shadow-soft">
            {items.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="px-4">
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
