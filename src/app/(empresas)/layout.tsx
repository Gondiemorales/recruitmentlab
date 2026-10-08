import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { EMPLEO } from "@/lib/routes";

/** Web de EMPRESAS: venta B2B, acceso al panel y al portal de clientes */
export default function EmpresasLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar
        logoHref="/"
        links={[
          { href: "/#como-funciona", label: "Cómo funciona" },
          { href: "/#ventajas", label: "Ventajas" },
          { href: "/#casos", label: "Casos" },
          { href: "/#contacto", label: "Contacto" },
        ]}
        secondary={{ href: "/login", label: "Acceso clientes" }}
        primary={{ href: "/#contacto", label: "Quiero contratar" }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoHref="/"
        description="Reclutamiento con anuncios de Meta para empresas. Captamos, filtramos y te entregamos candidatos cualificados en días."
        columns={[
          {
            title: "Servicio",
            links: [
              { href: "/#como-funciona", label: "Cómo funciona" },
              { href: "/#ventajas", label: "Ventajas" },
              { href: "/#casos", label: "Casos de éxito" },
            ],
          },
          {
            title: "Clientes",
            links: [
              { href: "/login", label: "Acceso clientes" },
              { href: "/#contacto", label: "Solicitar propuesta" },
              { href: "/contacto", label: "Contacto" },
            ],
          },
          {
            title: "Legal",
            links: [
              { href: "/legal/aviso-legal", label: "Aviso legal" },
              { href: "/legal/privacidad", label: "Política de privacidad" },
              { href: "/legal/cookies", label: "Política de cookies" },
            ],
          },
        ]}
        crossLink={{ href: EMPLEO, label: "¿Buscas trabajo? Visita Recruitment Lab Empleo" }}
      />
      <CookieBanner policyHref="/legal/cookies" />
    </>
  );
}
