import type {
  AnswerValue,
  Application,
  ApplicationEvent,
  ApplicationStatus,
  CandidateProfile,
  Company,
  CompanyUser,
  ContactRequest,
  EmailMessage,
  Invoice,
  Job,
  JobQuestion,
  Lead,
  MetaCampaign,
} from "../types";
import { scoreApplication } from "../scoring";
import { createRandom, type Random } from "./random";
import { COMPANY_ACCOUNTS, COMPANY_SEEDS, JOB_SEEDS, type JobSeed, type ProfilePool } from "./catalog";
import { makeInvoices, makeUsers } from "./billing";
import { EMAIL_DOMAINS, FIRST_NAMES, LAST_NAMES, UNIVERSITIES } from "./people";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const MIN = 60_000;

export type DemoData = {
  companies: Company[];
  jobs: Job[];
  leads: Lead[];
  applications: Application[];
  emails: EmailMessage[];
  contactRequests: ContactRequest[];
  /** Campañas propias de Recruitment Lab para captar empresas cliente */
  agencyCampaigns: MetaCampaign[];
  /** Administración de cuentas cliente */
  users: CompanyUser[];
  invoices: Invoice[];
};

const iso = (ms: number) => new Date(ms).toISOString();
const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ───────────────────────── Personas ─────────────────────────

export type Person = { firstName: string; fullName: string; email: string; phone: string };

export function makePerson(r: Random): Person {
  const first = r.pick(FIRST_NAMES);
  const last1 = r.pick(LAST_NAMES);
  const last2 = r.pick(LAST_NAMES);
  const email = `${strip(first)}.${strip(last1)}${r.chance(0.5) ? r.int(1, 99) : ""}@${r.pick(EMAIL_DOMAINS)}`;
  const phone = `+34 6${r.int(10, 99)} ${r.int(100, 999)} ${r.int(100, 999)}`;
  return { firstName: first, fullName: `${first} ${last1} ${last2}`, email, phone };
}

export const GENERIC_POOL: ProfilePool = {
  headlines: ["Profesional con experiencia", "Perfil polivalente"],
  roles: ["Técnico/a", "Auxiliar", "Responsable de turno", "Atención al cliente"],
  employers: ["Empresa local", "Grupo Empresarial", "ETT"],
  skills: ["Trabajo en equipo", "Atención al cliente", "Organización", "Ofimática"],
  education: ["Bachillerato", "FP Grado Medio", "Grado universitario"],
};

export function makeProfile(r: Random, pool: ProfilePool): CandidateProfile {
  const years = r.int(1, 12);
  const roles = r.sample(pool.roles, Math.min(pool.roles.length, r.int(2, 3)));
  const thisYear = new Date().getFullYear();
  let cursor = thisYear;
  const experience = roles.map((role, i) => {
    const len = r.int(1, 4);
    const end = i === 0 ? "Actualidad" : String(cursor);
    const start = cursor - len;
    cursor = start;
    return {
      role,
      company: r.pick(pool.employers),
      period: `${start} – ${end}`,
      summary: r.pick([
        "Atención directa al cliente y resolución de incidencias.",
        "Trabajo en equipo con objetivos semanales y reporting al responsable.",
        "Formación de nuevas incorporaciones y mejora de procesos.",
        "Gestión autónoma de tareas en entorno de alta demanda.",
      ]),
    };
  });
  return {
    headline: r.pick(pool.headlines),
    yearsExperience: years,
    experience,
    education: [{ title: r.pick(pool.education), center: r.pick(UNIVERSITIES), period: `${cursor - 3} – ${cursor - 1}` }],
    skills: r.sample(pool.skills, Math.min(pool.skills.length, r.int(4, 6))),
    languages: r.chance(0.6) ? ["Español (nativo)", r.pick(["Inglés (B1)", "Inglés (B2)", "Inglés (C1)", "Francés (B1)"])] : ["Español (nativo)"],
  };
}

// ───────────────────────── Respuestas ─────────────────────────

