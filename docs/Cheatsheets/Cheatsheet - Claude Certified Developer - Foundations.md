# Cheatsheet profesional - Claude Certified Developer Foundations

Nov 10, 2026 · @Sebastian Larrauri

Esta es una guía de consulta para llevar una integración con Claude de prototipo a producción. Cubre los 5 módulos del curso: M1 MSO Foundations, M2 Prompting, Agents & Tool Use, M3 Claude Code, MCP & Integration, M4 Production Engineering, Evals & Security y M5 Accelerators & IP Contribution.

## Índice y convenciones

1. **A. Quick Reference**: números, límites, headers beta, códigos de estado y reglas de oro.
2. **B. Core Knowledge**: modelo mental de cada capa (API, prompting, tools, contexto, agentes, Claude Code, MCP, evals, seguridad, plataformas).
3. **C. Practical Workflows**: 12 procedimientos paso a paso con verificación y errores frecuentes.
4. **D. Tools & Commands**: código y configuraciones listos para adaptar.
5. **E. Decision Making**: tablas para elegir modelo, patrón, memoria, transporte, plataforma y más.
6. **F. Best Practices**: recomendaciones de producción y seguridad.
7. **G. Troubleshooting**: síntoma → causa → solución → prevención.
8. **H. Practical Examples**: los casos y postmortems del curso, resueltos.
9. **I. Checklists**: listas reutilizables antes de cada entrega.
10. **J. Glossary**: términos y acrónimos.

**Marcas usadas en todo el documento:**

| Marca | Significado |
| --- | --- |
| **\[Obligatorio\]** | Requisito estructural de la API o regla sin la cual el sistema falla. |
| **\[Recomendado\]** | Buena práctica que el curso indica como default. |
| **\[Opcional\]** | Mejora que depende del caso. |
| **\[Verificar\]** | El curso advierte que el dato cambia: confirmar en platform.claude.com, code.claude.com o trust.anthropic.com antes de construir. |
| **\[Externo\]** | Contexto agregado que no está en el material del curso. |
| (M2) | Módulo de origen del contenido. |

> El curso se declara contenido educativo y aclara que productos, IDs de modelo, headers beta y precios cambian rápido. Todo valor marcado \[Verificar\] debe confirmarse en la documentación oficial al momento de construir.

## A. Quick Reference

Lo mínimo que hay que recordar: todo se mide en tokens, la ventana de contexto es un presupuesto fijo, la salida no es determinista y cada decisión de producción se valida con un eval.

### A.1 Reglas de oro

1. **Diagnosticá antes de re-promptear.** El tipo de falla indica qué técnica falta; reescribir no arregla una falla estructural (M2).
2. **Cada `tool_use` necesita un `tool_result` con el mismo ID en el turno de usuario inmediatamente siguiente** \[Obligatorio\] (M2).
3. **Los thinking blocks vuelven a la API sin modificar** en loops con tools; editarlos rompe la firma \[Obligatorio\] (M2).
4. **Un stream que termina no es un mensaje completo.** Solo `message_stop` cierra el mensaje; recién ahí se guarda en el historial (M2).
5. **Toda tool necesita una condición de exclusión** en su descripción: cuándo usarla y cuándo no (M2).
6. **Si una tool puede hacer algo irreversible, lleva HITL antes de ejecutarse**, definido en el diseño (M2, M3).
7. **Una instrucción en el prompt o en CLAUDE.md es una convención; un hook es un control.** Lo que debe cumplirse siempre va en un hook (M3, M4).
8. **Los secretos nunca van en archivos commiteados.** Un secreto commiteado se considera comprometido y se rota (M3).
9. **El contenido externo es dato, nunca instrucción.** El límite real está en lo que el agente puede hacer, no en la redacción del prompt (M4, M5).
10. **Primero el eval, después el cambio.** Cambiá una variable por vez y promové versiones solo si superan el baseline (M4, M5).
11. **Fijá (pin) el ID completo del modelo en lo que va a producción** y conservá la versión anterior para rollback (M5).
12. **Empezá por lo más simple:** una llamada, luego un workflow, luego un agente; Sonnet por defecto (M2, M4).

### A.2 Números y límites que cita el curso

| Concepto | Valor | Fuente | Estado |
| --- | --- | --- | --- |
| Ventana de contexto | Al menos 200k tokens en modelos actuales de la API; 1M por defecto en los flagship más nuevos (Fable incluido) | M2 | \[Verificar\] |
| Message Batches: tamaño | Hasta 100.000 requests o 256 MB por batch, lo que ocurra primero | M2 | \[Verificar\] |
| Message Batches: latencia | Hasta 24 h (a menudo mucho menos), orden de resultados arbitrario | M1, M2 | \[Verificar\] |
| Message Batches: descuento | Menor costo por token; el checkpoint de M4 lo cita como \~50% | M4 | \[Verificar\] |
| Prompt caching: breakpoints | Hasta 4 por request | M2, M3 | \[Verificar\] |
| Prompt caching: TTL | 5 min por defecto (se renueva con cada lectura); 1 h opcional con `ttl: "1h"` | M3, M4 | \[Verificar\] |
| Prompt caching: mínimo | 1.024 tokens en la mayoría de los modelos actuales; varía por modelo | M3, M4 | \[Verificar\] |
| Prompt caching: precio | Escritura 1,25x (TTL 5 min) o 2x (TTL 1 h) del input base; lectura 0,1x | M4 | \[Verificar\] |
| Structured outputs | Primera llamada con un schema nuevo es más lenta; la gramática compilada se cachea 24 h desde el último uso | M2 | \[Verificar\] |
| Costo de imágenes | ⌈ancho/28⌉ × ⌈alto/28⌉ tokens visuales; 1000×1000 px ≈ 1.296 tokens | M2 | \[Verificar\] límites por modelo |
| MCP en Claude Code | Definiciones diferidas por defecto (tool search); modo opt-in carga todo si entra en \~10% de la ventana | M3 | \[Verificar\] |
| CLAUDE.md | Riesgo de dilución por encima de \~200-300 líneas; auditar si supera unos cientos | M3 | Recomendado |
| Descripción de tool | 3 a 4 oraciones: qué hace, cuándo usarla, qué devuelve | M2 | Recomendado |
| Multi-agente orquestador-worker | \~15x los tokens de un chat normal (caso reportado por Anthropic) | M4 | \[Verificar\] |
| Hook Notification | Se dispara al pedir permiso o tras 60 s de inactividad | M3 | \[Verificar\] |
| Tool outputs en producción | Suelen ser 3 a 5 veces más largos que los fixtures de desarrollo | M2 | Regla empírica |

### A.3 Headers beta mencionados

| Feature | Header | Notas |
| --- | --- | --- |
| MCP Connector de la API (`mcp_toolset`) | `mcp-client-2025-11-20` | Solo servidores remotos HTTP (M2) |
| Skills en Messages API | `code-execution-2025-08-25` + `skills-2025-10-02` | El skill corre en el contenedor de code execution (M2, M3) |
| Claude Managed Agents | `managed-agents-2026-04-01` | Beta pública; sin ZDR ni HIPAA BAA (M2, M3) |
| Files API | (beta, header no especificado en el curso) | No disponible en Bedrock ni Vertex AI (M2) |

Todos los headers son \[Verificar\]: se versionan y cambian al pasar a GA.

### A.4 Códigos de estado y `stop_reason`

| Señal | Significado | Acción |
| --- | --- | --- |
| 429 | Rate limit | Reintentar con backoff exponencial + jitter; respetar `retry-after` |
| 529 | Servicio sobrecargado (lado Anthropic) | Reintentar con backoff; fallback si persiste |
| 500, 502, 503, 504 | Error de servidor / timeout | Reintentar con backoff |
| 400 | Request inválido (incluye input mayor que la ventana) | Fallar rápido; corregir el request |
| 401 / 403 | Autenticación / permisos | Fallar rápido |
| 404 | Recurso inexistente (ej. modelo mal escrito) | Fallar rápido |
| `stop_reason: end_turn` | Claude terminó | Devolver la respuesta |
| `stop_reason: tool_use` | Claude pide tools | Ejecutar y devolver `tool_result` |
| `stop_reason: max_tokens` | Corte por límite de salida (puede dejar JSON incompleto) | No parsear como válido; ajustar `max_tokens` o reintentar |
| `stop_reason: refusal` | El modelo rechazó (llega como HTTP 200) | No reintentar; registrar y escalar |
| `stop_reason: model_context_window_exceeded` | Se alcanzó el techo de contexto durante la generación | Recortar o resumir historial antes del próximo turno |

### A.5 Defaults que el curso recomienda

| Decisión | Default |
| --- | --- |
| Modelo | Sonnet; subir a Opus o bajar a Haiku solo con evidencia de un eval |
| Razonamiento | Apagado para clasificación, extracción y formato; adaptive thinking con `effort` calibrado para tareas multi-paso |
| Prompting | Zero-shot; agregar ejemplos solo si la estructura falla |
| Transporte de respuesta | Síncrono para backend corto; streaming si hay un usuario mirando; Batches para volumen offline |
| Permission mode en Claude Code | `default` o `plan` en código desconocido; `acceptEdits` en trabajo local de confianza |
| Transporte MCP | stdio si es local; Streamable HTTP si es remoto o compartido |
| Patrón | Workflow, salvo que el camino no se pueda enumerar |

## B. Core Knowledge

El curso es una sola historia: algo que funcionó en desarrollo tiene que sobrevivir producción. Cada capa de abajo previene una falla concreta que en desarrollo no aparece.

| Módulo | Capa | Falla que previene |
| --- | --- | --- |
| M1 | Fundamentos del modelo y de la API | Tests frágiles, presupuestos de contexto mal estimados, patrón de request equivocado |
| M2 | Prompting, tools, streaming, contexto, agentes, memoria, multimodal | Parser roto, tool equivocada, historial corrupto, ventana llena, escritura irreversible sin revisión |
| M3 | Claude Code, contexto durable, plugins, MCP, auth enterprise | Borrado fuera de alcance, reglas diluidas, plugin que solo anda en la máquina del autor, clave filtrada |
| M4 | Evals, tests, fallas, costos, seguridad | Regresión silenciosa, caída por 429, factura inesperada, prompt injection |
| M5 | Aceleradores, contribución, plataformas, versionado, trust boundaries | Reconstruir desde cero, PR sin revisar, alias que cambia, rechazo por residencia |

### B.1 Cómo se comporta un LLM (M1)

- **Token**: unidad de input, output, costo y presupuesto. Todo cuenta: prompt, historial, definiciones de tools, resultados de tools y la respuesta. La relación caracteres/token depende del tokenizer de cada generación \[Verificar\].
- **Ventana de contexto**: presupuesto fijo por request que contiene todo a la vez. Tiene dos comportamientos de borde:
  - Input ya mayor que la ventana → error de validación antes de generar.
  - Input que entra pero la generación alcanza el techo → devuelve lo generado con `stop_reason: model_context_window_exceeded`.
  - En ningún caso la API trunca silenciosamente lo más viejo: **recortar o resumir es trabajo de tu aplicación**.
- **Sampling**: en cada paso el modelo muestrea de una distribución. `temperature` baja = más repetible; alta = más variada. Temperatura 0 no garantiza salidas idénticas.
- **Parámetros de sampling en modelos nuevos**: los modelos Claude más nuevos rechazan `temperature`, `top_p` o `top_k` no default con error 400; se guía el comportamiento con el prompt \[Verificar\].
- **No determinismo**: no testees texto exacto. Assert sobre propiedades (campo presente, valor en rango, estructura parseable) y usá un eval con juez para el significado.

### B.2 Modelos y razonamiento (M1, M2, M4)

| Tier | Rol |
| --- | --- |
| Fable | El más capaz: razonamiento, código y trabajo agéntico más exigente |
| Opus | Trabajo exigente por encima del alcance de Sonnet |
| Sonnet | Default balanceado para la mayoría de producción |
| Haiku | Velocidad y costo, en tareas dentro de su alcance |

- **Elegir modelo y activar razonamiento son decisiones separadas** que se combinan. El modelo elige el miembro de la familia; el razonamiento se configura por request.
- **Adaptive thinking** (modelos actuales): el modelo decide cuánto pensar; se ajusta la profundidad con un `effort`, no con un presupuesto fijo. `budget_tokens` está deprecado y en las generaciones más nuevas devuelve 400 \[Verificar\].
- En los modelos más nuevos el contenido del thinking se omite por defecto; para verlo se pide un resumen con la opción de display. Algunos modelos piensan de forma adaptativa por defecto \[Verificar\].
- **Los tokens de thinking cuestan como tokens de output.** Úsalo en problemas multi-paso, planificación y loops agénticos; no en lookups ni clasificación.
- Un modelo superior a veces es más rápido y barato si llega a la respuesta con menos tokens (M4).

### B.3 Modos de prompting (M1)

| Modo | Qué incluye | Cuándo |
| --- | --- | --- |
| Zero-shot | Instrucción sin ejemplos | Tarea simple, forma de salida obvia |
| One-shot | Un par input→output | La forma tiene un detalle que la descripción no fija |
| Multi-shot (few-shot) | Varios pares | Estructura, mayúsculas o casos borde que siguen fallando |

Los ejemplos no son entrenamiento: viven en el prompt y cuestan tokens en cada llamada. Agregá el mínimo que da un resultado confiable. Un modelo más capaz suele resolver zero-shot lo que uno chico necesita con ejemplos.

### B.4 Cómo se accede a Claude (M1)

| Patrón | Qué es | Cuándo |
| --- | --- | --- |
| REST directo | HTTP + API key + JSON | Cualquier lenguaje sin SDK |
| SDK oficial (Python, TypeScript, otros) | Capa fina sobre la misma API: auth, construcción de requests, reintentos, parseo | Opción por defecto |
| Síncrono | Esperás la respuesta completa | Respuestas cortas, backend sin usuario esperando |
| Streaming (SSE) | La respuesta llega en eventos | Respuesta larga o usuario mirando |
| Async/await | `AsyncAnthropic` en Python; en TypeScript el cliente ya es Promise-based | Concurrencia sin bloquear el hilo |
| Message Batches API | Envío masivo, se obtiene un ID y se hace polling | Volumen offline donde importa el costo, no la latencia |

No confundas el **Anthropic SDK** (wrapper de la API, sin loop de agente) con el **Claude Agent SDK** (`claude-agent-sdk` en Python, `@anthropic-ai/claude-agent-sdk` en TypeScript), que ejecuta el mismo loop que Claude Code.

### B.5 Prompting de producción (M2)

Las cuatro técnicas estructurales y la falla que corrige cada una:

| Lo que observás | Lo que falta | Por qué lo arregla |
| --- | --- | --- |
| Forma incorrecta (frase en vez de etiqueta, prosa en vez de JSON) | **Output constraint** | Fija forma, campos, tipos, límites, preámbulo y qué hacer si falta el dato |
| Contenido o alcance que se desvía, peor a medida que avanza la conversación | **System prompt** más específico | Es el contrato de comportamiento persistente: rol, alcance, formato |
| Tarea correcta pero estructura inventada | **Few-shot examples** | Muestran el patrón en lugar de describirlo |
| Bien en lo testeado, se rompe en una variante | **Constraint o ejemplo que cubra la variante** | El prompt solo cubría el happy path |
| Instrucciones y datos mezclados | **XML tags** descriptivos (`<my_code>`, `<docs>`, `<ticket>`) | Hacen inequívoco el límite; no hace falta usar nombres "oficiales" |

Señal de alarma: si el prompt crece con cada pasada y tres re-prompts seguidos no funcionaron, dejá de agregar texto y diagnosticá. Un prompt verboso también produce salidas verbosas y sube la latencia sin mejorar la precisión.

**Structured outputs** mueven el control de formato del prompt a la API mediante *constrained decoding*:

| Modo | Qué restringe | Cómo se activa | Cuándo |
| --- | --- | --- | --- |
| JSON outputs | La respuesta final | `output_config.format` con `type: json_schema` y tu schema | El modelo produce el payload que consume tu código |
| Strict tool use | Los argumentos que Claude pasa a una tool | `strict: true` en la definición de la tool | Loops agénticos donde un argumento malformado rompe la función |

Costos y límites: primera llamada con schema nuevo más lenta (compilación de gramática, cache de 24 h), más tokens de input (la API inyecta un system prompt de formato), **no garantiza éxito** ante `refusal` o `max_tokens` (seguí chequeando `stop_reason`) y **no se combina con prefill** del mensaje del asistente.

