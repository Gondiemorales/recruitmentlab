import type { Metadata } from "next";
import { BillingPage } from "@/components/admin/billing-page";

export const metadata: Metadata = { title: "Facturación" };

export default function FacturacionPage() {
  return <BillingPage />;
}
