import type { Metadata } from "next";
import { ApplicationsBoard } from "@/components/company/applications-board";
import type { ApplicationStatus } from "@/lib/types";
import { APPLICATION_PIPELINE } from "@/lib/labels";

export const metadata: Metadata = { title: "Candidaturas" };

export default async function CandidaturasPage({ searchParams }: PageProps<"/portal/candidaturas">) {
  const { oferta, estado } = await searchParams;
  const status = APPLICATION_PIPELINE.find((s) => s === estado) as ApplicationStatus | undefined;
  return <ApplicationsBoard initialJobId={typeof oferta === "string" ? oferta : "all"} initialStatus={status ?? "all"} />;
}
