import type { Session } from "./types";

// Cuentas de acceso. Sin backend todavía: la validación se hace en el navegador.
// Cuando haya base de datos, esto pasa a un sistema de auth real.

/** Cuenta del portal de empresa (acceso clientes en /login) */
export const COMPANY_ACCOUNT = {
  email: "recruitmentlab@recruitmentlab.es",
  password: "12345678",
  name: "Recruitment Lab",
  /** Empresa cuyos procesos ve esta cuenta en el portal */
  companyId: "cmp_recruitmentlab",
} as const;

/** Usuario del panel interno de la agencia (/agencia) */
export const AGENCY_SESSION: Session = {
  role: "agency",
  name: "Laura Gómez",
  email: "equipo@recruitmentlab.es",
};

export function checkCompanyLogin(email: string, password: string): Session | null {
  if (email.trim().toLowerCase() !== COMPANY_ACCOUNT.email || password !== COMPANY_ACCOUNT.password) return null;
  return { role: "company", name: COMPANY_ACCOUNT.name, email: COMPANY_ACCOUNT.email, companyId: COMPANY_ACCOUNT.companyId };
}
