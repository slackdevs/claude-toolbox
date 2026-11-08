# tools
Slackdevs tools for Anthropic Claude and Claude Code.

**Claude Toolbox**: una colección de herramientas en el navegador, al estilo de [it-tools.tech](https://it-tools.tech), para profesionales que trabajan con Claude, la Claude API y Claude Code. Las herramientas están organizadas según lo que evalúan las credenciales de Anthropic:

- Claude Certified Associate – Foundations (CCAO-F)
- Claude Certified Developer – Foundations (CCDV-F)
- Claude Certified Architect – Foundations (CCAR-F)
- Claude Certified Architect – Professional (CCAR-P)
- Claude Partner Badge – Claude Code

Todo corre del lado del cliente: no se envía ningún dato a servidores.

## Uso

Abrí `index.html` en el navegador. No requiere build ni dependencias.

Para servirlo localmente:

```bash
npx serve .
# o
python -m http.server 8080
```

## Herramientas (v0.1)

| Categoría | Herramientas |
|---|---|
| API, costos y tokens | Calculadora de costos (caching + Batch), estimador de tokens, presupuesto de ventana de contexto, constructor de requests (cURL/Python/TS), generador de Message Batches, visor de streaming SSE, referencia de errores y `stop_reason` |
| Prompts y evaluación | Constructor de prompts con XML, linter de prompts, generador de evals (LLM como juez) |
| Tools, MCP y salida estructurada | Constructor de definiciones de tools, validador de JSON Schema, configurador de servidores MCP |
| Claude Code | Generador de CLAUDE.md, settings.json y permisos, hooks, subagentes, skills y comandos, headless y CI/CD |
| Arquitectura y certificación | Selector de patrones agénticos, mapa de certificaciones y checklist de estudio |

## Estado y próximos pasos

Esta versión es un único archivo HTML autocontenido (vanilla JS). Próximo paso planeado: migrar a un proyecto con build (p. ej. Vite + Vue/TypeScript) donde cada herramienta sea un módulo independiente, para facilitar contribuciones.

## Aviso

Proyecto independiente, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic. Los precios y los datos de los exámenes provienen de fuentes públicas (noviembre 2026) y pueden cambiar: verificalos en la documentación oficial.
