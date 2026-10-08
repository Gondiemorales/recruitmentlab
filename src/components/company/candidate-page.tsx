"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { useScopedData } from "@/lib/workspace";
import { CandidateView } from "@/components/candidates/candidate-view";
import { EmptyState } from "@/components/shared/states";
import { buttonVariants } from "@/components/ui/button";

export function CandidatePage({ id }: { id: string }) {
  const { applications, jobs } = useScopedData();
  const app = applications.find((a) => a.id === id);
  const job = app && jobs.find((j) => j.id === app.jobId);

  if (!app || !job) {
    return (
      <EmptyState
        icon={UserX}
        title="Candidatura no encontrada"
        action={
          <Link href="/portal/candidaturas" className={buttonVariants()}>
            Ver candidaturas
          </Link>
        }
      />
    );
  }
  return <CandidateView app={app} job={job} backHref="/portal/candidaturas" jobHref={`/portal/ofertas/${job.id}`} />;
}
