"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string };

/** Barra de navegación flotante, reutilizada por la web de empresas y la de empleo */
export function Navbar({
  logoHref,
  logoTag,
  links,
  secondary,
  primary,
}: {
  logoHref: string;
  logoTag?: string;
  links: NavLink[];
  secondary?: NavLink;
  primary: NavLink;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => !href.includes("#") && href !== logoHref && pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-3 pl-4 transition-all duration-300",
          scrolled || open ? "glass shadow-soft" : "bg-transparent",
        )}
      >
        <Logo href={logoHref} tag={logoTag} />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(l.href) && "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {secondary && (
            <Link href={secondary.href} className={buttonVariants({ variant: "ghost", size: "lg" })}>
              {secondary.label}
            </Link>
          )}
          <Link href={primary.href} className={cn(buttonVariants({ size: "lg" }), "shadow-glow")}>
            {primary.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-xl md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass shadow-soft mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <div className={cn("mt-2 grid gap-2", secondary && "grid-cols-2")}>
              {secondary && (
                <Link href={secondary.href} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {secondary.label}
                </Link>
              )}
              <Link href={primary.href} className={buttonVariants({ size: "lg" })}>
                {primary.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
