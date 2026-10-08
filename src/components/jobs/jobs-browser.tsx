"use client";

import { useMemo, useState } from "react";
import { SearchX, Search, X } from "lucide-react";
import { useDemo } from "@/lib/store";
import { WORK_MODE_LABEL } from "@/lib/labels";
import type { WorkMode } from "@/lib/types";
import { JobCard } from "./job-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function JobsBrowser({ initialQuery = "", initialSector = "all" }: { initialQuery?: string; initialSector?: string }) {
  const hydrated = useDemo((s) => s.hydrated);
  const { jobs, companies } = useDemo((s) => s.data);
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<WorkMode | "all">("all");
  const [sector, setSector] = useState<string>(initialSector);

  const active = useMemo(
    () => jobs.filter((j) => j.status === "active").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
    [jobs],
  );

  const sectors = useMemo(() => {
    const set = new Set(active.map((j) => companies.find((c) => c.id === j.companyId)?.sector).filter(Boolean) as string[]);
    return [...set].sort();
  }, [active, companies]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return active.filter((j) => {
      const company = companies.find((c) => c.id === j.companyId);
      if (mode !== "all" && j.workMode !== mode) return false;
      if (sector !== "all" && company?.sector !== sector) return false;
      if (!q) return true;
      return normalize([j.title, j.city, j.region, company?.name, ...j.tags].join(" ")).includes(q);
    });
  }, [active, companies, query, mode, sector]);

  const hasFilters = query || mode !== "all" || sector !== "all";

  return (
    <div className="mt-10">
      <div className="sticky top-20 z-30 -mx-2 rounded-3xl p-2">
        <div className="glass shadow-soft flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Puesto, empresa o ciudad…"
              className="h-11 rounded-xl border-transparent bg-white pl-10 text-base shadow-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "onsite", "hybrid", "remote"] as const).map((m) => (
              <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                {m === "all" ? "Todas" : WORK_MODE_LABEL[m]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
          <Chip size="sm" active={sector === "all"} onClick={() => setSector("all")}>
            Todos los sectores
          </Chip>
          {sectors.map((s) => (
            <Chip key={s} size="sm" active={sector === s} onClick={() => setSector(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{hydrated ? `${filtered.length} ${filtered.length === 1 ? "oferta" : "ofertas"}` : "Cargando ofertas…"}</span>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setMode("all");
              setSector("all");
            }}
          >
            <X data-icon="inline-start" /> Limpiar filtros
          </Button>
        )}
      </div>

      {!hydrated ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="No hay ofertas con esos filtros" description="Prueba con otra búsqueda o envíanos tu CV para futuras ofertas." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} company={companies.find((c) => c.id === job.companyId)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  size = "md",
  onClick,
  children,
}: {
  active: boolean;
  size?: "sm" | "md";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border font-medium transition-colors",
        size === "md" ? "h-9 px-4 text-sm" : "h-7 px-3 text-xs",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
