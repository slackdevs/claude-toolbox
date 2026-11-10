# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es

Claude Toolbox: colección de herramientas client-side (estilo it-tools) para profesionales de Claude, la Claude API y Claude Code, de SlackDevs (Sebastián Larrauri). UI en español. Vue 3 + `<script setup>` + TypeScript + Vite + Vue Router (history real; el `base` sale de `BRAND.tools`, hoy `/`). Sin librería de UI.

## Comandos

```bash
npm run dev                               # desarrollo
npm run build                             # vue-tsc + build a dist/
npm run script:create:tool -- <nombre>    # nueva herramienta en src/tools/<nombre>/
```

## Arquitectura

- Cada herramienta vive en `src/tools/<nombre>/`: `index.ts` (metadatos con `defineTool`), `<nombre>.vue`, y lógica pura opcional en `*.service.ts` / `*.data.ts`. El registro es automático vía `import.meta.glob`: no edites índices.
- Categorías en `src/tools/index.ts`; certificaciones (`A`, `D`, `AF`, `AP`, `B`), su color de marca e insignia en `src/lib/certs.ts`.
- Precios de modelos sólo en `src/lib/models.ts`.
- Componentes compartidos en `src/components/` (`CodeOutput`, `TabbedCode`, `LintList`, `KpiCard`, ...). `LintList` renderiza HTML: escapá el input del usuario con `esc()`.
- SEO: `scripts/seo.ts` genera en el build un HTML por herramienta, sitemap, robots y llms.txt desde el registro; la URL pública está en `BRAND.tools`. Bloque `<!--seo-->` de `index.html`: lo reescribe el build.
- Nada sale del navegador: no agregues llamadas de red ni analytics sin pedirlo.

## Marca

El estilo replica `../website/css/style.css` (variables `--color-primary` ámbar, `--color-secondary` violeta, `--color-tertiary` cian, `--color-bg-*`, fuentes `--font-serif/sans/mono`). Usá esas variables, no colores sueltos. Solo tema oscuro. Respetá `prefers-reduced-motion`.

## Git

Prefijos de commit como en website: `add:`, `update:`, `fix:`, `change:`, `DEL:`.
