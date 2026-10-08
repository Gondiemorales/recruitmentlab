"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import type { AccountStatus, PlanId } from "@/lib/types";
import { allCompanyStats } from "@/lib/account-metrics";
import { ACCOUNT_STATUS, PLANS } from "@/lib/plans";
import { formatEuro, formatEuroCents, formatNumber, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { SimpleSelect } from "@/components/app/simple-select";
import { CompanyLogo } from "@/components/shared/brand";
import { ToneBadge } from "@/components/shared/tone-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CompaniesPage({ openNew = false }: { openNew?: boolean }) {
  const router = useRouter();
  const data = useDemo((s) => s.data);
  const [open, setOpen] = useState(openNew);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<PlanId | "all">("all");
  const [status, setStatus] = useState<AccountStatus | "all">("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCompanyStats(data)
      .filter((s) => plan === "all" || s.company.plan === plan)
      .filter((s) => status === "all" || s.company.accountStatus === status)
      .filter((s) => !q || `${s.company.name} ${s.company.sector} ${s.company.city}`.toLowerCase().includes(q))
      .sort((a, b) => a.company.name.localeCompare(b.company.name));
  }, [data, query, plan, status]);

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Cuentas cliente: plan contratado, uso de la plataforma, resultados y estado de cobro."
        actions={
          <Button size="lg" onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" /> Nueva empresa
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar empresa" className="h-9 bg-white pl-9" />
        </div>
        <SimpleSelect<PlanId | "all">
          value={plan}
          onChange={setPlan}
          className="h-9 md:w-44"
          options={[{ value: "all", label: "Todos los planes" }, ...(Object.keys(PLANS) as PlanId[]).map((p) => ({ value: p, label: PLANS[p].name }))]}
        />
        <SimpleSelect<AccountStatus | "all">
          value={status}
          onChange={setStatus}
          className="h-9 md:w-44"
          options={[
            { value: "all", label: "Todos los estados" },
            ...(Object.keys(ACCOUNT_STATUS) as AccountStatus[]).map((s) => ({ value: s, label: ACCOUNT_STATUS[s].label })),
          ]}
        />
        <span className="text-sm text-muted-foreground md:ml-auto">{rows.length} empresas</span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Cuenta</th>
                <th className="px-3 py-3 text-right font-medium">Ofertas activas</th>
                <th className="px-3 py-3 text-right font-medium">Leads</th>
                <th className="px-3 py-3 text-right font-medium">Contratados</th>
                <th className="px-3 py-3 text-right font-medium">Pendiente</th>
                <th className="px-5 py-3 text-right font-medium">Último acceso</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.company.id}
                  onClick={() => router.push(`/admin/empresas/${s.company.id}`)}
                  className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={s.company.name} hue={s.company.hue} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.company.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.company.sector} · {s.company.city}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <ToneBadge tone={PLANS[s.company.plan].tone} dot={false}>
                      {PLANS[s.company.plan].name}
                    </ToneBadge>
                    {PLANS[s.company.plan].monthlyFee > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{formatEuro(PLANS[s.company.plan].monthlyFee)}/mes</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <ToneBadge tone={ACCOUNT_STATUS[s.company.accountStatus].tone}>{ACCOUNT_STATUS[s.company.accountStatus].label}</ToneBadge>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {s.activeJobs}
                    {s.maxActiveJobs !== null && <span className="text-muted-foreground">/{s.maxActiveJobs}</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatNumber(s.leads)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.hired}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {s.overdue > 0 ? (
                      <span className="font-semibold text-rose-600">{formatEuroCents(s.pending + s.overdue)}</span>
                    ) : s.pending > 0 ? (
                      formatEuroCents(s.pending)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs whitespace-nowrap text-muted-foreground">{s.lastLoginAt ? timeAgo(s.lastLoginAt) : "Nunca"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewCompanyDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

const schema = z.object({
  name: z.string().trim().min(2, "Nombre de la empresa"),
  sector: z.string().trim().min(2, "Sector"),
  city: z.string().trim().min(2, "Ciudad"),
  website: z.string().trim(),
  contactName: z.string().trim().min(2, "Persona de contacto"),
  contactEmail: z.string().trim().email("Email no válido"),
});
type Values = z.infer<typeof schema>;

function NewCompanyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const createCompany = useDemo((s) => s.createCompany);
  const [values, setValues] = useState<Values>({ name: "", sector: "", city: "", website: "", contactName: "", contactEmail: "" });
  const [plan, setPlan] = useState<PlanId>("pro");
  const [trial, setTrial] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const i of parsed.error.issues) next[i.path[0] as keyof Values] = i.message;
      setErrors(next);
      return;
    }
    const company = createCompany({ ...parsed.data, hue: Math.floor(Math.random() * 360), plan, accountStatus: trial ? "trial" : "active" });
    toast.success("Empresa dada de alta", { description: `Acceso al panel enviado a ${parsed.data.contactEmail}` });
    setValues({ name: "", sector: "", city: "", website: "", contactName: "", contactEmail: "" });
    setErrors({});
    onOpenChange(false);
    router.push(`/admin/empresas/${company.id}`);
  };

  const fields: [keyof Values, string, string][] = [
    ["name", "Empresa", "Hoteles del Sur"],
    ["sector", "Sector", "Hostelería"],
    ["city", "Ciudad", "Madrid"],
    ["website", "Web", "hotelesdelsur.es"],
    ["contactName", "Persona de contacto", "Ana López"],
    ["contactEmail", "Email de acceso", "ana@hotelesdelsur.es"],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva empresa cliente</DialogTitle>
          <DialogDescription>Se crea la cuenta y la persona de contacto recibe acceso a su panel.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {fields.map(([k, label, ph]) => (
            <div key={k} className="space-y-1.5">
              <Label>{label}</Label>
              <Input value={values[k]} onChange={(e) => setValues({ ...values, [k]: e.target.value })} placeholder={ph} aria-invalid={!!errors[k]} />
              {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
            </div>
          ))}
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <SimpleSelect<PlanId>
              value={plan}
              onChange={setPlan}
              options={(["basic", "pro", "enterprise"] as PlanId[]).map((p) => ({ value: p, label: `${PLANS[p].name} · ${formatEuro(PLANS[p].monthlyFee)}/mes` }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Alta</Label>
            <SimpleSelect<"active" | "trial">
              value={trial ? "trial" : "active"}
              onChange={(v) => setTrial(v === "trial")}
              options={[
                { value: "active", label: "Cuenta activa" },
                { value: "trial", label: "Periodo de prueba" },
              ]}
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Dar de alta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
