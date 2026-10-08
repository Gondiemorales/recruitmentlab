"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/store";
import { useScopedData } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimpleSelect } from "@/components/app/simple-select";

const SAMPLE = `nombre,email,telefono
Andrea Castillo Vega,andrea.castillo@gmail.com,+34 655 210 984
Javier Prieto Sanz,javi.prieto@hotmail.com,+34 611 873 402
Marta Lozano Gil,marta.lozano@outlook.es,+34 690 334 128
Rubén Escobar Díaz,ruben.escobar@gmail.com,+34 622 908 551`;

type Row = { fullName: string; email: string; phone: string };

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0]!.includes(";") ? ";" : ",";
  const first = lines[0]!.toLowerCase();
  const body = first.includes("email") || first.includes("nombre") ? lines.slice(1) : lines;
  return body
    .map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")))
    .map(([fullName = "", email = "", phone = ""]) => ({ fullName, email, phone }))
    .filter((r) => r.fullName && z.string().email().safeParse(r.email).success);
}

function useActiveJobs() {
  const jobs = useScopedData().jobs;
  return useMemo(() => jobs.filter((j) => j.status === "active"), [jobs]);
}

export function ImportLeadsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const activeJobs = useActiveJobs();
  const addLead = useDemo((s) => s.addLead);
  const sendInvite = useDemo((s) => s.sendInvite);
  const [text, setText] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [sendEmails, setSendEmails] = useState(true);
  const [busy, setBusy] = useState(false);
  const rows = useMemo(() => parseCsv(text), [text]);
  const target = jobId ?? activeJobs[0]?.id ?? null;

  const run = async () => {
    if (!target || !rows.length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    const job = activeJobs.find((j) => j.id === target);
    for (const r of rows) {
      const lead = addLead({ ...r, jobId: target, city: job?.city ?? "", source: "csv_import" });
      if (sendEmails) sendInvite(lead.id);
    }
    setBusy(false);
    setText("");
    onOpenChange(false);
    toast.success(`${rows.length} leads importados`, { description: sendEmails ? "Emails con enlace personal enviados" : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" /> Importar leads desde CSV
          </DialogTitle>
          <DialogDescription>Pega el CSV que exporta Meta (o cualquier listado) con columnas nombre, email y teléfono.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Oferta</Label>
            <SimpleSelect value={target} onChange={setJobId} options={activeJobs.map((j) => ({ value: j.id, label: j.title }))} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Contenido CSV</Label>
              <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => setText(SAMPLE)}>
                Usar plantilla
              </button>
            </div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="nombre,email,telefono" className="min-h-36 font-mono text-xs" />
            <p className="text-xs text-muted-foreground">{rows.length} filas válidas detectadas</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={sendEmails} onCheckedChange={setSendEmails} /> Enviar email con enlace personal a cada lead
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={run} disabled={!rows.length || !target || busy}>
            {busy && <Loader2 className="animate-spin" data-icon="inline-start" />}
            Importar {rows.length || ""} leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const leadSchema = z.object({
  fullName: z.string().trim().min(3, "Nombre completo"),
  email: z.string().trim().email("Email no válido"),
  phone: z.string().trim().min(9, "Teléfono no válido"),
});

export function AddLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const activeJobs = useActiveJobs();
  const addLead = useDemo((s) => s.addLead);
  const sendInvite = useDemo((s) => s.sendInvite);
  const [values, setValues] = useState({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const target = jobId ?? activeJobs[0]?.id ?? null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const i of parsed.error.issues) next[i.path[0] as keyof typeof values] = i.message;
      setErrors(next);
      return;
    }
    if (!target) return;
    const job = activeJobs.find((j) => j.id === target);
    const lead = addLead({ ...parsed.data, jobId: target, city: job?.city ?? "", source: "manual" });
    sendInvite(lead.id);
    toast.success("Lead añadido y email enviado", { description: lead.email });
    setValues({ fullName: "", email: "", phone: "" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir lead manualmente</DialogTitle>
          <DialogDescription>Recibirá el mismo email con su enlace personal para completar la candidatura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Oferta</Label>
            <SimpleSelect value={target} onChange={setJobId} options={activeJobs.map((j) => ({ value: j.id, label: j.title }))} />
          </div>
          {(
            [
              ["fullName", "Nombre completo", "Lucía Martín Ruiz"],
              ["email", "Email", "lucia@email.com"],
              ["phone", "Teléfono", "+34 600 000 000"],
            ] as const
          ).map(([k, label, ph]) => (
            <div key={k} className="space-y-1.5">
              <Label>{label}</Label>
              <Input value={values[k]} onChange={(e) => setValues({ ...values, [k]: e.target.value })} placeholder={ph} aria-invalid={!!errors[k]} />
              {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Añadir y enviar email</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
