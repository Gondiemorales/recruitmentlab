"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileCheck2, Mail, MessageSquareQuote, MousePointerClick } from "lucide-react";
import { useScopedData } from "@/lib/workspace";
import { timeAgo } from "@/lib/format";
import { MetaIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

type Item = { id: string; at: string; icon: React.ComponentType<{ className?: string }>; tone: string; text: React.ReactNode; href?: string };

/** Feed combinado de leads, clics, candidaturas y feedback de empresas */
export function ActivityFeed({ limit = 8, jobId }: { limit?: number; jobId?: string }) {
  const { leads, applications, jobs } = useScopedData();

  const items = useMemo(() => {
    const jobTitle = (id: string) => jobs.find((j) => j.id === id)?.title ?? "";
    const out: Item[] = [];
    for (const l of leads) {
      if (jobId && l.jobId !== jobId) continue;
      out.push({
        id: `l-${l.id}`,
        at: l.createdAt,
        icon: MetaIcon,
        tone: "bg-blue-50 text-meta",
        text: (
          <>
            <b className="font-semibold">{l.fullName}</b> dejó sus datos en un anuncio de <b className="font-semibold">{jobTitle(l.jobId)}</b>
          </>
        ),
        href: "/portal/leads",
      });
      if (l.clickedAt && !l.appliedAt)
        out.push({
          id: `c-${l.id}`,
          at: l.clickedAt,
          icon: MousePointerClick,
          tone: "bg-amber-50 text-amber-600",
          text: (
            <>
              <b className="font-semibold">{l.fullName}</b> abrió el enlace del email
            </>
          ),
        });
      else if (l.openedAt && !l.clickedAt)
        out.push({
          id: `o-${l.id}`,
          at: l.openedAt,
          icon: Mail,
          tone: "bg-violet-50 text-violet-600",
          text: (
            <>
              <b className="font-semibold">{l.fullName}</b> abrió el email
            </>
          ),
        });
    }
    for (const a of applications) {
      if (jobId && a.jobId !== jobId) continue;
      out.push({
        id: `a-${a.id}`,
        at: a.createdAt,
        icon: FileCheck2,
        tone: "bg-emerald-50 text-emerald-600",
        text: (
          <>
            <b className="font-semibold">{a.fullName}</b> completó su candidatura{a.score != null ? ` · ${a.score} pts` : ""}
          </>
        ),
        href: `/portal/candidaturas/${a.id}`,
      });
      if (a.companyFeedback)
        out.push({
          id: `f-${a.id}`,
          at: a.companyFeedback.at,
          icon: MessageSquareQuote,
          tone: "bg-sky-50 text-sky-600",
          text: (
            <>
              El responsable valoró a <b className="font-semibold">{a.fullName}</b>
            </>
          ),
          href: `/portal/candidaturas/${a.id}`,
        });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  }, [leads, applications, jobs, limit, jobId]);

  return (
    <ul className="divide-y">
      {items.map((i) => {
        const body = (
          <div className="flex gap-3 px-5 py-3">
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", i.tone)}>
              <i.icon className="size-3.5" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="leading-snug text-slate-700">{i.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(i.at)}</p>
            </div>
          </div>
        );
        return (
          <li key={i.id}>
            {i.href ? (
              <Link href={i.href} className="block transition-colors hover:bg-muted/40">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
