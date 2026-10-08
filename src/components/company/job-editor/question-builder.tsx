"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignLeft,
  CheckSquare,
  ChevronDown,
  CircleDot,
  GripVertical,
  Hash,
  ListPlus,
  Plus,
  ShieldAlert,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { JobQuestion, QuestionType } from "@/lib/types";
import { QUESTION_TYPE } from "@/lib/labels";
import { isScorable } from "@/lib/scoring";
import { uid } from "@/lib/id";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SimpleSelect } from "@/components/app/simple-select";
import { cn } from "@/lib/utils";

export const QUESTION_ICON: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  short_text: Type,
  long_text: AlignLeft,
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  yes_no: ToggleLeft,
  number: Hash,
};

function blank(type: QuestionType): JobQuestion {
  const base: JobQuestion = { id: uid("q"), type, label: "", required: true };
  if (type === "single_choice" || type === "multiple_choice")
    return {
      ...base,
      options: [
        { id: uid("o"), label: "Opción 1" },
        { id: uid("o"), label: "Opción 2" },
      ],
    };
  if (type === "yes_no") return { ...base, expectedYes: true };
  return base;
}

const TEMPLATES: { label: string; make: () => JobQuestion }[] = [
  {
    label: "Disponibilidad para turnos",
    make: () => ({ id: uid("q"), type: "yes_no", label: "¿Tienes disponibilidad para turnos rotativos?", required: true, expectedYes: true, knockout: true, points: 20 }),
  },
  {
    label: "Carnet de conducir y vehículo",
    make: () => ({ id: uid("q"), type: "yes_no", label: "¿Tienes carnet B y vehículo propio?", required: true, expectedYes: true, knockout: true, points: 20 }),
  },
  {
    label: "Años de experiencia",
    make: () => ({ id: uid("q"), type: "number", label: "¿Cuántos años de experiencia tienes en un puesto similar?", required: true, min: 1, points: 20 }),
  },
  {
    label: "Nivel de inglés",
    make: () => ({
      id: uid("q"),
      type: "single_choice",
      label: "¿Cuál es tu nivel de inglés?",
      required: true,
      points: 20,
      options: [
        { id: uid("o"), label: "Básico (A1-A2)" },
        { id: uid("o"), label: "Intermedio (B1)" },
        { id: uid("o"), label: "Avanzado (B2)", correct: true },
        { id: uid("o"), label: "Nativo / C1-C2", correct: true },
      ],
    }),
  },
  {
    label: "Incorporación",
    make: () => ({
      id: uid("q"),
      type: "single_choice",
      label: "¿Cuándo podrías incorporarte?",
      required: true,
      options: [
        { id: uid("o"), label: "Inmediatamente" },
        { id: uid("o"), label: "En 15 días" },
        { id: uid("o"), label: "En 1 mes o más" },
      ],
    }),
  },
];

