import type { Company, CompanyUser, Invoice, Job } from "../types";
import { PLANS, VAT } from "../plans";
import type { Random } from "./random";
import { makePerson } from "./generate";

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Cuentas con pagos atrasados (para que el panel de administración tenga algo que vigilar) */
const OVERDUE: Record<string, number> = { cmp_nexo: 2, cmp_sonrisa: 1 };

/** Facturas de cuota mensual + inversión publicitaria de cada campaña */
export function makeInvoices(r: Random, companies: Company[], jobs: Job[], now: number): Invoice[] {
  const invoices: Invoice[] = [];
  let seq = 1;
  const number = (d: Date) => `RL-${d.getFullYear()}-${String(seq++).padStart(4, "0")}`;

  for (const c of companies) {
    const plan = PLANS[c.plan];
    if (plan.monthlyFee === 0) continue;

    // Cuota mensual desde el alta (la cuenta en prueba no factura)
    if (c.accountStatus !== "trial") {
      const start = new Date(c.createdAt);
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const companyInvoices: Invoice[] = [];
      while (cursor.getTime() <= now) {
        const issued = cursor.getTime();
        const due = issued + 15 * DAY;
        companyInvoices.push({
          id: `inv_${c.id}_${cursor.getFullYear()}_${cursor.getMonth()}`,
          companyId: c.id,
          number: "",
          concept: `Cuota plan ${plan.name} · ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`,
          amount: Math.round(plan.monthlyFee * (1 + VAT) * 100) / 100,
          issuedAt: iso(issued),
          dueAt: iso(due),
          status: due < now ? "paid" : "pending",
          paidAt: due < now ? iso(issued + r.int(2, 12) * DAY) : null,
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
      // Las últimas N facturas ya vencidas quedan sin pagar
      const overdue = OVERDUE[c.id] ?? 0;
      if (overdue > 0) {
        for (const i of companyInvoices.filter((x) => new Date(x.dueAt).getTime() < now).slice(-overdue)) {
          i.status = "overdue";
          i.paidAt = null;
        }
      }
      invoices.push(...companyInvoices);
    }

    // Inversión publicitaria repercutida al cliente, una factura por campaña
    for (const j of jobs.filter((x) => x.companyId === c.id && x.campaign && x.campaign.spend > 0)) {
      const issued = new Date(j.campaign!.startedAt).getTime() + 30 * DAY;
      if (issued > now) continue;
      const due = issued + 15 * DAY;
      invoices.push({
        id: `inv_ads_${j.id}`,
        companyId: c.id,
        number: "",
        concept: `Inversión en Meta Ads · ${j.campaign!.name}`,
        amount: Math.round(j.campaign!.spend * (1 + VAT) * 100) / 100,
        issuedAt: iso(issued),
        dueAt: iso(due),
        status: due < now ? (OVERDUE[c.id] ? "overdue" : "paid") : "pending",
        paidAt: due < now && !OVERDUE[c.id] ? iso(issued + r.int(3, 10) * DAY) : null,
      });
    }
  }

  // Numeración correlativa por fecha de emisión
  return invoices
    .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
    .map((i) => ({ ...i, number: number(new Date(i.issuedAt)) }))
    .reverse();
}

/** Usuarios con acceso al panel de cada empresa */
export function makeUsers(r: Random, companies: Company[], now: number): CompanyUser[] {
  const users: CompanyUser[] = [];
  for (const c of companies) {
    users.push({
      id: `usr_${c.id}_owner`,
      companyId: c.id,
      name: c.contactName,
      email: c.contactEmail,
      role: "owner",
      lastLoginAt: iso(now - r.int(1, 72) * 3_600_000),
    });
    const extra = c.plan === "enterprise" ? 3 : c.plan === "pro" ? 2 : c.plan === "basic" ? 1 : 0;
    for (let i = 0; i < extra; i++) {
      const p = makePerson(r);
      const domain = c.contactEmail.split("@")[1];
      users.push({
        id: `usr_${c.id}_${i}`,
        companyId: c.id,
        name: p.fullName.split(" ").slice(0, 2).join(" "),
        email: `${p.firstName.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}@${domain}`,
        role: i === extra - 1 && extra > 1 ? "viewer" : "recruiter",
        lastLoginAt: r.chance(0.85) ? iso(now - r.int(1, 20) * DAY) : null,
      });
    }
  }
  return users;
}
