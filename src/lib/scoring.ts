import type { AnswerValue, JobQuestion } from "./types";

export type QuestionResult = {
  questionId: string;
  scored: boolean;
  earned: number;
  possible: number;
  knockoutFailed: boolean;
};

export function isScorable(q: JobQuestion) {
  return (q.points ?? 0) > 0 && (q.type === "single_choice" || q.type === "multiple_choice" || q.type === "yes_no" || q.type === "number");
}

export function evaluateQuestion(q: JobQuestion, value: AnswerValue): QuestionResult {
  const possible = isScorable(q) ? q.points ?? 0 : 0;
  let correct: boolean | null = null;

  switch (q.type) {
    case "yes_no":
      if (q.expectedYes !== undefined && typeof value === "boolean") correct = value === q.expectedYes;
      break;
    case "single_choice": {
      const right = q.options?.filter((o) => o.correct).map((o) => o.id) ?? [];
      if (right.length && typeof value === "string") correct = right.includes(value);
      break;
    }
    case "multiple_choice": {
      const right = new Set(q.options?.filter((o) => o.correct).map((o) => o.id) ?? []);
      if (right.size && Array.isArray(value)) {
        correct = value.length === right.size && value.every((v) => right.has(v));
      }
      break;
    }
    case "number":
      if (q.min !== undefined && typeof value === "number") correct = value >= q.min;
      break;
  }

  return {
    questionId: q.id,
    scored: possible > 0,
    earned: correct ? possible : 0,
    possible,
    knockoutFailed: Boolean(q.knockout && correct === false),
  };
}

/** Puntuación 0-100 sobre preguntas puntuables y si falla algún requisito eliminatorio */
export function scoreApplication(questions: JobQuestion[], answers: Record<string, AnswerValue>) {
  const results = questions.map((q) => evaluateQuestion(q, answers[q.id] ?? null));
  const possible = results.reduce((s, r) => s + r.possible, 0);
  const earned = results.reduce((s, r) => s + r.earned, 0);
  return {
    score: possible > 0 ? Math.round((earned / possible) * 100) : null,
    knockoutFailed: results.some((r) => r.knockoutFailed),
    results,
  };
}

export function isAnswered(q: JobQuestion, value: AnswerValue | undefined) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return true;
}

export function formatAnswer(q: JobQuestion, value: AnswerValue | undefined): string {
  if (value === undefined || value === null || value === "") return "Sin respuesta";
  switch (q.type) {
    case "yes_no":
      return value ? "Sí" : "No";
    case "single_choice":
      return q.options?.find((o) => o.id === value)?.label ?? String(value);
    case "multiple_choice":
      return (value as string[])
        .map((v) => q.options?.find((o) => o.id === v)?.label ?? v)
        .join(", ");
    default:
      return String(value);
  }
}