/** quality ∈ [0,1]: probabilidad de que cada respuesta sea "buena" */
export function makeAnswers(r: Random, questions: JobQuestion[], quality: number): Record<string, AnswerValue> {
  const answers: Record<string, AnswerValue> = {};
  for (const q of questions) {
    const good = r.chance(quality);
    if (!q.required && r.chance(0.35)) continue;
    switch (q.type) {
      case "yes_no":
        answers[q.id] = q.expectedYes === undefined ? r.chance(0.5) : good ? q.expectedYes : !q.expectedYes;
        break;
      case "single_choice": {
        const opts = q.options ?? [];
        const right = opts.filter((o) => o.correct);
        const wrong = opts.filter((o) => !o.correct);
        const pool = right.length && wrong.length ? (good ? right : wrong) : opts;
        answers[q.id] = pool.length ? r.pick(pool).id : null;
        break;
      }
      case "multiple_choice": {
        const opts = q.options ?? [];
        const right = opts.filter((o) => o.correct).map((o) => o.id);
        answers[q.id] = good && right.length
          ? right
          : r.sample(opts.map((o) => o.id), r.int(1, Math.max(1, Math.min(2, opts.length))));
        break;
      }
      case "number": {
        const min = q.min ?? 1;
        answers[q.id] = good ? r.int(min, min + 8) : Math.max(0, min - r.int(1, min));
        break;
      }
      case "short_text":
        answers[q.id] = r.pick(["github.com/mi-perfil", "Disponible para incorporación inmediata", "Sí", "Ver CV adjunto"]);
        break;
      case "long_text":
        answers[q.id] = r.pick([
          "Mantendría la calma, escucharía al cliente sin interrumpir, le ofrecería una solución alternativa inmediata y haría seguimiento hasta que todo estuviera resuelto.",
          "Me gusta trabajar en equipos donde se cuida al cliente y se aprende cada día. Creo que encajo por mi experiencia y mis ganas de crecer.",
          "Conseguí cerrar una operación que llevaba meses parada escuchando de verdad lo que necesitaba el cliente y adaptando la propuesta.",
          "Siempre priorizo la comunicación clara y el trabajo bien hecho. Os aporto constancia, responsabilidad y muy buena actitud.",
        ]);
        break;
    }
  }
  return answers;
}

// ───────────────────────── Campaña ─────────────────────────

function makeCampaign(r: Random, seed: JobSeed, now: number): MetaCampaign | null {
  const c = seed.campaign;
  if (!c) return null;
  const days = Math.max(1, seed.daysAgo - (c.status === "ended" ? 30 : 0));
  const runDays = c.status === "paused" ? Math.round(days * 0.6) : days;
  const impressions = c.leads * r.int(170, 260);
  return {
    id: `cmp_${seed.id}`,
    name: c.name,
    status: c.status,
    objective: "lead_generation",
    dailyBudget: c.dailyBudget,
    // Si la campaña trae métricas reales, se respetan tal cual
    spend: c.spend ?? Math.round(c.dailyBudget * runDays * (0.86 + r.next() * 0.12) * 100) / 100,
    impressions: c.impressions ?? impressions,
    reach: c.reach ?? Math.round(impressions * (0.62 + r.next() * 0.1)),
    clicks: c.clicks ?? Math.round(c.leads * (2.6 + r.next() * 1.4)),
    leads: c.leads,
    audience: c.audience,
    placements: ["facebook", "instagram"],
    primaryText: c.primaryText,
    creatives: c.creatives.map((cr, i) => ({ id: `crv_${seed.id}_${i}`, ...cr })),
    startedAt: iso(now - seed.daysAgo * DAY),
  };
}

// ───────────────────────── Estado de candidatura según antigüedad ─────────────────────────

function pickStatus(r: Random, ageDays: number, knockoutFailed: boolean, score: number | null, jobClosed: boolean): ApplicationStatus {
  if (jobClosed) return "rejected";
  if (knockoutFailed) return ageDays > 1 ? "rejected" : r.pick<ApplicationStatus>(["new", "rejected"]);
  const good = (score ?? 70) >= 60;
  if (ageDays < 1) return "new";
  if (ageDays < 3) return r.pick<ApplicationStatus>(good ? ["new", "reviewing", "reviewing", "shortlisted"] : ["new", "reviewing", "rejected"]);
  if (ageDays < 8)
    return r.pick<ApplicationStatus>(good ? ["reviewing", "shortlisted", "shortlisted", "interview"] : ["reviewing", "rejected", "rejected"]);
  return r.pick<ApplicationStatus>(good ? ["shortlisted", "interview", "interview", "offer", "hired"] : ["rejected", "rejected", "reviewing"]);
}

