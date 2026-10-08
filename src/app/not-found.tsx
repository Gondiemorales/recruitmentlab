import Link from "next/link";
import { LogoMark } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";
import { JOBS_URL } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-grid px-6 text-center">
      <LogoMark className="size-12" />
      <p className="mt-8 font-display text-7xl font-semibold text-gradient">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Esta página se ha perdido en el laboratorio</h1>
      <p className="mt-2 text-muted-foreground">Puede que el enlace haya cambiado o que la oferta ya no esté activa.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Soy empresa
        </Link>
        <Link href={JOBS_URL} className={buttonVariants({ size: "lg", variant: "outline" })}>
          Busco trabajo
        </Link>
      </div>
    </div>
  );
}
