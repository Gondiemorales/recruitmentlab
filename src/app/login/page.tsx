import type { Metadata } from "next";
import { LoginForm } from "@/components/app/login-form";

export const metadata: Metadata = { title: "Acceso clientes" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" && next.startsWith("/") ? next : null} />;
}
