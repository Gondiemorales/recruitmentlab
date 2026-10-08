"use client";

import { toast } from "sonner";
import { useDemo } from "@/lib/store";

/** Entrar en el panel de una empresa como administrador (para revisar o dar soporte) */
export function useImpersonate() {
  const session = useDemo((s) => s.session);
  const login = useDemo((s) => s.login);
  const companies = useDemo((s) => s.data.companies);

  return (companyId: string) => {
    const c = companies.find((x) => x.id === companyId);
    if (!c) return;
    login({ role: "company", name: c.contactName, email: c.contactEmail, companyId: c.id, impersonatedBy: session?.name ?? "Administración" }, "/portal");
    toast.success(`Entrando en el panel de ${c.name}`);
  };
}
