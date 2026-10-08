import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { Eyebrow } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Contacto para empresas",
  description: "Cuéntanos qué perfiles necesitas y te enviamos una propuesta en menos de 24 h.",
};

export default function ContactoPage() {
  return (
    <div className="relative pt-32 pb-24">
      <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <Eyebrow>Contacto</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">¿Hablamos?</h1>
          <p className="mt-4 text-lg text-muted-foreground">Cuéntanos qué perfiles necesitas y te respondemos en menos de 24 h.</p>
        </div>
        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <ContactForm kind="company" />
        </div>
      </div>
    </div>
  );
}
