"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useScopedData } from "@/lib/workspace";
import { EmptyState } from "@/components/shared/states";
import { buttonVariants } from "@/components/ui/button";
import { JobEditor } from "./job-editor";

export function NewJob() {
  return <JobEditor />;
}

export function EditJob({ id }: { id: string }) {
  const job = useScopedData().jobs.find((j) => j.id === id);
  if (!job) return <JobNotFound />;
  return <JobEditor key={job.id} job={job} />;
}

export function JobNotFound() {
  return (
    <EmptyState
      icon={Briefcase}
      title="Oferta no encontrada"
      description="Puede que se haya eliminado."
      action={
        <Link href="/portal/ofertas" className={buttonVariants()}>
          Volver a ofertas
        </Link>
      }
    />
  );
}
