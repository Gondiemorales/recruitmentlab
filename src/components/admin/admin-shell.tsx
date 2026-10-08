"use client";

import { Building2, Inbox, LayoutDashboard, ReceiptText, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/store";
import { AppShell, type NavItem } from "@/components/app/app-shell";

/** Administración total: vigila las cuentas cliente (empresas), su uso y su facturación */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { contactRequests, invoices } = useDemo((s) => s.data);

  const nav: NavItem[] = [
    { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/admin/empresas", label: "Empresas", icon: Building2 },
    { href: "/admin/facturacion", label: "Facturación", icon: ReceiptText, badge: invoices.filter((i) => i.status === "overdue").length },
    { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox, badge: contactRequests.filter((c) => c.status === "new").length },
  ];

  return (
    <AppShell
      role="agency"
      nav={nav}
      context={
        <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs shadow-soft">
          <span className="flex size-6 items-center justify-center rounded-md bg-slate-900 text-white">
            <ShieldCheck className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">Administración</p>
            <p className="text-muted-foreground">Recruitment Lab</p>
          </div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
