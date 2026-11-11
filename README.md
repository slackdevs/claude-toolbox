# tools
Slackdevs tools for Anthropic Claude and Claude Code.

**Claude Toolbox**: herramientas en el navegador, al estilo de [it-tools](https://github.com/CorentinTh/it-tools), para profesionales que trabajan con Claude, la Claude API y Claude Code. Están organizadas según lo que evalúan las credenciales de Anthropic:

| Código | Credencial |
|---|---|
| CCAO-F | Claude Certified Associate – Foundations |
| CCDV-F | Claude Certified Developer – Foundations |
| CCAR-F | Claude Certified Architect – Foundations |
| CCAR-P | Claude Certified Architect – Professional |
| Badge CC | Claude Partner Badge – Claude Code |

Todo corre del lado del cliente: no se envía ningún dato a servidores. La única excepción prevista es la **capa comunitaria** (propuestas, votos y donaciones), que va a tener una API propia; hoy funciona en **modo demo**, con un backend simulado dentro del navegador.

## Áreas del sitio

| Área | Rutas | Qué es |
|---|---|---|
| Herramientas | `/`, `/<herramienta>/` | Las utilidades de siempre, con buscador, filtros por credencial y favoritos |
| Cheatsheets | `/cheatsheets/`, `/cheatsheets/<credencial>/` | Un cheatsheet por credencial, imprimible, con las herramientas relacionadas |
| Propuestas | `/propuestas/`, `/propuestas/nueva/`, `/propuestas/<id>/` | Proponer herramientas, mejoras o contenido; votar a favor o en contra; donar por consumos |
| Roadmap | `/roadmap/` | Lo planificado, en desarrollo y publicado, según el ranking de propuestas |
| Revisión | `/admin/` | Cola de revisión simulada (sin enlace en el menú, `noindex`) |

## Identidad visual

Hereda el sistema de [slackdevs.com](https://slackdevs.com) (“Literary Cyber-Minimalism”):

- **Colores**: ámbar `#e5a93c` (primario), violeta `#8b5cf6`, cian `#00e5ff`, fondo `#090a0f` con grilla sutil. Variables en `:root` de `src/styles/main.css`, con los mismos nombres que `website/css/style.css`: si cambia la marca, actualizá ambos.
- **Tipografías**: Playfair Display (títulos), Inter (texto), JetBrains Mono (etiquetas, código, botones).
- **Marca**: hexágono “SL”, favicon en `public/favicon.svg`, imagen social en `public/og-tools.jpg`.
- **Insignias** de certificación en `src/assets/badges/` (copiadas de `website/assets/badges/`); color por credencial en `src/lib/certs.ts`.
- Enlaces a slackdevs.com, artículos y páginas legales en `src/lib/brand.ts`.

## Stack

- [Vue 3](https://vuejs.org) + `<script setup>` + TypeScript
- [Vite](https://vite.dev)
- [Vue Router](https://router.vuejs.org) (history real: `/costos/`; cada ruta tiene su HTML estático para SEO)
- Sin librería de UI: estilos propios en `src/styles/main.css` (solo tema oscuro, como el sitio principal)

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build
```

## Estructura

```
src/
├── App.vue                 # layout: header, sidebar, cabecera de herramienta
├── router.ts               # una ruta por herramienta, generada desde el registro
├── pages/                  # Home (buscador + filtros por certificación), 404
├── components/             # CodeOutput, TabbedCode, LintList, ToolCard, ...
├── composables/            # estado global, localStorage, toast/copiar
├── lib/                    # utilidades compartidas: formato, modelos y precios, certificaciones
├── i18n/                   # idioma actual (es/en), helpers tr() y useMessages(), textos comunes (ui.ts)
├── cheatsheets/            # registro, rutas y páginas de cheatsheets (el contenido está en docs/Cheatsheets/)
├── community/              # propuestas, votos, donaciones, roadmap y admin (ver "Comunidad")
└── tools/
    ├── tool.ts             # tipo Tool + defineTool()
    ├── index.ts            # registro automático + categorías
    └── <herramienta>/
        ├── index.ts        # metadatos (nombre, ruta, categoría, certificaciones)
        ├── <herramienta>.vue
        └── *.service.ts / *.data.ts   # lógica pura y datos (opcional)
```

## Crear una herramienta nueva

```bash
npm run script:create:tool -- mi-herramienta
```

Genera `src/tools/mi-herramienta/` con `index.ts` y el componente. El registro es automático (`import.meta.glob`), así que no hay que editar ningún índice. Completá en `index.ts` la categoría (`api`, `prompt`, `tools`, `code`, `arch`) y las certificaciones (`A`, `D`, `AF`, `AP`, `B`).

Convenciones:
- Todo texto visible va en español e inglés (ver [Idiomas](#idiomas)).
- La lógica pura va en `<herramienta>.service.ts` para poder testearla sin el componente.
- Los mensajes de `LintList` admiten HTML propio: escapá siempre el input del usuario con `esc()` de `@/lib/format`.
- Los precios de modelos viven en `src/lib/models.ts`: actualizalos ahí y se reflejan en todas las herramientas.

## Comunidad: propuestas, votos, donaciones y roadmap

Todo vive en `src/community/`, aislado del resto y cargado de forma diferida: si esta capa falla, las herramientas siguen funcionando.

```
src/community/
├── types.ts        # tipos del dominio (se van a compartir con la API)
├── config.ts       # precios, equivalencias y pesos del puntaje: PROVISORIOS, marcados TODO
├── score.ts        # funciones puras: puntaje, desglose, orden del ranking
├── api.ts          # interfaz CommunityApi: única puerta de entrada a los datos
├── mock/           # backend simulado: localStorage, semillas, latencia y errores aleatorios
├── http/           # stub de la API real (todavía sin implementar)
├── composables/    # useProposals, useProposal, useVoter, useVote, useDonate, useAdmin
├── components/     # VoteControl, ScoreBreakdown, DonateButtons, StatusBadge, ProposalCard, ...
└── pages/          # listado, detalle, nueva propuesta, roadmap, admin
```

Reglas que implementa:

- **Ciclo de vida**: Recibida → Abierta a votación → Planificada → En desarrollo → Publicada (o Descartada / Duplicada, siempre con motivo público).
- **Revisión**: toda propuesta entra como Recibida; no se puede votar ni donar hasta que se le asigna un tiempo estimado y se abre desde `/admin/`.
- **Voto**: sin login, un voto por email y propuesta (+1 o −1), con consentimiento explícito. Se puede cambiar o retirar.
- **Puntaje**: `votos a favor − votos en contra + puntos por donaciones`, siempre con el desglose a la vista. Desempate: la más antigua primero.
- **Donaciones**: Buy Me a Coffee, A Beer y A Pizza. No se reembolsan: si la propuesta no avanza, quedan como crédito para un desarrollo privado.

### Modo demo

Con `VITE_COMMUNITY_API=mock` (el valor por defecto) el backend es `src/community/mock/`: los datos se guardan en `localStorage` (clave `ct-community-v1`), no sale nada del navegador, no se envían emails y no se cobra nada. Las páginas comunitarias muestran un banner de modo demo.

- **Datos de ejemplo**: `mock/seed.ts` (14 propuestas de Slackdevs, con votantes y donantes ficticios de `example.com`).
- **Verificación de email y pago con PayPal**: simulados con un botón.
- **`/admin/`**: activá "Modo Sebastián (demo)" para revisar propuestas, cambiar estados, ver votos (email, IP y región simuladas) y donaciones. Ahí también están las herramientas de demo: restablecer los datos de ejemplo, activar errores aleatorios y ajustar la latencia.
- **Valores provisorios**: los precios de cada consumo, sus equivalencias en tiempo y su peso en el puntaje están en `config.ts` marcados `TODO`, y la interfaz los muestra como "provisorio" mientras `provisional` sea `true`.

### Pasar de mock a http

1. Implementá cada operación de `CommunityApi` en `src/community/http/httpApi.ts` contra la API real. Cada método de `api.ts` tiene anotado su endpoint (`GET /proposals`, `POST /proposals/:id/vote`, ...). Los errores tienen que llegar como `CommunityError` con su `code` (`network`, `not_found`, `invalid` + `field`, `forbidden`, `unverified`).
2. Compilá con `VITE_COMMUNITY_API=http` (por ejemplo en `.env.production`).
3. Los componentes no cambian: sólo hablan con `CommunityApi`. Lo que es propio del mock deja de aparecer solo: el banner de demo, "Simular verificación" (depende de `demoToken`) y las herramientas de demo (dependen de `api.demo`).
4. Antes de salir de la demo: definí los valores de `config.ts` y poné `provisional: false`, reemplazá el pago simulado de `DonateDialog.vue` por el flujo real de PayPal, protegé `/admin/` con autenticación real y actualizá la nota de privacidad.

## Cheatsheets

El contenido de cada cheatsheet es un Markdown en `docs/Cheatsheets/` (única fuente). `src/cheatsheets/index.ts` asocia cada credencial con su archivo, su fecha de última revisión y un resumen en español e inglés; la app carga el Markdown de forma diferida y `scripts/seo.ts` lo convierte a HTML estático en el build.

- Para actualizar un cheatsheet, editá su `.md` y la fecha `reviewedAt` en `src/cheatsheets/index.ts`.
- El contenido está sólo en español; con la interfaz en inglés se muestra un aviso.
- El Markdown se renderiza con el parser propio de `src/lib/markdown.ts` (títulos, tablas, bloques de código, listas, listas de tareas, citas), sin `v-html`. El mismo parser, en su perfil simple, muestra las descripciones que escriben los usuarios en las propuestas.
- `OFFICIAL_GUIDE_URL` (link a la guía oficial de cada examen) está marcado `TODO`.

## Idiomas

La interfaz está en **español e inglés**. El botón `ES / EN` del header cambia el idioma; la elección se guarda en `localStorage` (`ct-lang`) y, la primera vez, se toma del idioma del navegador. Sin dependencias: es un i18n mínimo en `src/i18n/`.

- **Textos comunes** (header, sidebar, home, botones): `src/i18n/ui.ts`.
- **Metadatos de cada herramienta**: `name` y `description` son `{ es, en }` en su `index.ts`.
- **Textos de un componente**: co-ubicados con `useMessages()`. TypeScript exige que `en` tenga las mismas claves que `es`:

  ```ts
  const t = useMessages({
    es: { title: 'Resultado', total: (n: number) => `${n} tokens` },
    en: { title: 'Result', total: (n: number) => `${n} tokens` },
  });
  // template: {{ t.title }} · script: t.value.total(5)
  ```

- **Datos** (`*.data.ts`, `*.service.ts`): exportá `Localized<T>` y elegí la variante con `tr()`.
- Al cambiar de idioma la herramienta abierta se vuelve a montar, así sus valores de ejemplo aparecen en el idioma nuevo (lo que se haya escrito en los campos se pierde).
- `fmt()` formatea números según el idioma (`es-AR` / `en-US`).

## Herramientas

| Categoría | Herramientas |
|---|---|
| API, costos y tokens | Calculadora de costos (caching + Batch), estimador de tokens, presupuesto de ventana de contexto, constructor de requests (cURL/Python/TS), generador de Message Batches, visor de streaming SSE, referencia de errores y `stop_reason` |
| Prompts y evaluación | Constructor de prompts con XML, linter de prompts, generador de evals (LLM como juez) |
| Tools, MCP y salida estructurada | Constructor de definiciones de tools, validador de JSON Schema, configurador de servidores MCP |
| Claude Code | Generador de CLAUDE.md, settings.json y permisos, hooks, subagentes, skills y comandos, headless y CI/CD |
| Arquitectura y certificación | Selector de patrones agénticos, mapa de certificaciones y checklist de estudio |

## Deploy

Se publica en Hostinger como app Vite en <https://claudetoolbox.slackdevs.com/>: cada push a `main` corre `npm run build` y sirve `dist/` en la raíz del dominio. Los assets se piden con ruta absoluta según el `base`, así que `BRAND.tools` tiene que coincidir con la URL donde realmente se sirve el sitio (si no, todos los assets dan 404).

`legacy/standalone.html` conserva la versión 0.1 en un solo archivo HTML.

## SEO y LLMs

`scripts/seo.ts` es un plugin de Vite que corre al final de `npm run build` y, a partir del registro de herramientas, genera en `dist/`:

- `<herramienta>/index.html`: title, description, canonical, Open Graph, JSON-LD (`WebApplication` + `BreadcrumbList`) y contenido legible sin JavaScript.
- `index.html` con JSON-LD `WebSite` + `ItemList`, y `404.html` (`noindex`).
- `cheatsheets/index.html` y `cheatsheets/<credencial>/index.html`, con el contenido completo del cheatsheet y JSON-LD `TechArticle`.
- `propuestas/index.html` y `roadmap/index.html` con title, description y canonical (su contenido es dinámico). El detalle `/propuestas/<id>/` no tiene HTML estático: al recargarlo depende del fallback `404.html` del hosting.
- `propuestas/nueva/index.html` y `admin/index.html` con `noindex`, fuera del sitemap y de `llms.txt`.
- `sitemap.xml`, `robots.txt`, `llms.txt` y `llms-full.txt` ([llmstxt.org](https://llmstxt.org)).

Una herramienta nueva aparece en todos automáticamente. Los enlaces viejos con hash (`#/costos`) redirigen a la ruta real.

La URL pública vive en `BRAND.tools` (`src/lib/brand.ts`) y define el `base` de Vite. Si cambia el dominio o pasa a una subcarpeta, cambiala ahí y en las URLs absolutas de `og:image`, `twitter:image`, sitemap y llms.txt de `index.html`.

Como el sitio se sirve en la raíz del dominio, `robots.txt` y `llms.txt` quedan donde buscadores y crawlers de IA los buscan. Conviene igual enviar `sitemap.xml` a Google Search Console y Bing Webmaster Tools.

## Aviso

Proyecto independiente de Sebastián Larrauri ([slackdevs.com](https://slackdevs.com)),, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic. Los precios y los datos de los exámenes provienen de fuentes públicas (noviembre 2026) y pueden cambiar: verificalos en la documentación oficial.
