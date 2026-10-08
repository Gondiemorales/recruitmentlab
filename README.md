# Recruitment Lab · V2 (demo comercial)

Web y plataforma de **reclutamiento con anuncios de Meta**: captamos candidatos con Lead Ads, les enviamos un email automático con un enlace personal a la oferta (datos autorrellenados), aplican con CV + preguntas/test y la agencia y la empresa cliente gestionan el proceso desde sus paneles.

> **Es una demo 100 % simulada.** No hay backend, base de datos, emails reales ni conexión con Meta. Todo vive en el navegador (`localStorage`) para poder enseñarlo y venderlo. Cada visitante ve los mismos datos de ejemplo y sus cambios solo los ve él.

## Dos webs en un mismo proyecto

| Web | URL | Para quién |
|---|---|---|
| **Empresas** | `/` | Landing de venta B2B, contacto y acceso clientes (`/login`) |
| **Empleo** | `/empleo` | Landing para candidatos, todas las ofertas (`/empleo/ofertas`), detalle, candidatura y "Envíanos tu CV" |

Cada web tiene su propio menú, pie de página y textos legales. Comparten proyecto porque la demo guarda los datos en el navegador, y eso solo se comparte dentro del mismo dominio. Con un backend real, `/empleo` puede servirse en su propio dominio (p. ej. `empleo.recruitmentlab.es`) con una regla de *rewrite*, sin tocar las páginas. Todas las URLs de la web de empleo salen de `src/lib/routes.ts`.

## Tres niveles de acceso

| Nivel | Entrada | Qué hace |
|---|---|---|
| **Administración total** (Recruitment Lab) | `/agencia` → `/admin` | Vigila las cuentas cliente: plan, cuota, facturas y deudas, uso, resultados, usuarios y avisos. Puede entrar en el panel de cualquier empresa. Gestiona las solicitudes de empresas interesadas. |
| **Empresa** | `/login` → `/portal` | Gestiona **sus** ofertas (preguntas, test, campaña de Meta), leads, candidaturas (tablero, ficha, notas, valoración del responsable). Solo ve sus datos (`src/lib/workspace.ts`). |
| **Candidato** | `/empleo` | Ve ofertas y aplica (con autorrelleno si viene del email del lead). |

Cuenta de empresa: **recruitmentlab@recruitmentlab.es / 12345678** (`src/lib/auth.ts`). Los planes y precios internos están en `src/lib/plans.ts`.

## Cómo enseñar la demo (guion de 3 minutos)

1. **Web de empresas** `/` → explica el flujo con el visual del hero y la sección "Cómo funciona". La **web de empleo** `/empleo` es lo que ven los candidatos.
2. **Acceso clientes** → entra con la cuenta de empresa. Verás sus ofertas, campañas y candidatos.
3. Pulsa **Lead de prueba** → llega un lead de Instagram/Facebook y se envía el email automático.
4. En el email, pulsa **Completar mi candidatura** → se abre la oferta con los datos **autorrellenados**. Adjunta un CV, responde las preguntas y envía.
5. En **Candidaturas** aparece puntuada, con filtros eliminatorios y el historial del lead. Arrástrala por el tablero.
6. Entra en `/agencia` para la **administración total**: empresas, facturación, deudas y avisos. Desde la ficha de una empresa, **Entrar en su panel**.

Para restaurar los datos iniciales antes de una presentación: `/agencia?reset=1`.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (sobre Base UI) + Motion para animaciones
- **Zustand** como "base de datos" en el navegador
- Recharts (gráficos), dnd-kit (kanban y orden de preguntas), zod (validación), date-fns

## Estructura

```
src/
  app/
    (empresas)/           WEB DE EMPRESAS (navbar y footer B2B)
      page.tsx            Landing de venta: cómo funciona, ventajas, casos, planes, contacto
      contacto/           Formulario para empresas
      legal/[doc]/        Aviso legal, privacidad, cookies (texto modelo)
    (empleo)/empleo/      WEB DE EMPLEO (navbar y footer de candidatos)
      page.tsx            Landing para candidatos: buscador, sectores, ofertas, cómo aplicar
      ofertas/            Todas las ofertas (filtros) y detalle de cada oferta
      envia-tu-cv/        Candidatura espontánea
      legal/[doc]/        Textos legales en la web de empleo
    (focus)/empleo/ofertas/[slug]/aplicar/   Candidatura en pasos (sin distracciones)
    login/                Login de demo (Agencia / Empresa)
    admin/                Panel de la agencia
      ofertas/            Listado, nueva, detalle y edición
      candidaturas/       Tablero kanban / lista y ficha del candidato
      leads/              Leads de Meta, email enviado, importar CSV
      empresas/           Clientes (+ "Ver su portal")
      solicitudes/        Formularios de contacto recibidos
    portal/               Portal de la empresa cliente (solo ve lo suyo)
  components/
    marketing/            Navbar/footer compartidos y secciones de la web de empresas
    empleo/               Secciones de la web de empleo
    jobs/                 Tarjetas, listado y detalle de ofertas
    apply/                Flujo de candidatura, campos de pregunta, subida de CV
    admin/                Pantallas del panel, simulador de leads, editor de ofertas
    portal/               Pantallas del portal de empresa
    candidates/           Ficha del candidato (compartida agencia / empresa), CV
    app/                  Layout de paneles, cabeceras, KPIs, gráficos
    shared/               Logo, iconos de marca, badges, estados vacíos
    ui/                   Componentes shadcn/ui
  lib/
    types.ts              Modelo de dominio (listo para mapear a tablas SQL)
    store.ts              Estado + acciones (crear oferta, simular lead, aplicar…)
    seed/                 Generador determinista de datos de ejemplo
    scoring.ts            Puntuación de test y requisitos eliminatorios
    metrics.ts            Embudo, series diarias, costes
    labels.ts, format.ts  Textos y formatos en español
```

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # compilación de producción
npm run lint
```

## Desplegar en Vercel (gratis)

Opción A, desde GitHub (recomendada):

1. Crea un repositorio en GitHub y sube esta carpeta (`git push`).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Next.js solo: no hace falta configurar nada ni variables de entorno.
3. Pulsa **Deploy**. Cada `git push` vuelve a desplegar.

Opción B, desde la terminal:

```bash
npm i -g vercel
vercel          # primera vez: inicia sesión y crea el proyecto (preview)
vercel --prod   # despliegue a producción
```

Para usar `recruitmentlab.es`: en Vercel → Project → Settings → Domains, añade el dominio y apunta los DNS como indique Vercel.

## Pasar de demo a producto real (siguiente fase)

El modelo de `lib/types.ts` ya está pensado para una base de datos. Los pasos naturales:

- **Base de datos y ficheros**: Postgres (p. ej. Supabase/Neon) y almacenamiento privado para los CV; sustituir `lib/store.ts` por Server Actions.
- **Auth real** para agencia y empresas (roles y acceso por empresa).
- **Webhook de Meta Lead Ads** (`/api/meta/webhook`): verificar firma, leer el lead con la Graph API, crear el lead y enviar el email.
- **Emails** transaccionales (Resend + React Email) con seguimiento de apertura y clic.
- **IA** de análisis de CV (estaba en la V1, aparcada a propósito).
