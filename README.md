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

Todo corre del lado del cliente: no se envía ningún dato a servidores.

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
- [Vue Router](https://router.vuejs.org) (hash history, compatible con GitHub Pages)
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
- La lógica pura va en `<herramienta>.service.ts` para poder testearla sin el componente.
- Los mensajes de `LintList` admiten HTML propio: escapá siempre el input del usuario con `esc()` de `@/lib/format`.
- Los precios de modelos viven en `src/lib/models.ts`: actualizalos ahí y se reflejan en todas las herramientas.

## Herramientas

| Categoría | Herramientas |
|---|---|
| API, costos y tokens | Calculadora de costos (caching + Batch), estimador de tokens, presupuesto de ventana de contexto, constructor de requests (cURL/Python/TS), generador de Message Batches, visor de streaming SSE, referencia de errores y `stop_reason` |
| Prompts y evaluación | Constructor de prompts con XML, linter de prompts, generador de evals (LLM como juez) |
| Tools, MCP y salida estructurada | Constructor de definiciones de tools, validador de JSON Schema, configurador de servidores MCP |
| Claude Code | Generador de CLAUDE.md, settings.json y permisos, hooks, subagentes, skills y comandos, headless y CI/CD |
| Arquitectura y certificación | Selector de patrones agénticos, mapa de certificaciones y checklist de estudio |

## Deploy

`.github/workflows/deploy.yml` construye y publica en GitHub Pages en cada push a `main`. Activalo en **Settings → Pages → Source: GitHub Actions**.

`legacy/standalone.html` conserva la versión 0.1 en un solo archivo HTML.

Si publicás en un dominio propio (por ejemplo `tools.slackdevs.com`), actualizá las URLs absolutas de `og:url`, `og:image` y `twitter:image` en `index.html`.

## Aviso

Proyecto independiente de Sebastián Larrauri ([slackdevs.com](https://slackdevs.com)),, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic. Los precios y los datos de los exámenes provienen de fuentes públicas (noviembre 2026) y pueden cambiar: verificalos en la documentación oficial.