### B.6 Tool use (M2)

**Claude no ejecuta las tools.** Lee las definiciones, decide cuál usar y devuelve un `tool_use`; tu aplicación la ejecuta, devuelve el resultado y hace una nueva request. El modelo no guarda estado entre llamadas.

&#91;embedded content: loop de tool use · 6 pasos, 1 decisión\]

El loop solo avanza si tu código devuelve cada `tool_result` con el ID exacto en una nueva request; el gate HITL va antes de ejecutar, nunca después.

| Bloque | Rol | Contiene | Regla crítica |
| --- | --- | --- | --- |
| `text` | Assistant | Prosa | Si viene junto a un `tool_use`, guardá el array completo en el historial |
| `tool_use` | Assistant | `name`, `id` único, `input` | Debe responderse con `tool_result` del mismo ID en el turno de usuario inmediatamente siguiente |
| `tool_result` | User | `tool_use_id`, `content`, `is_error` opcional | El ID debe coincidir exactamente; la API empareja por ID, no por posición |
| `thinking` (y `redacted_thinking`) | Assistant | Razonamiento con firma | Devolverlo sin cambios; editar, resumir o quitar rompe la firma |

Anatomía del schema: `name` específico (`get_account_balance`, no `get_data`), `description` con cuándo usarla y **cuándo no**, `input_schema` en JSON Schema con `required` solo para lo indispensable. Claude enruta por nombre + descripción; los tipos de parámetros son señal secundaria. Si dos tools necesitan descripciones cada vez más largas para distinguirse, fusionalas en una con un parámetro de tipo.

- **Paralelo vs secuencial**: los modelos actuales emiten varias `tool_use` en un turno cuando son independientes; tu código las ejecuta en concurrencia y devuelve todos los `tool_result` juntos. Si hay dependencia real, modelala como turnos separados. `disable_parallel_tool_use` fuerza una por turno.
- **MCP como alternativa** a escribir schemas: el cliente MCP pide `ListToolsRequest`, recibe las tools y se las pasa a Claude; el loop no cambia. Cuidado: las definiciones ocupan contexto aunque no se usen.

### B.7 Streaming (M2)

| Evento | Qué señala | Qué hace tu handler |
| --- | --- | --- |
| `message_start` | Empieza el mensaje (shell vacío + usage inicial) | Inicializar array de contenido |
| `content_block_start` | Abre un bloque (`text`, `tool_use`, `thinking`) con su `index` | Crear el slot; `tool_use` trae `name` e `id`, sin input |
| `content_block_delta` | Fragmento de texto, de JSON (`input_json_delta`) o de thinking | Acumular; el JSON parcial no se parsea todavía |
| `content_block_stop` | Bloque completo | Finalizar; recién acá se parsea el input de la tool |
| `message_delta` | `stop_reason` y usage final | Registrar `stop_reason` |
| `message_stop` | Fin del stream | El mensaje está completo; recién acá se agrega al historial |

Si el stream se corta antes de `message_stop`: descartá el turno parcial, no lo guardes, y reintentá desde el último turno completo.

### B.8 Context engineering (M2, M3)

| Estrategia | Qué hace | Cuándo | Qué perdés |
| --- | --- | --- | --- |
| **Pruning** | Volvés a un mensaje anterior y descartás lo posterior | Camino improductivo o debugging que no sirve para lo que sigue | Lo aprendido después del punto de retroceso |
| **Compaction** (`/compact` en Claude Code; compaction server-side en la API, beta; o resumen manual) | Resume el historial | Cerca del techo y seguís en la misma tarea | Detalles que el resumen no capturó |
| **Clearing** (`/clear`; nueva sesión en la API) | Contexto vacío | La próxima tarea no tiene relación | Todo; lo persistente va en CLAUDE.md o storage |
| **Subagent handoff** | Subagente con contexto aislado y solo lo que necesita | Subtarea autocontenida, sobre todo exploración | Visibilidad del camino intermedio |

Dos palancas de costo sobre lo que ya está en contexto:

- **Prompt caching**: `cache_control: {"type": "ephemeral"}` en el último bloque a cachear (cachea todo hasta ahí). Orden de procesamiento: tools → system → messages. El prefijo debe ser idéntico: un carácter cambiado invalida. También existe un modo automático con un flag a nivel de request, recomendado como punto de partida (M4) \[Verificar\].
- **Token counting**: el endpoint `count_tokens` recibe el mismo body que `messages` y devuelve el conteo sin inferencia. Úsalo para validar supuestos con outputs reales y para bloquear requests que no entran.

**RAG** (M2, M3): almacena el material fuera de la ventana y trae solo lo relevante.

| Variante | Cómo encuentra el contexto | Ventaja | Costo |
| --- | --- | --- | --- |
| RAG clásico (fetch-once) | Índice de embeddings construido antes | Inspeccionable y testeable | Infraestructura de índice que sincronizar y asegurar; puede quedar desactualizado |
| Búsqueda agéntica (search-across-rounds) | El modelo busca en el momento, en varias rondas | Lee los archivos actuales, sin índice | Más tokens y latencia por consulta; menos inspeccionable |

Tres puntos de quiebre del RAG: **chunking** (por oración o sección con algo de solapamiento), **match de embeddings** (semántico; para identificadores exactos sumá búsqueda léxica) y **ensamblado en el prompt** (si llega mal formado, el modelo responde de memoria).

### B.9 Agentes (M2)

Un agente es un loop multi-paso de tool use con contexto gestionado y un objetivo definido. Antes de construirlo, preguntá si el problema lo necesita.

| Elegí workflow si… | Elegí agente si… |
| --- | --- |
| Podés enumerar los pasos en código | Podés especificar el objetivo y las tools, pero no el camino |
| El costo de error es real y necesitás guardrails por paso | El camino no se puede enumerar de antemano |
| Necesitás observabilidad con herramientas estándar | El no determinismo es aceptable y las tools acotan las acciones |
| Los inputs son un conjunto conocido | Los inputs varían en contenido y estructura |
| Siempre se sigue la misma secuencia | La tarea requiere secuenciar tools de forma creativa |

Progresión recomendada: una llamada → workflow → agente. Sub-patrones de workflow citados como fuente: chaining, routing, parallelization y evaluator-optimizer (artículo "Building Effective Agents").

**Los 4 pasos del loop** (iguales en cualquier vía): registrar tools, fijar un system prompt acotado a la tarea, manejar el loop de tool use y definir condiciones de salida que no dependan de que Claude decida parar.

| Vía de cableado | Quién corre el loop | Qué es tuyo | Ojo con |
| --- | --- | --- | --- |
| Messages API directa | Tu código, cada iteración | Todo: loop, tools, contexto, reintentos, salida | Mantenimiento completo |
| Claude Agent SDK | El SDK, en tu proceso (Python o TypeScript) | Ejecución de tools y la aplicación | Fijar `settingSources` / `setting_sources` explícitamente |
| Claude Managed Agents (beta) | Anthropic, con sandbox | La capa de aplicación y la definición del agente como recurso versionado | Sesiones guardadas server-side: no elegible para ZDR ni HIPAA BAA |

**HITL**: la pregunta que lo ubica es *¿cuál es el peor resultado si este paso corre sin revisión humana?*

| Punto de inserción | Disparador | Riesgo |
| --- | --- | --- |
| Antes de una tool destructiva | write, delete, send | Alto: irreversible |
| Después de planificar | Plan listo para ejecutar | Medio: plan incorrecto |
| Ante output inesperado | Error, resultado vacío, valor fuera de rango | Variable |

**Orquestación de tools**: el sobre-tooling (registrar todo "por las dudas") degrada la selección; el sub-tooling obliga a inventar caminos. Empezá con el mínimo y agregá ante una brecha confirmada.

**Restricciones reguladas** (deciden endpoint, credenciales y logs antes del diseño):

| Restricción | Qué descarta | Qué suele aprobarse |
| --- | --- | --- |
| Secreto profesional abogado-cliente | Superficies de consumo no auditables; endpoints no aprobados | API/SDK desde la app de la firma, SSO, gateway LLM aprobado con logging completo; la app debe implementar el logging de conversaciones |
| HIPAA (PHI) | Endpoints o rutas sin BAA para esa configuración | API en configuración con BAA (org HIPAA dedicada provista por Anthropic) o Bedrock/Vertex en cuenta HIPAA-eligible. El BAA no cubre Console, Workbench, features beta ni planes de consumo |
| GDPR / residencia | Rutas sin región fijada; endpoint global sin región | Bedrock o Vertex con región fijada. La API directa no ofrece residencia en la UE |
| FedRAMP / gobierno | Endpoints fuera de entornos autorizados (incluso en dev/test) | Claude for Government (FedRAMP High vía PFCS-SS), Bedrock GovCloud (FedRAMP High, DoD IL4/5), Vertex AI Assured Workloads. Claude Enterprise en AWS Marketplace no es FedRAMP |
| Política interna de residencia | Clouds fuera de la lista aprobada | La ruta del proveedor ya aprobado |

Todo lo de esta tabla es \[Verificar\] en trust.anthropic.com y con el equipo de cuenta.

### B.10 Memoria y Skills (M2)

| Scope de memoria | Qué persiste | Costo | Cuándo | Qué perdés |
| --- | --- | --- | --- | --- |
| In-context | Estado dentro de la sesión | Sin latencia; el costo crece con cada turno | Sesiones cortas que no sobreviven un reinicio | Todo al terminar la sesión |
| Storage externo | Estado en una base, se lee al iniciar o bajo demanda | Latencia por lectura + lógica de lectura/escritura | Continuidad entre sesiones, usuarios o instancias | Nada; pagás latencia y complejidad |
| Memoria resumida | Resumen inyectado al iniciar la siguiente sesión | Menos tokens que reenviar todo | Agentes conversacionales largos | Lo que el resumidor no conservó |
| Stateless | Nada | Ninguno | Jobs independientes que terminan y cierran | Todo el contexto previo |

La decisión de memoria se toma en diseño: el curso estima \~20 minutos en diseño contra \~1 hora de refactor bajo presión en producción. Medí historial + system prompt + schemas de tools contra el límite antes de elegir in-context.

**Skill** = archivo `SKILL.md` (frontmatter con `name` y `description` + instrucciones). Al inicio solo se cargan nombre y descripción; el cuerpo entra al contexto solo si la descripción coincide con el pedido.

| Patrón | Cuándo carga | Costo de contexto | Ideal para |
| --- | --- | --- | --- |
| Skill | Bajo demanda, por match de descripción | Bajo | Expertise específica: formatos de dominio, checklists de revisión, workflows de un subconjunto de tareas |
| CLAUDE.md | Cada sesión, siempre (en el CLI) | Fijo por sesión | Estándares siempre vigentes: convenciones, reglas de formato, restricciones |
| Instrucciones in-context | Cada turno de esa sesión | Crece con la sesión | Trabajo exploratorio de una sola conversación |

**Los subagentes no heredan Skills ni historial**, pero sí heredan el contexto de permisos del padre. Si un subagente necesita un Skill, listalo explícitamente en su configuración.

### B.11 Multimodal y Batches (M2)

| Método | Cómo funciona | Cuándo |
| --- | --- | --- |
| Base64 inline | Bytes codificados en el bloque | Imagen de un solo uso |
| URL | URL pública y estable; Claude la descarga al procesar | Ya está alojada en una URL pública que controlás. No sirve para URLs con auth o firmadas que expiran |
| Files API (beta) | Subís una vez, recibís `file_id`, lo referenciás | Mismo archivo en muchas requests o turnos, o archivo grande. No disponible en Bedrock ni Vertex AI \[Verificar\] |

PDFs usan un bloque `document` (no `image`) con la misma estructura de `source` (base64, URL o `file_id`); `title` y `context` son opcionales. En prompts de visión, indicá cómo resolver ambigüedades visuales (superposición, profundidad, oclusión).

Batches: un loop de llamadas síncronas en chunks **no es batching**; produce las mismas llamadas y los mismos rate limits. Usá `custom_id` para emparejar resultados, que vuelven en orden arbitrario.

### B.12 Claude Code (M3)

**Loop explore → plan → code**: lee y traza el código, propone un plan, y solo después de aprobado edita y ejecuta. `plan` mode retiene al agente en exploración.

| Permission mode | Auto-aprueba | Sigue pidiendo confirmación | Uso |
| --- | --- | --- | --- |
| `default` | Solo lecturas | Toda edición y comando de shell | Proyecto nuevo o desconocido |
| `acceptEdits` | Lecturas, ediciones y `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed` dentro del directorio de trabajo | Otros comandos, escrituras fuera del directorio, rutas protegidas | Trabajo local de confianza donde el shell necesita ojo humano |
| `plan` | Solo lecturas; investiga y propone | Toda edición y comando hasta aprobar el plan | Código sensible o desconocido |
| `auto` | Todo, con un clasificador que revisa cada acción | Bloquea por defecto deploys y migraciones a prod, borrados masivos, exfiltración de credenciales, force-push a main | Menos prompts sin perder red de seguridad. Research preview: depende de plan, modelo y admin \[Verificar\] |
| `dontAsk` | Solo tools del allow list + comandos de solo lectura | Niega todo lo demás, sin cola de confirmación | CI y scripts cerrados |
| `bypassPermissions` | Todo, sin chequeos; quita también la protección de rutas protegidas | Solo `rm -rf /` y `rm -rf ~` piden confirmación | Solo en contenedor o VM descartable |

**Niveles de settings** (de mayor a menor autoridad):

| Nivel | Archivo | Alcance |
| --- | --- | --- |
| Enterprise | `managed-settings.json` (admins) | Toda la organización; no se puede sobrescribir |
| Proyecto | `.claude/settings.json` (commiteado) | Todos los que clonan el repo |
| Local de proyecto | `.claude/settings.local.json` (git-ignored automático) | Tus overrides en ese proyecto |
| Usuario | `~/.claude/settings.json` | Todos tus proyectos |

Las reglas allow/deny se aplican sobre el modo. **Deny siempre gana sobre allow** (precedencia deny > ask > allow). Un deny a nivel enterprise no lo quita ningún desarrollador y aplica incluso en modo bypass.

**Contexto durable**:

| Mecanismo | Qué carga | Cuándo | Costo | Qué va acá |
| --- | --- | --- | --- | --- |
| `CLAUDE.md` (raíz) | El archivo completo al inicio de sesión; `/init` genera uno inicial | Siempre | Persistente; se diluye con el tamaño | Restricciones universales, comandos de test, convenciones del framework, rutas prohibidas |
| Rules (`.claude/rules/*.md`) | El archivo; acotado con `paths` en el frontmatter YAML | Al trabajar con archivos que coinciden; sin `paths` carga siempre | Solo al activarse si tiene `paths` | Guía específica de una parte del código |
| Hooks | Ejecutan tu script; no agregan contenido | En el evento configurado | Mínimo | Guardrails obligatorios, efectos automáticos, auditoría |
| Subagentes | Solo el contexto de la tarea | Cuando la sesión principal delega | Devuelve un resumen | Exploración e investigación; tareas paralelizables |

El acotamiento de rules viene del frontmatter, no de la carpeta: las subcarpetas de `.claude/rules/` solo organizan.

**Eventos de hook**:

| Evento | Cuándo | Puede bloquear | Uso típico |
| --- | --- | --- | --- |
| `PreToolUse` | Antes de ejecutar una tool | Sí: exit code 2 + motivo en stderr (o `permissionDecision: "deny"`) | Control de acceso, límites de escritura |
| `PostToolUse` | Después de ejecutarla | No | Formatter, tests, log de auditoría |
| `UserPromptSubmit` | Al enviar un prompt, antes de procesarlo | — | Inyectar contexto, validar el pedido |
| `Stop` | Al terminar de responder | — | Notificaciones, limpieza, commit del log |
| `Notification` | Pedido de permiso o 60 s de inactividad | — | Enrutar alertas |
| `SessionStart` / `SessionEnd` | Al iniciar o reanudar / al cerrar | — | Validar entorno / escrituras finales |

Se configuran en los archivos de settings con `/hooks`: evento + `matcher` opcional (tipo de tool) + comando.

**Subagentes integrados**: Explore y Plan **no cargan CLAUDE.md ni git status** (para ser rápidos); general-purpose sí. Si una regla de CLAUDE.md debe respetarse, usá general-purpose o un subagente custom (`.claude/agents`) que liste los skills que necesita en su frontmatter.

**Empaquetado**:

