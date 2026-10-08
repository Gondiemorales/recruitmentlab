import type { Metadata } from "next";
import { RequestsPage } from "@/components/admin/requests-page";

export const metadata: Metadata = { title: "Solicitudes" };

export default function AdminSolicitudesPage() {
  return <RequestsPage />;
}
