// URLs de las dos webs. La web de empleo vive bajo /empleo (en producción
// puede servirse en su propio dominio, p. ej. empleo.recruitmentlab.es).

export const EMPLEO = "/empleo";
export const JOBS_URL = `${EMPLEO}/ofertas`;
export const SEND_CV_URL = `${EMPLEO}/envia-tu-cv`;

export const jobUrl = (slug: string) => `${JOBS_URL}/${slug}`;
export const applyUrl = (slug: string, token?: string) => `${jobUrl(slug)}/aplicar${token ? `?t=${token}` : ""}`;
export const jobsSearchUrl = (params: { q?: string; sector?: string }) => {
  const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  const qs = sp.toString();
  return qs ? `${JOBS_URL}?${qs}` : JOBS_URL;
};

export const legalUrl = (site: "empresas" | "empleo", doc: string) => (site === "empleo" ? `${EMPLEO}/legal/${doc}` : `/legal/${doc}`);