// ───────────────────────── Generador principal ─────────────────────────

export function createDemoData(now = Date.now()): DemoData {
  const r = createRandom(20251007);

  const companies: Company[] = COMPANY_SEEDS.map(({ daysAgo, ...c }) => ({
    ...c,
    ...(COMPANY_ACCOUNTS[c.id] ?? { plan: "basic", accountStatus: "active" }),
    createdAt: iso(now - daysAgo * DAY),
  }));

  const jobs: Job[] = [];
  const leads: Lead[] = [];
  const applications: Application[] = [];
  const emails: EmailMessage[] = [];

  for (const seed of JOB_SEEDS) {
    const { daysAgo, profile, campaign: _c, ...rest } = seed;
    const createdAt = now - (daysAgo + 1) * DAY;
    const job: Job = {
      ...rest,
      campaign: makeCampaign(r, seed, now),
      views: 0,
      publishedAt: seed.status === "draft" ? null : iso(now - daysAgo * DAY),
      createdAt: iso(createdAt),
      updatedAt: iso(now - r.int(1, Math.max(1, daysAgo)) * HOUR),
    };
    jobs.push(job);

    if (!job.campaign) continue;

    const windowDays = Math.max(1, seed.campaign?.runDays ?? (job.campaign.status === "ended" ? daysAgo - 30 : daysAgo));
    const windowStart = now - daysAgo * DAY;
    let clicked = 0;

    for (let i = 0; i < job.campaign.leads; i++) {
      const p = makePerson(r);
      // Más leads recientes que antiguos (la campaña "aprende")
      const t = windowStart + Math.pow(r.next(), 0.8) * windowDays * DAY;
      const leadAt = Math.min(t, now - r.int(5, 50) * MIN);
      const age = now - leadAt;

      const lead: Lead = {
        id: `lead_${job.id}_${i}`,
        jobId: job.id,
        source: "meta_lead_ad",
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        city: job.city,
        metaAnswers: [
          { question: "¿Cuándo podrías incorporarte?", answer: r.pick(["Inmediata", "En 15 días", "En 1 mes"]) },
          { question: "Ciudad de residencia", answer: r.chance(0.8) ? job.city : r.pick(["Alrededores", "Otra provincia"]) },
        ],
        token: r.hex(20),
        status: "new",
        platform: r.chance(0.58) ? "instagram" : "facebook",
        createdAt: iso(leadAt),
        emailedAt: null,
        openedAt: null,
        clickedAt: null,
        appliedAt: null,
        applicationId: null,
      };

      // Embudo: email automático → abre → clic → aplica
      if (age > 2 * MIN) {
        if (r.chance(0.03)) {
          lead.status = "bounced";
          lead.emailedAt = iso(leadAt + r.int(1, 3) * MIN);
        } else {
          const emailedAt = leadAt + r.int(1, 3) * MIN;
          lead.status = "emailed";
          lead.emailedAt = iso(emailedAt);
          const openedAt = emailedAt + r.int(4, 360) * MIN;
          if (openedAt < now && r.chance(0.8)) {
            lead.status = "opened";
            lead.openedAt = iso(openedAt);
            const clickedAt = openedAt + r.int(1, 8) * MIN;
            if (clickedAt < now && r.chance(0.74)) {
              lead.status = "clicked";
              lead.clickedAt = iso(clickedAt);
              clicked++;
              const appliedAt = clickedAt + r.int(3, 14) * MIN;
              if (appliedAt < now && r.chance(0.76)) {
                lead.status = "applied";
                lead.appliedAt = iso(appliedAt);
                const app = makeApplication(r, job, profile, p, appliedAt, now, lead);
                lead.applicationId = app.id;
                applications.push(app);
              }
            }
          }
        }
        emails.push({
          id: `eml_${lead.id}`,
          leadId: lead.id,
          to: lead.email,
          subject: `${p.firstName}, completa tu candidatura para ${job.title}`,
          template: "apply_invite",
          status:
            lead.status === "bounced"
              ? "bounced"
              : lead.clickedAt
                ? "clicked"
                : lead.openedAt
                  ? "opened"
                  : "delivered",
          sentAt: lead.emailedAt!,
        });
      }
      leads.push(lead);
    }

    // Algunas candidaturas orgánicas (llegan a la web sin anuncio)
    const organic = job.status === "active" ? r.int(1, 3) : 0;
    for (let i = 0; i < organic; i++) {
      const p = makePerson(r);
      const at = now - r.next() * daysAgo * DAY;
      applications.push(makeApplication(r, job, profile, p, at, now, null));
    }

    job.views = clicked + organic * r.int(8, 14) + r.int(20, 80);
  }

  // En el proceso cerrado, una persona contratada
  const closedApps = applications.filter((a) => a.jobId === "job_recepcion_closed" && !a.knockoutFailed);
  if (closedApps[0]) {
    closedApps[0].status = "hired";
    closedApps[0].events.push(evt("status_changed", "Movida a Contratada", closedApps[0].updatedAt));
  }

  const contactRequests: ContactRequest[] = [
    {
      id: "req_1",
      kind: "company",
      name: "Jaime Castells",
      companyName: "Bodegas Castells",
      email: "jaime@bodegascastells.es",
      phone: "+34 677 120 334",
      message: "Necesitamos 12 personas para vendimia y 3 para tienda. ¿Podéis ayudarnos antes de septiembre?",
      hiringVolume: "10-25 personas",
      status: "new",
      createdAt: iso(now - 3 * HOUR),
    },
    {
      id: "req_2",
      kind: "company",
      name: "Laura Méndez",
      companyName: "Clínicas Fisiomove",
      email: "laura@fisiomove.es",
      message: "Abrimos 2 centros nuevos en Madrid y buscamos fisioterapeutas. Me interesa conocer precios.",
      hiringVolume: "5-10 personas",
      status: "contacted",
      createdAt: iso(now - 2 * DAY),
    },
    {
      id: "req_3",
      kind: "company",
      name: "Óscar Villar",
      companyName: "Transportes Villar",
      email: "oscar@tvillar.es",
      phone: "+34 654 908 112",
      message: "Buscamos conductores C+E de forma recurrente. Nos han hablado muy bien de vosotros.",
      hiringVolume: "25+ personas",
      status: "won",
      createdAt: iso(now - 9 * DAY),
    },
    {
      id: "req_4",
      kind: "candidate",
      name: "Clara Sáez",
      email: "clara.saez@gmail.com",
      message: "Soy administrativa con 6 años de experiencia. Me gustaría que tuvierais en cuenta mi perfil para futuras ofertas.",
      status: "new",
      createdAt: iso(now - 20 * HOUR),
    },
    {
      id: "req_5",
      kind: "company",
      name: "Natalia Ruiz",
      companyName: "Coworking Faro",
      email: "natalia@faro.es",
      message: "Solo necesitamos una recepcionista, ¿trabajáis con volúmenes pequeños?",
      hiringVolume: "1-4 personas",
      status: "lost",
      createdAt: iso(now - 15 * DAY),
    },
  ];

  // Campaña propia de captación de empresas (datos reales de Meta Ads Manager)
  const { campaign: agencyCampaign, requests: metaRequests } = makeAgencyCampaign(r, now);

  return {
    companies,
    jobs,
    leads,
    applications: applications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    emails,
    contactRequests: [...contactRequests.map((c) => ({ ...c, source: "web" as const })), ...metaRequests].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    agencyCampaigns: [agencyCampaign],
    users: makeUsers(r, companies, now),
    invoices: makeInvoices(r, companies, jobs, now),
  };
}

