import { HeartPulse, Hotel, Laptop, Phone, ShoppingBasket, Sun, Truck, Wrench } from "lucide-react";
import { Reveal } from "../section";

const SECTORS = [
  { icon: Hotel, name: "Hostelería y turismo" },
  { icon: Truck, name: "Logística y transporte" },
  { icon: ShoppingBasket, name: "Retail y alimentación" },
  { icon: HeartPulse, name: "Salud y clínicas" },
  { icon: Sun, name: "Energía e instalaciones" },
  { icon: Wrench, name: "Industria y oficios" },
  { icon: Laptop, name: "Tecnología" },
  { icon: Phone, name: "Ventas y atención al cliente" },
];

export function Sectors() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-6 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">Sectores en los que somos especialistas</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SECTORS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.03}>
              <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-soft">
                <s.icon className="size-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
