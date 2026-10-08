import type {
  ApplicationStatus,
  EmploymentType,
  JobStatus,
  LeadSource,
  LeadStatus,
  QuestionType,
  SalaryPeriod,
  WorkMode,
} from "./types";

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
};

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Jornada completa",
  part_time: "Media jornada",
  temporary: "Temporal",
  internship: "Prácticas",
};

export const SALARY_PERIOD_LABEL: Record<SalaryPeriod, string> = {
  year: "año",
  month: "mes",
  hour: "hora",
};

export const JOB_STATUS: Record<JobStatus, { label: string; tone: Tone }> = {
  draft: { label: "Borrador", tone: "neutral" },
  active: { label: "Activa", tone: "success" },
  paused: { label: "Pausada", tone: "warning" },
  closed: { label: "Cerrada", tone: "muted" },
};

export const LEAD_STATUS: Record<LeadStatus, { label: string; tone: Tone }> = {
  new: { label: "Nuevo", tone: "info" },
  emailed: { label: "Email enviado", tone: "neutral" },
  opened: { label: "Email abierto", tone: "violet" },
  clicked: { label: "Clic en oferta", tone: "warning" },
  applied: { label: "Ha aplicado", tone: "success" },
  bounced: { label: "Rebotado", tone: "danger" },
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  meta_lead_ad: "Meta Lead Ads",
  csv_import: "Importación CSV",
  manual: "Manual",
  organic: "Web",
};

/** Orden del pipeline (columnas del kanban) */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; tone: Tone; description: string }
> = {
  new: { label: "Nueva", tone: "info", description: "Pendiente de revisar" },
  reviewing: { label: "En revisión", tone: "neutral", description: "En evaluación por el equipo" },
  shortlisted: { label: "Preseleccionada", tone: "violet", description: "Lista para entrevistar" },
  interview: { label: "Entrevista", tone: "warning", description: "Entrevista agendada" },
  offer: { label: "Oferta", tone: "brand", description: "Oferta enviada" },
  hired: { label: "Contratada", tone: "success", description: "¡Incorporación cerrada!" },
  rejected: { label: "Descartada", tone: "danger", description: "No continúa en el proceso" },
};

/** Estados que cuentan como candidatos preseleccionados (shortlist) */
export const COMPANY_VISIBLE_STATUSES: ApplicationStatus[] = [
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

export const QUESTION_TYPE: Record<QuestionType, { label: string; hint: string }> = {
  short_text: { label: "Texto corto", hint: "Una línea" },
  long_text: { label: "Texto largo", hint: "Respuesta desarrollada" },
  single_choice: { label: "Opción única", hint: "Elegir una opción" },
  multiple_choice: { label: "Opción múltiple", hint: "Elegir varias" },
  yes_no: { label: "Sí / No", hint: "Ideal para requisitos" },
  number: { label: "Número", hint: "Años, disponibilidad…" },
};

export const FEEDBACK_LABEL = {
  interested: { label: "Me interesa", tone: "success" },
  maybe: { label: "Quizá", tone: "warning" },
  not_fit: { label: "No encaja", tone: "danger" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type Tone =
  | "neutral"
  | "muted"
  | "info"
  | "brand"
  | "violet"
  | "success"
  | "warning"
  | "danger";
