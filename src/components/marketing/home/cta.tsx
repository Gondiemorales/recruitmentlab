import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "../section";

export function Cta({
  title = "¿Tienes vacantes que no consigues cubrir?",
  description = "Cuéntanos qué perfil buscas y en 48 horas tendrás tu campaña en marcha. Sin permanencia.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="px-3 py-24 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-blue-600 to-brand-2 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold text-balance sm:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-white/80">{description}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/#contacto" className={cn(buttonVariants({ size: "xl", variant: "secondary" }), "bg-white text-primary hover:bg-white/90")}>
                <CalendarCheck data-icon="inline-start" />
                Solicitar propuesta
              </Link>
              <Link
                href="/#como-funciona"
                className={cn(buttonVariants({ size: "xl", variant: "outline" }), "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white")}
              >
                Cómo funciona
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
