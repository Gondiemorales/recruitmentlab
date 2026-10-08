import Link from "next/link";
import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/shared/brand";
import { EMPLOYMENT_TYPE_LABEL, WORK_MODE_LABEL } from "@/lib/labels";
import { formatSalary, isNew, timeAgo } from "@/lib/format";
import type { Company, Job } from "@/lib/types";
import { jobUrl } from "@/lib/routes";

export function JobCard({ job, company }: { job: Job; company?: Company }) {
  const salary = formatSalary(job);
  return (
    <Link
      href={jobUrl(job.slug)}
      className="group relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-glow"
    >
      <div className="flex items-start gap-4">
        {company && <CompanyLogo name={company.name} hue={company.hue} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{company?.name}</p>
          <h3 className="mt-0.5 text-lg leading-snug font-semibold transition-colors group-hover:text-primary">{job.title}</h3>
        </div>
        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{job.summary}</p>

      <div className="mt-5 mb-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 text-primary/70" />
          {job.city}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="size-4 text-primary/70" />
          {WORK_MODE_LABEL[job.workMode]} · {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
        {salary ? <span className="text-sm font-semibold">{salary}</span> : <span />}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {isNew(job.publishedAt) && (
            <span className="mr-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset">Nueva</span>
          )}
          <Clock className="size-3.5" />
          {timeAgo(job.publishedAt)}
        </span>
      </div>
    </Link>
  );
}
