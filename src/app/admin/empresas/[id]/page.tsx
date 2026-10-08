import { CompanyDetail } from "@/components/admin/company-detail";

export default async function EmpresaAdminPage({ params }: PageProps<"/admin/empresas/[id]">) {
  const { id } = await params;
  return <CompanyDetail id={id} />;
}
