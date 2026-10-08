"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronsUpDown, ExternalLink, LogOut, Menu } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Session } from "@/lib/types";
import { Logo, PersonAvatar } from "@/components/shared/brand";
import { PageSkeleton } from "@/components/shared/states";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  exact?: boolean;
};

/** Layout común para el panel de agencia y el portal de empresa (con guarda de rol) */
export function AppShell({
  role,
  nav,
  context,
  children,
}: {
  role: Session["role"];
  nav: NavItem[];
  context: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useDemo((s) => s.hydrated);
  const session = useDemo((s) => s.session);
  const pendingPath = useDemo((s) => s.pendingPath);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allowed = session?.role === role;

  useEffect(() => {
    if (!hydrated || allowed) return;
    if (session) {
      // Sesión con el otro rol (p. ej. el administrador entra al panel de una empresa):
      // ir al destino indicado al cambiar de sesión o al inicio de ese panel
      router.replace(pendingPath ?? (session.role === "agency" ? "/admin" : "/portal"));
    } else {
      // La agencia entra por su propia URL; las empresas por el login de clientes
      router.replace(role === "agency" ? "/agencia" : `/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, allowed, session, pendingPath, router, pathname, role]);

  const sidebar = <SidebarContent nav={nav} context={context} pathname={pathname} />;

  return (
    <div className="flex min-h-screen bg-[oklch(0.985_0.004_255)]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar lg:block">{sidebar}</aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menú</SheetTitle>
          {/* Cerrar el menú móvil al navegar */}
          <div
            className="h-full"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setMobileOpen(false);
            }}
          >
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="flex size-9 items-center justify-center rounded-lg hover:bg-muted" aria-label="Abrir menú">
            <Menu className="size-5" />
          </button>
          <Logo href={role === "agency" ? "/admin" : "/portal"} />
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">{hydrated && allowed ? children : <PageSkeleton />}</main>
      </div>
    </div>
  );
}

function SidebarContent({ nav, context, pathname }: { nav: NavItem[]; context: React.ReactNode; pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href="/" />
      </div>
      <div className="px-3">{context}</div>
      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active ? "bg-white text-primary shadow-soft ring-1 ring-border" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {!!item.badge && (
                <span className="rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold text-white tabular-nums">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <UserMenu />
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const session = useDemo((s) => s.session);
  const logout = useDemo((s) => s.logout);
  if (!session) return null;

  return (
    <div className="border-t p-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-sidebar-accent">
          <PersonAvatar name={session.name} className="size-8" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{session.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.email}</p>
          </div>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{session.role === "agency" ? "Agencia · Recruitment Lab" : "Portal de empresa"}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.open("/", "_blank")}>
            <ExternalLink /> Ver web pública
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              const role = session.role;
              logout();
              router.push(role === "agency" ? "/" : "/login");
            }}
          >
            <LogOut /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
