import type { Metadata } from "next";
import { ApplyFlow } from "@/components/apply/apply-flow";

export const metadata: Metadata = {
  title: "Completa tu candidatura",
  robots: { index: false },
};

export default async function AplicarPage({ params, searchParams }: PageProps<"/empleo/ofertas/[slug]/aplicar">) {
  const { slug } = await params;
  const { t } = await searchParams;
  return <ApplyFlow slug={slug} token={typeof t === "string" ? t : null} />;
}
