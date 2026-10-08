import type { Metadata } from "next";
import { LeadsPage } from "@/components/company/leads-page";

export const metadata: Metadata = { title: "Leads de Meta" };

export default function AdminLeadsPage() {
  return <LeadsPage />;
}
