"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "rl-cookies";

function readDecision() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

export function CookieBanner({ policyHref }: { policyHref: string }) {
  // En servidor asumimos "ya decidido" para no pintar el banner antes de hidratar
  const decidedBefore = useSyncExternalStore(noopSubscribe, readDecision, () => true);
  const [dismissed, setDismissed] = useState(false);
  const visible = !decidedBefore && !dismissed;

  const decide = (value: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ delay: 1.2 }}
          className="glass shadow-soft fixed inset-x-3 bottom-3 z-50 rounded-2xl p-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
        >
          <div className="flex gap-3">
            <Cookie className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Usamos cookies propias para que la web funcione y, con tu permiso, analíticas para mejorarla.{" "}
                <Link href={policyHref} className="font-medium text-foreground underline underline-offset-2">
                  Más info
                </Link>
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide("all")}>
                  Aceptar todas
                </Button>
                <Button size="sm" variant="outline" onClick={() => decide("essential")}>
                  Solo necesarias
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
