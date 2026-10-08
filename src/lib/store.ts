"use client";

import { create } from "zustand";
import type {
  AnswerValue,
  Application,
  ApplicationEvent,
  ApplicationStatus,
  Company,
  CompanyUser,
  CompanyFeedback,
  ContactRequest,
  CvFile,
  EmailMessage,
  Job,
  JobStatus,
  Lead,
  LeadSource,
  Session,
} from "./types";
import { createDemoData, GENERIC_POOL, makePerson, makeProfile, PROFILE_POOLS, type DemoData } from "./seed/generate";
import { createRandom } from "./seed/random";
import { scoreApplication } from "./scoring";
import { slugify } from "./format";
import { token, uid } from "./id";
import { APPLICATION_STATUS, COMPANY_VISIBLE_STATUSES } from "./labels";

const STORAGE_KEY = "recruitment-lab-demo";
const STORAGE_VERSION = 6;

type Persisted = {
  version: number;
  savedAt: number;
  data: DemoData;
  session: Session | null;
};

type State = {
  hydrated: boolean;
  data: DemoData;
  session: Session | null;
  /** CVs subidos en esta sesión (object URLs, no se persisten) */
  liveCvUrls: Record<string, string>;
  /** Destino tras cambiar de sesión entre paneles (evita que la guarda redirija a otro sitio) */
  pendingPath: string | null;
};

export type JobInput = Omit<Job, "id" | "slug" | "createdAt" | "updatedAt" | "publishedAt" | "views">;

export type ApplicationInput = {
  jobId: string;
  leadToken?: string | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  linkedinUrl: string;
  answers: Record<string, AnswerValue>;
  cv: CvFile;
  cvObjectUrl?: string;
  consents: Application["consents"];
};

type Actions = {
  hydrate: () => void;
  resetDemo: () => void;
  login: (session: Session, then?: string) => void;
  logout: () => void;

  createCompany: (input: Omit<Company, "id" | "createdAt">) => Company;
  updateCompany: (id: string, patch: Partial<Pick<Company, "plan" | "accountStatus" | "contactName" | "contactEmail">>) => void;
  markInvoicePaid: (id: string) => void;
  createJob: (input: JobInput) => Job;
  updateJob: (id: string, patch: Partial<JobInput>) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  duplicateJob: (id: string) => Job | null;
  deleteJob: (id: string) => void;

  simulateLead: (jobId: string, opts?: { source?: LeadSource; platform?: Lead["platform"] }) => Lead;
  addLead: (input: Pick<Lead, "jobId" | "fullName" | "email" | "phone" | "city" | "source">) => Lead;
  sendInvite: (leadId: string) => EmailMessage | null;
  markLeadOpened: (leadId: string) => void;
  trackLeadClick: (tokenValue: string) => Lead | null;

  submitApplication: (input: ApplicationInput) => Application;
  setApplicationStatus: (id: string, status: ApplicationStatus) => void;
  rateApplication: (id: string, rating: Application["rating"]) => void;
  addNote: (id: string, body: string) => void;
  setCompanyFeedback: (id: string, feedback: Omit<CompanyFeedback, "at">) => void;

  submitContactRequest: (input: Omit<ContactRequest, "id" | "status" | "createdAt">) => void;
  setContactRequestStatus: (id: string, status: ContactRequest["status"]) => void;
};

const EMPTY: DemoData = { companies: [], jobs: [], leads: [], applications: [], emails: [], contactRequests: [], agencyCampaigns: [], users: [], invoices: [] };

const now = () => new Date().toISOString();

// ───────────────────────── Persistencia ─────────────────────────

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** Desplaza todas las fechas ISO para que la demo siempre parezca "reciente" */
function shiftDates<T>(value: T, deltaMs: number): T {
  if (deltaMs <= 0) return value;
  if (typeof value === "string") {
    return (ISO_RE.test(value) ? new Date(new Date(value).getTime() + deltaMs).toISOString() : value) as T;
  }
  if (Array.isArray(value)) return value.map((v) => shiftDates(v, deltaMs)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shiftDates(v, deltaMs)])) as T;
  }
  return value;
}

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Guardado agrupado en un microtask: varios cambios seguidos se escriben una sola vez,
// pero siempre antes de que el navegador pueda cambiar de página (un timer se perdería).
let pendingSave: Pick<State, "data" | "session"> | null = null;
function save(state: Pick<State, "data" | "session">) {
  const scheduled = pendingSave !== null;
  pendingSave = state;
  if (scheduled) return;
  queueMicrotask(() => {
    const s = pendingSave;
    pendingSave = null;
    if (!s) return;
    try {
      const payload: Persisted = { version: STORAGE_VERSION, savedAt: Date.now(), data: s.data, session: s.session };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Modo privado / cuota llena: la web sigue funcionando en memoria
    }
  });
}