| Capa | Qué es | Para quién | Cuándo |
| --- | --- | --- | --- |
| Skill | `SKILL.md` en `.claude/skills`; carga por match o con `/skill-name` | Individuo o equipo | Procedimiento que debe quedar fuera del contexto hasta que se necesite |
| Custom command | Atajo explícito. Hoy se recomienda un skill con `disable-model-invocation: true`; `.claude/commands/` es legacy | Quien quiere un punto de entrada predecible | Procedimiento frecuente con nombre claro |
| Plugin | Bundle versionado de skills, hooks, subagentes y servidores MCP, distribuido por marketplace | Equipo que necesita instalación en un paso | Setup que vive en una máquina y hay que compartir |

Los comandos de un plugin llevan su nombre como prefijo (`/payments:run-tests`); renombrar el plugin renombra todos sus comandos. El marketplace oficial de Anthropic viene incluido; se agregan otros con `/plugin marketplace add <owner/repo>`. En enterprise, un allowlist de marketplaces limita las fuentes y `extraKnownMarketplaces` en managed settings los registra para todos \[Verificar nombres exactos\].

**Cómo corre un mismo skill en cada runtime**:

| Runtime | Cómo carga | Dónde corre | Qué configurar |
| --- | --- | --- | --- |
| Claude Code | Descubierto en `.claude/skills` | Tu terminal, bajo el permission mode y las deny rules | `SKILL.md` con descripción que coincida |
| Messages API | Enviado con la request | Contenedor de code execution de Anthropic | Headers `code-execution-2025-08-25` y `skills-2025-10-02`; sin depender de archivos ni tools locales |
| Agent SDK | Lo carga el agente si `settingSources` lo permite | Tu proceso | `settingSources` explícito, ej. `["user", "project", "local"]` o `[]` aislado |
| Managed Agents | Definido en el recurso del agente, server-side | Sandbox de Anthropic | Header `managed-agents-2026-04-01`; los skills se adjuntan al definir el agente |

### B.13 MCP (M2, M3)

Un servidor MCP es un proceso que expone **tools** (acciones), **resources** (datos de solo lectura por dirección: directos o con template de parámetro) y **prompts** (plantillas de instrucción mantenidas en el servidor). Lo construyes una vez y cualquier cliente MCP lo usa. El soporte de resources varía por cliente \[Verificar\].

| Transporte | Dónde corre | Uso |
| --- | --- | --- |
| stdio | Subproceso local; stdin/stdout | Herramienta local o personal |
| Streamable HTTP | Remoto; POST cliente→servidor y stream SSE opcional por GET | Servidores compartidos o alojados (recomendado para todo lo no local) |
| SSE (solo) | — | Legacy, deprecado |

El MCP Connector de la API solo soporta servidores HTTP remotos; para stdio necesitás gestionar el cliente con el SDK, o usar Claude Desktop o Claude Code como cliente.

| Scope | Dónde se guarda | Quién lo carga |
| --- | --- | --- |
| Local | `~/.claude.json` bajo la ruta del proyecto | Solo vos, en ese proyecto |
| User | Tu configuración personal de Claude | Solo vos, en todos tus proyectos |
| Project | `.mcp.json` en la raíz del repo (commiteado) | Todos los que clonan; cada uno ejecuta el servidor stdio en su máquina y necesita el runtime (ej. Node para `npx`) |
| Enterprise | Configuración administrada | Toda la organización |

Permisos por tool individual: `mcp__<servidor>__<tool>` (ej. allow `mcp__github__create_issue`). Un deny sobre una tool gana sobre un allow del servidor. En la API, `mcp_toolset` controla qué tools ve el modelo (`enabled`) y cuándo se cargan (`defer_loading`), con `default_config` y overrides en `configs` por nombre de tool.

### B.14 Autenticación enterprise (M3)

| Tipo de servicio | Auth | Dónde vive el secreto | Log | Quién bloquea la config |
| --- | --- | --- | --- | --- |
| Remoto con identidad de usuario (SaaS) | OAuth (el servidor devuelve 401 y el cliente abre el login en el navegador; ej. Linear) | Token emitido y guardado por el cliente | Hook `PostToolUse` a log de auditoría | Admin vía managed settings |
| Remoto con identidad de servicio (API interna) | API key en variable de entorno (ej. GitHub con PAT como Bearer) | Solo en el entorno; en CI la inyecta el runner | Hook `PostToolUse` | Admin vía managed settings |
| Local (filesystem, DB local) | Permisos del filesystem, stdio | No hay credencial; deny rules | Hook `PostToolUse` | Deny rules enterprise |

Tres prácticas de secretos: **separación** (la config tiene una referencia, nunca el valor), **ubicación** (variable de entorno si es local y efímera; secret store si es compartido o auditado) y **rotación** (programada e inmediata ante sospecha). Además: alcance mínimo por credencial y registro de qué servicios usan cada una.

Los redirect URIs de OAuth se registran por host: que funcione en staging no implica que producción esté autorizada. Muchos clientes enterprise exigen apps OAuth separadas por entorno.

### B.15 Evals, tests y tracing (M4)

**Design document primero.** Una página con cuatro decisiones que alimentan cada capa:

| Decisión | Se convierte en |
| --- | --- |
| Criterios de éxito (verificables, no "resumí el hilo") | Casos del eval |
| Manejo de fallas (cada error: reintentable o terminal, y qué recibe el usuario) | Rutas de error |
| Presupuesto de costo y latencia + piso de confiabilidad | Instrumentación y límite de optimización |
| Trust boundary (qué input es externo, acciones mínimas) | Datos tratados como datos + hooks |

**Eval** = casos + comportamiento esperado + calificación. Se escribe antes del feature. Un primer puntaje de 2-3/10 es normal; lo que importa es que suba. Cambiá una sola cosa por vez y mirá el desglose por caso: un promedio estable puede esconder 3 arreglos y 3 roturas.

| Tipo de tarea | Grader | Detecta | No sirve para |
| --- | --- | --- | --- |
| Una sola respuesta correcta | Exact / string match | Respuesta incorrecta; costo casi nulo | Cualquier paráfrasis o reordenamiento |
| Salida estructurada o código | Code-graded check (parsear JSON, `ast.parse`, rango, campo requerido) | Formato y sintaxis | Saber si el contenido es bueno |
| Calidad abierta | LLM-as-judge con rúbrica | Fidelidad, seguimiento de instrucciones, completitud, tono | Es ruidoso y caro; no vale nada sin calibrar |

El juez debe devolver fortalezas, debilidades y razonamiento antes del puntaje; sin eso tiende a un 6. **Calibralo** contra casos etiquetados por humanos y medí el acuerdo; si es bajo, ajustá la rúbrica. Cobertura le gana a perfección: más casos con algo de ruido revelan más que pocos casos perfectos. Claude puede generar casos a partir de un set etiquetado; revisalos a mano.

| Nivel de test | Aísla | No detecta |
| --- | --- | --- |
| Unit | Una función (parser, wrapper de tool) | Cómo encajan las piezas |
| Functional | Una llamada a Claude devuelve la forma esperada | El sistema alrededor |
| Integration | El traspaso entre dos componentes (retrieval → modelo) | Comportamiento de punta a punta. **Acá se esconden la mayoría de las fallas silenciosas** |
| End-to-end | El flujo completo | Dónde exactamente está la rotura |

Un **trace** registra cada paso (prompt, tool calls, salidas intermedias, tiempos) y localiza el paso que falló. Router de retrieval: una clasificación barata envía lookups a fetch-once y preguntas multi-paso a búsqueda agéntica.

### B.16 Fallas en producción (M4)

Una pregunta: *¿esperar y reintentar el mismo request podría funcionar?* Sí → reintentable (429, 529, 5xx, timeouts). No → terminal (400, 401, 403, 404). Ante la duda, tratalo como terminal: falla ruidosa y se arregla.

- El SDK ya reintenta fallas transitorias con backoff. **No apiles tu propio loop encima** sin desactivar o ajustar el del SDK.
- `retry-after` en 429/529 es la espera autoritativa; el backoff exponencial con jitter es el fallback.
- Un error de tool vuelve a Claude con `is_error: true`; un resultado vacío se toma como dato válido y genera una respuesta segura pero errónea.
- Un `refusal` llega como HTTP 200: tu clasificador de reintentos no lo ve. Chequealo en `stop_reason`.
- Un stream cortado es transitorio: reintentá el request completo, no pases la salida parcial.

### B.17 Costo, latencia y orquestación (M4)

Instrumentá tres métricas por llamada desde el día uno: tokens de input/output, latencia y tasa de error. Las palancas: modelo, tamaño de prompt y contexto, cantidad de tool calls, streaming (latencia percibida), prompt caching (prefijos estables) y Batches (costo en trabajo no urgente). Batches y caching se combinan.

**Orquestador-worker**: un lead planifica, reparte subtareas a subagentes en paralelo y sintetiza. Sirve para tareas que se dividen en partes independientes (investigación en fuentes separadas). Cuesta \~15x tokens; en tareas acopladas como código no conviene. Usá un modelo más capaz como lead y modelos más baratos como workers. Cada subagente necesita su propio manejo de fallas.

**Piso de confiabilidad primero**: definí presupuesto de reintentos y techo de latencia, y optimizá costo por encima. El baseline del eval hace el piso verificable.

### B.18 Seguridad (M4)

El modelo procesa todo el contexto como un único flujo de tokens, sin una frontera entre instrucciones confiables y datos externos. **Prompt injection** = instrucciones ocultas en contenido que el agente lee (páginas, documentos, emails, registros, resultados de tools), directa o indirecta, visible u oculta. **Jailbreak** = intento de que el modelo ignore sus propias restricciones. Misma defensa en capas:

1. Entrenamiento del modelo y clasificadores de Anthropic (probabilísticos; ningún agente que lee contenido externo es inmune).
2. Tratar el contenido externo como dato; delimitadores ayudan pero son un límite blando.
3. Identidad con mínimo privilegio, secretos en entorno o secret manager, config de auth protegida (editar el rol es una acción privilegiada).
4. Hooks `PreToolUse` que bloquean y registran antes de ejecutar.
5. **Sandbox a nivel de SO** (filesystem acotado al directorio de trabajo; red solo a endpoints permitidos): el control residual que se sostiene aunque falte un hook. Se configura en settings de Claude Code (code.claude.com).
6. Scoping regulado: residencia de datos, logging de acceso y configuración administrada. La elegibilidad ZDR varía por modelo y plataforma \[Verificar en Trust Center\].

### B.19 Aceleradores, contribución, ciclo de vida y plataformas (M5)

| Tipo de activo | Qué empaqueta | Requisito de empaquetado |
| --- | --- | --- |
| Agent template | System prompt, schemas de tools, estructura del loop | Valores de dominio en configuración con defaults documentados |
| MCP server package | Tools, inputs y scope | Inputs documentados por tool; el equipo instalador fija el scope |
| Eval suite | Dataset + rúbrica | Se entregan juntos; sirve también como gate de despliegue contra un baseline |

Documentá supuestos de entorno, inputs esperados, fallas manejadas y el eval que define "funciona". El log de auditoría es parte del paquete.

**Contribución**: el canal debe coincidir con la forma. Claude Cookbook (repo de GitHub) para un patrón enfocado; el repo propio de cada servidor o tool para tools y fixes. Un maintainer acepta lo que puede verificar: código que hace una cosa, ejemplo ejecutable, test, declaración de supuestos. Derechos y atribución van **antes** de la revisión técnica.

**Requisitos**: funcionales (qué hace el sistema, verificable) e infraestructura (latencia, escala, residencia, identidad), documentados para defender la decisión de plataforma.

**Ciclo de vida**: Requirements → Design → Build → Test → Deploy → Operate → Iterate, con gates entre fases.

| Plataforma | Identidad y datos | Cuándo | Pinning |
| --- | --- | --- | --- |
| Claude API (first-party) | Identidad y términos de Anthropic; features nuevos primero | Sin restricción de cloud o residencia | ID completo; conservar snapshot previo |
| Claude Platform on AWS | Anthropic, accedido desde la cuenta AWS; inferencia operada por Anthropic fuera del límite de AWS | Cliente en AWS que quiere IDs, ciclo de vida y paridad de Anthropic | Mismo formato de ID que la API |
| Claude in Amazon Bedrock | Messages API en `/anthropic/v1/messages`; datos dentro del límite AWS | Cliente en AWS con postura de compliance ahí | ID completo con prefijo `anthropic.`; fechas de retiro propias |
| Claude on Amazon Bedrock (legacy) | InvokeModel/Converse, IDs por ARN | Integración existente sin migrar | ARN versionado |
| Google Vertex AI | IAM y billing de Google Cloud; endpoints regionales o globales | Cliente en Google Cloud | Formato de ID de Vertex; fechas propias |
| Terceros (ej. Microsoft Foundry) | Identidad del producto. Foundry: Hosted on Azure (inferencia en Azure) u Hosted on Anthropic, según modelo | El cliente ya usa esa plataforma | Según la plataforma |

Todo este cuadro es \[Verificar\]. Desde Claude 4.6, el ID del modelo ya fija un snapshot; en modelos anteriores hace falta el sufijo de fecha (ej. `claude-haiku-4-5-20251001`). Los alias pueden resolver a versiones distintas según la plataforma.

**Trust boundaries en apps multi-componente**: cada punto donde datos o instrucciones pasan de un entorno a otro es un boundary. La app está tan contenida como su componente más privilegiado. Si una costura no se puede asegurar, se escala a un responsable humano.

### B.20 Contradicciones y vacíos detectados en el material

| # | Dónde | Observación |
| --- | --- | --- |
| 1 | M3, objetivo 2 y takeaway 2 | El objetivo "leer código generado por IA y revisarlo con confianza calibrada" aparece en la intro y el resumen, pero ninguna pantalla de enseñanza lo desarrolla. Lo único disponible: confiar en hallazgos demostrables en el diff, tratar afirmaciones sobre runtime u otros sistemas como hipótesis, gate humano donde un hallazgo se vuelve acción irreversible, y dar al revisor las convenciones del proyecto. |
| 2 | M1 quiz vs teoría de M1/M2 | El quiz habla de "extended thinking" on/off; la teoría dice que en modelos actuales el modo es adaptive thinking con `effort` y que `budget_tokens` da 400. Asumí la teoría. |
| 3 | M4 Cost & Orchestration | Dice que el context engineering viene "del primer módulo"; en realidad está en M2. |
| 4 | M3 Watch Out de MCP | Dice que el hook "exits with code to block"; falta el número. El resto del curso indica **exit code 2**. |
| 5 | M2 vs M4 Batches | M2 solo dice "menor costo por token"; el checkpoint de M4 indica "\~50%" y la teoría pide confirmarlo. |
| 6 | M3 | Ni el curso ni este cheatsheet incluyen el código de un servidor MCP propio: el objetivo "construir un servidor MCP" se cubre a nivel de transporte, scope y auth. Para implementarlo hace falta la doc del SDK de MCP \[Externo\]. |
| 7 | M2 Files API | No especifica el header beta de Files API ni la sintaxis del endpoint de upload. |

## C. Practical Workflows

Catorce procedimientos con el mismo formato: cuándo, requisitos, pasos, verificación y errores frecuentes. El código referenciado está en la sección D.

### C.1 Diagnosticar y arreglar un prompt que falla (M2)

- **Cuándo:** la salida no sirve para el parser o el contenido se desvía.
- **Requisitos:** ejemplos de las salidas incorrectas y, si existe, un eval (C.10).
- **Herramientas:** Messages API; structured outputs.

1. Clasificá la falla con la tabla de B.5: forma incorrecta, desvío, estructura inventada o caso borde.
2. Agregá **una sola** técnica: output constraint, system prompt, few-shot o constraint para la variante.
3. Separá instrucciones y datos con XML tags; envolvé ejemplos en `<sample_input>` / `<ideal_output>`. Podés tomar ejemplos de las salidas con mejor puntaje en el eval.
4. Si la salida es consumida por código y las variantes siguen rompiendo, pasá a structured outputs (`output_config.format` o `strict: true`). Ver D.2.
5. Volvé a correr el eval. Si sigue fallando, volvé al paso 1.

- **Resultado esperado:** salida estable y parseable en todos los casos del eval.
- **Verificación:** puntaje por caso, no solo promedio; incluir casos ambiguos y bordes.
- **Errores frecuentes:** agregar párrafos de descripción en lugar de un constraint; asumir que structured outputs elimina `refusal` o `max_tokens`; combinar JSON outputs con prefill.

