import type { Metadata } from "next";
import { LEGAL_DOCS } from "@/lib/legal";
import { LegalView } from "@/components/marketing/legal-view";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/empleo/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  return { title: LEGAL_DOCS.find((d) => d.slug === doc)?.title ?? "Legal" };
}

export default async function EmpleoLegalPage({ params }: PageProps<"/empleo/legal/[doc]">) {
  const { doc } = await params;
  return <LegalView slug={doc} site="empleo" />;
}
