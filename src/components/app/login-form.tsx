"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useDemo } from "@/lib/store";
import { checkCompanyLogin } from "@/lib/auth";
import { Logo } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlowShowcase } from "@/components/marketing/flow-showcase";

/** Acceso de empresas cliente a su portal */
export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const hydrated = useDemo((s) => s.hydrated);
  const login = useDemo((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Introduce tu email y tu contraseña");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const session = checkCompanyLogin(email, password);
    if (!session) {
      setLoading(false);
      setError("Email o contraseña incorrectos");
      return;
    }
    login(session);
    router.push(next?.startsWith("/portal") ? next : "/portal");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold">Accede a tu portal</h1>
          <p className="mt-2 text-muted-foreground">Sigue tus procesos de selección y valora a tus candidatos en tiempo real.</p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="h-11 rounded-xl bg-white"
                aria-invalid={!!error}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-white pr-11"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" size="xl" className="w-full shadow-glow" disabled={loading || !hydrated}>
              {loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Lock data-icon="inline-start" />}
              Entrar
              {!loading && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Has olvidado tu contraseña?{" "}
            <a href="mailto:hola@recruitmentlab.es" className="font-medium text-primary hover:underline">
              Escríbenos
            </a>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-80 rounded-full bg-brand-2/20 blur-3xl" />
        <FlowShowcase className="scale-90" />
        <p className="relative mt-4 max-w-sm text-center text-white/70">
          Del anuncio en Instagram a la candidatura puntuada, <span className="font-semibold text-white">sin perder a nadie por el camino.</span>
        </p>
      </div>
    </div>
  );
}
