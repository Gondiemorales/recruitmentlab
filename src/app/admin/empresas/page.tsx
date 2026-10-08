import type { Metadata } from "next";
import { CompaniesPage } from "@/components/admin/companies-page";

export const metadata: Metadata = { title: "Empresas" };

export default async function AdminEmpresasPage({ searchParams }: PageProps<"/admin/empresas">) {
  const { nueva } = await searchParams;
  return <CompaniesPage openNew={nueva === "1"} />;
}