const B2B_PREFIXES = ["Talleres", "Hostal", "Restaurante", "Clínica", "Transportes", "Construcciones", "Panadería", "Residencia", "Logística", "Instalaciones", "Grupo", "Supermercados"];
const B2B_NAMES = ["Ebro", "Moncayo", "del Pilar", "Aragonesa", "Delicias", "Las Fuentes", "Torrero", "Almozara", "Cierzo", "Huerva", "Gállego", "Actur", "San José", "Casablanca"];
const B2B_NEEDS = [
  "Necesitamos camareros/as para el fin de semana y no encontramos a nadie.",
  "Buscamos conductores con carnet C para reparto en la provincia.",
  "Queremos contratar 2 auxiliares de enfermería para la residencia.",
  "Abrimos un segundo local y necesitamos personal de cocina y sala.",
  "Nos hacen falta peones y oficiales de primera para varias obras.",
  "Buscamos dependientas para campaña de Navidad.",
  "Necesitamos un electricista con experiencia y un ayudante.",
  "Queremos probar a contratar por redes sociales, ¿cómo funciona?",
  "Llevamos meses buscando un mecánico de automoción.",
  "Buscamos personal de limpieza para oficinas, jornada parcial.",
];

function makeAgencyCampaign(r: Random, now: number) {
  const startedDaysAgo = 20;
  const runDays = 5;
  const campaign: MetaCampaign = {
    id: "cmp_agency_b2b_video",
    name: "Recruitment Lab - Captación Empresas - Vídeo",
    status: "paused",
    objective: "lead_generation",
    dailyBudget: 30,
    spend: 145.13,
    impressions: 15740,
    reach: 11260,
    clicks: 318,
    leads: 40,
    audience: "30-60 años · Aragón · Empresarios, responsables de RRHH y propietarios de pymes",
    placements: ["facebook", "instagram"],
    primaryText: "¿Llevas semanas buscando personal y no aparece nadie? Te llenamos las vacantes con anuncios en Instagram y Facebook. Primeros candidatos en 48 h.",
    creatives: [{ id: "crv_agency_video", kind: "video", headline: "Contrata en días, no en meses", hue: 262 }],
    startedAt: iso(now - startedDaysAgo * DAY),
  };

  const statuses: ContactRequest["status"][] = ["won", "won", "contacted", "contacted", "contacted", "lost", "lost", "new"];
  const requests: ContactRequest[] = Array.from({ length: campaign.leads }, (_, i) => {
    const p = makePerson(r);
    const companyName = `${r.pick(B2B_PREFIXES)} ${r.pick(B2B_NAMES)}`;
    const domain = strip(companyName).replace(/[^a-z]+/g, "");
    return {
      id: `req_meta_${i}`,
      kind: "company",
      name: p.fullName.split(" ").slice(0, 2).join(" "),
      companyName,
      email: `${strip(p.firstName)}@${domain}.es`,
      phone: p.phone,
      message: r.pick(B2B_NEEDS),
      hiringVolume: r.pick(["1-4 personas", "1-4 personas", "5-10 personas", "10-25 personas"]),
      status: r.pick(statuses),
      source: "meta_lead_ad",
      campaignId: campaign.id,
      createdAt: iso(now - startedDaysAgo * DAY + r.next() * runDays * DAY),
    };
  });
  return { campaign, requests };
}

