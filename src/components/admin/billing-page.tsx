"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ReceiptText } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import { INVOICE_STATUS } from "@/lib/plans";
import { formatEuroCents } from "@/lib/format";
import { PageHeader, Panel } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { SimpleSelect } from "@/components/app/simple-select";
import { InvoicesTable } from "./invoices-table";

type Filter = Invoice["status"] | "all";

export function BillingPage() {
  const { invoices, companies } = useDemo((s) => s.data);
  const [status, setStatus] = useState<Filter>("all");
  const [companyId, setCompanyId] = useState("all");

  const totals = useMemo(() => {
    const now = new Date();
    const thisMonth = invoices.filter((i) => {
      const d = new Date(i.issuedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const sum = (xs: Invoice[]) => xs.reduce((s, i) => s + i.amount, 0);
    return {
      month: sum(thisMonth),
      paid: sum(invoices.filter((i) => i.status === "paid")),
      pending: sum(invoices.filter((i) => i.status === "pending")),
      overdue: sum(invoices.filter((i) => i.status === "overdue")),
      overdueCount: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  const filtered = useMemo(
    () => invoices.filter((i) => (status === "all" || i.status === status) && (companyId === "all" || i.companyId === companyId)),
    [invoices, status, companyId],
  );

  return (
    <>
      <PageHeader title="Facturación" description="Cuotas de los planes e inversión publicitaria repercutida a cada empresa (IVA incluido)." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Facturado este mes" value={formatEuroCents(totals.month)} icon={ReceiptText} />
        <StatCard label="Cobrado" value={formatEuroCents(totals.paid)} icon={CheckCircle2} hint="desde el inicio" />
        <StatCard label="Pendiente (en plazo)" value={formatEuroCents(totals.pending)} icon={Clock} />
        <StatCard
          label="Vencido"
          value={formatEuroCents(totals.overdue)}
          icon={AlertTriangle}
          hint={`${totals.overdueCount} facturas sin pagar`}
          className={totals.overdue ? "ring-1 ring-rose-200" : undefined}
        />
      </div>

      <Panel
        className="mt-4"
        title="Facturas"
        description={`${filtered.length} facturas`}
        bodyClassName="p-0"
        actions={
          <div className="flex gap-2">
            <SimpleSelect
              value={companyId}
              onChange={setCompanyId}
              size="sm"
              className="w-48"
              options={[{ value: "all", label: "Todas las empresas" }, ...companies.filter((c) => c.plan !== "internal").map((c) => ({ value: c.id, label: c.name }))]}
            />
            <SimpleSelect<Filter>
              value={status}
              onChange={setStatus}
              size="sm"
              className="w-40"
              options={[
                { value: "all", label: "Todos los estados" },
                ...(Object.keys(INVOICE_STATUS) as Invoice["status"][]).map((s) => ({ value: s, label: INVOICE_STATUS[s].label })),
              ]}
            />
          </div>
        }
      >
        <InvoicesTable invoices={filtered} companies={companies} />
      </Panel>
    </>
  );
}
