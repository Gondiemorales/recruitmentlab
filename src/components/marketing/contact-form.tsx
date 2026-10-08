"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useDemo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { legalUrl } from "@/lib/routes";

const VOLUMES = ["1-4 personas", "5-10 personas", "10-25 personas", "25+ personas"];

const companySchema = z.object({
  name: z.string().trim().min(2, "¿Cómo te llamas?"),
  companyName: z.string().trim().min(2, "Nombre de la empresa"),
  email: z.string().trim().email("Email no válido"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)"),
});

const candidateSchema = z.object({
  name: z.string().trim().min(2, "¿Cómo te llamas?"),
  email: z.string().trim().email("Email no válido"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10, "Cuéntanos un poco sobre ti"),
});

type Values = { name: string; companyName: string; email: string; phone: string; message: string };

export function ContactForm({ kind = "company" }: { kind?: "company" | "candidate" }) {
  const submitContactRequest = useDemo((s) => s.submitContactRequest);
  const [values, setValues] = useState<Values>({ name: "", companyName: "", email: "", phone: "", message: "" });
  const [volume, setVolume] = useState(VOLUMES[1]!);
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Values | "privacy", string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = (kind === "company" ? companySchema : candidateSchema).safeParse(values);
    const next: typeof errors = {};
    if (!parsed.success) for (const i of parsed.error.issues) next[i.path[0] as keyof Values] = i.message;
    if (!privacy) next.privacy = "Debes aceptar la política de privacidad";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    await new Promise((r) => setTimeout(r, 900));
    submitContactRequest({
      kind,
      name: values.name.trim(),
      companyName: kind === "company" ? values.companyName.trim() : undefined,
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      message: values.message.trim(),
      hiringVolume: kind === "company" ? volume : undefined,
    });
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold">¡Gracias, {values.name.split(" ")[0]}!</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          {kind === "company"
            ? "Te escribimos en menos de 24 h laborables con una propuesta para tus vacantes."
            : "Hemos guardado tu perfil. Te avisaremos cuando haya una oferta que encaje contigo."}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setStatus("idle");
            setValues({ name: "", companyName: "", email: "", phone: "", message: "" });
            setPrivacy(false);
          }}
        >
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <F label="Nombre" error={errors.name}>
        <Input value={values.name} onChange={set("name")} placeholder="Tu nombre" autoComplete="name" />
      </F>
      {kind === "company" ? (
        <F label="Empresa" error={errors.companyName}>
          <Input value={values.companyName} onChange={set("companyName")} placeholder="Nombre de la empresa" autoComplete="organization" />
        </F>
      ) : (
        <F label="Teléfono (opcional)">
          <Input value={values.phone} onChange={set("phone")} placeholder="+34 600 000 000" autoComplete="tel" />
        </F>
      )}
      <F label="Email" error={errors.email}>
        <Input type="email" value={values.email} onChange={set("email")} placeholder="tu@empresa.com" autoComplete="email" />
      </F>
      {kind === "company" && (
        <F label="Teléfono (opcional)">
          <Input value={values.phone} onChange={set("phone")} placeholder="+34 600 000 000" autoComplete="tel" />
        </F>
      )}
      {kind === "company" && (
        <div className="space-y-2 sm:col-span-2">
          <Label>¿Cuántas personas necesitas contratar?</Label>
          <div className="flex flex-wrap gap-2">
            {VOLUMES.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setVolume(v)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
                  volume === v ? "border-primary bg-primary text-white" : "bg-white hover:border-primary/40",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
      <F label={kind === "company" ? "¿Qué perfiles buscas?" : "Cuéntanos sobre ti"} error={errors.message} className="sm:col-span-2">
        <Textarea
          value={values.message}
          onChange={set("message")}
          placeholder={kind === "company" ? "Ej.: 6 camareros/as para temporada en Málaga, con inglés básico…" : "Experiencia, sector que te interesa, zona…"}
          className="min-h-32"
        />
      </F>
      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <Checkbox checked={privacy} onCheckedChange={(v) => setPrivacy(v === true)} className="mt-0.5" />
          <span className="text-muted-foreground">
            Acepto la{" "}
            <Link href={kind === "company" ? legalUrl("empresas", "privacidad") : legalUrl("empleo", "privacidad-candidatos")} target="_blank" className="font-medium text-primary underline underline-offset-2">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {errors.privacy && <p className="mt-1 ml-7 text-sm text-destructive">{errors.privacy}</p>}
      </div>
      <Button type="submit" size="xl" className="shadow-glow sm:col-span-2" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Send data-icon="inline-start" />}
        {kind === "company" ? "Solicitar propuesta" : "Enviar mi perfil"}
      </Button>
    </form>
  );
}

function F({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className={cn("[&_input]:h-11 [&_input]:rounded-xl [&_input]:bg-white [&_textarea]:rounded-xl [&_textarea]:bg-white", error && "[&_input]:border-destructive [&_textarea]:border-destructive")}>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