### C.2 Definir una tool y cablear el loop con HITL (M2)

- **Cuándo:** Claude tiene que consultar o actuar sobre un sistema.
- **Requisitos:** decidir workflow o agente (E.3); lista mínima de tools; peor caso de cada tool.
- **Herramientas:** Anthropic SDK; o Agent SDK si no querés escribir el loop.

1. Escribí `name` específico, `description` de 3-4 oraciones con **cuándo usarla y cuándo no**, y `input_schema` con `required` mínimo.
2. Si dos tools comparten forma de parámetros, agregá lenguaje de dominio que las diferencie; si no alcanza, fusionalas.
3. Escribí un system prompt acotado que nombre la tarea y las tools disponibles (ni más ni menos).
4. Implementá el loop (D.3): si `stop_reason == "tool_use"`, guardá el turno del asistente **completo**, ejecutá cada `tool_use`, y devolvé **todos** los `tool_result` en un solo turno de usuario con el mismo `tool_use_id`.
5. Ante error de la tool, devolvé `is_error: true` con el mensaje.
6. Para cada tool irreversible (write, delete, send), insertá el gate HITL **dentro del loop, antes de ejecutar**, filtrando por nombre de tool.
7. Definí la condición de salida (`end_turn`) y un tope de iteraciones.

- **Resultado esperado:** el agente elige la tool correcta y nunca ejecuta una acción irreversible sin aprobación.
- **Verificación:** casos de prueba en el límite entre descripciones parecidas; un request con dos tools en paralelo; un rechazo del operador que vuelve a Claude como `tool_result`.
- **Errores frecuentes:** `tool_use_id` que no coincide; tirar el bloque `text` que acompaña a `tool_use`; aprobar después de `execute_tool`; condición de salida acotada a una validación local (caso del rate limit en H.4).

### C.3 Consumir un stream sin corromper el historial (M2, M4)

- **Cuándo:** respuestas largas o un usuario mirando.
- **Requisitos:** loop de tool use funcionando sin streaming.

1. Inicializá un diccionario de bloques por `index` en `content_block_start`.
2. Acumulá `text_delta` e `input_json_delta` en `content_block_delta`. No parsees ni ejecutes nada.
3. En `content_block_stop`, recién ahí parseá el JSON del input de la tool.
4. Registrá `stop_reason` de `message_delta`.
5. Marcá `stop_seen = True` en `message_stop`.
6. Solo si `stop_seen`: agregá el turno completo (incluido cualquier `thinking`) al historial. Si no: descartá y reintentá desde el último turno completo.

- **Verificación:** test que corta el stream a mitad de un `tool_use` y confirma que el historial no cambió.
- **Errores frecuentes:** confundir "terminó el loop de lectura" con "el mensaje está completo"; filtrar los bloques `thinking` al guardar.

### C.4 Mantener una sesión dentro del presupuesto de contexto (M2, M3)

- **Cuándo:** agentes multi-turno, tool outputs grandes, sesiones largas.
- **Requisitos:** un tope de presupuesto (puede ser menor que la ventana del modelo, como control de costo).

1. Medí con `count_tokens` el costo real del mayor tool output de producción que puedas conseguir, no del fixture.
2. Calculá cuántos turnos entran: system prompt + tools + historial + outputs.
3. Marcá `cache_control` en el prefijo estable (tools y system) para bajar costo.
4. Podá tool outputs después de usarlos y compactá **antes** de llegar al tope.
5. Si compactás a mano, escribí un prompt de resumen que preserve rutas de archivos modificados, decisiones y errores con su resolución (D.5).
6. Delegá exploraciones a subagentes con contexto mínimo y condición de salida clara.
7. Usá `/clear` o una sesión nueva cuando la tarea siguiente no tiene relación.

- **Verificación:** gráfico o log de tokens por turno en una sesión realista; ninguna sesión se acerca al tope sin compactar.
- **Errores frecuentes:** diagnosticar una ventana llena como "mala selección de tools"; subir `max_tokens` (controla la salida, no el contexto).

### C.5 Elegir la memoria del agente (M2)

1. Describí la forma de las sesiones: ¿una larga, muchas cortas, jobs independientes?
2. Elegí con la tabla de B.10 (o E.5).
3. Si es storage externo: guardá al final de sesión e inyectá al inicio **solo el subconjunto relevante** o un resumen (D.5).
4. Pasá instrucciones recurrentes a Skills, no a cada sesión.
5. Medí el estado esperado por sesión contra el límite antes de elegir in-context.

- **Error frecuente:** concatenar transcripciones completas de sesiones previas; la ventana se llena hacia la sesión cuatro.

### C.6 Procesar volumen offline e imágenes (M2)

1. Confirmá que nadie espera la respuesta. Si alguien espera, usá la API síncrona.
2. Calculá el costo de la imagen más grande: ⌈ancho/28⌉ × ⌈alto/28⌉. Si excede, agregá un resize.
3. Subí una sola vez con Files API los activos reutilizados; base64 para uno solo.
4. Armá los requests con `custom_id` único y envialos en un batch (≤100.000 o ≤256 MB).
5. Guardá el `batch_id`, hacé polling hasta que termine y descargá resultados.
6. Empareja por `custom_id` (el orden es arbitrario). Combiná con structured outputs y caching.

- **Errores frecuentes:** loop síncrono en chunks (no es batching); Batches en un flujo con usuario esperando; Files API en Bedrock o Vertex.

### C.7 Configurar Claude Code en un proyecto (M3)

1. Arrancá en `plan` o `default` si el código es desconocido.
2. Ejecutá `/init`, revisá el CLAUDE.md generado y dejalo en las reglas que cambian comportamiento: comandos de test, convenciones, rutas prohibidas, decisiones de estilo.
3. Pasá la guía específica de una carpeta a `.claude/rules/<tema>.md` con `paths` en el frontmatter.
4. En `.claude/settings.json` (commiteado): `defaultMode`, allow para los comandos del proyecto y deny para destructivos y archivos sensibles (D.7).
5. Preferencias personales en `.claude/settings.local.json`.
6. Convertí en hook `PreToolUse` cualquier regla que no se pueda romper nunca; formatter y auditoría en `PostToolUse` (D.8).
7. Para tareas donde CLAUDE.md debe aplicar, no uses los subagentes Explore o Plan.

- **Verificación:** pedile al agente algo que viole la regla y confirmá que el hook lo bloquea; revisá que CLAUDE.md siga por debajo de \~200-300 líneas.
- **Errores frecuentes:** usar `bypassPermissions` en tu máquina; meter historial de decisiones y notas archivadas en CLAUDE.md; asumir que `acceptEdits` frena un `rm` dentro del directorio de trabajo (no lo frena).

### C.8 Empaquetar y distribuir un plugin (M3)

1. Mové workflows a skills con descripciones que funcionen como criterio de match.
2. Reemplazá toda ruta absoluta por `$CLAUDE_PROJECT_DIR` (scripts del proyecto) o `${CLAUDE_PLUGIN_ROOT}` (scripts dentro del plugin).
3. Incluí en el bundle todo script, config y asset necesario.
4. Documentá y validá al instalar cada variable de entorno requerida.
5. Incluí explícitamente los hooks y deny rules de los que dependen los skills; si no están en el bundle, no viajan.
6. Elegí el nombre del plugin como parte de la interfaz (prefija todos los comandos).
7. Probá la instalación en una máquina limpia y publicá en un marketplace.

- **Errores frecuentes:** `/Users/<autor>/...` en un SKILL.md; variables de entorno no documentadas.

### C.9 Conectar un servidor MCP (M3)

1. Elegí transporte: stdio si corre en tu máquina; HTTP si es remoto o compartido.
2. Elegí scope: local o user (personal), project (`.mcp.json` commiteado) o enterprise (admin).
3. Elegí auth: OAuth si hay identidad de usuario; API key en variable de entorno si es cuenta de servicio.
4. Escribí la config con **referencia** a la variable (`${WAREHOUSE_MCP_TOKEN}`), nunca el valor (D.9).
5. Limitá las tools con permisos `mcp__servidor__tool` o, en la API, `mcp_toolset` con `enabled` y `defer_loading`.
6. Agregá una regla en CLAUDE.md y un hook `PreToolUse` que bloquee credenciales inline en `.mcp.json`.
7. Para OAuth, registrá el redirect URI de **cada** host (staging, producción) y verificá si el cliente exige apps separadas.

- **Verificación:** cloná el repo en otra máquina y conectá sin tocar la config; `git log -p .mcp.json` no muestra secretos \[Externo\].
- **Errores frecuentes:** stdio en `.mcp.json` pensando que se comparte un servicio; clave commiteada (rotarla siempre, aunque la borres después).

### C.10 Construir y calibrar un eval (M4)

1. Escribí el design document (B.15) con criterios de éxito verificables.
2. Armá el dataset: casos típicos, irregulares y bordes. Pedile a Claude que enumere casos que puedan romper la implementación y revisalos.
3. Elegí el grader según la forma de salida (E.8). Code-graded en cada commit; juez en una pasada programada.
4. Para el juez: rúbrica con bandas de puntaje, salida JSON con fortalezas, debilidades, razonamiento y puntaje (D.10).
5. Calibrá: corré el juez sobre casos etiquetados por humanos y medí el acuerdo; si es bajo, ajustá la rúbrica y agregá ejemplos bueno/malo.
6. Fijá un baseline y usá el eval como gate para prompts, modelos y versiones.

- **Errores frecuentes:** juzgar "por impresión" con una docena de pruebas; cambiar tres cosas a la vez; usar juez donde alcanza un parse.

### C.11 Agregar manejo de fallas (M4)

1. Listá en el design doc cada error esperado y clasificalo (A.4).
2. Decidí dónde viven los reintentos: el SDK o tu código, nunca ambos sin coordinar.
3. Para reintentables: respetá `retry-after`; si falta, backoff exponencial con tope y jitter; número máximo de intentos (D.11).
4. Para terminales: fallá rápido con un error claro.
5. Chequeo de `stop_reason == "refusal"` aparte (llega como 200).
6. Errores de tools con `is_error: true`.
7. Fallback nombrado para cada falla que el reintento no resuelve (caché, ruta más simple o error elegante).

- **Errores frecuentes:** sin ruta de error porque "en desarrollo nunca falló"; reintentos inmediatos que profundizan el rate limit.

### C.12 Asegurar un agente que lee contenido externo (M4, M5)

1. Listá todo contenido que lee el agente y que otra persona puede escribir.
2. Envolvé ese contenido en delimitadores e indicá que es dato (límite blando).
3. Acotá la identidad: escritura en una sola ruta, lectura solo del input, deny explícito de `/etc`, `/secrets`, `~/.aws`.
4. Secretos desde `os.environ` o secret manager; protegé la config de auth.
5. Hook `PreToolUse` que bloquea escrituras fuera de la ruta permitida y registra todo (D.12).
6. Activá sandbox de filesystem y red en Claude Code.
7. En apps multi-componente, marcá cada costura como boundary y aplícá `treat_as_data` en el componente receptor.
8. Prepará respuestas para residencia, logging y config administrada antes de la revisión.

- **Verificación:** prueba con una página que contiene una instrucción oculta; el resultado debe ser una acción denegada y una entrada de auditoría.
- **Error frecuente:** "nuestros usuarios son internos, así que el input es confiable"; la inyección llega por el contenido, no por el usuario.

### C.13 Desplegar y versionar (M5)

1. Armá el registro de requisitos (funcionales + latencia, escala, residencia, identidad).
2. Elegí plataforma por cloud y compliance del cliente (E.10); si la compliance es pasa/no pasa, decide sola.
3. Medí latencia **desde la región del cliente** con su payload real; en Bedrock compará endpoints globales y regionales.
4. Calculá costo total por llamada: tokens + egress + fees + integración.
5. Fijá el ID completo del modelo (no el alias) y versioná prompt y activo junto con el código.
6. Conservá la versión fijada anterior como destino de rollback.
7. Promové con el eval: tráfico parcial, comparación contra baseline, promover o revertir.

- **Errores frecuentes:** desplegar con `model="opus"`; elegir plataforma por familiaridad; medir latencia desde tu laptop.

### C.14 Empaquetar un acelerador y contribuirlo (M5)

1. Separá lo reutilizable de lo específico del cliente mientras el build está fresco.
2. Pasá a parámetros con defaults documentados: prompts, rutas, scopes, credenciales por referencia, umbrales, modelo.
3. Documentá supuestos, inputs, fallas manejadas y el eval que define "funciona".
4. Empaquetá el eval suite y el log de auditoría con el activo.
5. Para contribuir: confirmá derechos y atribución primero.
6. Elegí el canal: Cookbook para un patrón enfocado; repo propio para una tool o un fix.
7. Reducí a una sola cosa, agregá ejemplo ejecutable, test y declaración de supuestos.

- **Errores frecuentes:** template con valores hardcodeados; scripts sueltos en lugar de un template; mandar una app completa al Cookbook; PR sin test.

## D. Tools & Commands

Código en Python con el SDK oficial (`pip install anthropic`). Los bloques en Python pasaron un chequeo de sintaxis; los nombres de parámetros nuevos o beta están marcados \[Verificar\]. Las funciones `execute_tool`, `run_prompt` y `chat` son puntos de integración con tu código.

### D.1 Llamada base, caching y conteo de tokens

```python
import os
import anthropic

client = anthropic.Anthropic()          # usa ANTHROPIC_API_KEY del entorno
MODEL = os.environ["CLAUDE_MODEL"]      # ID completo fijado, nunca un alias

LONG_SYSTEM_PROMPT = "..."              # prefijo estable (>= ~1.024 tokens para cachear)

request = dict(
    model=MODEL,
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": LONG_SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"},   # breakpoint: cachea hasta aca
        # "cache_control": {"type": "ephemeral", "ttl": "1h"}  # TTL de 1 h [Verificar]
    }],
    messages=[{"role": "user", "content": "<ticket>...</ticket>"}],
)

# Medir presion de contexto ANTES de enviar (no ejecuta inferencia)
count = client.messages.count_tokens(
    model=MODEL, system=request["system"], messages=request["messages"])
print(count.input_tokens)

resp = client.messages.create(**request)
print(resp.stop_reason, resp.usage)     # usage incluye lecturas/escrituras de cache
```

Para async en Python: `anthropic.AsyncAnthropic()` y `await client.messages.create(...)`.

### D.2 Prompt con XML, few-shot y structured outputs

```text
System: You are a support classifier. Classify each ticket into exactly one of:
BILLING, TECHNICAL, ESCALATION. Return only the label. No other text.

<sample_input>My account shows two charges for April.</sample_input>
<ideal_output>BILLING</ideal_output>
<sample_input>The API keeps returning a 429 error.</sample_input>
<ideal_output>TECHNICAL</ideal_output>

User: <ticket>I was charged twice for the same month.</ticket>
```

JSON outputs (constrained decoding). El nombre de parámetro es el que cita el curso \[Verificar\]:

```python
TICKET_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": ["billing", "technical", "escalation"]},
        "urgency": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
        "summary": {"type": "string"},
    },
    "required": ["category", "urgency", "summary"],
    "additionalProperties": False,
}

resp = client.messages.create(
    model=MODEL,
    max_tokens=512,
    messages=[{"role": "user", "content": "<ticket>...</ticket>"}],
    output_config={"format": {"type": "json_schema", "schema": TICKET_SCHEMA}},
)
if resp.stop_reason in ("refusal", "max_tokens"):
    raise ValueError(f"No parseable output: {resp.stop_reason}")
```

Strict tool use: agregar `"strict": True` a la definición de la tool para que sus argumentos se validen contra `input_schema` antes de llegar a tu código.

### D.3 Loop de tool use con HITL, errores y resultados en paralelo

