# Cheatsheet profesional: Claude Certified Architect - Foundations

Nov 10, 2026 · @Sebastian Larrauri

## Cómo usar este cheatsheet

Esta es la guía de consulta para diseñar, construir y defender soluciones con Claude (API, tools, RAG, MCP, agentes y Claude Code), y para rendir el examen Claude Certified Architect – Foundations. No resume los cursos: dice qué hacer, cuándo y cómo.

**Alcance.** Cubre los 7 cursos de preparación oficiales de tu carpeta: AI Fluency (AF), Building with the Claude API (API), Claude on Google Cloud (GC), Claude with Amazon Bedrock (AB), Claude Code in Action (CCA), Claude 101 (C101) e Introduction to MCP (MCP). Se usaron las notas oficiales que trae cada lección, los 19 notebooks, tu guía de estudio `guide_es.md` (GE) y la ficha oficial del examen.

**Leyenda de fuentes** (entre corchetes al final de cada fila o regla):

| Marca | Significa | Confianza |
| --- | --- | --- |
| \[API\], \[GC\], \[AB\], \[MCP\], \[CCA\], \[AF\], \[C101\] | Material oficial del curso | Alta |
| \[GE\] | Guía de estudio comunitaria basada en la guía oficial del examen (5 dominios, 8 escenarios) | Alta para criterios de examen; el código del Agent SDK es pseudocódigo |
| \[EXT\] | Conocimiento externo agregado para completar un procedimiento | Verificar en docs.claude.com antes de producción |
| **Obligatorio** / *Recomendado* / (Opcional) | Nivel de exigencia de la regla | — |

**Contradicciones detectadas entre módulos** (y cómo resolverlas):

| Tema | Un módulo dice | Otro dice | Qué hacer |
| --- | --- | --- | --- |
| Duración del prompt cache | 1 hora máximo \[API\] | 5 minutos \[GC\]; 5 min de inactividad \[AB\] | \[EXT\] El TTL por defecto es 5 min y se renueva con cada lectura; existe un TTL opcional de 1 h con costo distinto. Para el examen: 5 min por defecto |
| Imágenes por request | Máx. 100 \[API\] | Máx. 20 \[AB\] | Depende de la plataforma: consultá el límite del proveedor que uses |
| Formato del examen | 1 correcta de 4 \[GE\] | "Multiple choice and multiple response" (ficha oficial) | Prepará preguntas de respuesta única y múltiple |
| Nombre del Text Editor tool | `str_replace_editor` (3.7) / `str_replace_based_edit_tool` (3.5) \[AB\] | Tipo con fecha que cambia por modelo \[API\] | \[EXT\] El nombre y el `type` dependen del modelo; copiálos de la doc del tool para tu modelo |
| Activar extended thinking | `thinking=true` + `thinking_budget` \[API\] (wrapper del curso) | `thinking={"type":"enabled","budget_tokens":N}` \[GC\] | En la API real se usa el objeto de \[GC\]; lo de \[API\] es la firma de la función helper del curso |
| Agent SDK en \[GE\] | `AgentDefinition(name, system_prompt, allowed_tools)` y `@hook(...)` | No existe esa firma en el SDK | Tratálo como pseudocódigo conceptual; ver sección D para la forma real \[EXT\] |

**Información que falta en el material:** el curso no enseña el Claude Agent SDK en profundidad (solo \[CCA\] lo menciona), ni el escenario 8 del examen ("herramientas de IA agéntica", sin cobertura en \[GE\]). Tampoco da IDs de modelo vigentes: los notebooks usan IDs viejos. Usá siempre los IDs de la página de modelos.

**Índice:** A. Quick Reference · B. Core Knowledge · C. Practical Workflows · D. Tools & Commands · E. Decision Making · F. Best Practices · G. Troubleshooting · H. Practical Examples · I. Checklists · J. Glossary

## A. Quick Reference

### A.1 El examen en una tabla

| Parámetro | Valor |
| --- | --- |
| Preguntas / duración | 60 preguntas en 120 min (\~135 min de asiento) |
| Tipo | Opción múltiple y respuesta múltiple |
| Aprobación | 720 en escala 100–1000; sin penalización por adivinar: respondé todo \[GE\] |
| Precio / validez | USD 125 / 12 meses |
| Entrega | Online con proctor o centro Pearson VUE |
| Escenarios | 4 de 8 al azar \[GE\]: soporte al cliente, generación de código con Claude Code, investigación multiagente, productividad de developers, Claude Code en CI, extracción estructurada, IA conversacional, herramientas agénticas |
| Fuera de alcance \[GE\] | Fine-tuning, auth y facturación, deploy de servidores MCP, arquitectura interna, Constitutional AI/RLHF, streaming y rate limits, config de nubes |

| Dominio | Peso | Lo que más se pregunta |
| --- | --- | --- |
| 1. Arquitectura de agentes y orquestación | 27% | Loop por `stop_reason`, coordinador-subagente, contexto explícito, hooks vs prompts, descomposición |
| 3. Configuración y workflows de Claude Code | 20% | Jerarquía CLAUDE.md, `.claude/rules/` con `paths`, skills, plan mode, `-p`, hooks |
| 4. Prompt engineering y salida estructurada | 20% | Criterios explícitos, few-shot, tool\_use + JSON Schema, validación y reintento, Batch API |
| 2. Diseño de tools e integración MCP | 18% | Descripciones, errores estructurados, pocas tools por agente, `tool_choice`, `.mcp.json` |
| 5. Gestión de contexto y confiabilidad | 15% | Case facts, recorte de resultados, lost-in-the-middle, escalada, provenance |

### A.2 Reglas de oro (memorizar)

1. **La API no guarda estado.** Mandá el historial completo en cada request \[API\].
2. **El loop agéntico se controla con `stop_reason`.** Seguí mientras sea `"tool_use"`; terminá en `"end_turn"`. Nunca parsees el texto ni uses un tope de iteraciones como mecanismo principal \[API\]\[GE\].
3. **Reglas críticas = código, no prompt.** Dinero, identidad, seguridad o compliance van en hooks o precondiciones; los prompts son probabilísticos \[GE\]\[CCA\].
4. **La descripción de la tool es el mecanismo de selección.** Primer arreglo ante una tool mal elegida: mejorar descripciones \[API\]\[GE\].
5. **Los subagentes no heredan contexto.** Pasá todo en su prompt \[GE\].
6. **Workflow antes que agente.** Agente solo si los pasos son impredecibles \[API\].
7. **Medir antes de optimizar.** Evals antes de cambiar prompts o activar extended thinking \[API\]\[AB\].
8. **JSON Schema garantiza sintaxis, no semántica.** Validá los valores aparte \[GE\].
9. **Nunca llames a la API desde el cliente.** La key vive en el servidor \[API\].
10. **Cuanto menos miraste la corrida, más verificás.** Diff primero, tests como gate con hook, revisión en contexto limpio \[CCA\].

### A.3 `stop_reason`

| Valor | Significa | Acción |
| --- | --- | --- |
| `end_turn` | Terminó su respuesta | Mostrar resultado; salir del loop |
| `tool_use` | Pide ejecutar tools | Ejecutar cada `tool_use`, devolver `tool_result`, volver a llamar |
| `max_tokens` | Se cortó por límite | Respuesta truncada: subir `max_tokens` o pedir continuación |
| `stop_sequence` | Apareció una stop sequence | La secuencia no se incluye en la salida |

### A.4 `tool_choice`

| Valor | Comportamiento | Uso típico |
| --- | --- | --- |
| `{"type":"auto"}` | Claude decide si usa tools | Por defecto |
| `{"type":"any"}` | Debe usar alguna tool | Garantizar salida estructurada eligiendo entre varios extractores |
| `{"type":"tool","name":"x"}` | Debe usar esa tool | Extracción con schema; forzar el primer paso |

### A.5 Números que se preguntan

| Dato | Valor | Fuente |
| --- | --- | --- |
| Prompt caching: mínimo cacheable | 1024 tokens | \[API\]\[GC\]\[AB\] |
| Prompt caching: breakpoints por request | Máx. 4 | \[API\]\[GC\] |
| Prompt caching: orden de procesamiento | tools → system → messages | \[API\] |
| Extended thinking: budget mínimo | 1024 tokens; `max_tokens` > budget | \[API\]\[GC\] |
| Message Batches | 50% más barato, hasta 24 h, sin multi-turn con tools, `custom_id` | \[GE\] |
| Web search tool | `web_search_20250305`, `max_uses` (5 por defecto en el curso), `allowed_domains` | \[API\] |
| Imports `@path` en CLAUDE.md | Hasta 5 niveles de anidamiento | \[GE\] |
| Herramientas por agente | 4–5 en vez de 18 mejora la selección | \[GE\] |
| Routines | Como mucho cada hora; empujan solo a ramas `claude/` | \[CCA\] |
| Hooks de Claude Code | \~30 eventos; exit 2 bloquea, exit 1 no bloquea | \[CCA\] |

### A.6 Modelos

| Familia | Prioriza | Cuándo |
| --- | --- | --- |
| Opus | Inteligencia máxima | Tareas complejas, multi-paso, planificación profunda (más costo y latencia) |
| Sonnet | Balance | La mayoría de los casos; código y edición precisa |
| Haiku | Velocidad y costo | Tiempo real, alto volumen, generar datasets de evals |

Es normal usar varios modelos en la misma app según la tarea \[API\].

## B. Core Knowledge

### B.1 Messages API: cómo funciona una request \[API\]\[GC\]\[AB\]

- **Flujo:** cliente → tu servidor → API → tu servidor → cliente. La key nunca sale del servidor.
- **Generación:** tokenización → embedding → contextualización → generación token a token (probabilidad + aleatoriedad). Para en `max_tokens` o en el token de fin.
- **Obligatorios:** `model`, `max_tokens` (límite de seguridad, no objetivo de largo), `messages`.
- **Roles:** `user` y `assistant`. El system prompt va en el parámetro `system`, no en `messages`. Los resultados de tools viajan como bloques `tool_result` dentro de un mensaje `user` (no existe rol `tool`) \[GE\].
- **Respuesta:** `content` (lista de bloques), `stop_reason`, `usage` (tokens de entrada/salida y de cache).
- **Sin estado:** cada request es independiente. Mientras crece la conversación crecen costo y latencia \[GE\].
- **System prompt:** controla *cómo* responde (rol, tono, límites), no *qué*. Primera línea = rol. Ojo: frases como "siempre verificá al cliente" pueden provocar llamadas innecesarias a una tool \[GE\].
- **Temperature (0–1):** 0 = determinista (extracción, datos); cerca de 1 = creativo. Subirla no garantiza salidas distintas, solo las hace más probables.
- **Control de salida:** *prefill* (un mensaje `assistant` al final; Claude continúa desde el carácter exacto, vos unís prefill + respuesta) y *stop sequences* (corta al aparecer la cadena; la cadena no se incluye) \[GC\]\[AB\].
- **Streaming:** eventos `message_start` → `content_block_start` → `content_block_delta` (el texto) → `content_block_stop` → `message_stop`. Con tools aparece `input_json_delta` \[API\].

### B.2 Plataformas: misma familia de modelos, distinta API

| Aspecto | Anthropic API \[API\] | Google Vertex AI \[GC\] | Amazon Bedrock \[AB\] |
| --- | --- | --- | --- |
| SDK / cliente | `anthropic.Anthropic()` | `anthropic[vertex]` → `AnthropicVertex(region="global", project_id=...)` | `boto3` cliente `bedrock-runtime` |
| Llamada | `client.messages.create(...)` | `client.messages.create(...)` | `client.converse(modelId=..., messages=...)` |
| Formato de contenido | string o lista de bloques | igual que la API | siempre lista: `[{"text": "..."}]` |
| Texto de respuesta | `msg.content[0].text` | `msg.content[0].text` | `resp["output"]["message"]["content"][0]["text"]` |
| Stop sequences | `stop_sequences=[...]` | igual | en `inferenceConfig` |
| Cache | `cache_control: {"type":"ephemeral"}` | igual | bloque `cachePoint: {"type":"default"}` |
| Particularidad | Key en `.env` | Project ID de GCP | Model ID por región: usá *inference profiles* (cross-region) para evitar errores crípticos |

### B.3 Tool use \[API\]\[AB\]

