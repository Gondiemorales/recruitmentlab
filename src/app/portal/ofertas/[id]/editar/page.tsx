import type { Metadata } from "next";
import { EditJob } from "@/components/company/job-editor/job-editor-pages";

export const metadata: Metadata = { title: "Editar oferta" };

export default async function EditarOfertaPage({ params }: PageProps<"/portal/ofertas/[id]/editar">) {
  const { id } = await params;
  return <EditJob id={id} />;
}
