"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

const STATS = [
  { value: 1240, suffix: "+", label: "Contrataciones cerradas" },
  { value: 86, suffix: "", label: "Empresas cliente" },
  { value: 7, suffix: " días", label: "Media a primera entrevista" },
  { value: 94, suffix: " %", label: "Clientes que repiten" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("es-ES")}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-white sm:px-12">
        <div className="absolute -top-24 -left-24 size-80 rounded-full bg-brand/40 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-80 rounded-full bg-brand-2/30 blur-3xl" />
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl font-semibold tracking-tight">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
