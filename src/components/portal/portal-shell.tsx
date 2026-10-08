"use client";

import { ArrowLeft, Ban, Briefcase, Eye, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import { PLANS } from "@/lib/plans";
import { AGENCY_SESSION } from "@/lib/auth";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { CompanyLogo } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";

/** Panel de empresa: cada empresa gestiona sus ofertas, campañas y candidatos */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const { companies, applications, leads } = useScopedData();
  const company = companies[0];

  const nav: NavItem[] = [
    { href: "/portal", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/portal/ofertas", label: "Ofertas", icon: Briefcase },
    { href: "/portal/candidaturas", label: "Candidaturas", icon: Users, badge: applications.filter((a) => a.status === "new").length },
    { href: "/portal/leads", label: "Leads de Meta", icon: Megaphone, badge: leads.filter((l) => l.status === "new").length },
  ];

  return (
    <AppShell
      role="company"
      nav={nav}
      context={
        company ? (
          <div className="flex items-center gap-2.5 rounded-xl border bg-white p-2.5 shadow-soft">
            <CompanyLogo name={company.name} hue={company.hue} size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{company.name}</p>
              <p className="text-xs text-muted-foreground">{company.plan === "internal" ? "Cuenta de empresa" : `Plan ${PLANS[company.plan].name}`}</p>
            </div>
          </div>
        ) : null
      }
    >
      <PortalBanners />
      {children}
    </AppShell>
  );
}

/** Avisos de cuenta: suplantación por el administrador y cuenta suspendida */
function PortalBanners() {
  const session = useDemo((s) => s.session);
  const login = useDemo((s) => s.login);
  const { companies } = useScopedData();
  const company = companies[0];
  if (session?.role !== "company" || !company) return null;

  return (
    <div className="mb-6 space-y-2">
      {session.impersonatedBy && (
        <div className="flex flex-col gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white sm:flex-row sm:items-center">
          <Eye className="size-4 shrink-0 text-white/70" />
          <p className="flex-1">
            Estás viendo el panel de <b>{company.name}</b> como administrador.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              login(AGENCY_SESSION, `/admin/empresas/${company.id}`);
            }}
          >
            <ArrowLeft data-icon="inline-start" /> Volver a administración
          </Button>
        </div>
      )}
      {company.accountStatus === "suspended" && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <Ban className="size-4 shrink-0" />
          Tu cuenta está suspendida: no puedes publicar ofertas nuevas. Escríbenos a hola@recruitmentlab.es.
        </div>
      )}
    </div>
  );
}