- **Qué es:** Claude no ejecuta nada; pide una tool con un bloque `tool_use` (`id`, `name`, `input`) y tu código la ejecuta.
- **Tool function:** función Python con nombres descriptivos que valida entradas y lanza errores con mensajes útiles; Claude ve el error y puede reintentar corrigiendo.
- **Tool schema:** `name`, `description` (3–4 frases: qué hace, cuándo usarla, qué devuelve), `input_schema` (JSON Schema). Truco del curso: pedirle a Claude que genere el schema adjuntando la doc de tool use.
- **Mensajes multibloque:** la respuesta del asistente puede traer texto + varios `tool_use`. Guardá *todo* `response.content` en el historial.
- **Tool result:** en un mensaje `user`: `{"type":"tool_result","tool_use_id":..., "content": str, "is_error": bool}`. Un resultado por cada `tool_use`, emparejados por id. Reenviá los schemas aunque no se usen más.
- **Multi-turn con tools:** loop `while` hasta que `stop_reason != "tool_use"`; no se puede predecir cuántas tools harán falta.
- **Batch tool:** Claude rara vez emite varios `tool_use` en paralelo; una tool `batch_tool` con una lista `invocations` (nombre + argumentos JSON) lo induce a agrupar llamadas independientes en un solo ciclo \[API\]\[AB\].
- **Tools para datos estructurados:** una tool "falsa" cuyo `input_schema` es la forma del JSON que querés + `tool_choice` forzado; leés `response.content[0].input` y no hace falta devolver resultado. Más confiable que prefill+stop, más trabajo de setup \[API\]\[AB\].
- **Flexible tool extraction:** una tool `toJSON` con objeto libre y la estructura descrita en el prompt; iterás rápido sin reescribir schemas, con algo menos de calidad \[AB\].
- **Fine-grained tool streaming:** por defecto la API bufferea y valida cada par clave-valor de nivel superior (llegan ráfagas); el modo fine-grained manda chunks sin validar (más rápido, puede llegar JSON inválido: manejálo en el cliente) \[API\].
- **Tools integradas (schema provisto por Anthropic):** Text Editor (vos implementás `view`, `str_replace`, `create`, `insert`, `undo_edit`), Web Search (Anthropic la ejecuta; devuelve resultados y citas), Code Execution (contenedor sin red; datos vía Files API), Computer Use (vos proveés el entorno, típicamente Docker) \[API\]\[AB\].

### B.4 Salida estructurada: tres métodos

| Método | Cómo | Confiabilidad | Cuándo |
| --- | --- | --- | --- |
| Prefill + stop sequence | prefill ```` ```json ````, stop ```` ``` ```` | Media | Rápido y simple, datasets de evals |
| Tool con schema + `tool_choice` forzado | `input_schema` = forma de salida | Alta (sintaxis garantizada) | Extracción crítica, producción |
| Tool flexible `toJSON` | schema libre + estructura en el prompt | Media-alta | Estructuras que cambian seguido |

Diseño de schema \[GE\]: `required` solo si el dato siempre existe (si no, el modelo inventa); campos *nullable* `["string","null"]`; enums con `"other"` + campo de detalle y `"unclear"` para no forzar categorías.

### B.5 Evals \[API\]

1. Borrador de prompt.
2. Dataset (3 a miles de casos; manual o generado con Haiku).
3. Interpolar cada caso en el prompt.
4. Obtener respuestas.
5. Calificar (p. ej. 1–10) y promediar.
6. Iterar y comparar versiones.

| Grader | Qué evalúa | Pro / contra |
| --- | --- | --- |
| Código | Sintaxis (JSON, `ast` de Python, regex), largo, palabras | Determinista; solo forma |
| Modelo | Calidad, seguimiento de instrucciones | Flexible; puede ser inconsistente. Pedí fortalezas, debilidades, razonamiento y *después* el puntaje para evitar notas medias |
| Humano | Todo | El más flexible; lento y caro |

El curso combina: `score = (model_score + syntax_score) / 2`.

### B.6 Prompt engineering \[API\]\[AF\]\[C101\]

En el ejercicio del curso el puntaje subió de 2,32 → 3,92 (claro y directo) → 7,86 (específico).

| Técnica | Regla |
| --- | --- |
| Claro y directo | Primera línea = verbo de acción + tarea + salida esperada |
| Específico | Tipo A: atributos de la salida (casi siempre). Tipo B: pasos de razonamiento (problemas complejos) |
| XML tags | Envolver contenido interpolado con nombres descriptivos (`<sales_records>`, no `<data>`) |
| Ejemplos (one/multi-shot) | Dentro de tags, después de las instrucciones, con el porqué de que sean ideales; cubrir casos borde (sarcasmo). Tomar los mejores outputs de las evals |
| Criterios explícitos \[GE\] | "Marcá solo si X, Y o Z; no marques A, B" vence a "sé conservador" |
| Las 6 técnicas de AF | Dar contexto, mostrar ejemplos, especificar restricciones, dividir en pasos, pedir que piense primero, definir rol o tono. Arma secreta: pedirle a la IA que mejore tu prompt |

### B.7 RAG \[API\]\[GC\]\[AB\]

- **Por qué:** meter todo el documento choca con límites, baja efectividad y sube costo. RAG = trocear + recuperar solo lo relevante.
- **Chunking:** por tamaño (con *overlap*; el más común y el fallback universal), por estructura (headers; requiere formato garantizado), semántico (el más complejo). No hay método universal.
- **Embeddings:** vectores (−1 a 1) de significado; Anthropic recomienda Voyage AI. Normalizados a magnitud 1. Similitud coseno (cerca de 1 = parecido); distancia coseno = 1 − similitud.
- **Flujo:** chunk → embed → guardar en vector DB (con el texto como metadato) → embed de la consulta → búsqueda por similitud → armar prompt.
- **BM25 (léxico):** pondera términos raros; cubre lo que la semántica pierde (coincidencias exactas).
- **Híbrido + RRF:** correr ambos índices y fusionar con Reciprocal Rank Fusion: `score = Σ 1/(rank + 1)`.
- **Reranking:** un LLM reordena candidatos (por IDs, con prefill + stop). Más precisión, más latencia.
- **Contextual retrieval:** antes de indexar, Claude genera un contexto breve de cada chunk respecto del documento; si el doc es enorme, pasá los primeros chunks + los inmediatamente anteriores.

### B.8 Features de Claude \[API\]

| Feature | Clave operativa |
| --- | --- |
| Extended thinking | Activar solo si las evals muestran que optimizar el prompt no alcanza. Bloque `thinking` con firma criptográfica (no modificar); bloques `redacted_thinking` cifrados que hay que devolver igual. Cobra los tokens de thinking |
| Imágenes | Bloque `image` (base64 o URL) en mensaje `user`; consumen tokens por píxeles. La precisión depende del prompt: pasos, verificación, ejemplos imagen-texto alternados |
| PDF | Bloque `document` con `media_type: application/pdf`; lee texto, tablas, gráficos e imágenes |
| Citations | `"citations": {"enabled": true}` + `title` en el documento. Tipos: `page_location` (PDF) y `char_location` (texto) |
| Prompt caching | Reusa el procesamiento del prefijo. Breakpoint manual con `cache_control` en forma larga del bloque. Se cachea todo hasta el breakpoint; cualquier cambio antes lo invalida. Métricas: `cache_creation_input_tokens`, `cache_read_input_tokens` |
| Files API + Code execution | Subís archivo → `file_id` → bloque `container_upload` → Claude ejecuta Python en contenedor sin red y puede generar archivos descargables |

### B.9 MCP \[API\]\[MCP\]

- **Qué resuelve:** saca de tu app la escritura y mantenimiento de schemas y funciones para integrar servicios. MCP y tool use son complementarios: MCP define *quién* implementa la tool.
- **Arquitectura:** tu servidor contiene un *MCP client* que habla con un *MCP server*. Transporte agnóstico (stdio, HTTP; lo común local es stdio).
- **Mensajes:** `list tools` / `call tool` (y sus results), `read resource`, `list/get prompts`.
- **Tres primitivas del servidor:**

| Primitiva | Controlada por | Para qué | Ejemplo |
| --- | --- | --- | --- |
| Tools | El modelo (las llama cuando decide) | Acciones | `edit_document` |
| Resources | La app (los trae proactivamente) | Datos de lectura por URI; directos (`docs://documents`) o con plantilla (`docs://documents/{doc_id}`), con MIME type | Contenido al mencionar `@doc` |
| Prompts | El usuario (slash command) | Plantillas probadas por el autor del server | `/format doc_id` |

- **Errores:** `isError: true` con contenido estructurado (categoría, reintentable, mensaje) \[GE\].
- **Debug:** `mcp dev server.py` abre el MCP Inspector en el navegador.

### B.10 Agentes y workflows \[API\]\[AB\]

| Patrón | Estructura | Cuándo |
| --- | --- | --- |
| Chaining | Pasos secuenciales, cada uno enfocado | Prompts largos con muchas restricciones que Claude no cumple de una vez; revisar y reescribir |
| Routing | Clasificar entrada → pipeline especializado | Entradas de tipos distintos que piden tono o tools distintas |
| Parallelization | Subtareas simultáneas → agregador | Decisiones con varios criterios independientes |
| Evaluator-optimizer | Productor → evaluador → loop | Salida verificable (p. ej. imagen → modelo 3D) |
| Agente | LLM + tools en loop hasta lograr el objetivo | Pasos desconocidos de antemano |

Cualidades de un buen caso de agente \[AB\]: tareas de alto valor y bajo riesgo; la mayoría de las llamadas *recolectan* información; pocas tools con propósito claro; el contexto viene de las tools ("context is king"); evals obligatorias. Diseño: tools genéricas y combinables (bash, fetch, write) mejor que hiperespecializadas. **Environment inspection:** después de cada acción el agente debe observar el nuevo estado (screenshot, leer archivo antes de editar).

Workflows: más fáciles de testear y con mayor tasa de éxito. Agentes: más flexibles, más difíciles de evaluar. Priorizá confiabilidad.

### B.11 Sistemas multiagente \[GE\]

- **Hub-and-spoke:** el coordinador descompone, elige subagentes dinámicamente, delega, agrega, valida, maneja errores; toda comunicación pasa por él (observabilidad).
- **Contexto aislado:** los subagentes no heredan el historial; pasá en el prompt los datos, resultados previos y formato esperado. Para paralelizar, emití varias llamadas `Task` en la misma respuesta.
- **Prompt del coordinador:** objetivos y criterios de calidad, no pasos.
- **Riesgos:** descomposición demasiado granular; subagentes con tools fuera de su rol.
- **Errores:** recuperación local (1–2 reintentos) y propagar al coordinador un error estructurado con resultados parciales; distinguir "sin resultados" de "falló la búsqueda".

### B.12 Claude Code \[CCA\]\[API\]\[GE\]

**Tres superficies de instrucciones:**

| Superficie | Naturaleza | Para |
| --- | --- | --- |
| CLAUDE.md | Guía que Claude sigue (siempre cargada) | Convenciones permanentes |
| Skills | Procedimientos que cargan bajo demanda (solo la descripción está en contexto) | Tareas repetidas: verificación, releases, migraciones |
| Hooks | Código determinista en puntos fijos del loop | Reglas que no se pueden saltear |

**Memoria (se cargan todas juntas):** managed policy (organización) → usuario (`~/.claude/CLAUDE.md`) → proyecto (`CLAUDE.md` o `.claude/CLAUDE.md`, en VCS) → local (solo vos en este proyecto); más `CLAUDE.md` de subdirectorios. Los imports `@path` organizan pero **no** reducen contexto. `.claude/rules/*.md` con frontmatter `paths:` carga solo al tocar archivos que matchean \[GE\].

**Modos de permiso** (Shift+Tab cicla):

| Modo | Qué corre sin preguntar | Uso |
| --- | --- | --- |
| Manual | Lecturas | Trabajo supervisado |
| Accept edits | Lecturas, ediciones, bash de archivos comunes | Iterar y revisar después |
| Plan | Solo lectura; propone | Explorar y planificar |
| Auto | Todo, con un clasificador que revisa *intención* (no corrección) | Manos libres + Stop hook con tests |
| Don't ask | Solo tools preaprobadas; el resto se niega sin prompt | CI y pipelines desatendidos |
| Bypass | Todo sin checks | Solo en contenedor o VM aislada |