```python
import os
import anthropic

client = anthropic.Anthropic()
MODEL = os.environ["CLAUDE_MODEL"]
IRREVERSIBLE = {"update_record"}

tools = [
    {
        "name": "read_record",
        "description": (
            "Use this to read a customer record by customer_id. "
            "Returns the current field values as JSON. "
            "Do not use this to search customers by name or email."),
        "input_schema": {"type": "object",
                         "properties": {"customer_id": {"type": "string"}},
                         "required": ["customer_id"]},
    },
    {
        "name": "update_record",
        "description": (
            "Use this to update a specific field on a customer record. "
            "Only call this tool after a read_record call has confirmed the current value "
            "and the proposed change has been reviewed. "
            "Do not use this for bulk updates or schema changes."),
        "input_schema": {"type": "object",
                         "properties": {"customer_id": {"type": "string"},
                                        "field": {"type": "string"},
                                        "new_value": {"type": "string"}},
                         "required": ["customer_id", "field", "new_value"]},
    },
]

def execute_tool(name, tool_input):
    raise NotImplementedError(name)          # tu implementacion real

def approve(block) -> bool:                   # gate HITL
    print(f"Accion propuesta: {block.name} {block.input}")
    return input("Aprobar? (yes/no): ").strip().lower() == "yes"

def run_agent_loop(user_request, max_iterations=10):
    messages = [{"role": "user", "content": user_request}]
    for _ in range(max_iterations):
        response = client.messages.create(
            model=MODEL, max_tokens=4096, tools=tools, messages=messages,
            system="You manage customer records. Tools: read_record, update_record.")
        if response.stop_reason != "tool_use":
            return response                   # end_turn / max_tokens / refusal

        # Turno del asistente COMPLETO (text + tool_use + thinking)
        messages.append({"role": "assistant", "content": response.content})

        tool_results = []                     # todos en UN turno de usuario
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name in IRREVERSIBLE and not approve(block):
                tool_results.append({"type": "tool_result", "tool_use_id": block.id,
                                     "content": "Update rejected by operator."})
                continue
            try:
                result = execute_tool(block.name, block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id,
                                     "content": str(result)})
            except Exception as e:
                tool_results.append({"type": "tool_result", "tool_use_id": block.id,
                                     "is_error": True, "content": f"Tool failed: {e}"})
        messages.append({"role": "user", "content": tool_results})
    raise RuntimeError("Tope de iteraciones sin end_turn")
```

Opciones de la request: `tool_choice={"type": "auto", "disable_parallel_tool_use": True}` fuerza una tool por turno \[Verificar sintaxis\]. Con thinking activado, el `response.content` que se reenvía ya incluye los bloques `thinking` sin modificar.

### D.4 Handler de streaming seguro

```python
import json

class StreamInterruptedError(Exception):
    pass

def stream_turn(client, messages, **kwargs):
    blocks, stop_reason, stop_seen = {}, None, False
    with client.messages.stream(messages=messages, **kwargs) as stream:
        for event in stream:
            if event.type == "content_block_start":
                cb = event.content_block
                if cb.type == "tool_use":
                    blocks[event.index] = {"type": "tool_use", "id": cb.id,
                                           "name": cb.name, "_json": ""}
                elif cb.type == "text":
                    blocks[event.index] = {"type": "text", "text": ""}
                else:                                   # thinking: conservar
                    blocks[event.index] = cb.model_dump()
            elif event.type == "content_block_delta":
                d, b = event.delta, blocks[event.index]
                if d.type == "text_delta":
                    b["text"] += d.text
                elif d.type == "input_json_delta":
                    b["_json"] += d.partial_json        # NO parsear todavia
                elif d.type == "thinking_delta":
                    b["thinking"] = b.get("thinking", "") + d.thinking
                elif d.type == "signature_delta":
                    b["signature"] = d.signature
            elif event.type == "content_block_stop":
                b = blocks[event.index]
                if b["type"] == "tool_use":
                    b["input"] = json.loads(b.pop("_json") or "{}")  # recien aca
            elif event.type == "message_delta":
                stop_reason = event.delta.stop_reason
            elif event.type == "message_stop":
                stop_seen = True

    if not stop_seen:
        raise StreamInterruptedError(
            "Stream ended before message_stop; discarding partial turn. "
            "Retry from the last complete turn.")
    content = [blocks[i] for i in sorted(blocks)]
    messages.append({"role": "assistant", "content": content})   # solo si completo
    return content, stop_reason
```

&#91;Externo\] El SDK también ofrece `stream.get_final_message()`, que ensambla el mensaje por vos; la regla de no guardar turnos incompletos sigue aplicando.

### D.5 Prompt de compactación y memoria externa

```text
Summarize the conversation so far. Preserve, verbatim where possible:
- every file path that was created or modified
- every decision made at a branch point and the reason
- every error encountered and how it was resolved
- open tasks and their current status
Omit greetings, repeated tool output and dead ends that were abandoned.
```

```python
def build_session_history(prior_sessions):
    if not prior_sessions:
        return []
    summary = load_session_summary(prior_sessions[-1]["id"])   # storage externo
    return [{"role": "user", "content": f"Session context: {summary}"}]
```

### D.6 Imágenes, PDFs y Message Batches

```python
import base64, pathlib

img_b64 = base64.standard_b64encode(pathlib.Path("bug.png").read_bytes()).decode()
pdf_b64 = base64.standard_b64encode(pathlib.Path("contract.pdf").read_bytes()).decode()

content = [
    {"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                 "data": img_b64}},
    {"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                    "data": pdf_b64}, "title": "contract_review.pdf"},
    {"type": "text", "text": "If objects overlap, describe each separately and note the overlap."},
]
# Imagen por URL: {"type": "url", "url": "https://..."}; Files API: {"type": "file", "file_id": "..."} [Verificar]
```

```python
import time

batch = client.messages.batches.create(requests=[
    {"custom_id": f"rec-{r['id']}",
     "params": {"model": MODEL, "max_tokens": 64,
                "messages": [{"role": "user", "content": r["text"]}]}}
    for r in records                        # <= 100.000 requests o 256 MB
])
while client.messages.batches.retrieve(batch.id).processing_status != "ended":
    time.sleep(60)                           # polling
for item in client.messages.batches.results(batch.id):
    print(item.custom_id, item.result.type)  # orden arbitrario: emparejar por custom_id
```

### D.7 Settings de Claude Code

`.claude/settings.json` (commiteado, refactor local de confianza; respuesta del checkpoint de M3):

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Bash(npm run:*)"],
    "deny": ["Bash(rm:*)", "Bash(git push:*)", "Read(.env.production)"]
  }
}
```

Modos válidos para `defaultMode`: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`. Permiso por tool de MCP: `"allow": ["mcp__github__create_issue"]`.

### D.8 Hooks

Registro en settings (bloque `hooks`):

```json
{
  "hooks": {
    "PreToolUse": [
      {"matcher": "Read|Write|Edit",
       "hooks": [{"type": "command",
                  "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard.py"}]}
    ],
    "PostToolUse": [
      {"matcher": "Write|Edit",
       "hooks": [{"type": "command",
                  "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/audit_log.py"}]}
    ]
  }
}
```

`.claude/hooks/guard.py`. Los campos `tool_name` y `tool_input` del JSON de entrada vienen de la doc de Claude Code \[Externo, Verificar\]:

```python
#!/usr/bin/env python3
import json, re, sys

event = json.load(sys.stdin)
tool = event.get("tool_name", "")
args = event.get("tool_input", {}) or {}
path = str(args.get("file_path", ""))

if tool == "Read" and path.endswith(".env.production"):
    print("Blocked: .env.production must never be read by the agent.", file=sys.stderr)
    sys.exit(2)                                   # exit 2 = bloquear; stderr vuelve a Claude

if tool in ("Write", "Edit") and path.endswith(".mcp.json"):
    text = str(args.get("content", "")) + str(args.get("new_string", ""))
    if re.search(r"Bearer\s+(?!\$\{)[A-Za-z0-9_\-]{8,}", text):
        print("Blocked: reference credentials as ${ENV_VAR}, never inline.", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

Alternativa a exit 2: devolver por stdout `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}` (patrón de M4).

### D.9 Servidores MCP

`.mcp.json` en la raíz del repo (scope project):

```json
{
  "mcpServers": {
    "data-warehouse": {
      "type": "http",
      "url": "https://warehouse.internal/mcp",
      "headers": {"Authorization": "Bearer ${WAREHOUSE_MCP_TOKEN}"}
    }
  }
}
```

&#91;Externo, Verificar\] Alta por CLI: `claude mcp add --transport http --scope project <nombre> <url>`; para stdio, `claude mcp add --scope local <nombre> -- <comando> <args>`.

MCP Connector de la API (header `mcp-client-2025-11-20`). Estructura descrita en M2; nombres exactos de campos \[Verificar\]:

```json
{
  "type": "mcp_toolset",
  "default_config": {"defer_loading": true},
  "configs": {
    "create_issue": {"enabled": true, "defer_loading": false},
    "delete_repository": {"enabled": false}
  }
}
```

### D.10 Harness de eval y juez calibrado

```python
import ast, json

def validate_json(text):
    try:
        json.loads(text.strip()); return 10
    except json.JSONDecodeError:
        return 0

def validate_python(text):
    try:
        ast.parse(text.strip()); return 10
    except SyntaxError:
        return 0

def grade_by_model(task, solution, expected_behavior):
    eval_prompt = f"""
You are an expert reviewer. Evaluate the solution against the expected behavior.
<task>{task}</task>
<solution>{solution}</solution>
<expected_behavior>{expected_behavior}</expected_behavior>
Score bands: 1-3 misses required content; 4-7 partial, some required content missing;
8-10 complete and faithful to the expected behavior.
Return only JSON with:
"strengths": array of 1-3 points
"weaknesses": array of 1-3 points
"reasoning": one to two sentences, 50 words maximum
"score": a number from 1 to 10
"""
    return json.loads(chat([{"role": "user", "content": eval_prompt}]))

def grade(test_case, output):
    if test_case.get("format") == "json":
        return validate_json(output)
    return grade_by_model(test_case["input"], output, test_case["expected_behavior"])["score"]

def run_eval(dataset):
    results = []
    for case in dataset:
        output = run_prompt(case)
        results.append({"test_case": case, "output": output, "score": grade(case, output)})
    for r in results:                                   # desglose por caso
        print(r["score"], r["test_case"]["input"][:60])
    average = sum(r["score"] for r in results) / len(results)
    print(f"Average score: {average:.2f}")
    return results, average

def judge_agreement(labeled_cases, tolerance=1):
    """Calibracion: fraccion de casos donde el juez coincide con la etiqueta humana."""
    hits = sum(
        abs(grade_by_model(c["input"], c["output"], c["expected_behavior"])["score"]
            - c["human_score"]) <= tolerance
        for c in labeled_cases)
    return hits / len(labeled_cases)
```

Formato de dataset:

```json
[
  {"input": "Long support thread about a delayed refund, 14 messages.",
   "expected_behavior": "A 2-sentence summary naming the issue (delayed refund) and the current status (escalated)."},
  {"input": "Meeting transcript where three action items are assigned.",
   "expected_behavior": "A summary that lists all three action items with their owners."},
  {"input": "Bug report with repro steps and one unrelated aside.",
   "expected_behavior": "A summary of the bug and its repro steps that omits the unrelated aside."}
]
```

### D.11 Reintentos con backoff y `retry-after`

```python
import random, time
import anthropic

RETRIABLE = {429, 529, 500, 502, 503, 504}

class RetryBudgetExhausted(Exception):
    pass

def call_with_retry(make_call, max_attempts=5, cap=30):
    for attempt in range(max_attempts):
        try:
            resp = make_call()
            if resp.stop_reason == "refusal":            # 200: no es reintentable
                raise ValueError("Model refused the request. Review input before retrying.")
            return resp
        except anthropic.APIStatusError as e:
            if e.status_code not in RETRIABLE:
                raise                                    # terminal: fallar rapido
            wait = e.response.headers.get("retry-after")
            if wait is None:
                wait = min(cap, 2 ** attempt) + random.uniform(0, 1)
            time.sleep(float(wait))
        except anthropic.APIConnectionError:             # incluye timeouts
            time.sleep(min(cap, 2 ** attempt) + random.uniform(0, 1))
    raise RetryBudgetExhausted()

# Una sola capa de reintentos: apagar la del SDK si la maneja tu codigo
client = anthropic.Anthropic(max_retries=0)
```

### D.12 Instrumentación por llamada

```python
import time

def instrumented_call(make_call, step_name):
    start = time.perf_counter()
    resp = make_call()
    log_metric(step=step_name,
               input_tokens=resp.usage.input_tokens,
               output_tokens=resp.usage.output_tokens,
               latency_ms=(time.perf_counter() - start) * 1000)
    return resp
```

### D.13 Identidad de mínimo privilegio y hook de seguridad (patrón de M4, pseudocódigo)

```python
api_key = os.environ["SERVICE_API_KEY"]          # nunca en config commiteada
agent_role = Role(
    allow_write=["/workspace/output"],
    allow_read=["/workspace/input"],
    deny=["/etc", "/secrets", "~/.aws"],
)

def pre_tool_use(event):
    if event.tool == "write_file" and not event.path.startswith("/workspace/output"):
        log_audit(action="write_file", path=event.path, result="BLOCKED")
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                       "permissionDecision": "deny",
                                       "permissionDecisionReason": "write outside the permitted path"}}
    log_audit(action=event.tool, path=getattr(event, "path", None), result="allowed")
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow"}}
```

### D.14 Archivos de contexto: rules, skills y subagentes

`.claude/rules/database.md`:

```markdown
---
paths:
  - "src/db/**/*.sql"
---
All SQL in the database module must include an explicit transaction boundary.
```

`.claude/skills/migration-validate/SKILL.md`:

```markdown
---
name: migration-validate
description: Validates migration scripts before they run against production. Use when the user asks to check, validate or dry-run a database migration.
# disable-model-invocation: true   # descomentar para que solo corra con /migration-validate
---
## Steps
1. Run: $CLAUDE_PROJECT_DIR/scripts/validate-migration.sh
2. If the script exits non-zero, report the error to the developer.
3. If validation passes, report the results.
```

Subagente custom en `.claude/agents/<nombre>.md` que necesita un skill: listarlo en su frontmatter. El nombre exacto del campo no está en el curso \[Verificar en code.claude.com\].

### D.15 Agent SDK y pinning con gate de eval

&#91;Externo, Verificar\] Agent SDK en Python, con fuentes de settings explícitas:

```python
from claude_agent_sdk import ClaudeAgentOptions, query

options = ClaudeAgentOptions(
    setting_sources=["project"],        # carga CLAUDE.md y skills del repo; [] = aislado
    permission_mode="acceptEdits",
)

async def main():
    async for message in query(prompt="Review the open PR", options=options):
        print(message)
```

Pinning y promoción (respuesta del cumulative de M5):

```python
def build_agent(repo_path):                          # parametrizado para reuso
    return Agent(
        model="us.anthropic.claude-opus-4-8",        # ID completo fijado en Bedrock
        system_prompt=SYSTEM_PROMPT,
        repo_path=repo_path,
        tools=[read_file, run_linter],
    )

deploy(platform="amazon_bedrock", identity=aws_role_arn,
       retain_previous_pinned_version=True)          # destino de rollback
