import { formatDistanceToNowStrict, format } from "date-fns";
import { es } from "date-fns/locale";
import type { Job } from "./types";
import { SALARY_PERIOD_LABEL } from "./labels";

// useGrouping "always": en es-ES, por defecto 1550 no lleva punto de miles
const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
});
const num = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const compact = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 });

export const formatEuro = (n: number) => eur.format(n);
export const formatEuroCents = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" }).format(n);
export const formatNumber = (n: number) => num.format(n);
export const formatCompact = (n: number) => compact.format(n);
export const formatPercent = (n: number, digits = 0) =>
  `${(Number.isFinite(n) ? n * 100 : 0).toFixed(digits).replace(".", ",")} %`;

export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax" | "salaryPeriod">) {
  const { salaryMin: min, salaryMax: max, salaryPeriod } = job;
  if (min == null && max == null) return null;
  const k = (n: number) =>
    salaryPeriod === "year" && n >= 1000 ? `${Math.round(n / 1000)}K €` : formatEuro(n);
  const suffix = ` / ${SALARY_PERIOD_LABEL[salaryPeriod]}`;
  if (min != null && max != null) return `${k(min)} – ${k(max)}${suffix}`;
  if (min != null) return `Desde ${k(min)}${suffix}`;
  return `Hasta ${k(max as number)}${suffix}`;
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "ahora mismo";
  return `hace ${formatDistanceToNowStrict(new Date(iso), { locale: es })}`;
}

export function formatDate(iso: string | null | undefined, pattern = "d MMM yyyy") {
  if (!iso) return "—";
  return format(new Date(iso), pattern, { locale: es });
}

export function formatDateTime(iso: string | null | undefined) {
  return formatDate(iso, "d MMM yyyy · HH:mm");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isNew(iso: string | null, days = 4) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}
