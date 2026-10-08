"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDemo } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useDemo((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);

  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster theme="light" position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