function evt(kind: ApplicationEvent["kind"], label: string, at: string): ApplicationEvent {
  return { id: `evt_${kind}_${at}_${label.length}`, kind, label, at };
}

function makeApplication(
  r: Random,
  job: Job,
  pool: ProfilePool,
  p: Person,
  appliedAt: number,
  now: number,
  lead: Lead | null,
): Application {
  // Calidad de respuestas variada para que las puntuaciones sean realistas
  const quality = 0.35 + r.next() * 0.5;
  const answers = makeAnswers(r, job.questions, quality);
  const { score, knockoutFailed } = scoreApplication(job.questions, answers);
  const ageDays = (now - appliedAt) / DAY;
  const status = pickStatus(r, ageDays, knockoutFailed, score, job.status === "closed");
  const id = `app_${job.id}_${r.hex(6)}`;

  const events: ApplicationEvent[] = [];
  if (lead) {
    events.push(evt("lead_received", `Lead recibido desde ${lead.platform === "instagram" ? "Instagram" : "Facebook"}`, lead.createdAt));
    if (lead.emailedAt) events.push(evt("email_sent", "Email con enlace personalizado enviado", lead.emailedAt));
    if (lead.openedAt) events.push(evt("email_opened", "Email abierto", lead.openedAt));
    if (lead.clickedAt) events.push(evt("link_clicked", "Clic en el enlace de la oferta", lead.clickedAt));
  }
  events.push(evt("applied", "Candidatura completada", iso(appliedAt)));
  const updatedAt = Math.min(now - 10 * MIN, appliedAt + r.next() * Math.max(0, now - appliedAt) * 0.6);
  if (status !== "new") {
    events.push(evt("status_changed", `Movida a ${statusLabel(status)}`, iso(updatedAt)));
  }

  const shared = ["shortlisted", "interview", "offer", "hired"].includes(status);
  if (shared) events.push(evt("shared_with_company", "Preseleccionada para entrevista", iso(updatedAt)));
  const feedback =
    shared && status !== "shortlisted" && r.chance(0.8)
      ? {
          verdict: status === "hired" || status === "offer" || status === "interview" ? ("interested" as const) : r.pick(["interested", "maybe"] as const),
          comment: r.pick([
            "Muy buen perfil, nos encaja la experiencia. Adelante con la entrevista.",
            "Nos gusta, ¿podéis confirmar disponibilidad?",
            "Encaja muy bien con el equipo.",
          ]),
          at: iso(updatedAt + 2 * HOUR),
          by: "Empresa",
        }
      : null;
  if (feedback) events.push(evt("company_feedback", `El responsable marcó: ${feedback.verdict === "interested" ? "Me interesa" : "Quizá"}`, feedback.at));

  const [first, ...lastParts] = p.fullName.split(" ");
  return {
    id,
    jobId: job.id,
    leadId: lead?.id ?? null,
    fullName: p.fullName,
    email: p.email,
    phone: p.phone,
    city: job.city,
    linkedinUrl: r.chance(0.5) ? `linkedin.com/in/${strip(first!)}-${strip(lastParts[0] ?? "")}` : "",
    cv: {
      name: `CV_${first}_${lastParts[0]}.pdf`.normalize("NFD").replace(/[̀-ͯ]/g, ""),
      sizeBytes: r.int(110, 900) * 1024,
      mimeType: "application/pdf",
    },
    profile: makeProfile(r, pool),
    answers,
    score,
    knockoutFailed,
    status,
    rating: status === "hired" || status === "offer" ? 5 : status === "interview" ? 4 : shared ? (r.pick([3, 4]) as 3 | 4) : 0,
    notes:
      shared && r.chance(0.6)
        ? [
            {
              id: `note_${id}`,
              author: "Equipo Recruitment Lab",
              body: r.pick([
                "Llamada de screening OK. Muy comunicativa y con disponibilidad inmediata.",
                "Buen encaje técnico. Pide salario en la parte alta de la banda.",
                "Perfil sólido, recomendado para entrevista.",
              ]),
              at: iso(updatedAt),
            },
          ]
        : [],
    events: events.sort((a, b) => a.at.localeCompare(b.at)),
    companyFeedback: feedback,
    consents: { privacy: true, retention: r.chance(0.7), marketing: r.chance(0.4) },
    source: lead ? "meta_lead_ad" : "organic",
    createdAt: iso(appliedAt),
    updatedAt: iso(updatedAt),
  };
}

function statusLabel(s: ApplicationStatus) {
  return {
    new: "Nueva",
    reviewing: "En revisión",
    shortlisted: "Preseleccionada",
    interview: "Entrevista",
    offer: "Oferta",
    hired: "Contratada",
    rejected: "Descartada",
  }[s];
}

export { JOB_SEEDS };
export const PROFILE_POOLS: Record<string, ProfilePool> = Object.fromEntries(JOB_SEEDS.map((j) => [j.id, j.profile]));