export function QuestionBuilder({ questions, onChange }: { questions: JobQuestion[]; onChange: (q: JobQuestion[]) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const add = (q: JobQuestion) => {
    onChange([...questions, q]);
    setOpenId(q.id);
  };
  const update = (id: string, patch: Partial<JobQuestion>) => onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id: string) => onChange(questions.filter((q) => q.id !== id));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = questions.findIndex((q) => q.id === active.id);
    const to = questions.findIndex((q) => q.id === over.id);
    onChange(arrayMove(questions, from, to));
  };

  const maxPoints = questions.reduce((s, q) => s + (isScorable(q) ? (q.points ?? 0) : 0), 0);
  const knockouts = questions.filter((q) => q.knockout).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{questions.length} preguntas</span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{maxPoints} puntos de test</span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{knockouts} eliminatorias</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <SortableQuestion
                key={q.id}
                index={i}
                question={q}
                open={openId === q.id}
                onToggle={() => setOpenId(openId === q.id ? null : q.id)}
                onChange={(patch) => update(q.id, patch)}
                onRemove={() => remove(q.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Sin preguntas: el candidato solo tendrá que adjuntar su CV.
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <Plus data-icon="inline-start" /> Añadir pregunta
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tipo de pregunta</DropdownMenuLabel>
              {(Object.keys(QUESTION_TYPE) as QuestionType[]).map((t) => {
                const Icon = QUESTION_ICON[t];
                return (
                  <DropdownMenuItem key={t} onClick={() => add(blank(t))}>
                    <Icon /> {QUESTION_TYPE[t].label}
                    <span className="ml-auto text-xs text-muted-foreground">{QUESTION_TYPE[t].hint}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <ListPlus data-icon="inline-start" /> Plantillas
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Preguntas frecuentes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TEMPLATES.map((t) => (
                <DropdownMenuItem key={t.label} onClick={() => add(t.make())}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SortableQuestion({
  question: q,
  index,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  question: JobQuestion;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<JobQuestion>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const Icon = QUESTION_ICON[q.type];
  const scorable = isScorable({ ...q, points: 1 });
  const hasOptions = q.type === "single_choice" || q.type === "multiple_choice";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-xl border bg-white transition-shadow", isDragging && "z-10 shadow-glow", open && "ring-1 ring-primary/20")}
    >
      <div className="flex items-center gap-2 p-2.5">
        <button type="button" className="flex size-7 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing" {...attributes} {...listeners} aria-label="Reordenar">
          <GripVertical className="size-4" />
        </button>
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/8 text-primary">
          <Icon className="size-3.5" />
        </span>
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
          <span className={cn("truncate text-sm font-medium", !q.label && "text-muted-foreground italic")}>{q.label || "Pregunta sin título"}</span>
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {q.required && <MiniBadge>Obligatoria</MiniBadge>}
          {q.knockout && (
            <MiniBadge className="bg-rose-50 text-rose-700">
              <ShieldAlert className="size-3" /> Eliminatoria
            </MiniBadge>
          )}
          {!!q.points && scorable && <MiniBadge className="bg-emerald-50 text-emerald-700">{q.points} pts</MiniBadge>}
        </div>
        <button type="button" onClick={onToggle} className="flex size-7 items-center justify-center rounded-md hover:bg-muted" aria-label="Editar">
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
        <button type="button" onClick={onRemove} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t bg-muted/20 p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div className="space-y-1.5">
              <Label>Pregunta</Label>
              <Input autoFocus value={q.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="¿Tienes disponibilidad para…?" className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <SimpleSelect<QuestionType>
                value={q.type}
                onChange={(type) => onChange({ ...blank(type), id: q.id, label: q.label, required: q.required })}
                options={(Object.keys(QUESTION_TYPE) as QuestionType[]).map((t) => ({ value: t, label: QUESTION_TYPE[t].label }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Texto de ayuda (opcional)</Label>
            <Input value={q.helpText ?? ""} onChange={(e) => onChange({ helpText: e.target.value || undefined })} placeholder="Aclaración para el candidato" className="bg-white" />
          </div>

          {hasOptions && (
            <div className="space-y-2">
              <Label>Opciones {scorable && <span className="font-normal text-muted-foreground">· marca las correctas para puntuar</span>}</Label>
              {q.options?.map((o, oi) => (
                <div key={o.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ options: q.options!.map((x) => (x.id === o.id ? { ...x, correct: !x.correct } : x)) })}
                    className={cn(
                      "flex h-9 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                      o.correct ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "bg-white text-muted-foreground hover:border-emerald-200",
                    )}
                  >
                    {o.correct ? "Correcta" : "Marcar"}
                  </button>
                  <Input
                    value={o.label}
                    onChange={(e) => onChange({ options: q.options!.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)) })}
                    className="bg-white"
                    placeholder={`Opción ${oi + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ options: q.options!.filter((x) => x.id !== o.id) })}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-white hover:text-foreground"
                    aria-label="Quitar opción"
                    disabled={(q.options?.length ?? 0) <= 2}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ options: [...(q.options ?? []), { id: uid("o"), label: `Opción ${(q.options?.length ?? 0) + 1}` }] })}
              >
                <Plus data-icon="inline-start" /> Añadir opción
              </Button>
            </div>
          )}

          {q.type === "yes_no" && (
            <div className="space-y-1.5 sm:w-60">
              <Label>Respuesta esperada</Label>
              <SimpleSelect<"yes" | "no" | "any">
                value={q.expectedYes === undefined ? "any" : q.expectedYes ? "yes" : "no"}
                onChange={(v) => onChange({ expectedYes: v === "any" ? undefined : v === "yes" })}
                options={[
                  { value: "yes", label: "Sí" },
                  { value: "no", label: "No" },
                  { value: "any", label: "Cualquiera (informativa)" },
                ]}
              />
            </div>
          )}

          {q.type === "number" && (
            <div className="space-y-1.5 sm:w-60">
              <Label>Valor mínimo esperado</Label>
              <Input
                type="number"
                min={0}
                value={q.min ?? ""}
                onChange={(e) => onChange({ min: e.target.value === "" ? undefined : Number(e.target.value) })}
                placeholder="Ej.: 2"
                className="bg-white"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={q.required} onCheckedChange={(v) => onChange({ required: v })} /> Obligatoria
            </label>
            {scorable && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={!!q.knockout} onCheckedChange={(v) => onChange({ knockout: v })} />
                  Eliminatoria
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Puntos
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={q.points ?? 0}
                    onChange={(e) => onChange({ points: Math.max(0, Number(e.target.value) || 0) })}
                    className="h-8 w-20 bg-white"
                  />
                </label>
              </>
            )}
          </div>
          {q.knockout && (
            <p className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
              <ShieldAlert className="mt-px size-3.5 shrink-0" />
              Si el candidato no da la respuesta esperada, su candidatura se marcará como «No cumple requisitos».
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MiniBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground", className)}>{children}</span>;
}