**Sesiones largas:** plan mode para acotar; `/compact <instrucciones>` para guiar el resumen; *rewind* (doble Esc) para volver a un checkpoint; `/goal <condición verificable>` para trabajar hasta cumplirla; *loop* para sondear estado externo; *worktrees* para sesiones paralelas (`.worktreeinclude` copia archivos ignorados como `.env`).

**Automatización:** Routines (infra de Anthropic, trigger cron/HTTP/GitHub); headless `-p` (`--bare`, `--output-format json` + schema → `structured_output`); Agent SDK (Python/TS, función `query` con las mismas primitivas); Managed Code Review (no aprueba ni bloquea); GitHub Action `anthropics/claude-code-action@v1`; Plugins (skills, subagentes, hooks, MCP; namespaced; leer antes de instalar).

### B.13 AI Fluency: el marco 4D \[AF\]

AI Fluency = interactuar con IA de forma efectiva, eficiente, ética y segura. Tres modos: **Automation** (la IA ejecuta lo que indicás), **Augmentation** (colaboran), **Agency** (la IA actúa sola; vos le das forma a su conocimiento y conducta).

| Competencia | Qué es | Componentes |
| --- | --- | --- |
| Delegation | Decidir qué hace la IA, qué hacés vos y qué hacen juntos | Problem, Platform y Task awareness/delegation |
| Description | Comunicar con claridad | Product (qué), Process (cómo), Performance (cómo se comporta) |
| Discernment | Evaluar con criterio | Product, Process, Performance discernment |
| Diligence | Responsabilidad | Creation, Transparency, Deployment diligence |

Description y Discernment forman un loop: describir → evaluar → refinar. Límites a recordar: fecha de corte, alucinaciones, ventana de contexto, razonamiento complejo.

## C. Practical Workflows

Cada workflow sigue el mismo formato: cuándo, requisitos y herramientas, pasos, resultado y verificación, errores. El código completo de cada uno está en la sección D.

### C.1 Chat multi-turn sobre la API

**Cuándo:** cualquier app conversacional. **Requisitos:** API key en `.env` (fuera del VCS), `pip install anthropic python-dotenv`. **Herramientas:** SDK, servidor propio.

1. Cargar la key con `python-dotenv` y crear el cliente en el servidor.
2. Mantener una lista `messages` en tu código.
3. Agregar el mensaje del usuario, llamar a `messages.create`, agregar la respuesta del asistente.
4. Repetir enviando siempre la lista completa.
5. Fijar comportamiento persistente en `system`; `temperature` baja para datos, alta para creatividad.

**Resultado esperado:** respuestas coherentes con turnos previos. **Verificar:** preguntá algo que dependa del turno anterior. **Errores:** "olvida" lo dicho → no estás mandando el historial; costo creciente en charlas largas → resumí lo viejo y mantené literal lo reciente (B.1, H).

### C.2 Agente con tools (agentic loop)

**Cuándo:** la respuesta necesita datos externos o acciones, en una cantidad de pasos que no conocés. **Requisitos:** funciones Python que validan entradas; schemas con buenas descripciones.

1. Escribir cada tool function (nombres descriptivos, `raise` con mensaje claro).
2. Escribir su schema (`name`, `description` de 3–4 frases, `input_schema`).
3. Llamar a Claude con `tools=[...]`.
4. Agregar `response.content` completo al historial.
5. Si `stop_reason == "tool_use"`: ejecutar cada bloque `tool_use` con un dispatcher (`run_tool`), capturar excepciones, armar un `tool_result` por bloque (`tool_use_id`, `content` JSON, `is_error`), mandarlos todos en **un** mensaje `user`.
6. Repetir hasta `stop_reason != "tool_use"`.
7. Agregar tools nuevas = schema + caso en el dispatcher + función.
8. (Opcional) Agregar `batch_tool` para inducir llamadas paralelas.

**Verificar:** una pregunta que exija dos tools encadenadas ("¿qué día es dentro de 103 días?" → fecha actual + sumar duración). **Errores:** 400 por `tool_use` sin `tool_result` correspondiente; tool equivocada → mejorar descripciones; acción prohibida ejecutada → mover la regla a una precondición o hook (C.11).

### C.3 Extracción estructurada confiable

**Cuándo:** documentos no estructurados → JSON validado (escenario 6). **Herramientas:** tool con schema, `tool_choice`, Pydantic o JSON Schema, Batch API.

1. Definir el schema: `required` solo para datos siempre presentes; *nullable* para opcionales; enums con `"other"` + detalle y `"unclear"`.
2. Escribir el prompt con reglas de normalización (fechas ISO 8601, moneda como número + código) y 2–4 ejemplos few-shot de formatos distintos.
3. Llamar con `tool_choice={"type":"tool","name":"extract_x"}` y leer `content[0].input`.
4. Validar estructura y semántica (p. ej. suma de ítems = total; extraer `stated_total` y `calculated_total` y marcar `conflict_detected`).
5. Si falla: reintentar con documento + extracción anterior + error concreto. No reintentar si el dato no está en la fuente.
6. Enrutar por confianza: alta → automático; baja o ambigua → humano. Muestrear aleatoriamente incluso lo de alta confianza y medir precisión por tipo de documento y por campo.
7. Volumen y sin urgencia → Message Batches con `custom_id` por documento; reenviar solo los fallidos.

**Verificar:** precisión por campo contra un set etiquetado. **Errores:** valores inventados en campos `required`; 97% global que oculta 40% de error en un tipo de documento \[GE\].

### C.4 Pipeline de evals

**Cuándo:** antes de poner un prompt en producción y antes de cada cambio. **Herramientas:** Haiku para generar datos, graders de código y modelo.

1. Escribir el prompt v1.
2. Generar dataset con Claude (prefill ```` ```json ```` + stop ```` ``` ````) incluyendo `format` esperado si vas a validar sintaxis; guardar `dataset.json`.
3. `run_prompt` (interpola y llama) → `run_test_case` (llama y califica) → `run_eval` (recorre y junta).
4. Grader de modelo que devuelva fortalezas, debilidades, razonamiento y puntaje en JSON; grader de código para sintaxis.
5. Promediar; aplicar una técnica de prompting; re-evaluar; comparar versiones.

**Resultado:** un número objetivo por versión. **Errores:** probar a mano un par de veces y deployar (la trampa que señala el curso); grader que solo da número → notas medias poco informativas.

### C.5 RAG híbrido con reranking

**Cuándo:** preguntas sobre corpus grandes. **Requisitos:** key de Voyage AI (u otro modelo de embeddings), vector store, BM25.

1. Elegir chunking según garantías de formato (estructura si hay headers fiables; si no, tamaño con overlap).
2. (Recomendado) Contextual retrieval: generar contexto por chunk con Claude antes de indexar.
3. Embeddings + vector store guardando el texto como metadato; en paralelo, índice BM25.
4. En consulta: buscar en ambos y fusionar con RRF.
5. (Opcional) Reranking con Claude sobre los IDs candidatos.
6. Armar el prompt con los chunks dentro de tags XML; activar citations si el usuario debe verificar.

**Verificar:** consultas con términos exactos raros y con sinónimos ("ENG team" vs "engineering team"). **Errores:** chunk sin contexto recuperado por palabra ambigua ("bug" médico vs software).

### C.6 Activar prompt caching

**Cuándo:** mismo prefijo (tools, system, documentos) repetido entre requests. **Requisitos:** prefijo ≥ 1024 tokens.

1. Ordenar contenido estable primero: tools → system → mensajes fijos.
2. Poner `cache_control: {"type":"ephemeral"}` en la última tool (sobre una copia de la lista) y en el bloque de system en forma larga.
3. Hasta 4 breakpoints para capas (tools, system, documento, historial).
4. Mirar `usage`: primera llamada `cache_creation_input_tokens`, siguientes `cache_read_input_tokens`.

**Errores:** cache que nunca "pega" → algo cambia antes del breakpoint (timestamp en el system, orden de tools) o el prefijo es menor a 1024 tokens.

### C.7 Construir un servidor y un cliente MCP (Python)

**Requisitos:** SDK oficial `mcp`, `uv` (o pip), proyecto `cli_project.zip` del curso como base.

1. Servidor: definir tools con `@mcp.tool(name=..., description=...)` y `Field(description=...)`; validar y lanzar `ValueError` con mensaje claro.
2. Resources: `@mcp.resource("docs://documents", mime_type="application/json")` y plantillas `docs://documents/{doc_id}`.
3. Prompts: `@mcp.prompt(name=..., description=...)` que devuelva mensajes.
4. Probar con `mcp dev mcp_server.py` (Inspector): Connect → Tools/Resources/Prompts → ejecutar.
5. Cliente: envolver `ClientSession` en una clase con limpieza de recursos; `list_tools`, `call_tool`, `read_resource` (parsear según `mime_type`), `list_prompts`, `get_prompt`.
6. Integrar: pasar `list_tools()` a Claude y despachar sus `tool_use` con `call_tool`.

**Verificar:** el Inspector ejecuta cada tool y resource; el chat edita un documento real. **Errores:** recursos sin MIME correcto (el cliente no sabe deserializar); tools con descripciones genéricas.

### C.8 Configurar Claude Code para un equipo

1. `claude` en el repo y `/init` → genera `CLAUDE.md` del proyecto; editarlo: corto, específico y verificable.
2. Separar: convenciones permanentes en `CLAUDE.md` (con `@path` a estándares); convenciones por tipo de archivo en `.claude/rules/*.md` con `paths:`; procedimientos en `.claude/skills/<nombre>/SKILL.md`; reglas duras en hooks (`.claude/settings.json`).
3. Crear primero la skill de verificación (corre tests, lee el diff, chequea que no se debilitaron tests, reporta con evidencia).
4. MCP compartidos en `.mcp.json` con `${VARIABLES}` para secretos; personales en `~/.claude.json`.
5. Versionar `.claude/` y `.mcp.json`; preferencias personales en `~/.claude/` o memoria local.
6. (Opcional) Empaquetar todo como plugin con `.claude-plugin/plugin.json`.

**Verificar:** un compañero que clona el repo obtiene las mismas instrucciones, skills y servidores. **Errores:** reglas en `~/.claude/CLAUDE.md` que el equipo no recibe; CLAUDE.md largo que se sigue mal.

### C.9 Claude Code en CI/CD

1. Revisión de PRs sin construir nada → Managed Code Review (admin lo activa, instala la GitHub app, elige repos y triggers).
2. Algo más que revisión → `/install-github-app` y workflow con `anthropics/claude-code-action@v1` (`anthropic_api_key`, `trigger_phrase` `@claude`, `prompt`, `claude_args`).
3. En `claude_args`: tope de turnos, permission mode "don't ask", tools permitidas mínimas.
4. Scripts propios → `claude -p "..." --output-format json --json-schema '...'` (y `--bare` para corridas deterministas); leer `structured_output` con `jq`.
5. Revisión con instancia independiente de la que generó el código; en re-revisiones pasar hallazgos previos y pedir solo nuevos o no resueltos \[GE\].
6. Prompts con criterios explícitos y severidades con ejemplos para minimizar falsos positivos.

**Verificar:** exit code y JSON del run; comentarios inline con severidad. **Errores:** job colgado esperando aprobación (faltaba "don't ask" o `-p`); comentarios duplicados en cada push.

### C.10 Sesión larga o desatendida que podés firmar

1. Plan mode → leer el plan de verdad → aprobar.
2. Ejecutar en Auto (no Bypass) con un Stop hook que corre tests y devuelve exit 2 si fallan.
3. Guiar con `/compact <foco>`, rewind ante caminos erróneos, `/goal` cuando sepas describir "terminado".
4. Paralelizar en worktrees.
5. Al terminar: `/code-review`, luego `git diff` (no el resumen), confirmar que los tests corrieron, revisión en sesión o subagente limpio.

### C.11 Política de negocio + escalada a humano (soporte al cliente)