fetched = code_task.run(fetch_url=customer_page)
next_call(input=treat_as_data(fetched))              # externo = dato
assert eval_suite.run(model="us.anthropic.claude-opus-4-8") >= baseline_score
```

### D.16 Comandos de Claude Code citados

| Comando | Para qué |
| --- | --- |
| `/init` | Genera un CLAUDE.md inicial (revisarlo siempre) |
| `/compact` | Resume la conversación |
| `/clear` | Contexto vacío |
| `/hooks` | Configurar hooks |
| `/<skill-name>` | Invocar un skill |
| `/<plugin>:<comando>` | Comando de un plugin |
| `/plugin marketplace add <owner/repo>` | Agregar un marketplace de GitHub |

### D.17 Variables y rutas útiles

| Variable / ruta | Uso |
| --- | --- |
| `$CLAUDE_PROJECT_DIR` | Raíz del proyecto en skills y hooks |
| `${CLAUDE_PLUGIN_ROOT}` | Raíz del plugin instalado |
| `ANTHROPIC_API_KEY` | Clave que lee el SDK \[Externo\] |
| `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`, `managed-settings.json` | Settings por nivel |
| `~/.claude.json`, `.mcp.json` | MCP local / project |
| `.claude/skills/`, `.claude/rules/`, `.claude/agents/`, `.claude/commands/` (legacy) | Contexto y empaquetado |

## E. Decision Making

Cada tabla responde una pregunta frecuente. Leé la columna izquierda, buscá tu caso y aplicá la decisión.

### E.1 ¿Qué modelo uso?

| Situación | Decisión |
| --- | --- |
| No hay eval todavía | Sonnet, y construí el eval |
| El eval muestra que Sonnet no llega en los casos difíciles y el error es caro | Subir a Opus (o Fable para lo más exigente) |
| Alto volumen y el eval confirma que Haiku mantiene la calidad | Haiku (costo por volumen) |
| Tráfico mixto: mayoría simple, algunas consultas complejas | Router: default Sonnet o Haiku con override a Opus según una señal barata (tipo, largo, dificultad) |
| Tráfico uniforme | Fijar un solo modelo, sin router |
| Orquestador-worker | Modelo capaz como lead, modelos baratos como workers |

### E.2 ¿Activo razonamiento?

| Tarea | Decisión |
| --- | --- |
| Clasificación, extracción, conversión de formato, respuesta factual corta | Apagado; prompt con output constraint |
| Derivación, lógica multi-salto, plan de acciones dependientes | Activado, `effort` acorde a la profundidad |
| Loop agéntico que planifica varias tool calls | Activado; presupuestar el paso de planificación |
| "Quito el thinking del historial para ahorrar contexto" | Nunca; usar context engineering |

### E.3 ¿Llamada, workflow o agente?

| Pregunta | Sí → | No → |
| --- | --- | --- |
| ¿Una sola llamada resuelve la tarea? | Una llamada | Siguiente pregunta |
| ¿Podés escribir los pasos exactos en código? | Workflow (chaining, routing, parallelization, evaluator-optimizer) | Agente |
| ¿El agente puede hacer algo irreversible? | HITL antes de esa tool, en diseño | Sin gate obligatorio |

### E.4 ¿Cómo cableo el agente?

| Condición | Vía |
| --- | --- |
| Necesito control total de cada paso o restricciones que una librería no admite | Messages API directa |
| Quiero el loop de Claude Code en mi proceso (Python o TypeScript) | Agent SDK, con `settingSources` explícito |
| Ejecución de minutos u horas, sandbox administrado, sin construir loop ni runtime | Managed Agents (beta) |
| PHI, HIPAA o ZDR obligatorio | Agent SDK o loop directo en configuración cubierta; **nunca** Managed Agents |

### E.5 ¿Qué memoria le doy?

| Forma de uso | Scope |
| --- | --- |
| Mismo usuario en varios días, retoma donde quedó | Storage externo |
| Job independiente que termina y cierra | Stateless |
| Una sesión larga que no continúa | In-context |
| Conversación larga que superaría el presupuesto | Memoria resumida con prompt de resumen explícito |
| Instrucciones repetibles para ciertas tareas | Skill, no memoria |

### E.6 ¿Qué hago cuando el contexto se llena?

| Situación | Estrategia |
| --- | --- |
| Claude se fue por un camino improductivo | Pruning (volver atrás) |
| Cerca del techo, misma tarea, quiero conservar lo aprendido | Compaction |
| Próxima tarea sin relación | Clearing |
| Subtarea autocontenida o exploración ruidosa | Subagent handoff |
| Prefijo estable que se repite | Prompt caching |
| Corpus grande de referencia | RAG o búsqueda agéntica |
| Nunca se acerca al límite | No agregar gestión; medir y seguir |

### E.7 ¿Escribo el schema o uso MCP?

| Situación | Decisión |
| --- | --- |
| Existe un servidor MCP mantenido que cubre las operaciones que necesito | MCP |
| No hay servidor o necesito control fino de descripciones | Schema manual |
| Quiero cobertura amplia y precisión en las tools que más uso | Ambos: MCP + allowlist + descripciones afinadas |
| Tarea única, una persona, un proyecto | Tool directa en la llamada |
| Dos tools similares que necesitan descripciones cada vez más largas | Fusionarlas con un parámetro de tipo |

### E.8 ¿Cómo califico la salida en el eval?

| Forma de la salida | Grader | Frecuencia |
| --- | --- | --- |
| Una sola forma correcta | Exact match | Cada commit |
| JSON, código, rango, campo obligatorio | Code-graded | Cada commit |
| Calidad abierta (fidelidad, completitud, tono) | LLM-as-judge calibrado | Pasada programada |

### E.9 ¿Qué patrón de request uso?

| Situación | Patrón |
| --- | --- |
| Usuario esperando respuesta corta | Síncrono |
| Usuario mirando una respuesta larga | Streaming |
| Muchas llamadas concurrentes en tiempo real | Async/await |
| Miles de items offline, el costo importa | Message Batches API |
| Mismo archivo en muchas requests | Files API |
| Imagen de un solo uso | Base64 inline |

### E.10 ¿En qué plataforma despliego?

| Situación del cliente | Plataforma |
| --- | --- |
| Sin restricción de cloud o residencia; quiere features nuevos primero | Claude API first-party |
| En AWS, quiere IDs y ciclo de vida de Anthropic | Claude Platform on AWS |
| En AWS con compliance ahí; residencia por región | Claude in Amazon Bedrock |
| Integración Bedrock existente con InvokeModel/Converse | Bedrock legacy (planificar migración) |
| En Google Cloud con compliance ahí | Vertex AI |
| Residencia solo UE | Bedrock o Vertex con región fijada (la API directa no ofrece residencia en la UE) \[Verificar\] |
| FedRAMP | Claude for Government, Bedrock GovCloud o Vertex Assured Workloads \[Verificar\] |
| Ya usa un producto que integra Claude | Plataforma de terceros, confirmando el hosting de cada modelo |

### E.11 ¿Qué permission mode uso en Claude Code?

| Contexto | Modo |
| --- | --- |
| Código desconocido o sensible, solo explorar | `plan` |
| Proyecto nuevo | `default` |
| Refactor local de confianza | `acceptEdits` + deny de comandos destructivos |
| Menos prompts sin perder red de seguridad | `auto` (si está disponible) |
| CI o script cerrado | `dontAsk` con allow list |
| Contenedor o VM descartable | `bypassPermissions` |
| Workstation con código vivo | **Nunca** `bypassPermissions` |

### E.12 ¿Dónde pongo cada conocimiento del proyecto?

| Tipo de conocimiento | Mecanismo |
| --- | --- |
| Regla universal que cambia comportamiento | CLAUDE.md |
| Guía para una carpeta o tipo de archivo | Rule con `paths` |
| Regla que no se puede romper nunca | Hook `PreToolUse` (+ deny rule) |
| Efecto automático (formatear, testear, auditar) | Hook `PostToolUse` |
| Procedimiento que se usa a veces | Skill |
| Procedimiento que se invoca por nombre | Skill con `disable-model-invocation: true` |
| Historial de decisiones, notas archivadas | Documento aparte que el agente lee bajo demanda |
| Investigación que ensucia el contexto | Subagente |
| Setup que el equipo debe instalar igual | Plugin |

### E.13 ¿Qué transporte y scope uso para MCP?

| Escenario | Transporte + scope |
| --- | --- |
| Herramienta local solo en tu máquina | stdio + local |
| Servicio interno para todo el equipo | HTTP + project (`.mcp.json`) |
| Experimento de esta semana en un repo | stdio o HTTP + local |
| Servidor que IT debe desplegar a todos | HTTP + enterprise |
| Utilidad personal en todos tus proyectos | user |

### E.14 ¿Cómo autentico?

| Servicio | Auth | Secreto |
| --- | --- | --- |
| SaaS con identidad de usuario | OAuth | Token gestionado por el cliente |
| API interna con cuenta de servicio | API key | Variable de entorno o secret store, inyectada en runtime |
| Recurso local | Permisos del filesystem | Ninguno; deny rules |
| Secreto compartido o auditado | — | Secret store (rotación única para todos los consumidores) |

### E.15 ¿RAG clásico o búsqueda agéntica?

| Corpus y consulta | Enfoque |
| --- | --- |
| Corpus estable, lookups de un dato | Fetch-once (índice) |
| Corpus cambiante o preguntas multi-paso | Búsqueda agéntica |
| Mezcla de ambos | Router con clasificación barata |
| Necesitás identificadores exactos | Sumar búsqueda léxica al match semántico |

### E.16 ¿Un agente o varios?

| Tarea | Decisión |
| --- | --- |
| Se divide en partes independientes explorables en paralelo | Orquestador-worker (asumiendo \~15x tokens) |
| Pasos acoplados (código, refactors dependientes) | Un agente con buen contexto |
| Lookup disfrazado de investigación | Un agente |

### E.17 ¿A dónde contribuyo?

| Contribución | Canal | Lo que suele faltar |
| --- | --- | --- |
| Tool que envuelve una API | Repo propio de la tool | Un test que pruebe el wrapper |
| App completa con UI y scripts | Cookbook, después de extraer un patrón enfocado | Reducirla a un patrón |
| Fix de una línea a un ejemplo del Cookbook, traído de un proyecto con cliente | Repo del ejemplo del Cookbook | Chequeo de derechos y licencia |

### E.18 ¿Reintento o fallo rápido?

| Señal | Decisión |
| --- | --- |
| 429, 529, 5xx, timeout, conexión caída, stream cortado | Reintentar con backoff y tope |
| 400, 401, 403, 404 | Fallar rápido |
| `stop_reason: refusal` | Fallar rápido y registrar |
| Error de tool | Devolver `is_error: true`; reintentar solo si la causa es transitoria |
| Timeouts repetidos en requests caros | Arreglar el request, no reintentar |
| Duda | Tratarlo como terminal |

## F. Best Practices

Agrupadas por capa. Cada una es \[Recomendado\] salvo que diga \[Obligatorio\].

### F.1 Diseño y proceso

- Escribí el design document antes del código: éxito, fallas, presupuesto y trust boundary. Si usás una herramienta de código agéntica, entregale ese documento antes de que escriba.
- Separá requisitos funcionales (verificables) de requisitos de infraestructura (latencia, escala, residencia, identidad) y documentá de qué regulación sale cada restricción.
- Respetá los gates del ciclo de vida: no pases a build sin plataforma que cumpla residencia; no promuevas sin superar el baseline del eval.
- Decidí memoria, HITL y patrón (workflow o agente) en diseño; cambiarlos en producción cuesta mucho más.
- Nombrá la restricción regulatoria al empezar: define endpoint, credenciales y destino de logs.

### F.2 Prompts y salidas

- Agregá el mínimo de prompt que da un resultado confiable; diagnosticá antes de agregar.
- Usa XML tags descriptivos para separar instrucciones, datos y ejemplos.
- Toma ejemplos few-shot de las salidas con mejor puntaje en el eval.
- Para salidas que consume código, preferí structured outputs sobre "devolvé solo JSON"; evitalo en workloads que cambian de schema constantemente (pagan la compilación cada vez).
- Seguí chequeando `stop_reason` aunque uses structured outputs \[Obligatorio\].
- En visión, decí cómo resolver superposiciones, profundidad y oclusión.

### F.3 Tools y agentes

- Escribí la condición de exclusión en **todas** las tools parecidas, no solo en una.
- Marcá `required` solo lo indispensable; los opcionales con default en la firma de la función.
- Registrá el mínimo de tools y servidores MCP; agregá ante una brecha confirmada.
- Pasá el historial completo: las condiciones de exclusión que dependen de turnos previos fallan en silencio si truncas.
- Definí condiciones de salida que no dependan de que Claude decida parar, y un tope de iteraciones.
- Gate HITL dentro del loop, filtrado por nombre de tool, antes de ejecutar \[Obligatorio para tools irreversibles\].
- Prototipá en Agent SDK y pasá a Managed Agents si conviene; esperá una re-expresión de la definición, no una exportación directa.

### F.4 Contexto, costo y latencia

- Medí tokens contra el input más grande de producción, no contra fixtures.
- Cacheá primero tools y system prompt; mantené ese prefijo byte a byte idéntico.
- Elegí TTL de 1 h solo si los requests llegan con huecos de más de 5 minutos; si no, pagás la escritura sin lecturas.
- Instrumentá tokens, latencia y error rate por llamada desde el día uno; optimizá el paso que concentra el gasto.
- Combiná Batches y caching en jobs programados con prompts fijos largos.
- Fijá el piso de confiabilidad (reintentos, techo de latencia) antes de optimizar costo.
- Escribí prompts de compactación que preserven archivos, decisiones y errores.

### F.5 Claude Code

- Mantené CLAUDE.md como conjunto de trabajo, no como log: auditar al pasar unos cientos de líneas.
- Convertí la regla que no podés permitirte diluir en un hook.
- Poné deny rules en directorios sensibles **antes** de reducir confirmaciones.
- Preferí `auto` a `bypassPermissions` para tener menos prompts.
- Usá un deny enterprise para los controles que nadie debe poder quitar.
- Rutas siempre relativas (`$CLAUDE_PROJECT_DIR`, `${CLAUDE_PLUGIN_ROOT}`) en skills, hooks y plugins \[Obligatorio para compartir\].
- Probá cada plugin en una máquina limpia antes de distribuirlo.
- Escribí skills sin supuestos de entorno local si deben correr en la API o en Managed Agents.

### F.6 Seguridad

- Tratá todo contenido que no escribiste como dato \[Obligatorio\].
- Ninguna instrucción de prompt es un control de seguridad: lo que debe sostenerse va en un hook o en permisos.
- Mínimo privilegio por componente; la app vale lo que su costura más privilegiada.
- Secretos en variables de entorno o secret store, nunca en archivos commiteados \[Obligatorio\]; rotación programada; alcance mínimo por credencial; inventario de consumidores.
- Protegé la configuración de auth del agente como un secreto.
- Activá sandbox de filesystem y red como control residual.
- Registrá cada acción privilegiada (identidad, acción, resultado) y también cada bloqueo.
- Confirmá ZDR y BAA por modelo y por plataforma al hacer el scoping.
- Si una costura no se puede asegurar, escalá a un responsable humano en lugar de lanzar.

### F.7 Evals y testing

- Escribí el eval antes del feature y agregá cada incidente como caso nuevo.
- Cobertura antes que perfección; incluir entradas irregulares.
- Calibrá el juez contra etiquetas humanas antes de confiar en su número.
- Un cambio por vez; mirá el desglose por caso.
- Cubrí los cuatro niveles de test; priorizá tests de integración en cada costura.
- Tracing en cada paso para localizar fallas.

### F.8 Producción y entrega

- Fijá el ID completo del modelo en producción; los alias son para prototipos \[Obligatorio\].
- Versioná prompt y activo junto con el código; conservá la versión previa.
- Promové con tráfico parcial contra baseline.
- Empaquetá el build para reuso mientras está fresco, con parámetros, documentación, eval y log de auditoría.
- Para contribuir: derechos primero, código enfocado, ejemplo, test y supuestos.

## G. Troubleshooting

Leé primero el síntoma. Dos síntomas engañan seguido: la ventana llena parece mala selección de tools, y un turno de stream corrupto parece un bug del schema.

### G.1 Prompts y salidas

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Respuesta en frase cuando se esperaba una etiqueta; mayúsculas inconsistentes | Falta output constraint | Etiquetas fijas + "return only the label" + few-shot; o JSON outputs | Constraint desde la primera versión |
| Prompt cada vez más largo, salida sigue mal | Se agrega descripción en vez de la técnica faltante | Volver a diagnosticar (B.5) | Regla: 3 re-prompts fallidos = parar y diagnosticar |
| Salidas de más de 2.000 caracteres y latencia alta | Prompt verboso; el modelo calibra el largo al input | Reemplazar párrafos por schema + 2 ejemplos | Prompts mínimos |
| Etiqueta doble ("billing/technical") en casos ambiguos | Sin regla ni ejemplo para el caso ambiguo | Ejemplo few-shot del caso ambiguo | Incluir ambiguos en el eval |
| JSON inválido pese a structured outputs | `stop_reason` es `max_tokens` o `refusal` | Chequear `stop_reason`; subir `max_tokens` | Nunca asumir que todo parsea |
| Error al combinar JSON outputs con prefill | Incompatibles | Usar uno u otro | Elegir por tarea |
| 400 al pasar `temperature`, `top_p` o `top_k` | Modelos nuevos no aceptan sampling no default | Quitar el parámetro y guiar con el prompt | Verificar soporte de parámetros \[Verificar\] |
| 400 con `budget_tokens` | Deprecado en modelos nuevos | Usar adaptive thinking con `effort` | Verificar defaults de thinking por modelo |

### G.2 Tool use y streaming

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| `tool_result block references unknown tool_use_id` | ID distinto al emitido | Usar `block.id` exacto | Construir resultados desde el bloque, nunca a mano |
| Error de validación por `tool_use` sin `tool_result` | Resultado faltante, en turno posterior o tool\_result sin turno de asistente previo | Responder todos en el turno de usuario siguiente, después de guardar el turno del asistente | Test del invariante |
| Request rechazado por firma inválida | Thinking block editado, resumido o quitado | Reenviar sin cambios | No filtrar `thinking` |
| Claude elige la tool equivocada en entradas ambiguas | Descripciones superpuestas | Condición de exclusión en ambas tools | Revisar pares de tools en diseño |
| Claude repite búsqueda cuando la respuesta ya está en contexto | Tool de búsqueda sin "no usar si ya está en la sesión" | Agregar exclusión | Idem |
| Valores inventados en argumentos | Todo marcado como `required` | Dejar opcionales fuera de `required` | `required` mínimo |
| Respuesta segura pero incorrecta tras fallar una tool | Tool devolvió vacío en lugar de error | `is_error: true` con mensaje | Wrapper de tools con manejo de excepciones |
| JSON malformado al ejecutar una tool en streaming | Se parseó antes de `content_block_stop` | Acumular y parsear al cerrar el bloque | Patrón D.4 |
| Error de validación en un **retry** después de un corte de red | Se guardó un turno parcial con `tool_use` truncado | Quitar el turno corrupto; guardar solo tras `message_stop` | Gate en `stop_seen` |

### G.3 Contexto y memoria

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Selección de tools se degrada después de N turnos | Tool outputs acumulados desplazan las instrucciones | Podar outputs y compactar antes del tope | Medir con outputs reales |
| Agente olvida archivos o decisiones tras compactar | Prompt de resumen genérico | Prompt que preserve rutas, decisiones y errores | Plantilla D.5 |
| Sin resultados completos desde la sesión 4 | Transcripciones previas concatenadas in-context | Storage externo + resumen al iniciar | Elegir memoria en diseño |
| Cada sesión empieza de cero en un agente de seguimiento | Memoria in-context para un caso multi-día | Storage externo | E.5 |
| Truncado con `model_context_window_exceeded` | Techo alcanzado durante la generación | Recortar o resumir historial | Gestión proactiva |
| Subir `max_tokens` no ayuda | `max_tokens` controla salida, no contexto | Gestionar el contexto | — |
| Caching sin efecto | Prefijo cambia, es menor al mínimo o el TTL expiró | Estabilizar el prefijo; TTL de 1 h si hay huecos largos | Revisar `usage` de cache |
| RAG responde de memoria | Chunks llegan mal formados al prompt (lista vs string) | Extraer `.content` y unir | Test de integración retrieval → prompt |
| RAG no encuentra un identificador exacto | Match semántico prioriza otro chunk | Sumar búsqueda léxica | — |

### G.4 Claude Code y plugins

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Archivos fuera de alcance borrados | `bypassPermissions` + patrón más amplio de lo pensado | Restaurar desde control de versiones; volver a `default`/`acceptEdits` | Deny rules en rutas sensibles; `auto` en lugar de bypass |
| El agente editó un directorio prohibido por CLAUDE.md | Regla diluida en un archivo enorme | Mover la regla a un hook; limpiar CLAUDE.md | CLAUDE.md corto + rules con `paths` |
| Regla de CLAUDE.md ignorada por un subagente | Explore y Plan no cargan CLAUDE.md | Usar general-purpose o subagente custom | E.12 |
| Subagente no usa el skill esperado | Los subagentes no heredan skills | Listar el skill en el frontmatter del subagente | Configurar en diseño |
| Skill no carga en el Agent SDK | `settingSources` no configurado | Fijarlo explícitamente | Nunca depender del default |
| Skill falla en la Messages API | Depende de archivos o comandos locales; faltan headers beta | Quitar supuestos locales; agregar headers | Reglas de portabilidad |
| Plugin instala en todos pero solo corre en la máquina del autor | Ruta absoluta o variable de entorno no documentada | `$CLAUDE_PROJECT_DIR` / `${CLAUDE_PLUGIN_ROOT}`; documentar y validar variables | Prueba en máquina limpia |
| Teammates sin la protección del autor | Hook o deny rule no incluido en el bundle | Agregarlo al plugin | Revisar el manifiesto |
| El hook no bloquea | Evento `PostToolUse` o exit 0 | `PreToolUse` y exit 2 con motivo en stderr | Test del hook |
| `rm` pasa sin confirmación en `acceptEdits` | `acceptEdits` auto-aprueba `rm` dentro del directorio | Deny `Bash(rm:*)` o usar `default` | Conocer el modo |

### G.5 MCP y autenticación

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Clave visible en el repo | Valor inline en `.mcp.json` commiteado | **Rotar** la clave (borrarla no alcanza), mover a variable de entorno, avisar a consumidores | Hook + regla en CLAUDE.md |
| Rotar rompe otros servicios | Misma clave compartida y sin inventario | Secret store; credencial por integración | Registro de consumidores |
| 401 repetido leyendo credencial de un archivo en CI | Clave rechazada y guardada en texto plano | Rotar **y** inyectar como variable del runner | Nada de archivos de credenciales |
| Login OAuth vuelve en loop en producción | Redirect URI de producción no registrado | Registrar el URI; evaluar app separada por entorno | Paso en el checklist de deploy |
| Servidor stdio en `.mcp.json` no funciona para un teammate | Falta el runtime local (ej. Node) o se esperaba un servicio compartido | Instalar runtime o pasar a HTTP | Elegir transporte antes del scope |
| Mucho contexto consumido antes del primer mensaje | Demasiados servidores o tools cargadas | Desconectar los que no se usan; `defer_loading`, `enabled` | Registrar solo lo necesario |
| `mcp_toolset` no aplica | Falta header `mcp-client-2025-11-20` | Agregar header | \[Verificar\] versión |
| No se puede conectar un servidor stdio desde la API | El MCP Connector solo soporta HTTP remoto | Gestionar el cliente con el SDK o exponer por HTTP | — |

### G.6 Producción, costo y seguridad

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| El feature cae entero en el primer pico | Sin ruta de error para 429 | Backoff con tope y `retry-after` | Design doc con fallas |
| Los reintentos empeoran el rate limit | Reintentos inmediatos (`sleep(0)`) o doble capa SDK + propia | Backoff exponencial con jitter; una sola capa | D.11 |
| Muchos reintentos inútiles | Se reintentan 400/401/403/404 | Fallar rápido en terminales | Clasificación explícita |
| Rate limit en job nocturno "en chunks" | Loop síncrono, no batching | Message Batches API | E.9 |
| Factura x3 con multi-agente, calidad similar | Fan-out en una tarea acoplada | Un agente con buen contexto | E.16 |
| Factura alta sin explicación | Sin instrumentación por llamada | Wrapper D.12 y ordenar por paso | Instrumentar desde el día uno |
| Unit y functional pasan, end-to-end falla | Contrato de formato roto en una costura | Alinear el traspaso + test de integración | Tests por costura |
| Valor extraído bien formado pero incorrecto (dos fechas en una frase) | Sin caso graded para ese input | Ajustar prompt + caso en el eval | Enumerar bordes con el modelo |
| El agente escribió un archivo que nadie pidió | Prompt injection en contenido externo | Tratar como dato + hook de escritura + mínimo privilegio | C.12 |
| Escritura en producción rompe sistemas dependientes | Salida del loop acotada a validación local, sin HITL | Gate entre "cambio propuesto" y "escritura confirmada" | Pregunta del peor caso en diseño |
| `KeyError` en el parser sin cambios en la app | Alias de modelo avanzó a una versión nueva | Fijar ID completo; rollback a versión previa | Pinning + gate de eval |
| Revisión de seguridad rechaza la plataforma | Elegida por familiaridad; no cumple residencia | Medir desde la región y elegir por residencia | Compliance en scoping |
| PR abierto semanas sin revisión | El maintainer no puede verificarlo | Agregar ejemplo, test y supuestos | Checklist I.12 |
| Segundo equipo no puede reusar el template | Valores hardcodeados, sin docs ni eval | Parametrizar, documentar, empaquetar eval | Empaquetar al terminar el build |

## H. Practical Examples

Los casos del curso, resueltos con la respuesta modelo de cada checkpoint. Sirven como plantilla para situaciones parecidas.

### H.1 Extracción de tickets a JSON (M2, Checkpoint 1)

**Defecto:** "Extract the key information from the ticket below" no fija estructura, campos ni valores.

```text
System: You are a support ticket processor. Extract the key information from each ticket
and return only a JSON object with exactly these three fields: category (one of: billing,
technical, escalation), urgency (one of: low, medium, high, critical), and summary
(a single sentence describing the issue). Return only the JSON object. No other text.
```

Salida esperada para "Mi API key dejó de funcionar al rotarla y producción está caída": `{"category": "technical", "urgency": "critical", "summary": "..."}`.

### H.2 Dos tools que se pisan (M2)

`search_docs` ("find information about the product") y `get_context_summary` ("retrieve relevant information from the current session") son iguales para Claude. Arreglo, una oración de "cuándo" y una de "cuándo no" en cada una:

- `search_docs`: "Use when the user asks a question that requires looking up content not already present in this conversation. Do not call this if the answer is available in the current session context."
- `get_context_summary`: "Only use this if the answer is already present in the current session. Do not use this to look up new information."

### H.3 Traza de tool\_use con ID equivocado (M2, Checkpoint 3)

El asistente emite `tool_use id="toolu_01"`; el turno siguiente devuelve `tool_result tool_use_id="toolu_02"` → `invalid_request_error: tool_result block references unknown tool_use_id`. No es problema de descripción ni de `required`: la tool se eligió bien. Arreglo: `tool_use_id="toolu_01"`.

### H.4 El agente que editó un rate limit en producción (M2)

Loop `read_file` → `write_file` → `validate_config`, con salida al pasar la validación y tope de 10 iteraciones. En producción corrigió un rate limit "fuera de rango" del que dependían otros sistemas; la app del cliente empezó a fallar. El loop estaba bien; faltaba un estado entre "cambio propuesto" y "escritura confirmada" con revisión humana. Pregunta de diseño que faltaba: *¿cuál es el peor resultado si `write_file` corre sin revisión?*

### H.5 Debug acumulado de M2 (4 capas)

| Capa | Bug | Arreglo |
| --- | --- | --- |
| Schema | `"description": "Gets data."` | "Use this to retrieve full account and contact details for a customer by customer ID. Do not use this for order history or transaction records." |
| Streaming | El turno se guarda aunque no llegue `message_stop`, y se filtran los bloques `thinking` | Guardar todos los bloques solo si `stop_seen`; si no, `StreamInterruptedError` |
| Contexto | `tool_result` sin un turno de asistente completo con su `tool_use` | Se resuelve al arreglar streaming: el turno del asistente se agrega antes del `tool_result` |
| Memoria | Concatena todas las transcripciones previas | Storage externo + resumen de la última sesión al iniciar (D.5) |

### H.6 Presupuesto de contexto: recibos (M2)

Tope del equipo: 40k tokens (control de costo, la ventana del modelo era mucho mayor). Desarrollo: 20 recibos × \~800 tokens ≈ 18.000 tokens en toda la sesión. Producción: \~3.200 tokens por output; 8 turnos ≈ 25.600 tokens solo en outputs, y con system, usuario y asistente se llegó al tope en el turno 8. Síntoma: tools equivocadas y análisis incompletos. Causa: las instrucciones quedaron desplazadas. Arreglo: podar outputs tras usarlos y compactar antes del tope.

Checkpoint 5 (mismo patrón): cuatro `fetch_policy_document` de 2.400 tokens (9.600 acumulados) y en el turno 5 elige `search_knowledge_base` en vez de `apply_coverage_rule`. Los turnos 1-4 correctos descartan un problema de schema. Respuesta: podar después de cada turno y compactar antes del turno 5. Subir `max_tokens` no sirve.

### H.7 Integración acumulada de M3 (3 archivos)

| Archivo | Defecto | Corregido |
| --- | --- | --- |
| `.claude/settings.json` | `"defaultMode": "bypassPermissions"` en una workstation con migración a producción | `"defaultMode": "acceptEdits"`, manteniendo `"deny": ["Read(.env.production)"]` |
| `SKILL.md` | `/Users/priya/scripts/validate-migration.sh` | `$CLAUDE_PROJECT_DIR/scripts/validate-migration.sh` |
| `.mcp.json` | `"Authorization": "Bearer sk-prod-warehouse-abc123"` | `"Authorization": "Bearer ${WAREHOUSE_MCP_TOKEN}"` + rotar la clave filtrada |

### H.8 Hardening acumulado de M4 (3 capas)

```python
def answer(question, page_url):
    page = fetch(page_url)                             # contenido externo
    notes = read_file("/workspace/input/notes")
    write_file(page.suggested_path, summarize(page))   # BUG 3: ruta tomada del contenido externo
    resp = None
    for i in range(5):
        try:
            resp = client.messages.create(model=MODEL, max_tokens=MAX_TOKENS,
                                          messages=msg(question))
            break
        except Exception:
            time.sleep(0)                              # BUG 2: reintento inmediato de todo
    return resp.content[0].text                        # BUG 1: sin eval que proteja regresiones
