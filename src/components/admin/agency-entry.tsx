"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { AGENCY_SESSION } from "@/lib/auth";
import { LogoMark } from "@/components/shared/brand";

/** Inicia la sesión de agencia y entra directamente al panel */
export function AgencyEntry() {
  const router = useRouter();
  const hydrated = useDemo((s) => s.hydrated);
  const login = useDemo((s) => s.login);
  const resetDemo = useDemo((s) => s.resetDemo);

  useEffect(() => {
    if (!hydrated) return;
    // /agencia?reset=1 restaura los datos iniciales (útil antes de una presentación)
    if (new URLSearchParams(window.location.search).get("reset") === "1") resetDemo();
    login(AGENCY_SESSION);
    router.replace("/admin");
  }, [hydrated, login, resetDemo, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <LogoMark className="size-12" />
      <p className="flex items-center gap-2 text-sm text-white/70">
        <Loader2 className="size-4 animate-spin" /> Accediendo al panel de Recruitment Lab…
      </p>
    </div>
  );
}
