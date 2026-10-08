import type { Metadata } from "next";
import { JobsBrowser } from "@/components/jobs/jobs-browser";
import { Eyebrow } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Todas las ofertas",
  description: "Ofertas de empleo activas en hostelería, logística, salud, retail, energía y tecnología. Aplica en 1 minuto.",
};

export default async function OfertasPage({ searchParams }: PageProps<"/empleo/ofertas">) {
  const { q, sector } = await searchParams;
  return (
    <div className="relative pt-32 pb-24">
      <div className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <Eyebrow>Ofertas activas</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Todas las <span className="text-gradient">ofertas</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Empresas que contratan ya. Filtra por sector o modalidad y aplica en un minuto.
          </p>
        </div>
        <JobsBrowser initialQuery={typeof q === "string" ? q : ""} initialSector={typeof sector === "string" ? sector : "all"} />
      </div>
    </div>
  );
}
