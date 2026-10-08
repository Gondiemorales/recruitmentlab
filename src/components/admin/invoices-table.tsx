"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import type { Company, Invoice } from "@/lib/types";
import { INVOICE_STATUS } from "@/lib/plans";
import { formatDate, formatEuroCents } from "@/lib/format";
import { ToneBadge } from "@/components/shared/tone-badge";
import { Button } from "@/components/ui/button";

export function InvoicesTable({ invoices, companies, showCompany = true }: { invoices: Invoice[]; companies?: Company[]; showCompany?: boolean }) {
  const markInvoicePaid = useDemo((s) => s.markInvoicePaid);
  const companyName = (id: string) => companies?.find((c) => c.id === id)?.name ?? "";

  if (invoices.length === 0) return <p className="p-5 text-sm text-muted-foreground">Sin facturas.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">Factura</th>
            {showCompany && <th className="px-3 py-3 font-medium">Empresa</th>}
            <th className="px-3 py-3 font-medium">Concepto</th>
            <th className="px-3 py-3 font-medium">Emisión</th>
            <th className="px-3 py-3 font-medium">Vencimiento</th>
            <th className="px-3 py-3 text-right font-medium">Importe</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="w-32 px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id} className="border-b last:border-0">
              <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{i.number}</td>
              {showCompany && (
                <td className="px-3 py-3">
                  <Link href={`/admin/empresas/${i.companyId}`} className="font-medium hover:text-primary">
                    {companyName(i.companyId)}
                  </Link>
                </td>
              )}
              <td className="max-w-72 truncate px-3 py-3 text-muted-foreground">{i.concept}</td>
              <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(i.issuedAt)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(i.dueAt)}</td>
              <td className="px-3 py-3 text-right font-medium tabular-nums">{formatEuroCents(i.amount)}</td>
              <td className="px-3 py-3">
                <ToneBadge tone={INVOICE_STATUS[i.status].tone}>{INVOICE_STATUS[i.status].label}</ToneBadge>
              </td>
              <td className="px-5 py-3 text-right">
                {i.status !== "paid" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      markInvoicePaid(i.id);
                      toast.success(`Factura ${i.number} marcada como pagada`);
                    }}
                  >
                    <CheckCircle2 data-icon="inline-start" /> Cobrada
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">{i.paidAt ? formatDate(i.paidAt) : ""}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
