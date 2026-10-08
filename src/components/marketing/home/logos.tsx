import { CompanyLogo } from "@/components/shared/brand";

const CLIENTS = [
  { name: "Grupo Vela Hoteles", hue: 210 },
  { name: "LogiNorte", hue: 35 },
  { name: "Sonrisa Clinic", hue: 175 },
  { name: "Nexo Solar", hue: 85 },
  { name: "Fresh&Co Market", hue: 145 },
  { name: "Kodea Software", hue: 285 },
  { name: "Transportes Villar", hue: 15 },
  { name: "Clínicas Fisiomove", hue: 330 },
  { name: "Bodegas Castells", hue: 350 },
];

export function Logos() {
  return (
    <section className="border-y bg-white/60 py-10">
      <p className="mb-6 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Empresas que ya contratan con Recruitment Lab
      </p>
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 pr-12">
          {[...CLIENTS, ...CLIENTS].map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
              <CompanyLogo name={c.name} hue={c.hue} size="sm" />
              <span className="font-display text-base font-semibold whitespace-nowrap text-slate-700">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
