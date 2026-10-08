import { JobDetail } from "@/components/jobs/job-detail";

export default async function OfertaPage({ params }: PageProps<"/empleo/ofertas/[slug]">) {
  const { slug } = await params;
  return <JobDetail slug={slug} />;
}
