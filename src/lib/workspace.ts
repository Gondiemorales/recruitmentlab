"use client";

import { useMemo } from "react";
import { useDemo } from "./store";
import type { DemoData } from "./seed/generate";
import { PLANS } from "./plans";

/** Ruta base del panel de empresa */
export const PORTAL = "/portal";

/**
 * Comprueba si la empresa puede tener una oferta más activa según su plan y su estado de cuenta.
 * Devuelve el motivo del bloqueo o null si se puede publicar.
 */
export function usePublishGuard() {
  const data = useDemo((s) => s.data);
  return (jobId: string | null, companyId: string): string | null => {
    const company = data.companies.find((c) => c.id === companyId);
    if (!company) return null;
    if (company.accountStatus === "suspended") return "Tu cuenta está suspendida. Contacta con Recruitment Lab para reactivarla.";
    const max = PLANS[company.plan].maxActiveJobs;
    if (max === null) return null;
    const active = data.jobs.filter((j) => j.companyId === companyId && j.status === "active" && j.id !== jobId).length;
    return active >= max ? `Tu plan ${PLANS[company.plan].name} permite ${max} ofertas activas a la vez. Pausa otra oferta o amplía tu plan.` : null;
  };
}

/**
 * Datos visibles para la sesión actual.
 * Una empresa solo ve sus ofertas, leads y candidaturas; el resto de colecciones le llegan vacías.
 */
export function useScopedData(): DemoData {
  const session = useDemo((s) => s.session);
  const data = useDemo((s) => s.data);
  const companyId = session?.role === "company" ? session.companyId : null;

  return useMemo(() => {
    if (!companyId) return data;
    const jobs = data.jobs.filter((j) => j.companyId === companyId);
    const jobIds = new Set(jobs.map((j) => j.id));
    const leads = data.leads.filter((l) => jobIds.has(l.jobId));
    const leadIds = new Set(leads.map((l) => l.id));
    return {
      companies: data.companies.filter((c) => c.id === companyId),
      jobs,
      leads,
      applications: data.applications.filter((a) => jobIds.has(a.jobId)),
      emails: data.emails.filter((e) => leadIds.has(e.leadId)),
      contactRequests: [],
      agencyCampaigns: [],
      users: data.users.filter((u) => u.companyId === companyId),
      invoices: data.invoices.filter((i) => i.companyId === companyId),
    };
  }, [data, companyId]);
}
