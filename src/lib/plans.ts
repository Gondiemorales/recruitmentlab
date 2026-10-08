import type { AccountStatus, PlanId } from "./types";
import type { Tone } from "./labels";

// Planes internos de las cuentas cliente (visibles solo para el administrador total).
// Precios de ejemplo: cambiar aquí cuando estén definidos.

export const PLANS: Record<PlanId, { name: string; monthlyFee: number; maxActiveJobs: number | null; tone: Tone }> = {
  basic: { name: "Básico", monthlyFee: 290, maxActiveJobs: 2, tone: "neutral" },
  pro: { name: "Profesional", monthlyFee: 590, maxActiveJobs: 5, tone: "brand" },
  enterprise: { name: "Empresa", monthlyFee: 1190, maxActiveJobs: null, tone: "violet" },
  internal: { name: "Interno", monthlyFee: 0, maxActiveJobs: null, tone: "muted" },
};

export const ACCOUNT_STATUS: Record<AccountStatus, { label: string; tone: Tone }> = {
  active: { label: "Activa", tone: "success" },
  trial: { label: "Prueba", tone: "info" },
  suspended: { label: "Suspendida", tone: "danger" },
};

export const INVOICE_STATUS = {
  paid: { label: "Pagada", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  overdue: { label: "Vencida", tone: "danger" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export const USER_ROLE = {
  owner: "Administrador",
  recruiter: "Reclutador",
  viewer: "Solo lectura",
} as const;

export const VAT = 0.21;
