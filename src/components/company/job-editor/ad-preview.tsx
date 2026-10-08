import { Bookmark, Heart, Images, MessageCircle, MoreHorizontal, Play, Send } from "lucide-react";
import type { MetaCreative } from "@/lib/types";
import { initials } from "@/lib/format";
import { InstagramIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

/** Simulación de un anuncio de Instagram (feed) a partir de los datos de la campaña */
export function AdPreview({
  companyName,
  companyHue,
  primaryText,
  creative,
  ctaLabel = "Solicitar información",
  className,
}: {
  companyName: string;
  companyHue: number;
  primaryText: string;
  creative: Pick<MetaCreative, "kind" | "headline" | "hue">;
  ctaLabel?: string;
  className?: string;
}) {
  const handle = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return (
    <div className={cn("mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border bg-white shadow-soft", className)}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-[2px]">
          <div
            className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
            style={{ background: `oklch(0.55 0.17 ${companyHue})` }}
          >
            {initials(companyName)}
          </div>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold">{handle}</p>
          <p className="text-[10px] text-muted-foreground">Publicidad</p>
        </div>
        <MoreHorizontal className="ml-auto size-4 text-muted-foreground" />
      </div>
      <div
        className="relative flex aspect-[4/5] items-end overflow-hidden p-5 text-white"
        style={{ background: `linear-gradient(150deg, oklch(0.72 0.14 ${creative.hue}), oklch(0.42 0.18 ${creative.hue + 30}))` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_50%)]" />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium backdrop-blur">
          {creative.kind === "video" ? <Play className="size-3 fill-current" /> : creative.kind === "carousel" ? <Images className="size-3" /> : null}
          {creative.kind === "video" ? "0:15" : creative.kind === "carousel" ? "1/3" : null}
        </div>
        {creative.kind === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/25 backdrop-blur">
              <Play className="ml-1 size-6 fill-white" />
            </div>
          </div>
        )}
        <div className="relative">
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-80">Estamos contratando</p>
          <p className="mt-1 font-display text-2xl leading-tight font-bold text-balance">{creative.headline || "Titular de tu anuncio"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-b bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary">
        {ctaLabel}
        <span>›</span>
      </div>
      <div className="flex items-center gap-3 px-3 pt-2.5 text-slate-800">
        <Heart className="size-5" />
        <MessageCircle className="size-5" />
        <Send className="size-5" />
        <Bookmark className="ml-auto size-5" />
      </div>
      <p className="px-3 pt-2 pb-3 text-xs leading-relaxed">
        <span className="font-semibold">{handle}</span> <span className="whitespace-pre-line text-slate-700">{primaryText || "Texto principal del anuncio…"}</span>
      </p>
      <div className="flex items-center gap-1 border-t px-3 py-2 text-[10px] text-muted-foreground">
        <InstagramIcon className="size-3" /> Vista previa · Feed de Instagram
      </div>
    </div>
  );
}
