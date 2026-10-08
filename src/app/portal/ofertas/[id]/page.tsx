import { JobOverview } from "@/components/company/job-overview";

export default async function OfertaPage({ params }: PageProps<"/portal/ofertas/[id]">) {
  const { id } = await params;
  return <JobOverview id={id} />;
}
