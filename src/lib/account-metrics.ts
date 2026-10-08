import type { Company } from "./types";
import type { DemoData } from "./seed/generate";
import { PLANS } from "./plans";

export type CompanyAccountStats = {
  company: Company;
  monthlyFee: number;
  activeJobs: number;
  totalJobs: number;
  maxActiveJobs: number | null;
  leads: number;
  leads30d: number;
  applications: number;
  hired: number;
  adSpend: number;
  billed: number;
  paid: number;
  pending: number;
  overdue: number;
  users: number;
  lastLoginAt: string | null;
};

const DAY = 86_400_000;

/** Uso, resultados y estado de cobro de una cuenta cliente */
export function companyStats(company: Company, data: DemoData, now = Date.now()): CompanyAccountStats {
  const jobs = data.jobs.filter((j) => j.companyId === company.id);
  const jobIds = new Set(jobs.map((j) => j.id));
  const leads = data.leads.filter((l) => jobIds.has(l.jobId));
  const apps = data.applications.filter((a) => jobIds.has(a.jobId));
  const invoices = data.invoices.filter((i) => i.companyId === company.id);
  const users = data.users.filter((u) => u.companyId === company.id);
  const sum = (xs: { amount: number }[]) => Math.round(xs.reduce((s, x) => s + x.amount, 0) * 100) / 100;
  const lastLogin = users.map((u) => u.lastLoginAt).filter(Boolean).sort().at(-1) ?? null;

  return {
    company,
    monthlyFee: company.accountStatus === "active" ? PLANS[company.plan].monthlyFee : 0,
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalJobs: jobs.length,
    maxActiveJobs: PLANS[company.plan].maxActiveJobs,
    leads: leads.length,
    leads30d: leads.filter((l) => now - new Date(l.createdAt).getTime() < 30 * DAY).length,
    applications: apps.length,
    hired: apps.filter((a) => a.status === "hired").length,
    adSpend: Math.round(jobs.reduce((s, j) => s + (j.campaign?.spend ?? 0), 0) * 100) / 100,
    billed: sum(invoices),
    paid: sum(invoices.filter((i) => i.status === "paid")),
    pending: sum(invoices.filter((i) => i.status === "pending")),
    overdue: sum(invoices.filter((i) => i.status === "overdue")),
    users: users.length,
    lastLoginAt: lastLogin,
  };
}

export function allCompanyStats(data: DemoData) {
  return data.companies.map((c) => companyStats(c, data));
}