1. Tools: `get_customer`, `lookup_order`, `process_refund`, `escalate_to_human` con descripciones que delimiten uso.
2. Precondición programada: bloquear `lookup_order`/`process_refund` hasta tener `customer_id` verificado.
3. Hook antes de la tool: reembolso > umbral → denegar y redirigir a escalada.
4. Disparadores de escalada: pedido explícito de humano (inmediato), política que no cubre el caso, sin progreso tras intentos razonables, monto sobre umbral, varias coincidencias (pedir más datos, no adivinar). No usar sentimiento ni autoconfianza del modelo.
5. Handoff estructurado y autosuficiente (el humano no ve la conversación): ID, resumen, causa, acciones realizadas, monto, acción recomendada, motivo.
6. Mantener un bloque "case facts" en cada prompt.

### C.12 Investigación multiagente con citas

1. Coordinador: descompone el tema en coberturas sin solapamiento y lanza subagentes en paralelo (varias `Task` en una respuesta).
2. Prompt de cada subagente: tarea, datos necesarios, formato de salida con fuente, URL y fecha por afirmación.
3. Subagentes con tools mínimas para su rol; reintento local y error estructurado con resultados parciales.
4. Coordinador evalúa la síntesis y redirige huecos; conserva valores en conflicto con atribución.
5. Reporte con anotaciones de cobertura (completa / parcial y por qué) y formato por tipo de contenido.
6. Estado de cada agente en archivos (`agent-state/*.json` + manifest) para reanudar.

## D. Tools & Commands

Todo el código es Python 3.10+ con el SDK oficial `anthropic` salvo indicación; los bloques se validaron sintácticamente y los de MCP se ejecutaron. Los IDs de modelo cambian: tomalos de la página de modelos de docs.claude.com \[EXT\]. Lo marcado \[EXT\] no está en los cursos: verificalo en la documentación antes de producción.

### D.1 Cliente y helpers de chat \[API\]

```python
# pip install anthropic python-dotenv
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()                 # lee ANTHROPIC_API_KEY de .env (nunca al VCS)
client = Anthropic()
MODEL = "claude-sonnet-5-5"   # [EXT] confirmá el ID vigente

def add_user_message(messages, content):
    messages.append({"role": "user", "content": content})

def add_assistant_message(messages, content):
    messages.append({"role": "assistant", "content": content})

def chat(messages, system=None, temperature=1.0, stop_sequences=None, tools=None, tool_choice=None):
    params = {
        "model": MODEL,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature,
        "stop_sequences": stop_sequences or [],
    }
    if system:
        params["system"] = system
    if tools:
        params["tools"] = tools
    if tool_choice:
        params["tool_choice"] = tool_choice
    return client.messages.create(**params)

def text_from_message(message):
    return "\n".join(b.text for b in message.content if b.type == "text")

# Multi-turn: siempre se envía el historial completo
messages = []
add_user_message(messages, "Definí quantum computing en una oración.")
answer = chat(messages, system="Sos un tutor paciente. Das pistas, no soluciones.")
add_assistant_message(messages, answer.content)
add_user_message(messages, "Dame un ejemplo.")
print(text_from_message(chat(messages)))
```

### D.2 Prefill + stop sequence para salida limpia \[API\]\[GC\]

```python
import json

FENCE = "`" * 3                                     # evita escribir el fence literal
messages = []
add_user_message(messages, "Generá un JSON con 3 regiones de AWS y su código. Solo el JSON.")
add_assistant_message(messages, FENCE + "json")     # prefill: Claude continúa desde acá
resp = chat(messages, stop_sequences=[FENCE])       # corta al cerrar el bloque (no se incluye)
data = json.loads(resp.content[0].text.strip())
```

### D.3 Streaming \[API\]

```python
with client.messages.stream(
    model=MODEL, max_tokens=1000,
    messages=[{"role": "user", "content": "Escribí un haiku original sobre APIs."}],
) as stream:
    for text in stream.text_stream:     # solo los content_block_delta de texto
        print(text, end="", flush=True)
    final = stream.get_final_message()  # mensaje completo para guardar
```

### D.4 Agentic loop con tools \[API\]

```python
import json
from datetime import datetime, timedelta

def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    if not date_format:
        raise ValueError("date_format cannot be empty")
    return datetime.now().strftime(date_format)

def add_duration_to_datetime(datetime_str, days=0, input_format="%Y-%m-%d %H:%M:%S"):
    return (datetime.strptime(datetime_str, input_format) + timedelta(days=days)).strftime(input_format)

TOOLS = [
    {
        "name": "get_current_datetime",
        "description": "Returns the current local date and time formatted with a strftime pattern. "
                       "Use it whenever the user's request depends on today's date or the current time.",
        "input_schema": {
            "type": "object",
            "properties": {"date_format": {"type": "string", "description": "strftime pattern, e.g. %Y-%m-%d %H:%M:%S"}},
            "required": [],
        },
    },
    {
        "name": "add_duration_to_datetime",
        "description": "Adds a number of days to a datetime string and returns the resulting datetime. "
                       "Use it for date arithmetic instead of calculating dates yourself.",
        "input_schema": {
            "type": "object",
            "properties": {
                "datetime_str": {"type": "string", "description": "Start datetime, format %Y-%m-%d %H:%M:%S"},
                "days": {"type": "integer", "description": "Days to add (negative to subtract)"},
            },
            "required": ["datetime_str", "days"],
        },
    },
]

def run_tool(name, tool_input):
    if name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    if name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    raise ValueError(f"Unknown tool: {name}")

def run_tools(message):
    results = []
    for block in message.content:
        if block.type != "tool_use":
            continue
        try:
            output = run_tool(block.name, block.input)
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": json.dumps(output), "is_error": False})
        except Exception as e:                       # el error vuelve a Claude, que puede corregir
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": f"Error: {e}", "is_error": True})
    return results

def run_conversation(messages):
    while True:
        response = chat(messages, tools=TOOLS)
        add_assistant_message(messages, response.content)   # TODOS los bloques
        if response.stop_reason != "tool_use":              # única señal de fin
            return response
        add_user_message(messages, run_tools(response))     # todos los tool_result en un mensaje user

messages = [{"role": "user", "content": "¿Qué fecha será dentro de 103 días?"}]
print(text_from_message(run_conversation(messages)))
```

Batch tool para inducir paralelismo \[API\]\[AB\]:

```python
BATCH_TOOL = {
    "name": "batch_tool",
    "description": "Invoke multiple other tool calls simultaneously in a single step.",
    "input_schema": {
        "type": "object",
        "properties": {
            "invocations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Name of the tool to invoke"},
                        "arguments": {"type": "string", "description": "Tool arguments as a JSON string"},
                    },
                    "required": ["name", "arguments"],
                },
            }
        },
        "required": ["invocations"],
    },
}

def run_batch(invocations):
    return [{"tool_name": inv["name"], "output": run_tool(inv["name"], json.loads(inv["arguments"]))}
            for inv in invocations]
# En run_tool: if name == "batch_tool": return run_batch(tool_input["invocations"])
```

### D.5 Extracción con tool forzada + validación y reintento \[API\]\[GE\]

```python
# pip install pydantic
from typing import Literal, Optional
from pydantic import BaseModel, Field, ValidationError, model_validator

class LineItem(BaseModel):
    name: str
    price: float

class Invoice(BaseModel):
    invoice_number: str
    issue_date: str = Field(description="ISO 8601, YYYY-MM-DD")
    category: Literal["services", "goods", "other", "unclear"]
    category_detail: Optional[str] = None
    line_items: list[LineItem]
    stated_total: float

    @model_validator(mode="after")
    def totals_match(self):
        calc = round(sum(i.price for i in self.line_items), 2)
        if abs(calc - self.stated_total) > 0.01:
            raise ValueError(f"stated_total={self.stated_total} but sum(line_items)={calc}")
        return self

EXTRACT_TOOL = {
    "name": "extract_invoice",
    "description": "Record the structured data extracted from an invoice. Use null when a field is absent.",
    "input_schema": Invoice.model_json_schema(),   # una sola fuente de verdad para el schema
}

def extract(document, max_retries=2):
    messages = [{"role": "user", "content": f"<invoice>\n{document}\n</invoice>\n"
                 "Extract the invoice. Dates in ISO 8601. Do not invent values."}]
    for _ in range(max_retries + 1):
        resp = chat(messages, temperature=0, tools=[EXTRACT_TOOL],
                    tool_choice={"type": "tool", "name": "extract_invoice"})
        block = resp.content[0]
        try:
            return Invoice.model_validate(block.input)
        except ValidationError as e:
            # reintento con feedback: extracción previa + error concreto
            messages.append({"role": "assistant", "content": resp.content})
            messages.append({"role": "user", "content": [{
                "type": "tool_result", "tool_use_id": block.id, "is_error": True,
                "content": f"Validation failed: {e}. Re-check the document and call the tool again."}]})
    raise RuntimeError("Needs human review")   # enrutar a revisión humana
```

### D.6 Message Batches \[GE\]\[EXT\]

```python
import time

docs = {"inv-001": "...", "inv-002": "..."}
batch = client.messages.batches.create(requests=[
    {"custom_id": doc_id,
     "params": {"model": MODEL, "max_tokens": 1024,
                "messages": [{"role": "user", "content": f"Extract fields from: {text}"}]}}
    for doc_id, text in docs.items()
])
while client.messages.batches.retrieve(batch.id).processing_status != "ended":
    time.sleep(60)                                  # hasta 24 h; sin SLA de latencia

failed = []
for item in client.messages.batches.results(batch.id):
    if item.result.type == "succeeded":
        print(item.custom_id, item.result.message.content[0].text)
    else:
        failed.append(item.custom_id)               # reenviar solo estos (p. ej. troceados)
```

### D.7 Prompt caching \[API\]

```python
LONG_SYSTEM = "...instrucciones estables de más de 1024 tokens..."
tools_cached = [dict(t) for t in TOOLS]             # copia: no mutar los schemas originales
tools_cached[-1]["cache_control"] = {"type": "ephemeral"}

resp = client.messages.create(
    model=MODEL, max_tokens=1000,
    tools=tools_cached,                              # 1er breakpoint (orden: tools → system → messages)
    system=[{"type": "text", "text": LONG_SYSTEM,
             "cache_control": {"type": "ephemeral"}}],  # forma larga obligatoria
    messages=[{"role": "user", "content": "Hola"}],
)
print(resp.usage.cache_creation_input_tokens, resp.usage.cache_read_input_tokens)
```

### D.8 Features: thinking, imágenes, PDF, citations, web search \[API\]

```python
import base64

# Extended thinking (activar solo si las evals lo justifican)
resp = client.messages.create(
    model=MODEL, max_tokens=4000,
    thinking={"type": "enabled", "budget_tokens": 1024},   # mínimo 1024, max_tokens > budget
    messages=[{"role": "user", "content": "Diseñá un plan de migración en 5 pasos."}],
)
# resp.content: bloque "thinking" (con signature) o "redacted_thinking" + bloque "text". Devolvelos intactos.

# PDF con citations
with open("earth.pdf", "rb") as f:
    pdf_b64 = base64.standard_b64encode(f.read()).decode()
resp = client.messages.create(
    model=MODEL, max_tokens=1000,
    messages=[{"role": "user", "content": [
        {"type": "document",
         "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_b64},
         "title": "earth.pdf", "citations": {"enabled": True}},
        {"type": "text", "text": "¿Cómo se formó la atmósfera? Citá la fuente."},
    ]}],
)

# Imagen: bloque image + prompt con pasos y verificación
with open("prop.png", "rb") as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()
image_msg = {"role": "user", "content": [
    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
    {"type": "text", "text": "Analizá paso a paso: 1) densidad de árboles 2) acceso 3) alero del techo. Verificá cada conteo dos veces y asigná un riesgo de 1 a 4."},
]}

# Web search (Anthropic la ejecuta)
web_search = {"type": "web_search_20250305", "name": "web_search",
              "max_uses": 5, "allowed_domains": ["nih.gov"]}
resp = client.messages.create(model=MODEL, max_tokens=1500, tools=[web_search],
                              messages=[{"role": "user", "content": "Ejercicios para fortalecer rodillas"}])
```

### D.9 Fusión híbrida (RRF) \[API\]

```python
def reciprocal_rank_fusion(*ranked_lists, k=1):
    """Cada lista = ids ordenados por relevancia. score = Σ 1/(rank + k); el curso usa k=1 con rank desde 0."""
    scores = {}
    for ranked in ranked_lists:
        for rank, doc_id in enumerate(ranked):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (rank + k)
    return sorted(scores, key=scores.get, reverse=True)

