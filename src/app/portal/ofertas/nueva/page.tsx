import type { Metadata } from "next";
import { NewJob } from "@/components/company/job-editor/job-editor-pages";

export const metadata: Metadata = { title: "Nueva oferta" };

export default function NuevaOfertaPage() {
  return <NewJob />;
}
