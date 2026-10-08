import type { NextConfig } from "next";

// Demo 100 % cliente: los datos viven en el navegador (localStorage),
// así que no usamos cacheComponents ni datos de servidor.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // URLs antiguas → nueva estructura (web de empresas en / y web de empleo en /empleo)
  async redirects() {
    return [
      { source: "/ofertas", destination: "/empleo/ofertas", permanent: true },
      { source: "/ofertas/:path*", destination: "/empleo/ofertas/:path*", permanent: true },
      { source: "/empresas", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