```

| Capa | Defecto | Arreglo |
| --- | --- | --- |
| Eval / test | Solo tres demos manuales, sin holdout ni casos graded | Eval con set graded corrido en cada cambio |
| Error / costo | Reintenta todo de inmediato y sin distinguir terminales | `call_with_retry` de D.11 |
| Seguridad | Escribe donde dice la página externa, sin hook ni alcance | Ruta fija bajo `/workspace/output`, hook `PreToolUse` de D.13, contenido tratado como dato |

### H.9 Despliegue acumulado de M5 (3 capas)

| Capa | Defecto | Arreglo |
| --- | --- | --- |
| Empaquetado | `repo_path="/home/acme/checkout"` hardcodeado | Parámetro `repo_path` |
| Despliegue y versionado | `model="opus"` (alias) sin versión previa | `"us.anthropic.claude-opus-4-8"` fijado + `retain_previous_pinned_version=True` + gate de eval |
| Trust boundary | `next_call(input=fetched)` | `next_call(input=treat_as_data(fetched))` |

Código completo en D.15.

### H.10 Requisitos de un banco europeo (M5, Checkpoint 3)

Agente que resume transcripciones de llamadas, con revisión humana antes de guardar en la UE.

| Tipo | Ejemplo válido | No válido (por qué) |
| --- | --- | --- |
| Funcional | "El agente produce un resumen que un humano aprueba antes de guardarlo" | "Rápido y preciso" (no verificable) |
| Infraestructura | "Los datos de transcripciones se procesan en la UE" | "Usa una plantilla de prompt aprobada" (es comportamiento, no infraestructura) |

Consecuencia: residencia UE → Bedrock o Vertex con región fijada; latencia medida desde eu-west con el payload real (12 KB en el ejemplo de M5), no desde una laptop.

### H.11 Elegir configuración por palanca de costo (M4)

| Escenario | Configuración |
| --- | --- |
| Lookup de un dato en corpus estable | `single_agent(model=SMALL, retrieval="fetch_once")` |
| Investigación amplia en partes independientes | `orchestrator_worker(lead=LARGE, workers=SMALL, n=5)` |
| Respuesta de cara al usuario que debe sentirse instantánea | `single_agent(model=SMALL, stream=True)` |
| Job no urgente y sensible al costo | `single_agent(model=SMALL, batch=True, cache=True)` |

### H.12 Cálculos rápidos

- **Imagen 1.920×1.080:** ⌈1920/28⌉ × ⌈1080/28⌉ = 69 × 39 = 2.691 tokens visuales (antes de cualquier downscaling por límites del modelo).
- **Multi-agente:** una consulta de \~10.000 tokens con lead + 4 subagentes ≈ 150.000 tokens (×15).
- **Caching:** escritura a 1,25x y lecturas a 0,1x: el costo combinado baja solo si cada prefijo se lee varias veces dentro del TTL.
- **Piso de confiabilidad:** respuesta en 4 s y hasta 3 reintentos; bajar a 2 reintentos no es aceptable si sube la tasa de fallas por encima de lo que permite el piso.

## I. Checklists

Listas para tildar antes de cada entrega. Si un ítem no aplica, anotá por qué.

### I.1 Design document (antes de escribir código)

- [ ] Criterios de éxito verificables para casos representativos
- [ ] Cada falla esperada marcada como reintentable o terminal, con lo que recibe el usuario
- [ ] Presupuesto por request, techo mensual, objetivo de latencia y piso de confiabilidad
- [ ] Inputs no confiables listados y acciones mínimas definidas
- [ ] Restricción regulatoria nombrada (HIPAA, GDPR, FedRAMP, privilegio, política interna)
- [ ] Patrón elegido (llamada, workflow o agente) con justificación
- [ ] Memoria elegida según la forma de las sesiones

### I.2 Prompt listo para producción

- [ ] System prompt con rol, alcance y formato
- [ ] Output constraint: campos, tipos, límites, preámbulo, qué hacer si falta el dato
- [ ] Datos e instrucciones separados con XML tags
- [ ] Few-shot solo si la estructura lo requiere, incluyendo casos ambiguos
- [ ] Structured outputs si la salida la consume código
- [ ] Manejo de `stop_reason` (`max_tokens`, `refusal`)
- [ ] Razonamiento apagado si la tarea es mecánica
- [ ] Validado con el eval, no a ojo

### I.3 Loop de agente (checklist del curso, M2)

- [ ] Todas las tools necesarias registradas; ninguna referida en el prompt sin estar registrada
- [ ] System prompt nombra la tarea y las tools disponibles, ni más ni menos
- [ ] Cada `tool_use` recibe su `tool_result` antes del siguiente turno; todos los de un turno juntos
- [ ] Al menos un punto HITL definido (antes de tools destructivas)
- [ ] Condición de salida que no depende de que Claude decida parar, más tope de iteraciones
- [ ] Descripciones con condición de exclusión; `required` mínimo
- [ ] Errores de tools con `is_error: true`
- [ ] Turno del asistente guardado completo (text, tool\_use, thinking)

### I.4 Streaming

- [ ] Bloques acumulados por `index`
- [ ] JSON de tools parseado solo en `content_block_stop`
- [ ] Historial actualizado solo tras `message_stop`
- [ ] Turno parcial descartado y request reintentado ante corte
- [ ] `stop_reason` leído de `message_delta` antes de seguir el loop
- [ ] Test que corta el stream a mitad de un `tool_use`

### I.5 Contexto y costo

- [ ] Tokens medidos con el mayor input real de producción (`count_tokens`)
- [ ] Tools y system prompt cacheados con prefijo estable
- [ ] Poda de tool outputs y compactación antes del tope
- [ ] Prompt de compactación que preserva archivos, decisiones y errores
- [ ] Tokens, latencia y error rate instrumentados por llamada
- [ ] Batches para trabajo offline; nunca loops síncronos en chunks
- [ ] Costo de imágenes calculado con la imagen más grande esperada

### I.6 Repo con Claude Code

- [ ] CLAUDE.md revisado tras `/init`, por debajo de \~200-300 líneas, sin historial ni notas archivadas
- [ ] Guía específica en `.claude/rules/` con `paths`
- [ ] `.claude/settings.json` con `defaultMode` acorde al riesgo, allow y deny
- [ ] Deny en archivos sensibles (`.env*`, configs de producción)
- [ ] Hooks `PreToolUse` para reglas innegociables y `PostToolUse` para auditoría
- [ ] Ningún `bypassPermissions` fuera de contenedores descartables
- [ ] Subagentes que deben respetar CLAUDE.md no son Explore ni Plan

### I.7 Plugin antes de distribuir

- [ ] Cero rutas absolutas; `$CLAUDE_PROJECT_DIR` o `${CLAUDE_PLUGIN_ROOT}`
- [ ] Scripts, configs y assets incluidos en el bundle
- [ ] Variables de entorno documentadas y validadas al instalar
- [ ] Hooks y deny rules necesarios incluidos en el bundle
- [ ] Nombre del plugin elegido como interfaz (prefijo de comandos)
- [ ] Descripciones de skills que funcionan como criterio de match
- [ ] Instalación probada en máquina limpia

### I.8 Servidor MCP

- [ ] Transporte acorde a dónde corre (stdio local, HTTP remoto)
- [ ] Scope acorde a quién lo usa
- [ ] Ningún secreto inline; solo `${VARIABLE}`
- [ ] Hook que bloquea credenciales inline en `.mcp.json`
- [ ] Tools limitadas por permisos `mcp__servidor__tool` o `mcp_toolset`
- [ ] Solo los servidores necesarios conectados
- [ ] Redirect URIs de OAuth registrados para cada entorno
- [ ] Runtime local documentado para servidores stdio en scope project

### I.9 Eval

- [ ] Dataset con casos típicos, irregulares y bordes (incluye los de incidentes)
- [ ] Grader acorde a la forma de salida
- [ ] Juez con rúbrica, bandas y razonamiento antes del puntaje
- [ ] Acuerdo juez-humano medido y aceptable
- [ ] Baseline fijado
- [ ] Desglose por caso revisado en cada corrida
- [ ] Un solo cambio por iteración
- [ ] Tests unit, functional, integration (cada costura) y end-to-end, con tracing

### I.10 Seguridad y revisión regulada

- [ ] Contenido externo tratado como dato en cada costura
- [ ] Identidad de mínimo privilegio por componente
- [ ] Secretos en entorno o secret store; plan de rotación e inventario de consumidores
- [ ] Configuración de auth protegida
- [ ] Hook que bloquea acciones fuera del límite y registra todo
- [ ] Sandbox de filesystem y red activado
- [ ] Respuesta documentada para: ¿dónde se procesan los datos?, ¿cómo se registra el acceso?, ¿quién bloquea la configuración?
- [ ] ZDR y BAA confirmados por modelo y plataforma
- [ ] Para code modernization: blast radius, auditoría y aprobador de cada fase definidos

### I.11 Despliegue

- [ ] Registro de requisitos funcionales e infraestructura
- [ ] Plataforma elegida por cloud y compliance del cliente, no por familiaridad
- [ ] Latencia medida desde la región del cliente con su payload
- [ ] Costo total por llamada (tokens, egress, fees, integración)
- [ ] ID completo del modelo fijado; prompt y activo versionados
- [ ] Versión previa conservada para rollback
- [ ] Promoción con tráfico parcial y eval contra baseline

### I.12 Acelerador y contribución

- [ ] Valores específicos del cliente como parámetros con defaults documentados
- [ ] Supuestos, inputs y fallas manejadas documentados
- [ ] Eval suite y log de auditoría empaquetados
- [ ] Derechos y atribución confirmados
- [ ] Canal correcto (Cookbook o repo propio)
- [ ] Código que hace una sola cosa, con ejemplo ejecutable, test y supuestos

## J. Glossary

| Término | Definición | Módulo |
| --- | --- | --- |
| Accelerator | Solución empaquetada para que el próximo proyecto la configure en lugar de reconstruirla: parámetros documentados, supuestos escritos, eval incluido | M5 |
| `acceptEdits` | Permission mode que auto-aprueba ediciones y comandos comunes de filesystem dentro del directorio de trabajo | M3 |
| Adaptive thinking | Modo de razonamiento actual: el modelo decide cuánto pensar; se regula con `effort` | M1, M2 |
| Agent SDK (Claude Agent SDK) | Runtime que expone el mismo loop de Claude Code (`claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`). Distinto del Anthropic SDK | M2, M3 |
| Agentic search | El modelo hace sus propias búsquedas en varias rondas en lugar de traer contexto una sola vez | M2, M3, M4 |
| Alias de modelo | Nombre corto (ej. `opus`) que resuelve a una versión que cambia con el tiempo y puede variar por plataforma | M5 |
| Anthropic SDK | Wrapper oficial de la API REST (auth, requests, reintentos, parseo); no corre un loop de agente | M1, M2 |
| BAA | Business Associate Agreement de HIPAA; cubre configuraciones específicas, no Console, Workbench, betas ni planes de consumo | M2 |
| Backoff exponencial | Espera creciente entre reintentos, con tope, número máximo y jitter; respeta `retry-after` | M4 |
| Batches (Message Batches API) | Envío asíncrono masivo (hasta 100.000 requests o 256 MB), menor costo, hasta 24 h | M1, M2, M4 |
| `bypassPermissions` | Modo sin confirmaciones ni protección de rutas; solo para entornos descartables | M3 |
| Cache breakpoint | Marca `cache_control` que cachea todo hasta ese bloque; hasta 4 por request | M2, M3, M4 |
| Chunking | División del corpus en unidades recuperables para RAG | M2 |
| CLAUDE.md | Archivo en la raíz del proyecto que se carga en cada sesión de Claude Code | M3 |
| Claude Cookbook | Repositorio de GitHub con implementaciones de referencia enfocadas | M5 |
| Claude Managed Agents | Servicio beta donde Anthropic corre el loop y el sandbox; el agente es un recurso versionado | M2, M3 |
| Code-graded check | Grader que valida la salida con código (parse, rango, campo) | M4 |
| Compaction | Resumir el historial para liberar contexto (`/compact`, server-side en la API o manual) | M2 |
| Constrained decoding | La API solo permite tokens que mantienen la salida válida contra un schema | M2 |
| Context window | Total de tokens que un modelo procesa en una request, incluida su salida | M1, M2 |
| Contribution readiness | Código enfocado, ejemplo ejecutable, test, supuestos y derechos confirmados | M5 |
| `count_tokens` | Endpoint que cuenta tokens de un request sin ejecutar inferencia | M2 |
| `custom_id` | Identificador por request en un batch, para emparejar resultados | M2 |
| Deny rule | Regla de settings que bloquea una acción; siempre gana sobre allow | M3 |
| Deployment platform | Dónde corre el workload: API, Claude Platform on AWS, Bedrock (y legacy), Vertex AI o terceros | M5 |
| Design document | Página con criterios de éxito, fallas, presupuesto y trust boundary, escrita antes del código | M4 |
| `dontAsk` | Modo que solo permite lo pre-aprobado y niega el resto; para CI | M3 |
| `effort` | Parámetro que regula la profundidad del adaptive thinking | M1, M2 |
| Eval | Casos + comportamiento esperado + calificación; define "terminado" antes de lanzar | M1, M4 |
| Exclusion condition | Oración en la descripción de una tool que dice cuándo no usarla | M2 |
| Few-shot (multi-shot) | Varios ejemplos input→output dentro del prompt | M1, M2 |
| Files API | Subida única de archivos referenciados por `file_id` (beta) | M2 |
| Function signature | Nombre de la función más sus parámetros, tipos y defaults | M2 |
| Gate | Decisión de pasar de una fase del ciclo de vida a la siguiente | M5 |
| HITL | Human-in-the-loop: revisión o aprobación humana antes de una acción consecuente | M2, M3 |
| Hook | Comando ligado a un evento del ciclo de Claude Code que corre siempre, sin depender del modelo | M3, M4 |
| Integration test | Test de la costura entre dos componentes; donde se esconden las fallas silenciosas | M4 |
| `is_error` | Flag de `tool_result` que indica que la tool falló | M2, M4 |
| Jailbreak | Intento de que el modelo ignore sus restricciones de seguridad | M4 |
| Least privilege | Dar a cada identidad o componente solo el acceso que su tarea necesita | M4, M5 |
| LLM-as-judge | Segundo modelo que califica salidas abiertas con una rúbrica; requiere calibración | M4 |
| Managed settings | Configuración enterprise (`managed-settings.json`) que ningún usuario ni proyecto puede sobrescribir | M3 |
| Marketplace | Catálogo de plugins; el oficial viene incluido y se agregan otros desde GitHub | M3 |
| MCP | Model Context Protocol: capa estándar que expone tools, resources y prompts desde servidores | M2, M3 |
| MCP Connector | Integración de la API con servidores MCP remotos vía `mcp_toolset` | M2, M3 |
| `message_stop` | Último evento de un stream; marca el mensaje completo | M2 |
| Non-determinism | Inputs idénticos no garantizan outputs idénticos | M1 |
| OAuth | Autenticación con login del usuario en el navegador; token emitido y guardado por el cliente | M3 |
| Orchestrator-worker | Lead que planifica, subagentes en paralelo y síntesis; \~15x tokens | M4 |
| Permission mode | Configuración de cuándo Claude Code pide confirmación | M3 |
| Pinned model ID | ID completo que resuelve a un snapshot fijo | M5 |
| `plan` mode | Modo que solo permite leer y proponer hasta aprobar el plan | M3 |
| Plugin | Bundle versionado de skills, hooks, subagentes y servidores MCP | M3 |
| Prompt caching | Reutilizar el procesamiento de un prefijo idéntico entre requests | M2, M3, M4 |
| Prompt injection | Instrucciones ocultas en contenido leído por el agente que se toman como órdenes | M4, M5 |
| PreToolUse / PostToolUse | Eventos de hook antes (puede bloquear) y después (no puede) de una tool | M3, M4 |
| Pruning | Volver a un mensaje anterior y descartar lo posterior | M2 |
| RAG | Retrieval-augmented generation: traer solo los fragmentos relevantes al contexto | M2, M3 |
| Refactor | Cambiar la estructura interna sin cambiar el comportamiento externo | M2 |
| Refusal | `stop_reason` cuando el modelo rechaza; llega como HTTP 200 | M2, M4 |
| Resource (MCP) | Datos de solo lectura que expone un servidor por dirección, directa o con template | M3 |
| Retriable vs terminal | Si reintentar podría funcionar (429, 529, 5xx) o no (400, 401, 403, 404) | M4 |
| `retry-after` | Header que indica cuánto esperar antes de reintentar | M4 |
| Rules file | Archivo en `.claude/rules/` acotado con `paths`, que carga solo al tocar esos archivos | M3 |
| Sampling / temperature | Selección probabilística del siguiente token; `temperature` ajusta la dispersión | M1 |
| Sandbox (OS-level) | Aislamiento de filesystem y red a nivel de sistema operativo; control residual | M4 |
| Secret store | Servicio que guarda credenciales, las entrega en runtime y registra accesos | M3 |
| `settingSources` | Opción del Agent SDK que define si carga CLAUDE.md, skills y settings del filesystem | M2, M3 |
| Skill | `SKILL.md` con nombre, descripción e instrucciones que cargan bajo demanda | M2, M3 |
| SOC 2 | Marco de auditoría del AICPA sobre cómo una organización maneja datos de clientes | M2 |
| State | Información que un agente lleva entre turnos | M2 |
| stdio | Transporte MCP local por subproceso | M2, M3 |
| `stop_reason` | Campo que indica por qué paró la generación (`end_turn`, `tool_use`, `max_tokens`, `refusal`, ...) | M1, M2 |
| Streamable HTTP | Transporte MCP remoto recomendado (POST + SSE opcional por GET) | M2, M3 |
| Strict tool use | `strict: true` en una tool: argumentos validados contra el schema | M2 |
| Structured outputs | Salida restringida a un JSON schema por la API | M2 |
| Subagent | Instancia separada con contexto limpio; no hereda historial ni skills, sí permisos | M2, M3 |
| System prompt | Contrato de comportamiento persistente para toda la sesión | M2 |
| Thinking block | Bloque con el razonamiento y su firma; debe devolverse sin cambios | M2 |
| Token | Unidad de texto que mide costo y presupuesto de contexto | M1 |
| Tool schema | `name` + `description` + `input_schema` que Claude lee para decidir | M2 |
| `tool_use` / `tool_result` | Bloque con la llamada pedida por Claude / bloque con el resultado, emparejados por ID | M2 |
| Trace | Registro paso a paso de una ejecución para localizar fallas | M4 |
| Transport (MCP) | Canal entre cliente y servidor MCP | M3 |
| Trust boundary | Punto donde datos o instrucciones pasan de un entorno a otro | M4, M5 |
| Visual token | Parche de 28×28 px de una imagen | M2 |
| Workflow | Secuencia de pasos definida en código | M2 |
| XML tags | Delimitadores descriptivos que separan instrucciones, datos y ejemplos | M2 |
| Zero-shot / one-shot | Instrucción sin ejemplos / con un ejemplo | M1 |
| ZDR | Zero Data Retention; elegibilidad varía por modelo y plataforma | M2, M4 |

## Fuentes

Material del curso *Claude Certified Developer – Foundations* en la carpeta del usuario: módulos M1 a M5 (contenido, checkpoints y respuestas modelo). Referencias que cita el propio curso:

- [platform.claude.com/docs](https://platform.claude.com/docs): API, tools, MCP, structured outputs, modelos, errores, caching.
- [code.claude.com](https://code.claude.com/): Claude Code, permission modes, hooks, sandbox.
- [docs.claude.com](https://docs.claude.com/)
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents): patrones de workflow y agentes.
- trust.anthropic.com: autorizaciones (FedRAMP, ZDR, BAA).
- Cursos de Skilljar citados como fuente: Claude 101, Claude Code 101 In Action, Building with the Claude API, AI Fluency: Framework & Foundations.
