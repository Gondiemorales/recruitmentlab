import { Mail, MapPin, Phone } from "lucide-react";
import type { Application } from "@/lib/types";
import { LinkedinIcon } from "@/components/shared/brand";

/** Render de un CV a partir del perfil (los CV de la demo no son ficheros reales) */
export function CvDocument({ app }: { app: Application }) {
  const p = app.profile;
  return (
    <div className="mx-auto aspect-[1/1.414] w-full max-w-[640px] overflow-hidden rounded-md bg-white text-[11px] leading-relaxed text-slate-700 shadow-[0_4px_30px_-8px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 sm:text-xs">
      <div className="grid h-full grid-cols-[34%_1fr]">
        <aside className="space-y-5 bg-slate-800 p-5 text-slate-200 sm:p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-slate-600 font-display text-xl font-semibold text-white sm:size-20">
            {app.fullName
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")}
          </div>
          <div className="space-y-1.5 break-all">
            <p className="flex items-center gap-1.5">
              <Mail className="size-3 shrink-0" /> {app.email}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="size-3 shrink-0" /> {app.phone}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3 shrink-0" /> {app.city}
            </p>
            {app.linkedinUrl && (
              <p className="flex items-center gap-1.5">
                <LinkedinIcon className="size-3 shrink-0" /> {app.linkedinUrl}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-white uppercase">Habilidades</p>
            <ul className="space-y-1">
              {p.skills.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-white uppercase">Idiomas</p>
            <ul className="space-y-1">
              {p.languages.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="space-y-5 p-5 sm:p-7">
          <div>
            <p className="font-display text-xl leading-tight font-bold text-slate-900 sm:text-2xl">{app.fullName}</p>
            <p className="mt-0.5 font-medium text-blue-700">{p.headline}</p>
            <p className="mt-2 text-slate-600">
              Profesional con {p.yearsExperience} {p.yearsExperience === 1 ? "año" : "años"} de experiencia. Responsable, resolutivo y con muchas ganas de
              aportar a un equipo que apueste por el crecimiento.
            </p>
          </div>
          <div>
            <p className="mb-2 border-b pb-1 text-[10px] font-semibold tracking-widest text-slate-900 uppercase">Experiencia</p>
            <div className="space-y-3">
              {p.experience.map((e) => (
                <div key={`${e.role}-${e.company}`}>
                  <p className="font-semibold text-slate-900">
                    {e.role} · <span className="font-normal">{e.company}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">{e.period}</p>
                  <p>{e.summary}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 border-b pb-1 text-[10px] font-semibold tracking-widest text-slate-900 uppercase">Formación</p>
            {p.education.map((e) => (
              <div key={e.title}>
                <p className="font-semibold text-slate-900">{e.title}</p>
                <p className="text-[10px] text-slate-500">
                  {e.center} · {e.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
