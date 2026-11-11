# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es

Claude Toolbox: colección de herramientas client-side (estilo it-tools) para profesionales de Claude, la Claude API y Claude Code, de SlackDevs (Sebastián Larrauri), más cheatsheets por credencial y una capa comunitaria (propuestas, votos, donaciones, roadmap) en modo demo. UI en español e inglés. Vue 3 + `<script setup>` + TypeScript + Vite + Vue Router (history real; el `base` sale de `BRAND.tools`, hoy `/`). Sin librería de UI.

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
- SEO: `scripts/seo.ts` genera en el build un HTML por herramienta y por cheatsheet, las páginas de propuestas y roadmap, sitemap, robots y llms.txt desde los registros; la URL pública está en `BRAND.tools`. Bloque `<!--seo-->` de `index.html`: lo reescribe el build.
- Nada sale del navegador: no agregues llamadas de red ni analytics sin pedirlo. Única excepción prevista: la capa comunitaria, que va a tener una API propia (hoy es un mock en `localStorage` y tampoco sale nada).

### Capa comunitaria (`src/community/`)

Propuestas, votos, donaciones, roadmap y admin simulado. Aislada y diferida: si falla, las herramientas siguen funcionando (por eso `App.vue` y `Home.vue` la cargan con `defineAsyncComponent`).

- `CommunityApi` (`api.ts`) es la única puerta de entrada a los datos: los componentes nunca tocan `localStorage` ni `fetch`. `VITE_COMMUNITY_API=mock` (por defecto) usa `mock/`; `http` usa el stub de `http/httpApi.ts`, todavía sin implementar.
- `types.ts` no depende de Vue ni del navegador: se va a compartir con la API. Si agregás una operación, sumala a la interfaz, al mock y al stub.
- Valores de negocio sin definir (precios, equivalencias, pesos del puntaje): sólo en `config.ts`, marcados `TODO` y visibles como "provisorio". No inventes cifras definitivas.
- `score.ts` tiene las fórmulas (funciones puras). El puntaje siempre se muestra con su desglose (`ScoreBreakdown`).
- Estado por texto e ícono además de color (`labels.ts`, `StatusBadge`). Modales con `CommunityDialog` (`<dialog>` nativo).
- El texto que escriben los usuarios se muestra con `MarkdownView` (`src/lib/markdown.ts`, parser propio): nada de `v-html`.
- Cambios que afectan a varias pantallas (sesión, donación, admin): `bumpData()` de `state.ts` recarga los listados.

### Cheatsheets (`src/cheatsheets/`)

El contenido es Markdown en `docs/Cheatsheets/` (única fuente, sólo en español). `index.ts` lo asocia a cada credencial con su fecha de revisión; al editar un `.md`, actualizá `reviewedAt`. No inventes temario de examen.

## Marca

El estilo replica `../website/css/style.css` (variables `--color-primary` ámbar, `--color-secondary` violeta, `--color-tertiary` cian, `--color-bg-*`, fuentes `--font-serif/sans/mono`). Usá esas variables, no colores sueltos. Solo tema oscuro. Respetá `prefers-reduced-motion`.

## Git

Prefijos de commit como en website: `add:`, `update:`, `fix:`, `change:`, `DEL:`.
