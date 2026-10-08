// Modelo de dominio de Recruitment Lab.
// Pensado para mapear 1:1 a tablas de Postgres cuando se conecte un backend real.

export type ID = string;
export type ISODate = string;

// ───────────────────────── Empresas ─────────────────────────

export type Company = {
  id: ID;
  name: string;
  sector: string;
  city: string;
  website: string;
  /** Color de marca (hue OKLCH) para el logo generado */
  hue: number;
  contactName: string;
  contactEmail: string;
  /** Datos de la cuenta cliente (los gestiona el administrador total) */
  plan: PlanId;
  accountStatus: AccountStatus;
  createdAt: ISODate;
};

export type PlanId = "basic" | "pro" | "enterprise" | "internal";
export type AccountStatus = "active" | "trial" | "suspended";

export type CompanyUser = {
  id: ID;
  companyId: ID;
  name: string;
  email: string;
  role: "owner" | "recruiter" | "viewer";
  lastLoginAt: ISODate | null;
};

export type Invoice = {
  id: ID;
  companyId: ID;
  number: string;
  concept: string;
  /** Importe con IVA incluido */
  amount: number;
  issuedAt: ISODate;
  dueAt: ISODate;
  status: "paid" | "pending" | "overdue";
  paidAt: ISODate | null;
};

// ───────────────────────── Ofertas ─────────────────────────

export type WorkMode = "onsite" | "hybrid" | "remote";
export type EmploymentType = "full_time" | "part_time" | "temporary" | "internship";
export type SalaryPeriod = "year" | "month" | "hour";
export type JobStatus = "draft" | "active" | "paused" | "closed";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "yes_no"
  | "number";

export type QuestionOption = {
  id: ID;
  label: string;
  /** Si la pregunta puntúa, opciones correctas suman puntos */
  correct?: boolean;
};

export type JobQuestion = {
  id: ID;
  type: QuestionType;
  label: string;
  helpText?: string;
  required: boolean;
  options?: QuestionOption[];
  /** Puntos que aporta al test si se responde correctamente */
  points?: number;
  /**
   * Eliminatoria: si la respuesta no es la esperada, la candidatura se marca
   * como "no cumple requisitos". Para yes_no → expectedYes; para choice → opciones correctas;
   * para number → min.
   */
  knockout?: boolean;
  expectedYes?: boolean;
  min?: number;
};

export type MetaCreative = {
  id: ID;
  kind: "image" | "video" | "carousel";
  headline: string;
  /** Fondo generado (gradiente) para simular la creatividad */
  hue: number;
};

export type MetaCampaign = {
  id: ID;
  name: string;
  status: "active" | "paused" | "learning" | "ended";
  objective: "lead_generation";
  dailyBudget: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  audience: string;
  placements: ("facebook" | "instagram" | "messenger" | "audience_network")[];
  primaryText: string;
  creatives: MetaCreative[];
  startedAt: ISODate;
};

export type Job = {
  id: ID;
  slug: string;
  companyId: ID;
  title: string;
  /** Una frase para cards y SEO */
  summary: string;
  /** Markdown ligero (párrafos y listas con "- ") */
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  city: string;
  region: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod;
  tags: string[];
  status: JobStatus;
  questions: JobQuestion[];
  campaign: MetaCampaign | null;
  /** Visitas a la página de la oferta (simulado) */
  views: number;
  publishedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

// ───────────────────────── Leads (Meta) ─────────────────────────

export type LeadSource = "meta_lead_ad" | "csv_import" | "manual" | "organic";

/** Embudo del lead: llega de Meta → email → abre → clic → aplica */
export type LeadStatus = "new" | "emailed" | "opened" | "clicked" | "applied" | "bounced";

export type Lead = {
  id: ID;
  jobId: ID;
  source: LeadSource;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  /** Respuestas del formulario instantáneo de Meta */
  metaAnswers: { question: string; answer: string }[];
  /** Token secreto del enlace personalizado (autorrelleno) */
  token: string;
  status: LeadStatus;
  platform: "facebook" | "instagram";
  createdAt: ISODate;
  emailedAt: ISODate | null;
  openedAt: ISODate | null;
  clickedAt: ISODate | null;
  appliedAt: ISODate | null;
  applicationId: ID | null;
};

// ───────────────────────── Candidaturas ─────────────────────────

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type AnswerValue = string | string[] | number | boolean | null;

export type CvFile = {
  name: string;
  sizeBytes: number;
  mimeType: string;
};

export type CandidateProfile = {
  headline: string;
  yearsExperience: number;
  experience: { role: string; company: string; period: string; summary: string }[];
  education: { title: string; center: string; period: string }[];
  skills: string[];
  languages: string[];
};

export type CompanyFeedback = {
  verdict: "interested" | "maybe" | "not_fit";
  comment: string;
  at: ISODate;
  by: string;
};

export type ApplicationNote = {
  id: ID;
  author: string;
  body: string;
  at: ISODate;
};

export type ApplicationEvent = {
  id: ID;
  kind:
    | "lead_received"
    | "email_sent"
    | "email_opened"
    | "link_clicked"
    | "applied"
    | "status_changed"
    | "note_added"
    | "shared_with_company"
    | "company_feedback";
  label: string;
  at: ISODate;
};

export type Application = {
  id: ID;
  jobId: ID;
  leadId: ID | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  linkedinUrl: string;
  cv: CvFile;
  profile: CandidateProfile;
  answers: Record<ID, AnswerValue>;
  /** 0-100 sobre las preguntas puntuables. null si la oferta no tiene test */
  score: number | null;
  knockoutFailed: boolean;
  status: ApplicationStatus;
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  notes: ApplicationNote[];
  events: ApplicationEvent[];
  companyFeedback: CompanyFeedback | null;
  consents: { privacy: boolean; retention: boolean; marketing: boolean };
  source: LeadSource;
  createdAt: ISODate;
  updatedAt: ISODate;
};

// ───────────────────────── Contacto / emails ─────────────────────────

export type ContactRequest = {
  id: ID;
  kind: "company" | "candidate";
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  message: string;
  hiringVolume?: string;
  status: "new" | "contacted" | "won" | "lost";
  /** Formulario de la web o lead de una campaña propia de captación en Meta */
  source?: "web" | "meta_lead_ad";
  campaignId?: ID;
  createdAt: ISODate;
};

export type EmailMessage = {
  id: ID;
  leadId: ID;
  to: string;
  subject: string;
  template: "apply_invite" | "application_received" | "reminder";
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced";
  sentAt: ISODate;
};

// ───────────────────────── Sesión demo ─────────────────────────

export type Session =
  | { role: "agency"; name: string; email: string }
  | {
      role: "company";
      name: string;
      email: string;
      companyId: ID;
      /** El administrador total está viendo el panel de la empresa */
      impersonatedBy?: string;
    };
