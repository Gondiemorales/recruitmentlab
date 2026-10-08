import { CandidatePage } from "@/components/company/candidate-page";

export default async function CandidaturaPage({ params }: PageProps<"/portal/candidaturas/[id]">) {
  const { id } = await params;
  return <CandidatePage id={id} />;
}