// ───────────────────────── Helpers ─────────────────────────

function event(kind: ApplicationEvent["kind"], label: string): ApplicationEvent {
  return { id: uid("evt"), kind, label, at: now() };
}

function uniqueSlug(base: string, jobs: Job[]) {
  const slug = slugify(base) || "oferta";
  if (!jobs.some((j) => j.slug === slug)) return slug;
  return `${slug}-${uid().slice(0, 4)}`;
}

// ───────────────────────── Store ─────────────────────────

export const useDemo = create<State & Actions>()((set, get) => {
  const update = (fn: (data: DemoData) => DemoData) => set((s) => ({ data: fn(s.data) }));
  const patchApplication = (id: string, fn: (a: Application) => Application) =>
    update((d) => ({
      ...d,
      applications: d.applications.map((a) => (a.id === id ? { ...fn(a), updatedAt: now() } : a)),
    }));
  const patchLead = (id: string, fn: (l: Lead) => Lead) =>
    update((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? fn(l) : l)) }));

  return {
    hydrated: false,
    data: EMPTY,
    session: null,
    liveCvUrls: {},
    pendingPath: null,

    hydrate: () => {
      if (get().hydrated) return;
      const stored = load();
      if (stored) {
        set({ hydrated: true, data: shiftDates(stored.data, Date.now() - stored.savedAt), session: stored.session });
      } else {
        set({ hydrated: true, data: createDemoData(), session: null });
      }
    },

    resetDemo: () => set((s) => ({ data: createDemoData(), liveCvUrls: {}, session: s.session })),

    login: (session, then) => set({ session, pendingPath: then ?? null }),
    logout: () => set({ session: null }),

    // ───── Empresas (administración total) ─────
    createCompany: (input) => {
      const company: Company = { ...input, id: uid("cmp"), createdAt: now() };
      const owner: CompanyUser = {
        id: uid("usr"),
        companyId: company.id,
        name: input.contactName,
        email: input.contactEmail,
        role: "owner",
        lastLoginAt: null,
      };
      update((d) => ({ ...d, companies: [...d.companies, company], users: [...d.users, owner] }));
      return company;
    },

    updateCompany: (id, patch) =>
      update((d) => ({ ...d, companies: d.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

    markInvoicePaid: (id) =>
      update((d) => ({
        ...d,
        invoices: d.invoices.map((i) => (i.id === id ? { ...i, status: "paid", paidAt: now() } : i)),
      })),

    // ───── Ofertas ─────
    createJob: (input) => {
      const ts = now();
      const job: Job = {
        ...input,
        id: uid("job"),
        slug: uniqueSlug(`${input.title}-${input.city}`, get().data.jobs),
        views: 0,
        publishedAt: input.status === "active" ? ts : null,
        createdAt: ts,
        updatedAt: ts,
      };
      update((d) => ({ ...d, jobs: [job, ...d.jobs] }));
      return job;
    },

    updateJob: (id, patch) =>
      update((d) => ({
        ...d,
        jobs: d.jobs.map((j) =>
          j.id === id
            ? {
                ...j,
                ...patch,
                publishedAt: j.publishedAt ?? (patch.status === "active" ? now() : null),
                updatedAt: now(),
              }
            : j,
        ),
      })),

    setJobStatus: (id, status) => get().updateJob(id, { status }),

    duplicateJob: (id) => {
      const src = get().data.jobs.find((j) => j.id === id);
      if (!src) return null;
      const { id: _id, slug: _s, createdAt: _c, updatedAt: _u, publishedAt: _p, views: _v, ...rest } = src;
      return get().createJob({ ...rest, title: `${src.title} (copia)`, status: "draft", campaign: null });
    },

    deleteJob: (id) =>
      update((d) => ({
        ...d,
        jobs: d.jobs.filter((j) => j.id !== id),
        leads: d.leads.filter((l) => l.jobId !== id),
        applications: d.applications.filter((a) => a.jobId !== id),
      })),

    // ───── Leads (Meta simulado) ─────
    simulateLead: (jobId, opts) => {
      const r = createRandom(Date.now() % 2 ** 31);
      const p = makePerson(r);
      const job = get().data.jobs.find((j) => j.id === jobId);
      const lead: Lead = {
        id: uid("lead"),
        jobId,
        source: opts?.source ?? "meta_lead_ad",
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        city: job?.city ?? "",
        metaAnswers: [
          { question: "¿Cuándo podrías incorporarte?", answer: r.pick(["Inmediata", "En 15 días", "En 1 mes"]) },
          { question: "Ciudad de residencia", answer: job?.city ?? "" },
        ],
        token: token(),
        status: "new",
        platform: opts?.platform ?? (r.chance(0.6) ? "instagram" : "facebook"),
        createdAt: now(),
        emailedAt: null,
        openedAt: null,
        clickedAt: null,
        appliedAt: null,
        applicationId: null,
      };
      update((d) => ({
        ...d,
        leads: [lead, ...d.leads],
        jobs: d.jobs.map((j) =>
          j.id === jobId && j.campaign
            ? {
                ...j,
                campaign: {
                  ...j.campaign,
                  leads: j.campaign.leads + 1,
                  impressions: j.campaign.impressions + r.int(150, 260),
                  clicks: j.campaign.clicks + r.int(2, 4),
                  spend: Math.round((j.campaign.spend + 1.5 + r.next() * 3) * 100) / 100,
                },
              }
            : j,
        ),
      }));
      return lead;
    },

    addLead: (input) => {
      const lead: Lead = {
        ...input,
        id: uid("lead"),
        metaAnswers: [],
        token: token(),
        status: "new",
        platform: "facebook",
        createdAt: now(),
        emailedAt: null,
        openedAt: null,
        clickedAt: null,
        appliedAt: null,
        applicationId: null,
      };
      update((d) => ({ ...d, leads: [lead, ...d.leads] }));
      return lead;
    },

    sendInvite: (leadId) => {
      const { data } = get();
      const lead = data.leads.find((l) => l.id === leadId);
      const job = lead && data.jobs.find((j) => j.id === lead.jobId);
      if (!lead || !job) return null;
      const email: EmailMessage = {
        id: uid("eml"),
        leadId,
        to: lead.email,
        subject: `${lead.fullName.split(" ")[0]}, completa tu candidatura para ${job.title}`,
        template: "apply_invite",
        status: "delivered",
        sentAt: now(),
      };
      update((d) => ({
        ...d,
        emails: [email, ...d.emails],
        leads: d.leads.map((l) =>
          l.id === leadId
            ? { ...l, status: l.status === "new" || l.status === "bounced" ? "emailed" : l.status, emailedAt: now() }
            : l,
        ),
      }));
      return email;
    },

    markLeadOpened: (leadId) => {
      patchLead(leadId, (l) => (l.openedAt ? l : { ...l, status: l.status === "emailed" ? "opened" : l.status, openedAt: now() }));
      update((d) => ({
        ...d,
        emails: d.emails.map((e) => (e.leadId === leadId && e.status === "delivered" ? { ...e, status: "opened" } : e)),
      }));
    },

    trackLeadClick: (tokenValue) => {
      const lead = get().data.leads.find((l) => l.token === tokenValue);
      if (!lead) return null;
      if (!lead.clickedAt) {
        patchLead(lead.id, (l) => ({
          ...l,
          status: l.status === "applied" ? l.status : "clicked",
          openedAt: l.openedAt ?? now(),
          clickedAt: now(),
        }));
        update((d) => ({
          ...d,
          emails: d.emails.map((e) => (e.leadId === lead.id ? { ...e, status: "clicked" } : e)),
          jobs: d.jobs.map((j) => (j.id === lead.jobId ? { ...j, views: j.views + 1 } : j)),
        }));
      }
      return get().data.leads.find((l) => l.id === lead.id) ?? null;
    },

    // ───── Candidaturas ─────
    submitApplication: (input) => {
      const { data } = get();
      const job = data.jobs.find((j) => j.id === input.jobId);
      const lead = input.leadToken ? data.leads.find((l) => l.token === input.leadToken && l.jobId === input.jobId) : null;
      const { score, knockoutFailed } = scoreApplication(job?.questions ?? [], input.answers);
      const r = createRandom(Date.now() % 2 ** 31);
      const pool = PROFILE_POOLS[input.jobId] ?? { ...GENERIC_POOL, skills: job?.tags.length ? job.tags : GENERIC_POOL.skills };
      const ts = now();

      const events: ApplicationEvent[] = [];
      if (lead) {
        events.push({ id: uid("evt"), kind: "lead_received", label: "Lead recibido desde Meta", at: lead.createdAt });
        if (lead.emailedAt) events.push({ id: uid("evt"), kind: "email_sent", label: "Email con enlace personalizado enviado", at: lead.emailedAt });
        if (lead.clickedAt) events.push({ id: uid("evt"), kind: "link_clicked", label: "Clic en el enlace de la oferta", at: lead.clickedAt });
      }
      events.push(event("applied", "Candidatura completada"));

      const application: Application = {
        id: uid("app"),
        jobId: input.jobId,
        leadId: lead?.id ?? null,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        city: input.city,
        linkedinUrl: input.linkedinUrl,
        cv: input.cv,
        profile: makeProfile(r, pool),
        answers: input.answers,
        score,
        knockoutFailed,
        status: "new",
        rating: 0,
        notes: [],
        events,
        companyFeedback: null,
        consents: input.consents,
        source: lead ? lead.source : "organic",
        createdAt: ts,
        updatedAt: ts,
      };

      set((s) => ({
        liveCvUrls: input.cvObjectUrl ? { ...s.liveCvUrls, [application.id]: input.cvObjectUrl } : s.liveCvUrls,
        data: {
          ...s.data,
          applications: [application, ...s.data.applications.filter((a) => !(a.jobId === input.jobId && a.email === application.email))],
          leads: s.data.leads.map((l) =>
            l.id === lead?.id ? { ...l, status: "applied", appliedAt: ts, applicationId: application.id } : l,
          ),
        },
      }));
      return application;
    },

    setApplicationStatus: (id, status) =>
      patchApplication(id, (a) => {
        const events = [...a.events, event("status_changed", `Movida a ${APPLICATION_STATUS[status].label}`)];
        const nowShared = COMPANY_VISIBLE_STATUSES.includes(status) && !COMPANY_VISIBLE_STATUSES.includes(a.status);
        if (nowShared) events.push(event("shared_with_company", "Preseleccionada para entrevista"));
        return { ...a, status, events };
      }),

    rateApplication: (id, rating) => patchApplication(id, (a) => ({ ...a, rating })),

    addNote: (id, body) => {
      const author = get().session?.name ?? "Equipo";
      patchApplication(id, (a) => ({
        ...a,
        notes: [...a.notes, { id: uid("note"), author, body, at: now() }],
        events: [...a.events, event("note_added", `Nota añadida por ${author}`)],
      }));
    },

    setCompanyFeedback: (id, feedback) =>
      patchApplication(id, (a) => ({
        ...a,
        companyFeedback: { ...feedback, at: now() },
        events: [
          ...a.events,
          event(
            "company_feedback",
            `El responsable marcó: ${{ interested: "Me interesa", maybe: "Quizá", not_fit: "No encaja" }[feedback.verdict]}`,
          ),
        ],
      })),

    // ───── Contacto ─────
    submitContactRequest: (input) =>
      update((d) => ({
        ...d,
        contactRequests: [{ ...input, id: uid("req"), status: "new", source: "web", createdAt: now() }, ...d.contactRequests],
      })),

    setContactRequestStatus: (id, status) =>
      update((d) => ({ ...d, contactRequests: d.contactRequests.map((c) => (c.id === id ? { ...c, status } : c)) })),
  };
});

// Guarda cualquier cambio una vez hidratado y sincroniza entre pestañas
// (p. ej. el candidato aplica en una pestaña y el panel lo ve en otra).
if (typeof window !== "undefined") {
  let applyingExternal = false;

  useDemo.subscribe((s, prev) => {
    if (!s.hydrated || applyingExternal) return;
    if (s.data !== prev.data || s.session !== prev.session) save(s);
  });

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue || !useDemo.getState().hydrated) return;
    try {
      const parsed = JSON.parse(e.newValue) as Persisted;
      if (parsed.version !== STORAGE_VERSION) return;
      applyingExternal = true;
      useDemo.setState({ data: parsed.data, session: parsed.session });
    } catch {
      // ignorar
    } finally {
      applyingExternal = false;
    }
  });
}
