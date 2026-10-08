import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Recruitment Lab · Reclutamiento con anuncios de Meta",
    template: "%s · Recruitment Lab",
  },
  description:
    "Llenamos tus vacantes en días: campañas de Meta Ads que generan candidatos, filtro automático con preguntas y test, y un panel para seguir todo el proceso.",
  openGraph: {
    title: "Recruitment Lab",
    description: "Candidatos cualificados en días gracias a campañas de Meta Ads y filtros inteligentes.",
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