print(reciprocal_rank_fusion(["doc2", "doc7", "doc6"], ["doc6", "doc2", "doc7"]))  # ['doc2', 'doc6', 'doc7']
```

### D.10 Servidor MCP (Python SDK) \[MCP\]

```python
# mcp_server.py  ·  pip install "mcp[cli]<2"   (código del curso = SDK v1)
from pydantic import Field
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.prompts import base

mcp = FastMCP("DocumentMCP", log_level="ERROR")
docs = {"deposition.md": "Testimony of Angela Smith...", "plan.md": "Steps for the project..."}

@mcp.tool(name="read_doc_contents", description="Read the contents of a document and return it as a string.")
def read_document(doc_id: str = Field(description="Id of the document to read")):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]

@mcp.tool(name="edit_document", description="Edit a document by replacing an exact string with a new string.")
def edit_document(
    doc_id: str = Field(description="Id of the document to edit"),
    old_str: str = Field(description="Exact text to replace, including whitespace"),
    new_str: str = Field(description="Replacement text"),
):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    docs[doc_id] = docs[doc_id].replace(old_str, new_str)

@mcp.resource("docs://documents", mime_type="application/json")
def list_docs() -> list[str]:
    return list(docs.keys())

@mcp.resource("docs://documents/{doc_id}", mime_type="text/plain")
def fetch_doc(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]

@mcp.prompt(name="format", description="Rewrites the contents of the document in Markdown format.")
def format_document(doc_id: str = Field(description="Id of the document to format")) -> list[base.Message]:
    return [base.UserMessage(
        f"Reformat the document <document_id>{doc_id}</document_id> as Markdown. "
        "Read it with read_doc_contents and save the result with edit_document.")]

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

**Versión del SDK \[EXT\]:** en `mcp` 2.x `FastMCP` pasó a llamarse `MCPServer` (`from mcp.server.mcpserver import MCPServer`) y cambiaron otras APIs; este código (probado con 1.30) requiere `mcp<2` o migrar con la guía oficial.

Probar: `mcp dev mcp_server.py` → abrir la URL → Connect → Tools / Resources / Prompts.

### D.11 Cliente MCP \[MCP\]

```python
import json
from contextlib import AsyncExitStack
from pydantic import AnyUrl
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClient:
    def __init__(self, command: str, args: list[str]):
        self._params = StdioServerParameters(command=command, args=args)
        self._stack = AsyncExitStack()
        self.session = None

    async def connect(self):
        read, write = await self._stack.enter_async_context(stdio_client(self._params))
        self.session = await self._stack.enter_async_context(ClientSession(read, write))
        await self.session.initialize()

    async def list_tools(self):
        return (await self.session.list_tools()).tools

    async def call_tool(self, name, tool_input):
        return await self.session.call_tool(name, tool_input)

    async def read_resource(self, uri: str):
        resource = (await self.session.read_resource(AnyUrl(uri))).contents[0]
        return json.loads(resource.text) if resource.mimeType == "application/json" else resource.text

    async def list_prompts(self):
        return (await self.session.list_prompts()).prompts

    async def get_prompt(self, name, arguments: dict):
        return (await self.session.get_prompt(name, arguments)).messages

    async def close(self):
        await self._stack.aclose()   # limpieza de recursos obligatoria
```

Para pasarle las tools a Claude: `[{"name": t.name, "description": t.description, "input_schema": t.inputSchema} for t in await client.list_tools()]`.

### D.12 Claude Code: comandos \[CCA\]\[API\]\[GE\]

| Comando | Qué hace |
| --- | --- |
| `claude` | Abre la sesión interactiva en el repo |
| `/init` | Escanea el código y crea `CLAUDE.md` |
| `#<nota>` | Agrega una nota a la memoria \[API\] |
| `/memory` | Abre los archivos de memoria para editar |
| `/compact <foco>` | Resume la conversación guiando qué conservar |
| Doble `Esc` | Menú de rewind (código, conversación o ambos; resumir desde/hasta aquí) |
| `/goal <condición>` · `/goal clear` | Trabaja hasta que un evaluador confirma la condición |
| Shift+Tab | Cicla modos de permiso |
| `/schedule <tarea>` | Crea una routine |
| `/code-review` · `/code-review --fix` | Revisa los cambios; `--fix` aplica correcciones localmente |
| `/install-github-app` | Instala la app y el secret para la GitHub Action |
| `/plugin install org@plugin` · `/reload-plugins` · `/plugin marketplace add org/repo` | Plugins |
| `claude mcp add <nombre> -- <comando>` | Agrega un servidor MCP (el curso lo muestra como `claude mcp add [nombre] [comando]`; \[EXT\] el separador `--` evita que flags del servidor se lean como de Claude) |
| `claude -p "<prompt>"` / `--print` | Headless: lee stdin, escribe stdout |
| `--output-format json --json-schema '<schema>'` | Salida validada en `structured_output` |
| `--bare` | Sin auto-descubrimiento de hooks, skills, plugins, MCP ni CLAUDE.md |
| `--resume <sesión>` | Retoma una sesión (con el ID capturado del JSON) |

```bash
# PR review en un script de CI
claude -p "Revisá el diff de este PR. Reportá solo bugs y seguridad." \
  --output-format json \
  --json-schema '{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"file":{"type":"string"},"line":{"type":"integer"},"severity":{"type":"string","enum":["critical","high","medium","low"]},"issue":{"type":"string"}},"required":["file","severity","issue"]}}},"required":["findings"]}' \
  | jq '.structured_output.findings'
```

### D.13 Claude Code: archivos de configuración

`CLAUDE.md` del proyecto (corto, verificable, reemplazos nombrados) \[CCA\]:

```markdown
# Proyecto Billing
- Comandos: `npm test` (unit), `npm run typecheck`.
- Rutas nuevas de API en src/api/handlers, una por archivo.
- Usar named exports, no default exports.
- IMPORTANT: toda migración se genera con `npm run db:migrate:new`, nunca a mano.
- Estándares de testing: @./standards/testing.md
```

`.claude/rules/api.md` con carga condicional \[GE\]:

```markdown
---
paths: ["src/api/**/*"]
---
Endpoints con async/await y manejo explícito de errores.
Cada endpoint devuelve el envoltorio de respuesta estándar.
```

`.claude/skills/verify/SKILL.md` \[CCA\]\[GE\]:

```markdown
---
name: verify
description: Use after editing code. Runs the test suite, reads the diff, checks no test was weakened, reports pass/fail with evidence.
allowed-tools: Read, Grep, Glob, Bash
---
1. Run `npm test` and `npm run typecheck`; capture the output.
2. Run `git diff` and list every changed file.
3. Check that no test was deleted, skipped or had its assertions loosened.
4. Report PASS/FAIL with the failing output quoted. Details: see reference.md.
```

Frontmatter útil \[GE\]: `context: fork` (corre aislada en subagente), `allowed-tools` (restringe), `argument-hint` (pide parámetro). Comandos legados en `.claude/commands/<nombre>.md` con `$ARGUMENTS` siguen funcionando \[API\].

