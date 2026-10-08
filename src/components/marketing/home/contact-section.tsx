import { Clock, Mail, Phone } from "lucide-react";
import { ContactForm } from "../contact-form";
import { Eyebrow, Reveal } from "../section";

export function ContactSection() {
  return (
    <section id="contacto" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <Eyebrow>Hablemos</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold text-balance">Cuéntanos qué necesitas y te enviamos una propuesta</h2>
          <p className="mt-4 text-muted-foreground">Respondemos en menos de 24 h laborables. Si encaja, tu campaña puede estar activa esta misma semana.</p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Clock, t: "Campaña activa en 48 h" },
              { icon: Mail, t: "hola@recruitmentlab.es" },
              { icon: Phone, t: "+34 910 000 000" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="font-medium">{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
            <ContactForm kind="company" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
