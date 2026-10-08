"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { AnswerValue, JobQuestion } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Renderiza el control adecuado para cada tipo de pregunta (candidatura y vista previa del admin) */
export function QuestionField({
  question: q,
  value,
  onChange,
  autoFocus,
}: {
  question: JobQuestion;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  autoFocus?: boolean;
}) {
  switch (q.type) {
    case "short_text":
      return (
        <Input
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta"
          className="h-12 rounded-xl bg-white text-base"
        />
      );
    case "long_text":
      return (
        <Textarea
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="min-h-36 rounded-xl bg-white text-base"
        />
      );
    case "number": {
      const n = typeof value === "number" ? value : null;
      return (
        <div className="flex items-center gap-3">
          <StepperButton onClick={() => onChange(Math.max(0, (n ?? 0) - 1))} aria-label="Restar">
            <Minus className="size-4" />
          </StepperButton>
          <Input
            autoFocus={autoFocus}
            type="number"
            min={0}
            inputMode="numeric"
            value={n ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className="h-14 w-28 rounded-xl bg-white text-center font-display text-2xl font-semibold"
          />
          <StepperButton onClick={() => onChange((n ?? 0) + 1)} aria-label="Sumar">
            <Plus className="size-4" />
          </StepperButton>
        </div>
      );
    }
    case "yes_no":
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: "Sí" },
            { v: false, label: "No" },
          ].map((o, i) => (
            <OptionButton key={o.label} selected={value === o.v} onClick={() => onChange(o.v)} shortcut={i === 0 ? "S" : "N"}>
              {o.label}
            </OptionButton>
          ))}
        </div>
      );
    case "single_choice":
      return (
        <div className="grid gap-2.5">
          {q.options?.map((o, i) => (
            <OptionButton key={o.id} selected={value === o.id} onClick={() => onChange(o.id)} shortcut={String.fromCharCode(65 + i)}>
              {o.label}
            </OptionButton>
          ))}
        </div>
      );
    case "multiple_choice": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-2.5">
          {q.options?.map((o, i) => (
            <OptionButton
              key={o.id}
              multi
              selected={selected.includes(o.id)}
              onClick={() => onChange(selected.includes(o.id) ? selected.filter((v) => v !== o.id) : [...selected, o.id])}
              shortcut={String.fromCharCode(65 + i)}
            >
              {o.label}
            </OptionButton>
          ))}
          <p className="text-xs text-muted-foreground">Puedes elegir varias opciones</p>
        </div>
      );
    }
  }
}

function OptionButton({
  selected,
  multi,
  shortcut,
  onClick,
  children,
}: {
  selected: boolean;
  multi?: boolean;
  shortcut: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-13 w-full items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left text-[15px] font-medium transition-all",
        selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center border text-[11px] font-semibold transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-primary bg-primary text-white" : "border-border text-muted-foreground group-hover:border-primary/40",
        )}
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : shortcut}
      </span>
      {children}
    </button>
  );
}

function StepperButton(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="flex size-12 items-center justify-center rounded-xl border-2 bg-white transition-colors hover:border-primary/40"
      {...props}
    />
  );
}
