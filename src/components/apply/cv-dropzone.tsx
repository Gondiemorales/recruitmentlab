"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_MB = 10;
const ACCEPT = ".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg";

export type SelectedCv = { file: File; url: string };

/** Subida de CV simulada: valida, muestra progreso y devuelve el fichero (sin enviarlo a ningún servidor) */
export function CvDropzone({
  value,
  onChange,
  error,
}: {
  value: SelectedCv | null;
  onChange: (v: SelectedCv | null) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(value ? 100 : 0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || progress >= 100) return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 9 + Math.random() * 14)), 90);
    return () => clearInterval(t);
  }, [value, progress]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setLocalError(`El archivo supera ${MAX_MB} MB`);
      return;
    }
    setLocalError(null);
    setProgress(0);
    onChange({ file, url: URL.createObjectURL(file) });
  };

  if (value) {
    const done = progress >= 100;
    return (
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white text-primary shadow-soft">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{value.file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(value.file.size)} · {done ? "Subido correctamente" : `Subiendo… ${Math.round(progress)} %`}
            </p>
          </div>
          {done ? (
            <CheckCircle2 className="size-6 text-emerald-600" />
          ) : null}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setProgress(0);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white hover:text-foreground"
            aria-label="Quitar archivo"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2" animate={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "hover:border-primary/40 hover:bg-secondary/40",
          (error || localError) && "border-destructive/50",
        )}
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-glow">
          <UploadCloud className="size-6" />
        </div>
        <p className="font-semibold">Arrastra tu CV aquí o haz clic para elegirlo</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, Word o imagen · Máx. {MAX_MB} MB</p>
      </button>
      <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {(error || localError) && <p className="mt-2 text-sm text-destructive">{localError ?? error}</p>}
    </div>
  );
}
