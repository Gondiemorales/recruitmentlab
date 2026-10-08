import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { EMPLEO, JOBS_URL, SEND_CV_URL, legalUrl } from "@/lib/routes";

export const metadata: Metadata = {
  title: { default: "Recruitment Lab Empleo · Ofertas de trabajo", template: "%s · Recruitment Lab Empleo" },
  description: "Ofertas de empleo en hostelería, logística, salud, retail, energía y tecnología. Aplica en 1 minuto y te respondemos siempre.",
};

/** Web de EMPLEO: para personas que buscan trabajo */
export default function EmpleoLayout({ children }: LayoutProps<"/empleo">) {
  return (
    <>
      <Navbar
        logoHref={EMPLEO}
        logoTag="Empleo"
        links={[
          { href: JOBS_URL, label: "Ofertas" },
          { href: `${EMPLEO}#como-aplicar`, label: "Cómo aplicar" },
          { href: `${EMPLEO}#preguntas`, label: "Preguntas" },
        ]}
        secondary={{ href: SEND_CV_URL, label: "Envíanos tu CV" }}
        primary={{ href: JOBS_URL, label: "Ver ofertas" }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoHref={EMPLEO}
        logoTag="Empleo"
        description="Ofertas de empresas que contratan ya. Sin registros eternos: aplica en un minuto y te contestamos siempre."
        columns={[
          {
            title: "Ofertas",
            links: [
              { href: JOBS_URL, label: "Todas las ofertas" },
              { href: `${JOBS_URL}?sector=Hostelería`, label: "Hostelería" },
              { href: `${JOBS_URL}?sector=Logística`, label: "Logística" },
              { href: `${JOBS_URL}?sector=Tecnología`, label: "Tecnología" },
            ],
          },
          {
            title: "Candidatos",
            links: [
              { href: `${EMPLEO}#como-aplicar`, label: "Cómo aplicar" },
              { href: SEND_CV_URL, label: "Envíanos tu CV" },
              { href: `${EMPLEO}#preguntas`, label: "Preguntas frecuentes" },
            ],
          },
          {
            title: "Legal",
            links: [
              { href: legalUrl("empleo", "privacidad-candidatos"), label: "Privacidad candidatos" },
              { href: legalUrl("empleo", "aviso-legal"), label: "Aviso legal" },
              { href: legalUrl("empleo", "cookies"), label: "Política de cookies" },
            ],
          },
        ]}
        crossLink={{ href: "/", label: "¿Eres empresa? Contrata con Recruitment Lab" }}
      />
      <CookieBanner policyHref={legalUrl("empleo", "cookies")} />
    </>
  );
}
