import type { Metadata } from "next";
import { AgencyEntry } from "@/components/admin/agency-entry";

export const metadata: Metadata = { title: "Panel de agencia", robots: { index: false } };

/** Entrada directa al panel interno de la agencia */
export default function AgenciaPage() {
  return <AgencyEntry />;
}
