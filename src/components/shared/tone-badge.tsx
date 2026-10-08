import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/labels";
import {
  APPLICATION_STATUS,
  JOB_STATUS,
  LEAD_STATUS,
} from "@/lib/labels";
import type { ApplicationStatus, JobStatus, LeadStatus } from "@/lib/types";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  muted: "bg-muted text-muted-foreground ring-border",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  brand: "bg-blue-50 text-blue-700 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
};

const DOTS: Record<Tone, string> = {
  neutral: "bg-slate-400",
  muted: "bg-slate-300",
  info: "bg-sky-500",
  brand: "bg-blue-600",
  violet: "bg-violet-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function ToneBadge({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

export function toneDot(tone: Tone) {
  return DOTS[tone];
}

export const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <ToneBadge tone={APPLICATION_STATUS[status].tone}>{APPLICATION_STATUS[status].label}</ToneBadge>
);

export const JobStatusBadge = ({ status }: { status: JobStatus }) => (
  <ToneBadge tone={JOB_STATUS[status].tone}>{JOB_STATUS[status].label}</ToneBadge>
);

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => (
  <ToneBadge tone={LEAD_STATUS[status].tone}>{LEAD_STATUS[status].label}</ToneBadge>
);

export function ScoreBadge({ score, knockout, className }: { score: number | null; knockout?: boolean; className?: string }) {
  if (knockout) {
    return (
      <span className={cn("inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 ring-inset", className)}>
        No cumple
      </span>
    );
  }
  if (score == null) return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  const tone =
    score >= 75
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 50
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <span className={cn("inline-flex min-w-10 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset", tone, className)}>
      {score}
    </span>
  );
}
