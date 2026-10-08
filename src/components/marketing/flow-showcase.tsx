"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, Mail, MessageCircle, MousePointerClick, Send, Sparkles } from "lucide-react";
import { InstagramIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

const STEPS = 4;
const STEP_MS = 2200;

/** Visual del hero: anuncio de Meta → lead → email → candidatura filtrada (en bucle) */
export function FlowShowcase({ className }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (STEPS + 1)), STEP_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={cn("relative mx-auto h-[540px] w-full max-w-[520px]", className)}>
      {/* Halo */}
      <div className="absolute inset-10 rounded-full bg-gradient-to-br from-brand/25 to-brand-2/25 blur-3xl" />

      {/* Teléfono con el anuncio */}
      <div className="absolute top-6 left-1/2 w-[250px] -translate-x-[78%] rotate-[-4deg] sm:-translate-x-[85%]">
        <div className="rounded-[2.2rem] border-[7px] border-slate-900 bg-white shadow-2xl shadow-slate-900/20">
          <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-slate-900" />
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-[2px]">
              <div className="flex size-full items-center justify-center rounded-full bg-white text-[8px] font-bold">GV</div>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold">grupovela.hoteles</p>
              <p className="text-[9px] text-muted-foreground">Publicidad</p>
            </div>
            <InstagramIcon className="ml-auto size-3.5 text-muted-foreground" />
          </div>
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-200/70 to-transparent" />
            <div className="absolute inset-x-4 top-5 text-white">
              <p className="text-[10px] font-semibold tracking-widest uppercase opacity-80">Marbella · Hotel 4*</p>
              <p className="mt-1 font-display text-xl leading-tight font-bold">Trabaja frente al mar 🌊</p>
              <p className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                Contrato indefinido · 1.850 €
              </p>
            </div>
          </div>
          <motion.div
            animate={step === 0 ? { scale: [1, 0.96, 1] } : {}}
            transition={{ duration: 0.5, delay: 1 }}
            className="mx-3 mt-2 flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-white"
          >
            Solicitar información
            <MousePointerClick className="size-3.5" />
          </motion.div>
          <div className="flex gap-3 px-3 py-2.5 text-slate-700">
            <Heart className="size-4" />
            <MessageCircle className="size-4" />
            <Send className="size-4" />
          </div>
          <div className="pb-5" />
        </div>
      </div>

      {/* Tarjetas flotantes del flujo */}
      <FlowCard visible={step >= 1} className="top-10 right-0 sm:-right-2" active={step === 1}>
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
            LM
            <span className="absolute -top-0.5 -right-0.5 flex size-3">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-400" />
              <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold">Nuevo lead de Instagram</p>
            <p className="text-[11px] text-muted-foreground">Lucía Martín · hace 2 s</p>
          </div>
        </div>
      </FlowCard>

      <FlowCard visible={step >= 2} className="top-[160px] right-2 sm:-right-6" active={step === 2}>
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="size-4" />
          </div>
          <div className="w-44">
            <p className="text-xs font-semibold">Lucía, completa tu candidatura</p>
            <p className="text-[11px] text-muted-foreground">Enviado automáticamente · 1 min</p>
            <div className="mt-2 rounded-md bg-primary px-2 py-1 text-center text-[10px] font-semibold text-white">Completar en 1 minuto →</div>
          </div>
        </div>
      </FlowCard>

      <FlowCard visible={step >= 3} className="bottom-24 left-0 sm:-left-4" active={step === 3}>
        <p className="mb-2 text-xs font-semibold">Candidatura · datos autorrellenados</p>
        <ul className="space-y-1.5 text-[11px]">
          {["Nombre y email ✓", "CV adjunto ✓", "Inglés B2 o superior", "Turnos rotativos"].map((t, i) => (
            <li key={t} className="flex items-center gap-2">
              <span className={cn("flex size-4 items-center justify-center rounded-full", i < 2 ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-600")}>
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </FlowCard>

      <FlowCard visible={step >= 4} className="right-4 bottom-4 sm:right-0" active={step === 4}>
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.94 0.02 155)" strokeWidth="4" />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="oklch(0.64 0.15 155)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="94.2"
                initial={{ strokeDashoffset: 94.2 }}
                animate={{ strokeDashoffset: step >= 4 ? 94.2 * 0.08 : 94.2 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </svg>
            <span className="text-sm font-bold text-emerald-700">92</span>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold">
              <Sparkles className="size-3 text-violet-500" /> Preseleccionada
            </p>
            <p className="text-[11px] text-muted-foreground">Cumple todos los requisitos</p>
          </div>
        </div>
      </FlowCard>
    </div>
  );
}

function FlowCard({
  visible,
  active,
  className,
  children,
}: {
  visible: boolean;
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={cn(
            "absolute z-10 rounded-2xl border bg-white/95 p-3.5 shadow-xl shadow-slate-900/8 backdrop-blur transition-[box-shadow,border-color] duration-500",
            active && "border-primary/30 shadow-glow",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
