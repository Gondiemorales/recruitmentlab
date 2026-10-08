import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { Eyebrow } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Envíanos tu CV",
  description: "¿No encuentras tu oferta? Déjanos tu perfil y te avisamos cuando haya una que encaje contigo.",
};

export default function EnviaTuCvPage() {
  return (
    <div className="relative pt-32 pb-24">
      <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Eyebrow>Candidatura espontánea</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">¿No encuentras tu oferta?</h1>
          <p className="mt-4 text-lg text-muted-foreground">Déjanos tu perfil y te escribimos en cuanto haya una oferta que encaje contigo.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Nuevas ofertas cada semana en toda España", "Solo te contactamos con ofertas de tu zona y sector", "Puedes darte de baja cuando quieras"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <ContactForm kind="candidate" />
        </div>
      </div>
    </div>
  );
}
