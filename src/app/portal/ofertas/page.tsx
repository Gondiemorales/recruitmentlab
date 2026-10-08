import type { Metadata } from "next";
import { JobsList } from "@/components/company/jobs-list";

export const metadata: Metadata = { title: "Ofertas" };

export default function OfertasPage() {
  return <JobsList />;
}
