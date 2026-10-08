import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL_DOCS } from "@/lib/legal";
import { legalUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Documento legal con índice lateral (lo usan las dos webs) */
export function LegalView({ slug, site }: { slug: string; site: "empresas" | "empleo" }) {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  if (!doc) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-32 pb-24 lg:grid-cols-[220px_1fr]">
      <nav className="space-y-1 lg:sticky lg:top-28 lg:self-start">
        {LEGAL_DOCS.map((d) => (
          <Link
            key={d.slug}
            href={legalUrl(site, d.slug)}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              d.slug === doc.slug ? "bg-primary/8 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {d.title}
          </Link>
        ))}
      </nav>
      <article className="rounded-3xl border bg-white p-8 shadow-soft sm:p-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: {doc.updated}</p>
        <div className="mt-10 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              <div className="mt-2 space-y-2 leading-relaxed text-slate-700">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
