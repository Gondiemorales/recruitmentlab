import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, Logo } from "@/components/shared/brand";
import type { NavLink } from "./navbar";

export type FooterColumn = { title: string; links: NavLink[] };

/** Pie de página reutilizado por las dos webs */
export function Footer({
  logoHref,
  logoTag,
  description,
  columns,
  crossLink,
}: {
  logoHref: string;
  logoTag?: string;
  description: string;
  columns: FooterColumn[];
  /** Enlace discreto a la otra web */
  crossLink?: NavLink;
}) {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo href={logoHref} tag={logoTag} />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
          <div className="flex gap-2 text-muted-foreground">
            {[LinkedinIcon, InstagramIcon, FacebookIcon].map((Icon, i) => (
              <span key={i} className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:text-primary">
                <Icon />
              </span>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Recruitment Lab. Todos los derechos reservados.</p>
          {crossLink && (
            <Link href={crossLink.href} className="inline-flex items-center gap-1 font-medium transition-colors hover:text-primary">
              {crossLink.label} <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