`.claude/settings.json` con hooks \[CCA\]\[EXT para el formato exacto\]:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [ { "type": "command", "command": ".claude/hooks/block-push-main.sh" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [ { "type": "command", "command": "npm run lint --silent" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": ".claude/hooks/tests-gate.sh" } ] }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/block-push-main.sh — PreToolUse: decide por JSON con exit 0
cmd=$(jq -r '.tool_input.command // ""')
if echo "$cmd" | grep -Eq 'git push.*(origin )?main'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Never push to main; open a PR."}}'
fi
exit 0
```

```bash
#!/usr/bin/env bash
# .claude/hooks/tests-gate.sh — Stop: exit 2 bloquea y stderr vuelve a Claude
if ! npm test --silent > /tmp/test.log 2>&1; then
  tail -n 40 /tmp/test.log >&2
  exit 2
fi
exit 0
```

`.mcp.json` del proyecto (en VCS; secretos por variable) \[GE\]:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

Plugin mínimo \[CCA\]: `.claude-plugin/plugin.json` → `{"name": "team-setup", "version": "1.0.0", "description": "...", "author": "..."}` + `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json` en la raíz del plugin. Solo `name` es obligatorio.

### D.14 GitHub Action \[CCA\]

```yaml
name: Claude
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # [EXT] verificá nombres de flags en la doc de la CLI
          claude_args: "--max-turns 10 --allowedTools Read,Grep,Glob,Edit"
```

Para reportes programados: trigger `schedule` (cron) o `workflow_dispatch` y un `prompt`.

### D.15 Claude Agent SDK \[CCA\]\[EXT\]

El curso solo dice que el SDK (Python y TypeScript) expone `query` con prompt + opciones. Forma real aproximada (verificá en docs del Agent SDK):

```python
# pip install claude-agent-sdk
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition, HookMatcher

async def enforce_refund_limit(input_data, tool_use_id, context):
    if input_data["tool_input"].get("amount", 0) > 500:
        return {"hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": "Refunds over $500 need a human: call escalate_to_human."}}
    return {}

options = ClaudeAgentOptions(
    system_prompt="You coordinate research. Define goals and quality criteria for subagents.",
    allowed_tools=["Task", "Read", "WebSearch"],          # el coordinador necesita Task
    agents={
        "web-researcher": AgentDefinition(
            description="Searches the web and returns claims with source URL and date.",
            prompt="Return JSON: [{claim, source_url, publication_date}]. Report partial failures explicitly.",
            tools=["WebSearch", "WebFetch"],
        ),
    },
    hooks={"PreToolUse": [HookMatcher(matcher="mcp__support__process_refund",
                                      hooks=[enforce_refund_limit])]},
)

async def main():
    async for message in query(prompt="Investigá el impacto de la IA en la música.", options=options):
        print(message)

asyncio.run(main())
```

### D.16 Bedrock y Vertex \[AB\]\[GC\]

```python
# Bedrock (Converse API)
import boto3
br = boto3.client("bedrock-runtime", region_name="us-west-2")
resp = br.converse(
    modelId="<inference-profile-id>",           # usar perfil cross-region, no el ID directo
    messages=[{"role": "user", "content": [{"text": "Hola"}]}],
    inferenceConfig={"maxTokens": 500, "stopSequences": ["`" * 3]},
)
print(resp["output"]["message"]["content"][0]["text"])

# Vertex AI   ·  pip install "anthropic[vertex]"
from anthropic import AnthropicVertex
vx = AnthropicVertex(region="global", project_id="<gcp-project-id>")
msg = vx.messages.create(model="<vertex-model-id>", max_tokens=500,
                         messages=[{"role": "user", "content": "Hola"}])
print(msg.content[0].text)
```

## E. Decision Making

Regla de desempate en el examen \[GE\]: la respuesta correcta suele ser la **más determinista con el menor esfuerzo** que ataca la causa raíz. Desconfiá de opciones que agregan infraestructura (clasificadores, vector DB, capas de ruteo) cuando un cambio de descripción, schema o hook alcanza.

### E.1 ¿Dónde pongo esta regla?

| Si la regla... | Ponela en | Por qué |
| --- | --- | --- |
| Tiene consecuencia financiera, legal o de seguridad | Hook / precondición en código | Determinista; el prompt es probabilístico |
| Debe cumplirse en un orden (A antes que B) | Precondición programada o `tool_choice` forzado en el primer paso | Garantiza el orden |
| Exige confirmación previa (preview antes de ejecutar) | Dos tools: preview devuelve token de un solo uso; execute lo exige | La arquitectura impide saltearla \[GE\] |
| Es una convención de equipo que vale siempre | `CLAUDE.md` de proyecto | Siempre cargada, versionada |
| Aplica solo a ciertos archivos dispersos | `.claude/rules/` con `paths` | Carga condicional, ahorra contexto |
| Aplica a un directorio concreto | `CLAUDE.md` en ese subdirectorio | Alcance local |
| Es un procedimiento repetido | Skill | Solo la descripción ocupa contexto |
| Es preferencia personal | `~/.claude/CLAUDE.md` o memoria local | No afecta al equipo |
| Es tono o comportamiento de un asistente | System prompt | Persiste toda la conversación |

### E.2 ¿Workflow o agente?

| Pregunta | Sí → | No → |
| --- | --- | --- |
| ¿Conozco los pasos exactos? | Workflow | Agente |
| ¿Necesito testear y garantizar tasa de éxito alta? | Workflow | — |
| ¿La entrada varía mucho y requiere planificar? | Agente con tools genéricas | Workflow |
| ¿La tarea es de alto valor y bajo riesgo de error? | Apta para agente | Workflow + humano |

| Situación | Patrón |
| --- | --- |
| Prompt largo con restricciones que se incumplen | Chaining (generar → revisar → reescribir) |
| Tipos de entrada distintos | Routing |
| Varios criterios independientes | Parallelization + agregador |
| Salida verificable que se puede mejorar | Evaluator-optimizer |
| Revisión de PR con 10+ archivos | Pasada por archivo + pasada de integración \[GE\] |
| Investigación abierta | Descomposición dinámica: mapear primero, luego priorizar \[GE\] |

### E.3 ¿Qué método de salida estructurada?

| Necesidad | Método |
| --- | --- |
| Prototipo rápido o generación de datasets | Prefill + stop sequence |
| Producción, datos críticos | Tool con schema + `tool_choice` `tool` |
| Varios tipos de documento con extractores distintos | Varias tools + `tool_choice` `any` |
| Estructura que cambia seguido | Tool flexible `toJSON` |
| Errores de valores (no de sintaxis) | Validación + retry-with-feedback + self-correction |

### E.4 ¿API sincrónica o Message Batches? \[GE\]

| Tarea | Elección | Motivo |
| --- | --- | --- |
| Check de PR antes de merge, review interactiva | Sincrónica | Alguien espera |
| Reporte nocturno, auditoría semanal, 10.000 documentos | Batch | 50% de ahorro, puede tardar hasta 24 h |
| Flujo con varias vueltas de tool use | Sincrónica | Batch no soporta multi-turn con tools |
| Deadline en 30 h | Batch enviado como más tarde 6 h después del inicio | 30 − 24 = 6 h de margen |

### E.5 ¿Qué modo de permiso en Claude Code? \[CCA\]

| Trabajo | Modo |
| --- | --- |
| Explorar o planificar un cambio grande | Plan |
| Iterar código que revisás después | Accept edits |
| Sesión larga sin mirar | Auto + Stop hook con tests |
| CI, pipelines desatendidos | Don't ask (+ `-p`) |
| Contenedor o VM descartable | Bypass |

### E.6 ¿Cómo automatizo con Claude Code? \[CCA\]

| Necesidad | Opción |
| --- | --- |
| Mismo prompt en un trigger (cron, HTTP, GitHub) sin hostear nada | Routine |
| Review de cada PR con comentarios inline, sin construir nada | Managed Code Review |
| Implementar desde un comentario, reportes programados | GitHub Action |
| Pipeline propio con datos por stdin/stdout | Headless `-p` (`--bare` para determinismo) |
| Embeber Claude Code en tu producto | Agent SDK |
| Repartir tu setup al equipo | Plugin + marketplace privado |

### E.7 ¿Plan mode o ejecución directa? \[GE\]\[CCA\]

| Plan mode | Ejecución directa |
| --- | --- |
| Decenas de archivos, migraciones (45+ archivos) | Fix de un archivo con stack trace claro |
| Varios enfoques válidos o decisiones de arquitectura | Validación puntual, cambio bien entendido |
| Codebase desconocido | Tarea sin ambigüedad |

### E.8 Contexto largo: ¿qué técnica? \[GE\]

| Síntoma | Técnica |
| --- | --- |
| Se pierden montos, fechas, IDs al resumir | Bloque "case facts" fijo en cada prompt |
| Resultados de tools enormes | Recortar campos en un hook posterior a la tool |
| Hallazgos del medio ignorados | Clave al principio, acciones al final |
| Exploración que llena el contexto | Subagente Explore / delegar y recibir resumen |
| Sesión larga que se degrada | Scratchpad en archivo; `/compact` con foco |
| Historial de meses | Recuperación semántica de intercambios relevantes |
| Conversación de una sesión que crece | Híbrido: hechos estructurados + resumen + últimos turnos literales |
| Deriva de instrucciones tras varios turnos | Recordatorios periódicos; reemplazar reglas verbosas por few-shot |
| Reanudar con archivos cambiados | Sesión nueva con resumen en vez de `--resume` |

### E.9 ¿Qué tool integrada de Claude Code? \[GE\]

| Tarea | Tool |
| --- | --- |
| Encontrar archivos por nombre o patrón | Glob |
| Buscar contenido (función, error, import) | Grep |
| Leer un archivo | Read |
| Crear un archivo | Write |
| Cambio puntual con texto único | Edit (si falla por texto no único: Read + Write) |
| Comandos (git, tests, build) | Bash |

### E.10 RAG: ¿qué agrego?

| Problema | Agregar |
| --- | --- |
| No encuentra términos exactos o raros | BM25 + RRF |
| Orden de resultados flojo frente a la intención | Reranking con LLM |
| Chunks pierden referencia al documento | Contextual retrieval |
| Documento chico | Nada: ponelo entero en el prompt |

### E.11 Errores: ¿reintento o no? \[GE\]

| Categoría | Ejemplo | ¿Reintentar? | Acción |
| --- | --- | --- | --- |
| Transitorio | Timeout, 503 | Sí | Backoff dentro de la tool o del subagente |
| Validación | Formato inválido | No sin cambios | Corregir la entrada |
| Negocio | Límite excedido | No | Explicar y ofrecer alternativa |
| Permiso | Sin acceso | No | Escalar |
| Sin resultados | Búsqueda válida vacía | No es error | Informar "0 coincidencias" |

## F. Best Practices

### F.1 Seguridad

- **Obligatorio:** la API key vive en el servidor y en variables de entorno; `.env` en `.gitignore`; secretos de MCP como `${VAR}` en `.mcp.json` \[API\]\[GE\].
- **Obligatorio:** reglas de negocio críticas en hooks o precondiciones, nunca solo en el prompt \[GE\]\[CCA\].
- **Obligatorio:** Bypass permissions solo en contenedor o VM aislada; en desatendido, Auto o Don't ask \[CCA\].
- **Obligatorio:** leer cada hook, agente y servidor MCP de un plugin antes de instalarlo: corre con tus privilegios y sus hooks se suman a los tuyos. "Revisado" no es "confiable" \[CCA\].
- *Recomendado:* mínimo privilegio en tools: cada subagente solo con las de su rol; tools acotadas (`load_document` en vez de `fetch_url`) \[GE\].
- *Recomendado:* `web_search` con `allowed_domains` cuando la calidad de fuente importa \[API\].
- *Recomendado:* routines empujando solo a ramas `claude/` (por defecto) \[CCA\].
- *Recomendado:* acciones destructivas en dos pasos con token de confirmación \[GE\].

### F.2 Diseño de tools y MCP

- Descripción de 3–4 frases: qué hace, cuándo usarla y cuándo no, formato de entrada con ejemplo, qué devuelve, límites \[API\]\[GE\].
- Nombres y descripciones que no se solapen; si dos se confunden, renombrar o dividir \[GE\].
- 4–5 tools por agente; preferir tools genéricas y combinables para agentes \[GE\]\[API\].
- Validar entradas y devolver errores accionables; en MCP, `isError` + categoría + reintentable + mensaje \[API\]\[GE\].
- Reintento de errores transitorios dentro de la tool; devolver ya los no recuperables \[GE\].
- Para integraciones estándar (GitHub, Jira, Slack) usar servidores MCP existentes; propios solo para flujos únicos \[GE\].
- Si el agente prefiere tools integradas a tu MCP, reforzá la descripción MCP con lo que solo ella aporta \[GE\].
- Resources para datos de contexto (catálogos, esquemas) y así evitar llamadas exploratorias \[GE\]\[MCP\].

### F.3 Prompts

- Primera línea con verbo de acción; atributos de salida siempre; pasos solo si es complejo \[API\].
- Criterios explícitos y categóricos; severidades con ejemplos de código \[GE\].
- Contenido interpolado dentro de XML tags con nombres descriptivos \[API\].
- Ejemplos después de las instrucciones, con el porqué; cubrir casos borde \[API\].
- Ante muchas restricciones incumplidas: dividir en chaining, no repetir "NO hagas X" \[API\].
- Si hay alta tasa de falsos positivos en una categoría, desactivarla temporalmente: destruye la confianza en las precisas \[GE\].
- Ante pedidos ambiguos: declarar supuestos razonables y avanzar invitando correcciones; ante preferencias contradictorias del usuario: hacerlas explícitas y preguntar \[GE\].

### F.4 Calidad y evaluación

- Evals antes de deployar y antes de cada cambio; elegir mejoras por puntaje, no por intuición \[API\].
- Extended thinking solo si las evals muestran que el prompt optimizado no alcanza \[API\]\[AB\].
- Medir precisión por tipo de documento y por campo; muestreo aleatorio estratificado aun en alta confianza \[GE\].
- Revisión de código con instancia independiente; diff antes que resumen \[GE\]\[CCA\].
- Tests como gate con hook (Stop o PostToolUse), no como pedido en el prompt \[CCA\].

### F.5 Costo y latencia

- Elegir modelo por tarea (Haiku para volumen y datasets, Opus para razonamiento profundo) \[API\].
- Prompt caching para tools, system y documentos repetidos; contenido estable al principio \[API\].
- Batches para trabajo no urgente (50%) \[GE\].
- Recortar resultados de tools y resumir historial viejo \[GE\].
- RAG en vez de documentos enteros cuando el corpus es grande; reranking solo si la precisión lo justifica (suma latencia) \[API\].

### F.6 Claude Code en equipo

- CLAUDE.md corto: cada línea compite por atención; si no podés justificarla, borrala. Tratalo como código de producción \[CCA\].
- Reglas específicas y verificables; nombrar el reemplazo ("named exports, no default"); énfasis (`IMPORTANT`) solo en 2–3 reglas \[CCA\].
- Cuando Claude se equivoca, pedile "agregá eso a CLAUDE.md": es un bug report del archivo \[CCA\].
- Skills con `SKILL.md` liviano, profundidad en `reference.md` y scripts en la carpeta \[CCA\].
- Instrucciones del proyecto en el nivel proyecto (no usuario) para que el equipo las reciba \[GE\].
- Usar worktrees para trabajo paralelo \[CCA\]\[API\].
- Tres pasos para features: analizar archivos → planificar sin código → implementar; o TDD: proponer tests → elegir → código hasta que pasen \[API\].

### F.7 Uso responsable (AI Fluency) \[AF\]

- Delegar con conciencia del problema y de la plataforma; no automatizar todo.
- Verificar hechos clave en trabajo de alto impacto; pedir fuentes o nivel de confianza \[C101\].
- Ser transparente sobre el rol de la IA (diligence statement) y hacerse responsable del resultado publicado.

## G. Troubleshooting

**Diagnóstico en 4 pasos:** 1) mirá `stop_reason` y `usage` de la respuesta; 2) revisá el array `messages` que realmente enviaste; 3) reproducí con un caso de eval; 4) clasificá la causa: contexto, descripción, schema o regla que debería ser código.

### G.1 API y conversación

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Claude "olvida" lo dicho hace dos turnos | No se envía el historial | Agregar cada turno a `messages` y mandarlo completo | Helpers `add_user_message` / `add_assistant_message` |
| Costo y latencia crecen con los turnos | Historial completo en cada request | Resumir lo viejo, literal lo reciente, case facts; caching del prefijo | Presupuesto de tokens por conversación |
| Respuesta cortada | `stop_reason = max_tokens` | Subir `max_tokens` o continuar | Dimensionar según salida esperada |
| JSON con texto alrededor | Claude agrega encabezados | Prefill + stop sequence o tool con schema | Usar tool forzada en producción |
| Aperturas repetitivas ("¡Claro!") | Patrón de generación | Prefill con el inicio directo de la respuesta \[GE\] | — |
| Se desvía del system prompt tras varios turnos | Respuestas acumuladas diluyen las pautas | Recordatorios en puntos de corte; few-shot en lugar de reglas largas \[GE\] | Prompts de sistema concisos |
| Error de región o modelo en Bedrock | Modelo no hospedado en esa región | Usar inference profile cross-region \[AB\] | Tomar IDs de "cross region inference" |
| Funciona local y falla en prod | Config distinta (model ID, keys) | Automated debugging: logs → Claude → PR \[API\] | Config por entorno validada en CI |

### G.2 Tools y agentes

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Elige la tool equivocada | Descripciones mínimas o superpuestas | Ampliar descripciones con formatos, ejemplos y límites; renombrar | Revisar descripciones como código |
| Llama de más a una tool | System prompt la asocia ("siempre verificá") | Reformular la instrucción | Probar el prompt con evals |
| Saltea un paso obligatorio (12% de casos) | El orden depende del prompt | Precondición programada que bloquea la llamada siguiente \[GE\] | Reglas de orden en código |
| Error 400 con tools | Falta `tool_result` para un `tool_use`, ids que no coinciden o mensaje fuera de lugar | Un `tool_result` por cada `tool_use`, en el mensaje `user` siguiente | Dispatcher común `run_tools` |
| El loop no termina o termina antes | Se parsea texto o hay tope de iteraciones | Controlar por `stop_reason` | Tope solo como red de seguridad |
| Llamadas secuenciales que podrían ser paralelas | Claude rara vez emite varios `tool_use` | Batch tool \[API\]\[AB\] | — |
| Reintentos inútiles | Errores transitorios y de sintaxis devueltos igual | Reintento interno de transitorios; error de validación inmediato con detalle \[GE\] | Errores categorizados |
| Coordinador cree que no hubo resultados | Fallo silencioso devuelto como lista vacía | Distinguir "0 coincidencias" de "falló" | Error estructurado con parciales |
| Subagente responde sin contexto | No hereda historial | Pasar datos y resultados previos en su prompt | Plantilla de prompt de subagente |
| JSON de tool inválido al streamear | Fine-grained sin validación | Manejo de errores en el cliente | Modo por defecto si no hace falta inmediatez |

### G.3 Salida estructurada y extracción

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Valores inventados | Campo `required` sin dato en la fuente | Hacerlo nullable | Revisar `required` |
| Categorías forzadas | Enum sin salida | Agregar `"other"` + detalle y `"unclear"` | — |
| JSON válido con valores incoherentes | Error semántico | Validar reglas (sumas, fechas) y reintentar con el error | Normalización en el prompt |
| El reintento no mejora | El dato no está en el documento | Marcar ausente y enrutar a humano | Clasificar errores antes de reintentar |
| Precisión global alta pero quejas | Un tipo de documento falla mucho | Métricas por tipo y por campo | Muestreo estratificado |
| Fallan algunos del batch | Límite de contexto u otros | Reenviar por `custom_id`, troceando | Validar tamaño antes de enviar |

### G.4 RAG, caching y features

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Recupera chunks irrelevantes | Chunking pobre o palabra ambigua | Chunking por estructura; contextual retrieval | Evaluar retrieval por separado |
| No encuentra un término exacto | Solo búsqueda semántica | BM25 + RRF | Pipeline híbrido desde el inicio |
| Cache sin lecturas | Cambio antes del breakpoint, < 1024 tokens o expiró | Estabilizar prefijo; mirar `usage` | Contenido dinámico después del breakpoint |
| No se puede poner `cache_control` | Bloque en forma corta (string) | Forma larga `[{"type":"text",...}]` | Helper que siempre usa forma larga |
| Error con thinking | `max_tokens` ≤ budget o budget < 1024 | Ajustar valores | — |
| Conversación rota tras thinking | Se alteró o descartó el bloque firmado | Devolver thinking y redacted\_thinking intactos | — |
| Conteos erróneos en imágenes | Prompt simple | Pasos, re-conteo, ejemplos imagen-texto | Evals con imágenes |

### G.5 MCP

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| `ModuleNotFoundError: mcp.server.fastmcp` | SDK `mcp` 2.x | `pip install "mcp[cli]<2"` o migrar a `MCPServer` | Fijar versión en el lockfile |
| El cliente no ve tools o se cuelga | Sesión sin `initialize()` o servidor que imprime a stdout | Inicializar; logs a stderr con stdio | Probar primero en el Inspector |
| Resource devuelve texto en vez de objeto | MIME no es `application/json` | Declarar MIME y parsear por `mimeType` | — |
| Error genérico "Operation failed" | Sin estructura | `isError` + categoría + reintentable + detalle | Contrato de errores común |
| Compañero no tiene el servidor | Configurado en `~/.claude.json` | Moverlo a `.mcp.json` del proyecto | Servidores de equipo siempre en el repo |

### G.6 Claude Code

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Ignora reglas de CLAUDE.md | Archivo largo; reglas vagas | Recortar, hacer reglas verificables; mover duras a hooks | Revisar el archivo ante cada error |
| Nuevo integrante sin convenciones | Están en `~/.claude/CLAUDE.md` | Moverlas al CLAUDE.md del proyecto | — |
| Regla de tests no se carga | `paths` no matchea | Corregir el glob | Probar editando un archivo que matchee |
| El hook "bloquea" pero Claude sigue | Exit 1 (no bloquea) | Usar exit 2 o JSON `permissionDecision: deny` | Testear hooks con casos negativos |
| PostToolUse no evita la acción | Corre después de la tool | Usar PreToolUse para impedir | — |
| Contexto perdido tras compactar | Resumen sin foco | `/compact <foco>`; SessionStart con matcher `compact` para reinyectar estado | Scratchpad en archivo |
| Job de CI colgado | Espera aprobación o modo interactivo | `-p` + Don't ask + tools preaprobadas | Plantilla de workflow |
| Comentarios duplicados en el PR | Re-review sin historial | Pasar hallazgos previos y pedir solo nuevos | Managed Code Review deduplica |
| Resumen dice "todo ok" pero hay cambios inesperados | Se confió en el resumen | Empezar por `git diff`, confirmar que corrieron tests | Stop hook con tests |
| Sesiones paralelas se pisan | Mismo árbol de archivos | Worktrees (+ `.worktreeinclude`) | — |
| Resultados viejos tras `--resume` | Archivos cambiaron | Sesión nueva con resumen, o avisar qué cambió \[GE\] | — |
| Edit falla por texto no único | Coincidencia múltiple | Read + Write \[GE\] | Editar con más contexto |

## H. Practical Examples

Casos realistas organizados por los 8 escenarios del examen. Cada uno indica la decisión correcta y por qué fallan las alternativas típicas \[GE\]\[CCA\].

### H.1 Agente de soporte al cliente (escenario 1)

**Contexto:** devoluciones y disputas con `get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`; meta 80% de resolución en el primer contacto.

| Situación | Decisión | Por qué no las otras |
| --- | --- | --- |
| En 12% de los casos salta `get_customer` y reembolsa a la persona equivocada | Precondición que bloquea `lookup_order` hasta tener `customer_id` | Prompt, few-shot o clasificador siguen siendo probabilísticos |
| Confunde `get_customer` con `lookup_order` | Primero: ampliar descripciones de ambas | Es el arreglo de menor esfuerzo sobre el mecanismo de selección |
| Reembolsos > USD 500 deben aprobarse | Hook antes de la tool que deniega y redirige a escalada | Una instrucción puede fallar |
| "Quiero hablar con un gerente" | Escalar de inmediato | No intentar resolver primero |
| "¡Esto es un escándalo!" | Reconocer, ofrecer solución concreta; escalar si reitera | El enojo no es pedido de humano; el sentimiento no predice complejidad |
| Competidor 30% más barato, la política no lo cubre | Escalar por hueco de política | No improvisar descuentos |
| Dos clientes con el mismo nombre | Pedir un identificador adicional | Nunca adivinar |
| Resultados de `lookup_order` con 40+ campos | Recortar a los 5 relevantes en el hook posterior | Ahorra contexto y ruido |

Handoff al humano (autosuficiente):

```json
{
  "customer_id": "CUST-12345",
  "order_id": "ORD-67890",
  "issue_summary": "Producto dañado en la entrega; pide devolución total",
  "actions_taken": ["Identidad verificada (get_customer)", "Pedido confirmado (lookup_order)", "Se ofreció reemplazo: rechazado"],
  "refund_amount": 89.99,
  "recommended_action": "Aprobar devolución total",
  "escalation_reason": "Monto requiere aprobación / cliente pidió un gerente"
}
```

### H.2 Generación de código con Claude Code (escenario 2)

| Situación | Decisión |
| --- | --- |
| Migrar una librería en 45+ archivos | Plan mode → aprobar plan → ejecutar |
| Bug de un archivo con stack trace | Ejecución directa |
| "Nunca hagas push a main" | Hook PreToolUse, no CLAUDE.md |
| Mismo procedimiento de release tipeado dos veces | Skill con `SKILL.md` liviano + `reference.md` + scripts |
| Comando de equipo `/review` | `.claude/skills/review/SKILL.md` (o `.claude/commands/review.md`) en el repo |
| Variante personal de `/review` | `~/.claude/skills/` con otro nombre |
| Convenciones para todos los `*.test.tsx` dispersos | `.claude/rules/testing.md` con `paths: ["**/*.test.tsx"]` |
| Sabés describir "listo" mejor que los pasos | `/goal todos los tests de src/billing pasan y typecheck da 0 errores` |
| Tarea en un dominio desconocido (fintech, caché) | Patrón entrevista: que Claude pregunte antes de implementar |

### H.3 Investigación multiagente (escenario 3)

| Situación | Decisión |
| --- | --- |
| Subagentes repiten las mismas búsquedas | Coordinador reparte coberturas sin solapamiento |
| El subagente de búsqueda tuvo timeout en "música" | Error estructurado con parciales y alternativas; reporte con "COBERTURA PARCIAL" |
| Dos fuentes dan 12% y 8% | Conservar ambos valores con fuente, fecha y metodología; `conflict_detected` |
| La síntesis pierde de dónde salió cada dato | Afirmaciones como `{claim, source_url, publication_date}` |
| Fuente A (2023) 10% vs B (2024) 15% | Con fechas es tendencia, no contradicción |
| El coordinador sobre-divide en 30 microtareas | Prompt con objetivos y criterios de calidad, no pasos |

### H.4 Productividad de developers (escenario 4)

| Situación | Decisión |
| --- | --- |
| Entender un módulo de pagos desconocido | Grep puntos de entrada → Read → Grep usos → Read consumidores |
| La exploración llena el contexto | Subagente Explore que devuelve un resumen |
| Investigación de varios días | Scratchpad con hallazgos; `--resume` si nada cambió, sesión nueva con resumen si cambió |
| Comparar Redux vs Context API sobre la misma exploración | `fork_session` |
| Varias features a la vez | Una sesión por worktree |
| Leer PDFs y Word desde Claude Code | Servidor MCP propio: `claude mcp add` \[API\] |

### H.5 Claude Code en CI (escenario 5)

| Situación | Decisión |
| --- | --- |
| Review de cada PR sin construir nada | Managed Code Review (no aprueba ni bloquea) |
| Desarrolladores ignoran el bot por falsos positivos de estilo | Criterios explícitos (solo bugs y seguridad); desactivar categorías ruidosas |
| Review del código que generó la misma sesión | Instancia independiente |
| Auditoría de deuda técnica nocturna | Batch o routine; no la API sincrónica |
| Comentarios inline automáticos | `-p --output-format json --json-schema` y parsear `structured_output` |
| Errores que solo aparecen en producción | GitHub Action diaria: logs de CloudWatch → Claude deduplica y corrige → PR \[API\] |

### H.6 Extracción de datos estructurados (escenario 6)

| Situación | Decisión |
| --- | --- |
| JSON a veces inválido | Tool con schema + `tool_choice` forzado |
| "Total 150" pero ítems suman 145 | Extraer `stated_total` y `calculated_total`, marcar conflicto, reintentar con el error |
| Unidades informales ("dos puñados") | Few-shot con `original_text` y `precision: approximate` |
| 10.000 facturas para mañana | Message Batches con `custom_id` |
| Precisión 97% global | Desglosar por tipo de documento y campo antes de automatizar |

### H.7 IA conversacional (escenario 7) \[GE\]

| Situación | Decisión correcta |
| --- | --- |
| "Me encanta el jazz" y dos turnos después pregunta qué géneros te gustan | No se envían los mensajes previos en `messages` |
| 78.000 tokens con alergias y cantidades | Extraer hechos críticos estructurados + resumir lo general + últimos turnos literales |
| Solo conserva los últimos 25 pares | Híbrido: resumir lo viejo, literal lo reciente |
| Tres meses de sesiones, "¿qué concluimos sobre X?" | Recuperación semántica de intercambios relevantes |
| "Riesgo muy bajo" y "maximizar retornos" | Mostrar la contradicción y preguntar qué prioriza |
| "¿Podés ayudar con el informe?" con 40% de abandono por preguntas | Declarar supuestos razonables y avanzar invitando correcciones |
| Webhook: el paquete fue enviado mientras chatea | Anteponer el estado al próximo mensaje del usuario |
| Tono, razonamiento y preguntas aclaratorias | En el system prompt |
| `remove_team_member` con `dry_run` que el agente saltea | Dos tools: preview con token de un uso + execute que lo exige |
| `search_catalog`: 8% timeouts, 4% sintaxis | Reintento interno de timeouts; sintaxis devuelta ya con detalle |

### H.8 Herramientas de IA agéntica (escenario 8)

Sin cobertura en el material \[GE\]. Preparalo con B.10, B.11, C.2, C.12 y D.15: loop por `stop_reason`, tools genéricas y pocas, environment inspection, evals y hooks.

## I. Checklists

### I.1 Antes de poner un prompt en producción

- [ ] Primera línea con verbo de acción y salida esperada
- [ ] Atributos de salida (largo, formato, estructura) definidos
- [ ] Contenido interpolado dentro de XML tags descriptivos
- [ ] Ejemplos con casos borde y el porqué
- [ ] Criterios explícitos en vez de "sé cuidadoso"
- [ ] Dataset de eval y puntaje de la versión actual registrado
- [ ] Temperatura acorde (baja para extracción)
- [ ] Modelo elegido por tarea y costo estimado
- [ ] Caching en prefijos estables ≥ 1024 tokens

### I.2 Diseño de una tool o servidor MCP

- [ ] Nombre descriptivo y sin solaparse con otra tool
- [ ] Descripción: qué hace, cuándo sí y cuándo no, formato de entrada con ejemplo, qué devuelve
- [ ] `input_schema` con tipos, descripciones y `required` mínimos
- [ ] Validación de entradas con errores accionables
- [ ] Errores categorizados (transitorio, validación, negocio, permiso) y "sin resultados" distinto de "falló"
- [ ] Reintento interno de transitorios
- [ ] Acciones destructivas en dos pasos o detrás de un hook
- [ ] Probado en el MCP Inspector
- [ ] Configurado en `.mcp.json` con secretos como variables

### I.3 Agente o sistema multiagente

- [ ] Justificado frente a un workflow (pasos realmente impredecibles)
- [ ] Loop controlado por `stop_reason`; tope de iteraciones solo como red
- [ ] Todo `response.content` guardado en el historial; un `tool_result` por `tool_use`
- [ ] 4–5 tools por agente, acotadas a su rol
- [ ] Reglas críticas en hooks o precondiciones
- [ ] Subagentes reciben todo el contexto en su prompt y devuelven salida estructurada con fuentes
- [ ] Errores de subagente estructurados con resultados parciales
- [ ] Escalada a humano con disparadores claros y handoff autosuficiente
- [ ] Case facts y recorte de resultados para proteger el contexto
- [ ] Estado exportado para reanudar
- [ ] Evals del agente de punta a punta

### I.4 Pipeline de extracción

- [ ] Schema con nullables, enums con `other` y `unclear`
- [ ] `tool_choice` forzado
- [ ] Normalización (fechas, moneda, porcentajes) en el prompt
- [ ] Few-shot de varios formatos de documento
- [ ] Validación estructural y semántica (Pydantic)
- [ ] Retry-with-feedback solo para errores corregibles
- [ ] Enrutamiento por confianza y muestreo aleatorio de lo automático
- [ ] Métricas por tipo de documento y por campo
- [ ] Batches con `custom_id` y reenvío de fallidos

### I.5 RAG

- [ ] Estrategia de chunking elegida según el formato garantizado
- [ ] Contextual retrieval evaluado
- [ ] Índice vectorial + BM25 y fusión RRF
- [ ] Reranking solo si mejora en la eval
- [ ] Citations activadas si el usuario debe verificar
- [ ] Eval de retrieval separada de la de respuesta

### I.6 Repo listo para Claude Code en equipo

- [ ] `CLAUDE.md` de proyecto corto, con comandos y reglas verificables
- [ ] Convenciones por tipo de archivo en `.claude/rules/` con `paths`
- [ ] Skill de verificación en `.claude/skills/`
- [ ] Hooks: PreToolUse para reglas duras, PostToolUse para lint, Stop para tests
- [ ] `.mcp.json` compartido sin secretos
- [ ] Nada de equipo en `~/.claude/`
- [ ] (Opcional) Plugin con `plugin.json` y marketplace privado

### I.7 Antes de aceptar una corrida desatendida

- [ ] Corrió en Auto o Don't ask, no en Bypass (salvo contenedor aislado)
- [ ] `/code-review` ejecutado
- [ ] `git diff` leído, incluidos archivos fuera del plan
- [ ] Evidencia de que los tests corrieron y pasaron (hook, exit code, JSON)
- [ ] Revisión en sesión o subagente sin memoria de la construcción

### I.8 Día del examen

- [ ] Repasar A.2 (reglas de oro) y E (tablas de decisión)
- [ ] En cada pregunta: ¿cuál es la causa raíz y cuál es la solución más determinista y simple?
- [ ] Desconfiar de "agregar un clasificador", "vector DB" o "más instrucciones" cuando el problema es de orden o política
- [ ] Atención a preguntas de respuesta múltiple
- [ ] Responder todas (no hay penalización)

## J. Glossary

| Término | Definición |
| --- | --- |
| 4D Framework | Delegation, Description, Discernment, Diligence: competencias de AI Fluency \[AF\] |
| Agent SDK | Librerías Python/TS que embeben Claude Code en tu app; función `query` \[CCA\] |
| Agente | LLM con tools ejecutado en loop hasta lograr un objetivo; planifica sus pasos \[API\] |
| Agentic loop | Ciclo request → `tool_use` → ejecutar → `tool_result` → request, hasta `end_turn` |
| Auto mode | Modo de Claude Code que acepta todo con un clasificador que revisa intención, no corrección \[CCA\] |
| Batch tool | Tool que agrupa varias invocaciones para inducir paralelismo \[API\] |
| BM25 | Búsqueda léxica que pondera términos raros \[API\] |
| Cache breakpoint | Bloque con `cache_control`; se cachea todo hasta él (máx. 4) \[API\] |
| Case facts | Bloque estructurado de hechos clave que se repite en cada prompt \[GE\] |
| Chaining | Workflow de pasos secuenciales enfocados \[API\] |
| Chunking | Dividir documentos para RAG: por tamaño, estructura o semántica \[API\] |
| Citations | Referencias a la fuente: `page_location` (PDF) o `char_location` (texto) \[API\] |
| CLAUDE.md | Archivo de instrucciones siempre cargado; niveles managed, usuario, proyecto, local y subdirectorio \[CCA\] |
| Code execution | Tool de servidor: Python en contenedor sin red \[API\] |
| Contextual retrieval | Agregar a cada chunk un contexto generado antes de indexar \[API\] |
| Coordinador / subagente | Hub-and-spoke: el coordinador descompone, delega y agrega; los subagentes tienen contexto aislado \[GE\] |
| Cosine similarity / distance | Similitud entre vectores (−1 a 1) / 1 − similitud \[API\] |
| `custom_id` | Identificador de cada request en un batch para correlacionar resultados \[GE\] |
| Don't ask | Modo que solo corre tools preaprobadas y niega el resto sin preguntar; para CI \[CCA\] |
| Embedding | Vector numérico que representa el significado de un texto \[API\] |
| Environment inspection | Observar el estado tras cada acción (screenshot, leer archivo) \[API\] |
| Eval | Medición objetiva de un prompt con dataset y grader \[API\] |
| Evaluator-optimizer | Productor + evaluador en loop hasta aceptar \[API\] |
| Extended thinking | Razonamiento previo con presupuesto de tokens (≥ 1024), bloque firmado \[API\] |
| Few-shot / multi-shot | Incluir ejemplos de entrada y salida en el prompt \[API\] |
| Files API | Subir archivos una vez y referenciarlos por `file_id` \[API\] |
| Fine-grained tool streaming | Streaming de argumentos de tools sin validación previa del JSON \[API\] |
| `fork_session` | Ramificar una sesión desde una base común para comparar enfoques \[GE\] |
| Grader | Calificador de evals: código, modelo o humano \[API\] |
| Handoff | Resumen estructurado y autosuficiente al escalar a un humano \[GE\] |
| Headless | Claude Code no interactivo con `-p` \[CCA\] |
| Hook | Código determinista en un evento del ciclo (PreToolUse, PostToolUse, Stop, SessionStart...) \[CCA\] |
| Inference profile | ID de Bedrock que enruta a una región donde está el modelo \[AB\] |
| `isError` | Bandera MCP que marca un resultado de tool como fallido \[GE\] |
| Lost in the middle | Tendencia a ignorar información del medio de un contexto largo \[GE\] |
| `max_tokens` | Límite de seguridad de tokens generados \[API\] |
| MCP | Model Context Protocol: protocolo cliente-servidor para exponer tools, resources y prompts \[MCP\] |
| MCP Inspector | Debugger web de servidores MCP (`mcp dev`) \[MCP\] |
| Message Batches | API asíncrona: 50% más barata, hasta 24 h, sin multi-turn con tools \[GE\] |
| Plan mode | Modo de solo lectura que investiga y propone un plan \[CCA\] |
| Plugin | Paquete instalable de skills, subagentes, hooks y servidores MCP \[CCA\] |
| Prefill | Mensaje `assistant` inicial que Claude continúa \[API\] |
| Prompt caching | Reutilizar el procesamiento de un prefijo idéntico \[API\] |
| Provenance | Preservar la atribución afirmación → fuente → fecha \[GE\] |
| RAG | Retrieval Augmented Generation: recuperar fragmentos relevantes y pasarlos al prompt \[API\] |
| Redacted thinking | Bloque de thinking cifrado por seguridad que se devuelve intacto \[API\] |
| Reranking | Reordenar candidatos con un LLM \[API\] |
| Resource (MCP) | Datos de lectura expuestos por URI, directos o con plantilla \[MCP\] |
| Rewind | Volver a un checkpoint de la sesión (doble Esc) \[CCA\] |
| Routine | Prompt + repos + conectores que corre en la infraestructura de Anthropic por trigger \[CCA\] |
| Routing | Workflow que clasifica la entrada y la deriva a un pipeline especializado \[API\] |
| RRF | Reciprocal Rank Fusion: `Σ 1/(rank + 1)` para fusionar rankings \[API\] |
| Scratchpad | Archivo donde el agente anota hallazgos para no reinvestigar \[GE\] |
| Skill | Carpeta con `SKILL.md` (nombre, descripción, procedimiento) que se carga bajo demanda \[CCA\]\[C101\] |
| `stop_reason` | Motivo de fin: `end_turn`, `tool_use`, `max_tokens`, `stop_sequence` |
| Stop sequence | Cadena que corta la generación y no se incluye \[API\] |
| System prompt | Instrucciones de rol y comportamiento en el parámetro `system` \[API\] |
| `Task` | Tool del coordinador para lanzar subagentes \[GE\] |
| Temperature | Aleatoriedad de 0 (determinista) a 1 \[API\] |
| Text Editor tool | Tool con schema de Anthropic para operaciones de archivo que implementás vos \[API\] |
| Token | Fragmento de texto que procesa el modelo \[API\] |
| `tool_choice` | `auto`, `any` o una tool específica \[API\] |
| `tool_result` / `tool_use` | Bloques de resultado (en mensaje user) y de pedido de tool (en mensaje assistant) \[API\] |
| Workflow | Serie predefinida de llamadas a Claude \[API\] |
| Worktree | Copia de trabajo de git en otra carpeta para sesiones paralelas \[CCA\] |

### Fuentes

- Material de los 7 cursos de la carpeta "3 - Claude Certified Architect - Foundations" (lecciones y notas oficiales de cada curso, notebooks).
- `guide_es.md` (guía de estudio comunitaria basada en la guía oficial del examen).
- Ficha del examen en la página Claude Certified Architect – Foundations de Anthropic Academy (60 preguntas, 120 min, USD 125).
- [Documentación de Claude](https://docs.claude.com) para lo marcado \[EXT\].
