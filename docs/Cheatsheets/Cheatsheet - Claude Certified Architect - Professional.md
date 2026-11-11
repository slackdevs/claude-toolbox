# Cheatsheet profesional: Claude Certified Architect – Professional

Nov 10, 2026 · @Sebastian Larrauri

Guía de trabajo para el Architect que convierte un pedido ambiguo de un partner en una solución con Claude que pasa la revisión de seguridad, obtiene la aprobación de los stakeholders y sobrevive al handoff. Se construyó a partir de los 5 módulos del *Claude Certified Architect – Professional Prep Course* (Skilljar, \~733 min), incluidos los checkpoints y sus respuestas.

## Cómo usar este cheatsheet

**Leyenda de marcas** (se usan en todo el documento):

- **\[OBLIGATORIO\]** regla que el curso presenta como no negociable (ej.: autorización determinística antes de una tool con efectos secundarios).
- **\[RECOMENDADO\]** buena práctica o default razonable (ej.: Sonnet como modelo inicial).
- **\[OPCIONAL\]** técnica que depende del caso (ej.: extended thinking, fine-tuning).
- **\[EXTERNO\]** información que **no** está en el material del curso; aportada para completar (precios, sintaxis de API, fórmulas). Verificala en platform.claude.com/docs antes de usarla con un partner.
- **\[PARTNER TRACK\]** contenido que el propio curso marca como *no evaluado en el examen de Architect* (M4: demo, joint scoping, objeciones, reuse potential).
- Referencias tipo **M1·S11** = Módulo 1, pantalla 11 del curso.

**Índice**

1. A. Quick Reference — reglas de oro, 4 propiedades, 3 capas, 7 primitivas, números clave
2. B. Core Knowledge — el contenido técnico por área de decisión
3. C. Practical Workflows — 9 procedimientos paso a paso
4. D. Tools & Commands — parámetros de API, Claude Code, código de referencia
5. E. Decision Making — tablas para elegir rápido
6. F. Best Practices
7. G. Troubleshooting — síntoma → causa → solución
8. H. Practical Examples — los escenarios del curso con la respuesta correcta y el porqué
9. I. Checklists reutilizables
10. J. Glossary, contradicciones detectadas e información faltante

**Mapa del curso**

| Módulo | Tema | Duración | Pregunta que responde |
| --- | --- | --- | --- |
| M1 | Claude Platform & Solution Design | 238 min | ¿Qué hace Claude, con qué patrón, qué arquitectura, qué modelo/contexto y por qué entry point? |
| M2 | Enterprise Integration & Production | 158 min | ¿Cómo paso de POC a producción: evals, costo, confiabilidad, factibilidad, integración, A/B? |
| M3 | Responsible AI, Safety & Risk | 114 min | ¿Qué control va dónde, cómo falla y cómo lo pruebo ante un auditor? |
| M4 | Stakeholder Engagement, Lifecycle & GTM | 178 min | ¿Cómo hago discovery, presento tradeoffs, opero el feedback loop, documento y demuestro valor? |
| M5 | Team Enablement & Operational Productivity | 45 min | ¿Cómo adopta el equipo el sistema y lo opera sin depender de mí? |

**Las cuatro decisiones que preceden a todo código (M1·S01), en este orden:** (1) qué parte del trabajo es de Claude, (2) qué forma tiene el trabajo (augmented call / workflow / agent), (3) qué arquitectura de referencia comprometés, (4) dónde interactúa con Claude (entry point, modelo, estrategia de contexto). Hacerlas fuera de orden es *el camino más confiable a un pivot caro*.

**Ciclo de vida (M4):** discovery → design → handoff → monitoring → iteration.

## A. Quick Reference

### A.1 Reglas de oro (las 20 que más se evalúan)

1. **Descomponer antes de diseñar.** Cada paso va a Claude, a un sistema existente o a un humano. La pregunta no es “¿dónde puede ayudar Claude?” sino “¿dónde las 4 propiedades favorecen a Claude por sobre el sistema que ya lo hace bien?” (M1·S07)
2. **Una regla que debe acertar siempre no va dentro del modelo.** Umbrales, elegibilidad, prioridad y tarifas viven en el rule engine/SQL. (M1·S08: 41 de 14.000 reclamos mal ruteados)
3. **Retrieval es para conocimiento estable; tool call para estado vivo.** Pedidos, stock, saldos, tiers → tool/API del sistema de registro, nunca un índice. (M1·S17)
4. **Elegí el patrón más simple que cumpla tolerancia a error y observabilidad.** Agente solo si los pasos no se pueden enumerar de antemano. (M1·S11–S12)
5. **Prompting antes que fine-tuning:** prompt → tools/retrieval → evaluator-optimizer → recién ahí fine-tuning. (M1·S11)
6. **Sonnet por defecto.** Subí a Opus o bajá a Haiku solo con un eval que lo justifique. No elegir modelo = elegir el más caro. (M1·S21–S22)
7. **Todo cambio de modelo/prompt/retrieval es un release** y pasa por el eval con umbral de rollback fijado *antes* de correrlo. (M1·S21, M2·S02)
8. **Evals antes que código de producción** y golden dataset actualizado con cada cambio. (M2·S02–S03)
9. **Escalera de grading:** código → LLM-as-judge (calibrado, otro modelo) → humano. (M2·S02)
10. **Modeá costo con la distribución, no el promedio; latencia con p95, no la mediana.** (M2·S05)
11. **Retries cerca de la llamada, circuit breaker en el límite del servicio, fallback en la orquestación.** (M2·S05)
12. **La restricción regulatoria elimina entry points y rutas antes que costo o ergonomía.** (M1·S28, M2·S11)
13. **Identidad y rol se inyectan server-side,** nunca se leen del mensaje del usuario. (M2·S11)
14. **Al contexto entra solo lo necesario para la tarea de lenguaje** (redacción de PII antes de la llamada). (M2·S12)
15. **Claude no puede hacer cumplir una regla que nunca recibió:** el alignment entrenado cubre daño general, no tu política de dominio. (M3·S02–S03)
16. **Tres puntos de control:** input screening, output screening y autorización de tool calls (determinística). Tus guardrails fallan **cerrados**. (M3·S07)
17. **Revisión humana por stakes, no por volumen:** baja confianza + (irreversible o costoso) → humano antes de la acción. (M3·S13)
18. **Cada obligación = control + dueño + artefacto de evidencia vivo.** Una ruta compatible es prerequisito, no prueba. (M3·S16)
19. **Todo tradeoff se presenta en 3 elementos: gana / cede / costo de revertir** (+ postura de compliance en regulados). (M4)
20. **Documentá decisión + alternativas rechazadas + tradeoff.** Test: ¿un Architect que no estuvo puede hacer un cambio seguro? (M4)

### A.2 Las 4 propiedades de la IA generativa (lente de todo el curso)

| Propiedad | Capacidad | Limitación | Mitigación | Consecuencia de diseño |
| --- | --- | --- | --- | --- |
| Next-token prediction | Patrones comunes: resumir, reformatear, explicar | Precisión en específicos: nombres, fechas, citas, estadísticas | Citas, señalar incertidumbre, loops generador-verificador, tool calls a fuentes autoritativas | No-determinismo → por qué existen los evals |
| Knowledge | Temas comunes, recientes y consistentes en el training | Temas raros, de nicho, disputados o cambiantes; responde desactualizado con el mismo tono seguro | Web search, RAG, tool use, MCP: un sistema externo es la fuente de verdad | Límites de conocimiento → por qué existen retrieval y tools |
| Working memory | Todo lo que entra en la context window | Borde duro: fuera de la ventana no existe | Carga progresiva, chunking, info crítica al frente, resumir entre turnos, Projects | Contexto finito → la estrategia de contexto es una decisión de diseño |
| Steerability | Instrucciones cortas, concretas, verificables, con formato y límites | Instrucciones abstractas, cadenas largas de razonamiento, cálculo numérico/lógico preciso; cumple la letra y no la intención | System prompts, structured outputs, code execution; re-enunciar el objetivo junto a la instrucción | Confianza ≠ validez → por qué importa dónde va el humano |

### A.3 Las 3 capas de la plataforma (no son alternativas: toda solución tiene las tres)

| Capa | Qué decide | Se elige según | Ejemplos |
| --- | --- | --- | --- |
| Entry point | Quién habla con Claude y cómo | El usuario y el trabajo | Claude.ai (web/móvil/desktop), Claude Code, Cowork, Claude in Chrome, Claude for Excel, app propia sobre la API |
| Build-time interface | Contra qué programa el equipo | El equipo de ingeniería y la integración | Direct API, SDKs, MCP, Agent SDK |
| Delivery route | Sobre qué infraestructura termina el tráfico | Compromisos cloud y compliance | Anthropic 1P, AWS Bedrock, GCP Vertex AI, Microsoft Foundry |

### A.4 Las 7 primitivas

| Primitiva | Trabajo en una palabra | Definición |
| --- | --- | --- |
| Tools | Actuar | Función de tu código que el modelo puede invocar para actuar o traer un resultado |
| MCP | Conectar | Protocolo para exponer tools de modo que varios clientes de Claude lleguen a los mismos |
| Subagents | Aislar / paralelizar | Subtarea acotada en un contexto separado |
| Hooks | Garantizar | Código determinístico que se dispara en eventos y hace cumplir una regla que el modelo no puede saltear |
| Skills | Empaquetar un procedimiento | Unidad versionada y reutilizable (instrucciones + scripts opcionales) |
| Agent Teams | Coordinar pares | Varios agentes como pares coordinados, cada uno dueño de parte del objetivo |
| Dynamic Workflows | Componer en runtime | Los pasos del workflow se arman en tiempo de ejecución |

Regla de economía: usar la menor cantidad de primitivas que cumpla el requisito; cada una es algo para construir, observar y gobernar.

### A.5 Números y datos clave del curso

| Dato | Valor | Fuente |
| --- | --- | --- |
| Prompt demasiado largo (tokens) | `400 invalid_request_error` (rechazado antes de generar) | M1·S02 |
| Body excede el límite de bytes | `413 request_too_large` | M1·S02 |
| Generación que choca con el techo de la ventana | stop reason `model_context_window_exceeded`, salida truncada | M1·S02 |
| Refusal por clasificador de streaming | `stop_reason: "refusal"` + `stop_details` (desde Opus 4.7) con categoría: `cyber`, `bio`, `frontier_llm`, `reasoning_extraction` | M3·S07 |
| Errores transitorios | 429 rate limit, timeouts, 5xx (500, 503, 529 overloaded) | M2·S05, glosario |
| Cache TTL por defecto | 5 minutos; requiere marcadores `cache_control`; escribir cache cuesta más que input normal | M2·S08 |
| Cache read (ejemplo del curso) | \~10% de la tarifa de input | M2·S05 |
| Batch API (ejemplo del curso) | 50% de descuento, hasta 100.000 requests por batch, solo si el SLA admite asincronía | M2·S08 |
| Context window | 1M tokens en la mayoría de los modelos actuales; algunos 200k | M2·S09, S18 |
| 80 páginas | ≈ 29.000 tokens | M2·S18 |
| `inference_geo` (API 1P) | valores `"us"` y `"global"` (no hay pin a EU) | M2·S11 |
| Workspaces por organización | máximo 100 | M2·S13 |
| Alerta de costo sugerida | > 150% del promedio de 7 días | M2·S14 |
| Permission modes de Claude Code | 6: default, acceptEdits, plan, auto, dontAsk, bypassPermissions | M1·S28 |
| Server-managed settings de Claude Code | se refrescan con polling cada hora | M5·S02 |
| Constitución de Claude | última versión publicada: enero 2026 | M3·S02 |
| Prioridad de la constitución | broadly safe → ethical → guidelines → genuinely helpful (holística, no estricta) | M3·S02 |
| `budget_tokens` | deprecado en la generación 4.6; removido en Sonnet 5 (devuelve 400) | M1·S21 |
| Adaptive thinking + effort | control recomendado en Opus 4.6+, Sonnet 4.6+, Sonnet 5; único modo en Claude Fable 5 | M1·S21 |
| Foundry “Hosted on Azure” (GA) | Opus 4.8, Sonnet 5, Haiku 4.5 (al momento del curso) | M1·S28 |
| Volumen producción vs piloto | 1 a 2 órdenes de magnitud más | M4·S11 |

> ⚠️ Todos los números de precios, límites y modelos cambian. El curso pide verificarlos en platform.claude.com/docs (pricing, models, model-deprecations) al momento de usarlos.

## B. Core Knowledge

### B.1 Descomposición y delegación (M1·S07–S10)

La descomposición produce un **mapa de delegación**: para cada parte del pedido decidís si es trabajo apropiado para IA, trabajo retenido por humanos o colaborativo (Claude redacta, una persona decide). Justificá cada asignación con tres preguntas: **reversibilidad** (¿se puede deshacer?), **stakes** (¿cuánto cuesta un error?) y **accountability** (¿quién responde?). Delegation es la primera de las 4 competencias de AI Fluency (Delegation, Description, Discernment, Diligence).

| Dueño | Qué le corresponde | Ejemplos típicos |
| --- | --- | --- |
| Claude | Trabajo que se beneficia de comprensión de lenguaje, resumen, planificación, redacción o acción mediada por tools | Leer un reclamo, extraer un número de pieza de una foto, redactar un email |
| Sistemas existentes | Lo que el partner ya pagó para que sea confiable: servicios, motor de políticas, tablas de reglas, base de registro | Prioridad, elegibilidad, cobertura, stock, tier de contrato, total facturable, garantía |
| Humanos | Juicio, excepciones, aprobaciones, momentos donde acertar importa más que ir rápido | Aprobar un reembolso > £2.000, emitir un reembolso, escalar un incidente de seguridad |

Patrón “split”: “Enviar el email al ajustador” se divide en **redactar** (Claude) + **enviar** (sistema de email) + **aprobar** por encima de un umbral (humano).

Costo de sobre-asignar a Claude: pagás el modelo para lo que hacía una query; los errores dejan de ser trazables; el modelo no avisa cuando su información quedó vieja.

### B.2 Patrones: augmented LLM, workflow, agent (M1·S11)

| Patrón | Dónde vive el control de flujo | Usar cuando | Cuidado |
| --- | --- | --- | --- |
| Augmented LLM | Tu código; una sola invocación acotada (puede sumar tools, retrieval, extended thinking) | Tarea bien definida, salida verificable, sin motivo para partirla | Expone la distribución de salida del modelo sin guardas por paso |
| Workflow | Tu código, en pasos nombrados | El costo del error es real, importa la observabilidad y los pasos se conocen de antemano | Latencia aditiva; costo escala con pasos |
| Agent | Dentro del modelo (elige su secuencia de tool calls) | El camino **no se puede enumerar** y el costo de una salida inesperada es aceptable y recuperable | Siempre con tools acotadas, presupuesto por turno, permisos explícitos y criterio de parada \[OBLIGATORIO\] |

**Sub-patrones de workflow** (combinables; elegí el más simple y escalá solo si la medición lo pide):

| Sub-patrón | Forma | Cuándo | Ejemplo |
| --- | --- | --- | --- |
| Chaining | Paso 2 consume la salida del 1 | Etapas con handoffs claros | Extraer obligaciones → clasificar riesgo → memo |
| Routing | Un clasificador (a menudo Claude) elige el camino | Entradas de distinto tipo | Ticket: billing → índice de cuentas; técnico → docs; escalación → humano |
| Parallelization | Llamadas concurrentes, se agregan o votan | Subtareas independientes | 12 contratos de proveedores en paralelo → reporte de riesgo |
| Evaluator-optimizer | Uno genera, otro evalúa y pide revisión, loop hasta criterio o límite de reintentos | Calidad verificable pero un intento no alcanza | Código contra test suite; extracción con schema estricto; respuesta a queja contra rúbrica |

**Packaging de la capacidad** (decisión aparte del patrón): prompt-only → direct tool use → **Skills-based architecture** (Skill versionada que empaqueta procedimiento, instrucciones y scripts). Skill cuando el procedimiento se repite, se distribuye entre equipos/productos o debe versionarse y gobernarse.

**Fine-tuning** \[OPCIONAL\]: solo tras prompt → tools/retrieval → evaluator-optimizer. Casos válidos: volumen muy alto donde el costo de inferencia es la restricción real; latencia crítica donde un modelo chico especializado gana; formato consistente que el prompting no resolvió. Te ata a una versión fija. Disponibilidad limitada: confirmar con el account team de Anthropic.

Nota de costo: los agentes no cuestan automáticamente más; lo que manda es cuánto contexto se acumula y cuántas llamadas se hacen. Un workflow mal diseñado puede costar más que un agente bien diseñado.

### B.3 Sistemas multi-agente (M1·S13–S15)

- **Orchestrator**: dueño del objetivo; descompone, delega y sintetiza. *Nunca* hace el trabajo de la subtarea.
- **Subagents**: dueños de subtareas acotadas, cada uno en su contexto.
- Hay que **diseñar** (no asumir): cómo se descompone, cómo se estructura cada resultado para combinarlo y cómo se resuelven conflictos o huecos.
- **Fan-out** es la forma más común: dividir un ítem grande (400 archivos, 200 documentos, 50 reglas) en unidades independientes, un subagente por unidad, en paralelo, y sintetizar.
- **Asimetría de fallas:** falla de subagente = recuperable (reintentar, re-rutear, descartar y marcar el hueco); falla del orquestador = casi siempre irrecuperable. Hacé el trabajo de subagentes idempotente y reintentable; protegé el estado del orquestador con checkpoints.
- **Coverage check en la síntesis** \[OBLIGATORIO\]: resultados devueltos = unidades despachadas, o la corrida marca la diferencia antes de que alguien lea el resumen (caso “48 revisadas” sobre 50).
- **Trace ID compartido** propagado a todos los subagentes.
- **HITL checkpoint**: gate antes de cualquier acción irreversible o de alto riesgo; muestrear las de bajo riesgo en lugar de gatear cada una.

### B.4 Arquitecturas de referencia (M1·S16–S18)

Son referencias, no planos: entendé por qué funcionan y adaptalas.

| Arquitectura | Bien hecha | Dónde se rompe |
| --- | --- | --- |
| Agent | Tools limitadas + presupuesto de turnos; para caminos no escribibles (investigar un codebase, investigación multi-fuente, casos complejos) | Autonomía sin límites: tools que cambian estado sin revisión, sin límite de turnos, sin medir si se cumplió el objetivo |
| RAG | Corpus estable (manuales, docs, normativa) chunkeado e indexado; se recuperan los chunks relevantes | Usarlo para estado vivo (pedidos, inventario, colas): el índice es un snapshot |
| Document processing pipeline → Evaluator-optimizer | OCR → extracción contra schema → validación → ruteo de excepciones | Sin camino de excepción: baja confianza pasa igual, sin gate humano |
| Customer-service / ticket triage → Routing | Clasificar intención y rutear: retrieval para docs, API transaccional para estado vivo, aprobación humana para acciones de alto impacto | Retrieval para estado del pedido; sin escalación a humano; desplegar un agente antes de medir el workflow ruteado |
| Coding agent | Fase agéntica de exploración + pasos determinísticos parse → plan → propose → test → review; subagentes para tareas aisladas | Editar y commitear sin gate humano; no medir regresiones por lenguaje/framework; tratarlo como conversación y no como pipeline |

Combiná dos arquitecturas **solo** cuando las dos partes del problema fallan de maneras distintas que vale la pena manejar por separado; si es porque todavía no decidiste qué problema resolvés, adaptá una sola. Cada arquitectura lleva **su propio eval set**.

### B.5 Diseño del pipeline RAG (M1·S19–S20)

| Chunking | Cómo | Cuándo |
| --- | --- | --- |
| Fixed-size | Tramos uniformes con overlap | Texto homogéneo sin límites naturales; el más simple |
| Semantic | Corta en cambios de tema/significado | Prosa larga donde el chunk debe ser autocontenido |
| Hierarchical | Preserva secciones/subsecciones | Documentos estructurados: contratos, manuales, políticas |

| Indexing | Matchea | Cuándo |
| --- | --- | --- |
| Dense (embeddings) | Similitud semántica | Consultas con otras palabras que la fuente |
| Sparse (keyword, BM25) | Términos exactos, códigos, IDs | Números de pieza, citas legales, códigos de error |
| Hybrid | Ambos combinados | Consultas mixtas (caso típico de producción); fusionar con **reciprocal rank fusion** |

Triple tradeoff: calidad de retrieval · latencia · mantenimiento. Chunks más chicos + hybrid suben calidad y latencia; chunks grandes + dense-only bajan latencia y mantenimiento pero pierden exact-match. La calidad de retrieval no se ve en la salida: se mide contra un set etiquetado.

### B.6 Modelo y estrategia de contexto (M1·S21–S23)

**Términos que no hay que confundir:** context window (espacio de atención activo; se reinicia entre llamadas) · retrieval (conocimiento externo traído en el momento) · estado persistente de la aplicación (de tu sistema; requiere tool call) · resúmenes y capas de memoria (continuidad gestionada por la app; el modelo no tiene memoria nativa entre llamadas).

**Selección de modelo:** Opus (más capaz: razonamiento exigente, código avanzado, síntesis), Sonnet (default), Haiku (barato/rápido). Moverse solo con eval.

**Tamaño de ventana:** no presupuestes la ventana completa. Presupuestá conversación realista más grande + contexto recuperado + system prompt + scratch + margen. Medí con el campo `usage` y la token-counting API; no uses ratios fijos de caracteres por token.

| Estrategia | Gana su lugar | Se rompe |
| --- | --- | --- |
| Monolítica | Tareas acotadas de tamaño predecible; prefijos estables cacheables; Q&A single-shot; razonamiento que necesita todo a la vez | Conversaciones/loops que acumulan; costo y latencia lineales; la atención se degrada antes del límite |
| Progresiva (default para producción) | Multi-turno; loops de agente; workflows con handoffs angostos | Coherencia de largo alcance; detalle perdido; cache más difícil; el input del paso N no es reconstruible |
| Retrieval (RAG) | Bases demasiado grandes; fuentes que cambian más rápido que el deploy; se necesita citar | Síntesis entre muchos docs; chunking que parte tablas/código; el doc correcto no entra al top-k |
| Compaction | Agentes largos; transiciones de fase; sesiones que llegarían al límite | Resúmenes que pierden identificadores, números, decisiones; es un costo extra; casi irreversible; la fidelidad no se mide bien |

En producción se combinan. Cuatro preguntas separadas: ¿qué necesita al inicio? (baseline monolítico) · ¿qué de los pasos recientes? (ventana progresiva) · ¿qué podría buscar bajo demanda? (retrieval) · ¿qué se puede comprimir sin perder detalle decisivo? (compaction). Estrategia y tamaño de contexto son decisiones separadas.

**Extended thinking** \[OPCIONAL\]: pasada de razonamiento con tokens propios, facturados como output y con latencia extra. Corré los evals sin él; activalo solo si hay una brecha de precisión medida después de trabajar el prompt. Se factura lo consumido, no el resumen visible. Control actual: adaptive thinking + parámetro effort (ver A.5).

**Gate de cambio de modelo** \[OBLIGATORIO\]: (1) test set curado que cubra la distribución real, (2) función de grading, (3) umbral delta fijado **antes** de correr. Caso Sonnet→Haiku: 250 docs estratificados; Sonnet 0,94 vs Haiku 0,86; dos tipos en 0,71 y 0,74 < 0,85 → migración rechazada; salvataje = rutear esos dos tipos a Sonnet y el resto a Haiku.

### B.7 Prompting como arquitectura (M1·S24–S27)

- **System prompt empresarial**: rol y alcance + restricciones (qué nunca / qué siempre) + **output contract**. La ambigüedad es un defecto multiplicado por cada request.
- **Template**: slots parametrizados + andamiaje fijo que carga las garantías; llenar un slot no puede quitar una restricción.
- **Description** (competencia 4D): alcance, formato, restricciones. La subespecificación es el hueco que el modelo llena distinto cada vez.
- Un guardrail subespecificado es peor que uno ausente: aparenta control sin sustancia. Los guardrails críticos van en el **output contract** (estructural), no como frase en el rol.
- **Técnicas**: zero-shot (default) → few-shot (si el formato es más fácil de mostrar) → chain-of-thought (si la respuesta depende de una secuencia de pasos). Cada paso suma tokens y latencia.
- Un prompt tuneado para un modelo es punto de partida para otro: el par prompt-modelo es lo que se despliega.
- **Sesgo en prompts**: frases dirigidas, ejemplos desbalanceados, supuestos en la instrucción. Redactá neutral y balanceá ejemplos.
- **Caching**: prefijo estable primero, contenido dinámico después del breakpoint; TTL según frecuencia de llamada; si se llama poco o el prefijo es chico, la escritura puede costar más que el ahorro.
- **Prompt library vs Skill**: library = fragmentos que se ensamblan en código, gobernanza liviana, un equipo; Skill = SKILL.md + scripts + versionado, procedimiento estable, distribuido, con aprobación y rollback.

### B.8 Entry points, build-time interfaces y delivery routes (M1·S28)

**Entry points para usuarios**

| Entry point | Para quién | Tradeoff |
| --- | --- | --- |
| Claude.ai (web, móvil, desktop) | Knowledge workers sin código; Projects y conectores (Slack, Outlook, Drive) | Costo de construcción cero, cero integración: no se embebe ni se customiza |
| Claude.ai consumer (Free, Pro, Max) | Individuos y equipos chicos, baja sensibilidad | Sin controles de gobierno |
| Claude for Work – Team | Organizaciones | Admin, SSO/SAML, domain capture, compromiso contractual de no entrenar con contenido |
| Claude for Work – Enterprise | Organizaciones reguladas | + SCIM, retención configurable, audit logs, Compliance API, opción HIPAA-ready con BAA |
| Claude Code (terminal, IDE, desktop, web) | Ingenieros | Excelente para código; forma equivocada para flujos no técnicos o backend de productos multiusuario |
| Claude Cowork | Roles no técnicos que necesitan acciones sobre archivos/apps locales (planes pagos; macOS/Windows, Linux en beta) | Acciones reales → más importancia de permisos y revisión |
| Claude in Chrome | Trabajo anclado en apps web | El curso no detalla tradeoff |
| Claude for Excel | Analistas y finanzas | El curso no detalla tradeoff |

**Build-time interfaces** (se apilan, no compiten)

| Interfaz | Qué es | Cuándo |
| --- | --- | --- |
| Direct API | HTTP directo; tu equipo es dueño de retries, streaming, tools, observabilidad, UI | Necesitás una feature que el SDK aún no expone o preferís HTTP crudo |
| SDKs (Python, TypeScript, Java, Go, Ruby, C#, PHP) | Misma capacidad con tipos y helpers; **no** corre un loop de agente | Default para embeber Claude en un producto |
| MCP | Protocolo abierto para exponer tools, prompts y resources a cualquier cliente MCP | La misma tool debe alcanzarse desde 2+ clientes. Con uno solo, agrega overhead |
| Agent SDK (`@anthropic-ai/claude-agent-sdk` en npm, `claude-agent-sdk` en PyPI) | Loop de agente gestionado (el mismo de Claude Code) desde tu app | Claude debe actuar en múltiples turnos dentro de tu producto; cedes control fino del loop |

Regla: ¿una request, una respuesta? API/SDK. ¿Tools reutilizables entre clientes? MCP. ¿Claude actuando en varios turnos dentro de tu producto? Agent SDK. MCP y tool use de la API no son alternativas: un servidor MCP expone tools que el cliente llama con tool use.

**Delivery routes:** el modelo se comporta igual en todas; cambian facturación, identidad, región y contrato. Los CSP suelen ir semanas detrás del API 1P en features nuevas.

| Ruta | Detalles | Elegir cuando |
| --- | --- | --- |
| Anthropic 1P | api.anthropic.com, API key de Anthropic | Sin compromiso cloud fuerte, quiere features el día 1, o consolidar gasto con Anthropic (default) |
| AWS Bedrock | Messages API en `/anthropic/v1/messages` sobre infraestructura AWS, IAM, factura AWS; InvokeModel/Converse = camino legacy documentado; inference profiles para cross-region | Acuerdo enterprise con AWS, stack en AWS |
| GCP Vertex AI | Model Garden, cliente Anthropic Vertex o SDK de Google; modelos habilitados por proyecto | Stack ML en GCP |
| Microsoft Foundry (Azure) | Entra ID, suscripción Azure; dos formas: Hosted on Azure (GA) u Hosted on Anthropic infrastructure | Acuerdo Microsoft; verificar forma de hosting y residencia por modelo |

**Skills como mecanismo de integración:** se adjuntan con `container.skills`, se publican y versionan vía `/v1/skills` y **requieren la Code Execution Tool** (dependencia de sandbox).

### B.9 Capas de customización y gobierno de Claude Code (M1·S28)

| Grupo | Capa | Función |
| --- | --- | --- |
| SHAPING (qué sabe y hace) | CLAUDE.md | Instrucciones y convenciones persistentes cargadas al inicio |
| SHAPING | Skills | Procedimientos invocados bajo demanda (contexto liviano): commit-push-PR, release notes, migraciones |
| SHAPING | Subagents | Ayudantes con contexto aislado, tools restringidas o system prompt distinto (code review, exploración) |
| SHAPING | MCP servers | Tools externas por protocolo; cuando se reutilizan entre clientes |
| GOVERNING (qué puede tocar) | Hooks | Scripts en eventos del ciclo de vida (antes/después de una tool, inicio de sesión, stop): gates determinísticos |
| GOVERNING | Permission boundaries y approval flows | 6 modos (ver D.2). Permisos = qué puede tocar; hooks = qué debe pasar antes/después |
| GOVERNING | Sandboxing y ejecución restringida | Límites de filesystem, egress de red, superficie de comandos; el entorno hace cumplir el límite |

### B.10 Restricciones reguladas (M1·S28, M2·S11)

| Restricción | Descarta | Suele sobrevivir |
| --- | --- | --- |
| Attorney-client privilege | Claude.ai consumer para revisión privilegiada; cualquier superficie que la firma no pueda auditar punta a punta | API/SDK detrás de la app propia, SSO, gateway aprobado que loguea cada request; la firma es dueña del audit trail |
| HIPAA (PHI) | Cualquier configuración sin BAA que la cubra (un BAA no se extiende a otra configuración); features beta salvo que figuren como elegibles | API/SDK en configuración cubierta por BAA (API 1P con BAA de Anthropic, Bedrock, Vertex); Enterprise HIPAA-ready |
| GDPR y residencia | Rutas donde no se puede fijar la región o los datos salen del límite | Bedrock o Vertex con región fijada; API 1P con `inference_geo` (solo us/global: para residencia EU usar ruta cloud). Foundry EU: “Coming 2026”, verificar |
| FedRAMP / gobierno | Todo lo que no esté en un entorno autorizado al nivel requerido; Claude Enterprise en API directa no está autorizado | Claude for Government (FedRAMP High civil), Bedrock GovCloud (FedRAMP High, DoD IL4/5), Vertex Assured Workloads (FedRAMP High, IL2). Hay lag de modelos |
| Política interna de residencia | Rutas fuera de la lista de proveedores aprobados | La ruta del CSP aprobado por el CIO (es procurement, no ingeniería) |

Distinción clave: **uso para entrenamiento ≠ retención**. Los datos pueden excluirse del training por defecto y aun así retenerse para logging, prevención de abuso, compliance o auditoría (M3·S16). La API no retiene contenido conversacional por defecto, pero tu capa de aplicación sí suele loguear (M2·S11). Las secciones de integración del curso **no** cubren casos ZDR.

### B.11 Evals (M2·S02–S04, S17)

**Workflow de 5 etapas:** (1) definir la tarea y el prompt con criterio de aprobación → (2) golden dataset etiquetado con edge cases y contraejemplos → (3) checks automatizados → (4) scoring con judge → (5) interpretar y actuar (score global + por categoría).

| Tipo | Cómo | Para | Costo | Límite |
| --- | --- | --- | --- | --- |
| Code-based | Schema, regex, JSON parse, largo, assert contra dato autoritativo | Comportamiento inequívoco | Milisegundos, sin API | No evalúa interpretación |
| Model-based (LLM-as-judge) | Judge recibe prompt, salida y rúbrica; devuelve score + razonamiento | Calidad, seguimiento de instrucciones, razonamiento, seguridad, ambigüedad | \~ una llamada por ítem | Inconsistente en casos borde; exigile razonamiento |
| Human review | Persona con rúbrica | Alto riesgo, capacidades nuevas, calibrar judges | El más caro | No escala sin muestreo |

**Rigor del judge:** rúbricas detalladas, veredictos restringidos (pocas etiquetas fijas), calibración contra ejemplos etiquetados por humanos y **un modelo distinto** al evaluado (evita self-preference). Un judge sin calibrar es peor que ningún grade automático porque *parece* confiable. Volumen sobre perfección: muchos casos autograduables > pocos graduados a mano.

**De requisito a criterio:** comportamiento específico (“extraer nombre, número de reclamo, fecha de incidente y monto”) → umbral desde el negocio (ej.: 100% en campos estructurados, < 2% alucinación, 99,5% dentro de schema) → modos de falla como categorías → inputs adversariales.

**Multi-turn evals**: categoría aparte con su propio golden dataset de conversaciones completas; mide contexto previo, no inventar detalles en follow-ups y calidad a medida que se alarga.

Riesgo mayor: un eval suite **desactualizado** da falsa confianza (el momento de más riesgo de regresión es cuando hay evals y están viejos). Recurso: Claude Cookbooks `misc/building_evals.ipynb`.

### B.12 POC → producción (M2·S05–S07)

Un POC responde “¿puede hacerlo?”, no “¿cuánto cuesta a escala?” ni “¿qué pasa si falla una dependencia?”. Las 4 dimensiones invisibles en una demo: **costo, latencia, confiabilidad, modos de falla**. Capturalo igual como primera señal de la métrica de negocio.

| Control | Qué hace | Dónde va |
| --- | --- | --- |
| Retry con exponential backoff | Reintenta transitorios (429, timeout, 5xx) con esperas crecientes y tope de intentos/tiempo | Junto a la llamada a la API |
| Circuit breaker | Mide tasa de error de una dependencia; al superar el umbral corta y falla rápido durante un cooldown | En el límite del servicio |
| Fallback chain | Si el primario no está, rutea a otro tier o a respuesta cacheada sin error al usuario; se prueba en el eval suite | En la capa de orquestación |

| Arquitectura | Qué se rompe primero | Mitigación |
| --- | --- | --- |
| Agent | Uso de tools sin límite y contexto creciente | Presupuesto de tokens por turno, máximo de tool calls, criterio de parada, tools mínimas; evaluar el comportamiento de parada |
| RAG | Drift de calidad de retrieval (reindexado, desalineación, refresh) | Retrieval en el eval loop; precisión y recall como métricas de sistema; separar live-state de conocimiento |
| Document pipeline | Sin camino de excepción para baja confianza | Confidence scoring; cola humana para baja confianza; edge cases en el eval |
| Orchestrator-workers | Límites de falla difusos, trazas fragmentadas, subagente caído en silencio | Límites recuperables vs irrecuperables, trace ID compartido, conciliación de cobertura |

**Model version pinning** \[OBLIGATORIO\]: disciplina operativa para toda arquitectura; fijá versiones, monitoreá platform.claude.com/docs/en/about-claude/model-deprecations y mantené un runbook de actualización.

### B.13 Sizing, factibilidad y ROI (M2·S08–S10)

**Modelo de costo (4 inputs):** volumen de llamadas (del dueño de negocio, no de un dataset de muestra) · presupuesto de tokens por request (input + output, como **distribución**: la cola de requests largos suele subestimar el costo x2–x3) · tier de modelo · sensibilidad (¿y si se duplica el volumen?, ¿y si la distribución se corre a la cola?).

**Scoping en 4 pasos:** requisito de negocio → lista de capacidades → boceto de arquitectura (descomposición) → condiciones de borde → alcance en el SOW.

| Veredicto | Significa | Documentar |
| --- | --- | --- |
| Feasible as scoped | Las 4 propiedades favorecen a Claude, costo dentro del techo, p95 dentro del SLA, sin controles compensatorios que cambien la arquitectura | Los supuestos (si cambian, pasa a “with constraints”) |
| Feasible with constraints | Funciona bajo condiciones que hay que hacer cumplir (largo de doc, frecuencia de reindexado, gate humano) | Cada restricción y su modo de falla si se viola |
| Not feasible | Una limitación no compensable dentro de alcance y presupuesto | Qué restricción descalifica y qué reducción de alcance cambiaría el veredicto |

**Preguntas de factibilidad por propiedad:** next-token (¿generación probabilística o precisión en valores?) · knowledge (¿depende de info rara/reciente/de dominio?) · working memory (¿entra en la ventana?; la más olvidada) · steerability (¿instrucciones concretas y verificables?).

**ROI en 4 pasos:** (1) baseline medido en unidad de negocio con datos del dueño → (2) estado proyectado en la misma unidad, incluyendo el costo de la revisión humana → (3) restar el costo de ejecución del sizing (distribución, no promedio) → (4) payback period (build + run) con sensibilidad. **5 pilares del business case:** efficiency, transformation, productivity, solution cost, performance SLAs.

### B.14 Integración empresarial (M2·S11–S13)

Orden de capas: **compliance** (filtra rutas y entry points) → **identidad y SSO** → **autorización y política** (el modelo de autorización de tus sistemas gobierna también la capa Claude) → **manejo de datos y PII** → **observabilidad y audit logging**.

- **Identidad server-side**: verificá antes de la llamada e inyectá rol y datos autorizados en el system prompt; agregá departamento, nivel o IDs solo si cambian la respuesta.
- **La context window no es un límite de gobierno de datos**: si alcanza un ID de referencia, no pases el dato completo.
- **Least-privilege de tools**: por cada tool, ¿esencial o conveniente?; quitá las de fuera de alcance y registrá la justificación; en orchestrator-worker, cada subagente solo con las tools de su tarea.
- **Qué loguear** (4): request (versión de modelo, tokens de input, ID de prompt) · response (tokens de output, latencia, stop reason) · contexto (rol, session ID, si hubo cache) · outcome (si el downstream aceptó la salida).
- **Multi-tenant**: API keys separadas por tenant para atribución y aislamiento; usar **Workspaces** (keys acotadas a un workspace, límites de gasto y rate por workspace; máximo 100 por organización → agrupar tenants). Workload Identity Federation es autenticación, no aislamiento.
- Los equipos de seguridad tratan la observabilidad como **precondición** para habilitar agentes: verificá qué acciones agénticas quedan en los audit logs de cada superficie.

### B.15 A/B testing y observabilidad (M2·S14–S16)

| Componente | Requiere | Si falta |
| --- | --- | --- |
| Hipótesis | Tratamiento, dirección de la métrica primaria, umbral y restricciones sobre secundarias | Cualquier resultado parece un éxito |
| Asignación | Aleatoria y consistente por usuario/sesión | Grupos no comparables |
| Métrica primaria | Una sola, definida antes | Outcome-shopping |
| Tamaño de muestra | Desde efecto mínimo detectable, baseline y confianza; mayor varianza en LLMs → más muestra | No distingue efecto de ruido |

Significancia estadística ≠ relevancia. Antes de declarar ganador: ¿el efecto justifica el overhead? y ¿se degradó alguna secundaria? Ojo con interacciones tratamiento × tipo de input (picos estacionales).

**Shadow testing**: la versión nueva recibe copia del tráfico, se loguea y se puntúa offline; ningún usuario la ve. Usalo cuando un mal output es demasiado riesgoso o el tráfico es bajo; en regulados suele ser la única opción. Cuesta la señal de comportamiento real.

**Observabilidad a escala**: tracing por request (modelo, versión, tokens, latencia, stop reason, tool calls) → métricas (costo/request, p50/p95, task success, error por tipo; descomposición por request) → detección de anomalías (alertas por umbral; drift por comparación de distribuciones) → atribución de cambio (**model drift** vs **data drift** vs **efecto de update de modelo**).

**Taxonomía de fallas:** prompt failure (arreglo en el prompt) · hallucination (grounding, no más instrucción) · model mismatch (selección gateada por eval) · orchestrator-workers failure (traza que cruce ambos). **Discernment** = clasificar cada salida en aceptable / revisar / override y realimentar evals. Construí la **capa de traducción** métrica técnica → KPI de negocio en el diseño (task success → first-contact resolution; latencia → handle time).

### B.16 Responsible AI: el stack de seguridad (M3)

**Training-time alignment vs inference-time control.** Anthropic entrena a Claude contra una constitución; eso reduce clases amplias de daño pero es general por diseño. Las reglas de tu despliegue se hacen cumplir en inferencia: instrucciones de sistema + screening + autorización + revisión.

| Capa | Cubre | No cubre | Dueño |
| --- | --- | --- | --- |
| Comportamiento entrenado | Clases amplias de daño, en toda request | Tu política de dominio, reglas de datos, autorización | Anthropic |
| Instrucción del system prompt | Rol, tono y restricciones dentro de una request | Lo que un input adversarial puede convencer de saltear (instrucción ≠ enforcement) | Architect |
| Runtime screening | Detectar contenido no permitido en input y output | Acciones con efectos secundarios; ataques novedosos | Architect |
| Authorization | Si esta acción está permitida para este caller en este contexto | Calidad de contenido y equidad | Architect |

**Categorías de riesgo LLM:** direct prompt injection · **indirect prompt injection** (vía contenido recuperado o salida de tools; el vector dominante en enterprise) · token-budget exhaustion · tool/action abuse · data exposure (contexto o logs). La evaluación de riesgos es un **entregable escrito**: categoría, componente, probabilidad × impacto, control mitigante con dueño y artefacto.

| Punto de decisión | Model-based cuando | Determinístico cuando |
| --- | --- | --- |
| Input screening (antes de la llamada) | Intención ambigua; jailbreak/prompt injection | Regla clara: blocklist, regex, largo, formato |
| Output screening (antes de devolver) | Toxicidad, cumplimiento de política | String conocido, campo prohibido, violación de schema |
| Tool-call authorization (antes de efectos) | Rara vez | Casi siempre: allowlist + identidad + scope; debe ser demostrable y reproducible |

Model-based se evade; determinístico es frágil → **encadenalos**. Screená también **contenido recuperado y outputs de tools** antes de agregarlos al contexto. **Fail closed** en tus guardrails (los controles de seguridad de Anthropic no son configurables por el operador y no fallan abiertos). Tras un refusal, reiniciá el contexto (quitá o reformulá el turno que lo disparó).

&#91;embedded content: camino guardado · 3 puntos de control + screening externo\]

Un solo filtro de salida no cubre los otros puntos: la tool con efectos debe autorizarse antes de ejecutarse, y todo lo que vuelve de RAG o de tools se trata como input no confiable.

**Seguridad de la supply chain de Skills:** auditar el bundle buscando llamadas anómalas (red, shell, filesystem, credenciales) y operaciones fuera de alcance respecto del propósito declarado → ejecutar con least privilege en sandbox (sin credenciales permanentes) → solo fuentes confiables (registro interno, publishers verificados, releases firmados) → veredicto registrado: **approve / reject / remediate** (y re-auditar). No asumas que la plataforma escanea Skills por vos.

**Fairness y transparencia:** 4 puntos de entrada de resultados desiguales: corpus de retrieval, framing del prompt, ejemplos few-shot, ruteo downstream. Tres audiencias: usuario afectado (por qué, en términos accionables), regulador (consistencia y reconstrucción), equipo (traza completa). **Decision logging** = inputs + contexto recuperado + salida + ruteo, por decisión, consultable. El log mismo entra al registro de compliance (minimización, retención, acceso).

**Ruteo a revisión humana:** reversibilidad y costo del error fijan los stakes; la confianza (calibrada) estima la probabilidad de error y decide cuánto volumen pasa sin revisión.

| Ubicación | Da | Cuesta |
| --- | --- | --- |
| Pre-action approval | Nada irreversible pasa sin revisar | Latencia y disponibilidad; no escala |
| Post-action audit | Throughput alto | El error ya ocurrió: solo para reversibles y de bajo costo |
| Sampled review | Monitorea calidad sin frenar | Un caso malo puede no ser muestreado |

El revisor necesita: **inputs + salida + razón del flag**. Evitá la **consent fatigue**: revisión en checkpoints de mayor valor (plan review, excepciones), como la revisión a nivel de plan en Claude Code. **Diligence** = puntos de accountability humana explícitos.

**Registro de controles de compliance:** cada obligación → control técnico + dueño + artefacto de evidencia (BAA firmado + pantalla de HIPAA habilitado + lista de features elegibles; registro de autorización de la ruta; configuración de residencia + data-flow record; reconstrucción de muestra desde el log vivo). Se revalida periódicamente porque las configuraciones derivan.

### B.17 Stakeholders, ciclo de vida y GTM (M4)

**Discovery = filtro de 3 pasos:** escuchar → traducir → escribir. Una preferencia (“seamless”, “rápido”, “simple”) es señal de que faltan preguntas: ¿qué lo haría *no* seamless? **4 categorías de preguntas:** qué debe hacer · qué no debe hacer (nadie lo ofrece, hay que preguntarlo) · cuánto debe costar (latencia, costo por interacción, volumen) · qué debe probar (obligaciones de evidencia). Salida: **tabla de traducción** (declaración · restricción implícita · decisión arquitectónica · supuesto a documentar). Requisito = traza a algo que dijo el stakeholder; supuesto = no fue dicho (el más peligroso es el no documentado).

**Tradeoff framing:** qué ganamos · qué cedemos · qué cuesta revertir · (regulados) qué hace a la postura de compliance. Presentá un **paquete de decisión**: opciones, criterios, recomendación y riesgos remanentes. **Description** aplicada a stakeholders: empezar por el resultado de negocio, enunciar límites honestamente, anticipar la necesidad de justificar ante pares.

**Objeciones técnicas** \[PARTNER TRACK\]: capacidad · gobierno/compliance · elección de diseño (explicar el tradeoff y lo que hubiera costado la alternativa). **Demo** \[PARTNER TRACK\]: escenario reconocible, limit placement (1–2 límites nombrados de antemano), co-diseño con ventas, datos con forma real (anonimizados). **Joint scoping con Applied AI** \[PARTNER TRACK\]: llegar con requisitos/restricciones documentados, patrón(es) candidato(s) con tradeoffs y preguntas abiertas que solo ellos pueden responder.

**Feedback loop:** capa de decisión sobre la observabilidad: Signals → Triage → Decide → Act → Review. **SLA** = qué se mide + qué es breach + qué pasa ante breach; umbrales trazables a UX (latencia), criticidad (disponibilidad) y evals (calidad). El costo es la expectativa que más se rompe tras el lanzamiento: dar forecast de consumo y postura de control de gasto antes de la primera factura. En regulados hay **checkpoints por calendario** que disparan aunque ninguna métrica esté fuera de rango.

**Documentación para 3 lectores:** quien hereda (decisiones + alternativas rechazadas + por qué), auditor (obligación → control → dueño → evidencia), Architect que vuelve (decisiones fechadas, supuestos rotulados, pendientes con dueño y criterio de cierre).

**Multi-plataforma:** los identificadores de modelo difieren por ruta; las features pueden ir detrás en CSP; Bedrock/Vertex requieren configurar región explícitamente (el endpoint global por defecto rompe residencia). Requiere un **entry-point-responsibility map** antes de la primera línea de integración. **Outcome document (6 campos):** caso de uso con límite de alcance · métrica antes · métrica después (misma definición) · control que lo hace auditable · dueño de la medición · potencial de reuso \[PARTNER TRACK\].

### B.18 Enablement del equipo (M5)

- **Entorno como configuración compartida**: CLAUDE.md de proyecto, tools y servidores MCP acordados, postura de permisos; versionado y revisable.
- **Rollout**: un champion por departamento → prueba un workflow real (\~2 semanas) → sesiones por batch (ej.: 45 min con 5 pares) → rollout amplio.
- **Distribución de Skills**: ver tabla en E.8.
- **Spend posture** antes de la primera factura: modelo por defecto, allowlist de modelos, guía de effort, topes de gasto, rate y por usuario.
- **Workflows de desarrollo**: integrar Claude en editor, review y test loop. Fallas típicas: **lumpy adoption** (pocos lo usan mucho) y **stalling at basic chat** (nunca pasan a tools, repo-aware, Skills). **Diligence** → checklist de verificación (corrección, seguridad, mantenibilidad, comprensión humana), automatizado con tests y evals donde se pueda.
- **Soporte operativo = traducción, no firefighting**: conectar síntoma con causa arquitectónica y dejar **runbook** y **escalation path**.

## C. Practical Workflows

Nueve procedimientos, en el orden en que aparecen en un engagement. Cada uno: cuándo · prerequisitos · herramientas · pasos · parámetros · resultado · verificación · errores frecuentes.

### C.1 Discovery estructurado (M4)

- **Cuándo:** primera conversación con el stakeholder, antes de cualquier boceto.
- **Prerequisitos:** acceso al dueño de negocio; idealmente a compliance.
- **Herramientas:** plantilla de tabla de traducción; las 4 categorías de preguntas.
- **Pasos:**
  1. Escuchá el objetivo en lenguaje de negocio; anotá cada palabra de experiencia (seamless, rápido, simple).
  2. Por cada una preguntá: ¿qué lo rompería?, ¿qué nunca debe notar el usuario?, ¿qué debe seguir siendo cierto cuando algo falla?
  3. Recorré las 4 categorías: debe hacer · no debe hacer · debe costar (latencia, costo por interacción, volumen) · debe probar.
  4. Tratá cada “es solo una revisión” como restricción a perseguir (autoridad, timing, legalidad).
  5. Escribí una fila por ítem antes de pasar al siguiente: declaración · restricción · decisión requerida · supuesto a confirmar.
  6. Recién con las 4 categorías cerradas proponé un patrón.
- **Resultado:** tabla de traducción con requisitos testeables y acotados, y supuestos rotulados.
- **Verificación:** cada requisito traza a una frase del stakeholder; todo lo que no traza está marcado como supuesto con dueño para confirmar.
- **Errores frecuentes:** pasar a diseñar a mitad de la llamada (el boceto plausible frena las preguntas); no preguntar volumen, tamaño de input y SLA antes de emitir factibilidad (caso 800 contratos/día, 300 páginas, < 30 s).

### C.2 Descomposición y mapa de delegación (M1)

- **Cuándo:** al convertir un pedido en capacidades.
- **Prerequisitos:** lista de capacidades (cada verbo del pedido por separado).
- **Pasos:**
  1. Separá el pedido en pasos atómicos.
  2. Por paso, aplicá las 4 propiedades: ¿trabajo de lenguaje? (Claude) · ¿regla determinística o dato autoritativo/vivo? (sistema) · ¿alto riesgo, irreversible o con accountability? (humano).
  3. Dividí los pasos mixtos (redactar / enviar / aprobar).
  4. Justificá cada asignación con reversibilidad, stakes y accountability.
- **Resultado:** mapa Claude / sistemas / humanos.
- **Verificación:** ninguna regla que “debe acertar siempre” quedó en Claude; todo dato que cambia viene por tool call; toda acción irreversible tiene gate.
- **Errores frecuentes:** meter umbrales en el prompt; usar RAG para estado vivo; dejar “emitir el reembolso” a Claude.

### C.3 Selección de patrón (M1·S11)

- **Cuándo:** después de la descomposición.
- **Pasos:**
  1. Recorré los 5 factores en orden: predictibilidad → costo del error → observabilidad → latencia → costo. El primero que descarta un patrón decide.
  2. Si elegís workflow, elegí sub-patrón(es): chaining, routing, parallelization, evaluator-optimizer.
  3. Si elegís agente, definí tools mínimas, presupuesto por turno, máximo de tool calls, permisos y criterio de parada.
  4. Si es multi-agente, definí descomposición, formato de resultado, regla de conflicto, coverage check, trace ID y gates.
  5. Aplicá el lente de Delegation: ¿la autonomía está justificada por stakes y reversibilidad?
- **Verificación:** podés nombrar el costo de cada patrón descartado; si los caminos son enumerables, no es un agente.
- **Errores frecuentes:** elegir agente “para no restringir” (el equipo que reconstruyó un router + 4 chains dentro del loop en 6 meses).

### C.4 Gate de cambio de modelo / prompt (M1·S21, M2·S02)

- **Cuándo:** cualquier swap de modelo, revisión de prompt, cambio de estrategia de contexto o de retrieval.
- **Prerequisitos:** golden dataset representativo y estratificado por tipo; función de grading; versión actual fijada.
- **Pasos:**
  1. Fijá por escrito el criterio de rollback **antes** de correr (ej.: ningún tipo de documento < 0,85).
  2. Actualizá el golden dataset si el cambio altera el comportamiento esperado.
  3. Corré ambas versiones sobre el mismo set con la misma rúbrica.
  4. Analizá por categoría, no solo el promedio.
  5. Aplicá el criterio sin renegociar; si falla en segmentos, evaluá migración parcial por ruteo.
- **Resultado:** decisión ship / no ship / parcial, documentada.
- **Verificación:** el umbral tiene fecha anterior a la corrida; el reporte incluye desglose por categoría.
- **Errores frecuentes:** eval set construido con inputs cómodos (10 contratos conocidos); eval set que no se actualizó tras cambiar el prompt.

### C.5 Construir un eval suite (M2·S02, S17)

- **Cuándo:** antes del primer código de producción.
- **Pasos:**
  1. Traducí el requisito de negocio a comportamiento específico y medible.
  2. Fijá umbrales desde el negocio (no desde lo que logra el prototipo).
  3. Listá modos de falla → cada uno es una categoría del dataset.
  4. Armá el golden dataset con edge cases, contraejemplos e inputs adversariales (campos faltantes, manuscrito, layouts raros).
  5. Por cada dimensión elegí método con la escalera: código → judge → humano.
  6. Si usás judge: rúbrica detallada, veredictos restringidos, razonamiento obligatorio, modelo distinto, calibración con etiquetas humanas.
  7. Si hay conversación, sumá multi-turn evals con su propio dataset.
  8. Conectá el suite como gate de CI para todo cambio.
- **Verificación:** el judge concuerda con humanos en el set de calibración; cada modo de falla tiene casos.
- **Errores frecuentes:** usar judge para algo determinístico (campos extraídos, auto-deny, fuga entre clientes); spot-checks manuales como sustituto.

### C.6 Sizing, factibilidad y ROI (M2·S08–S10)

- **Cuándo:** antes de comprometer arquitectura o SOW.
- **Prerequisitos:** volumen del dueño de negocio, distribución de tamaños de input, SLA, techo de costo, baseline operativo.
- **Herramientas:** script de costo (D.4), precios vigentes de platform.claude.com/docs/en/about-claude/pricing.
- **Pasos:**
  1. Estimá volumen mensual (incluyendo turnos de continuación).
  2. Modelá tokens como distribución (p50, p95, cola), no promedio.
  3. Calculá input × tarifa input + output × tarifa output; tokens cacheados a tarifa de cache read; sumá escrituras de cache.
  4. Evaluá Batch API si el SLA admite asincronía (y si está cubierto por el BAA en regulados).
  5. Corré sensibilidad: volumen ×2, cola más pesada.
  6. Pasá cada capacidad por las 4 propiedades → controles compensatorios.
  7. Emití veredicto (as scoped / with constraints / not feasible) con la restricción *load-bearing*.
  8. ROI: baseline → proyectado (con costo de revisión humana) − run cost → payback con sensibilidad.
  9. Llevá las condiciones de borde al SOW.
- **Verificación:** el número de costo cambia si cambia el tier o el token budget (ROI y sizing conectados); cada restricción tiene su modo de falla.
- **Errores frecuentes:** presentar costos de demo sin extrapolar; asumir distribución uniforme (la cola consumía 80% del gasto); proyectar automatización total cuando el diseño exige revisión humana.

### C.7 Diseño de integración empresarial (M2·S11)

- **Pasos:**
  1. Identificá la regulación o política que gobierna.
  2. Eliminá entry points y rutas que no sobreviven (BAA por configuración, FedRAMP por nivel, región fijable, lista de proveedores).
  3. Elegí el patrón de integración (gateway, CSP, `inference_geo`).
  4. Identidad: verificación server-side (SSO/OAuth) e inyección de rol y alcance.
  5. Autorización: reutilizá el modelo de permisos del sistema subyacente; filtrá en la capa de retrieval antes de pasar contenido.
  6. Datos: redacción server-side de PII; IDs de referencia en lugar de datos completos.
  7. Tools: auditoría least-privilege con justificación de cada remoción.
  8. Observabilidad: request, response, contexto, outcome; audit log de toda acción que escribe downstream.
  9. Multi-tenant: Workspaces / API keys por tenant.
- **Verificación:** un request log de muestra no contiene PII innecesaria; no hay claims de rol en mensajes de usuario que cambien permisos; cada escritura downstream aparece en el audit log.
- **Errores frecuentes:** SSN e Insurance ID en el user message (miles de entradas en logs); “soy cliente premium” como autorización; API key compartida entre tenants.

### C.8 Montar el camino guardado y el ruteo de revisión (M3)

- **Pasos:**
  1. Dibujá la frontera: qué cubre el entrenamiento (daño amplio) vs qué es tuyo (dominio, datos, autorización).
  2. Escribí la evaluación de riesgos por categoría (direct/indirect injection, token exhaustion, tool abuse, data exposure).
  3. Ubicá input screening (model-based + determinístico), screening de contenido recuperado y outputs de tools, output screening y autorización determinística antes de cada tool con efectos.
  4. Definí la dirección de falla de cada control propio (fail closed) y logueá cada gate bloqueado o fallado.
  5. Manejá `stop_reason: "refusal"` leyendo `stop_details.category` y tolerando su ausencia; reiniciá contexto.
  6. Instrumentá los 4 puntos de fairness y el decision logging.
  7. Regla de ruteo: baja confianza **y** (irreversible **o** costoso) → pre-action approval; confiables, reversibles y baratos pasan; muestreo para monitorear.
  8. Vista del revisor: inputs + salida + razón del flag.
  9. Si usás Skills de terceros: auditoría + sandbox + fuentes confiables + veredicto registrado.
- **Verificación:** prueba de caos: apagá el clasificador y confirmá que bloquea; tool call no autorizada → rechazada; la cola de revisión entra en la capacidad del revisor.
- **Errores frecuentes:** un solo filtro de salida (el reembolso ya se había ejecutado); rutear todo a revisión (400 ítems diarios aprobados a ciegas).

### C.9 Handoff: documentación, feedback loop, outcome y enablement (M4–M5)

- **Pasos:**
  1. Decision log: decisión fechada, alternativas rechazadas, tradeoff (gana / cede / revertir), dueño.
  2. Registro de controles con links a evidencia y estado audit-ready.
  3. Assumption register con dueños y criterios de cierre.
  4. Tabla de gobierno de señales (señal → trigger → acción → checkpoint regulado), incluyendo drifts lentos y checkpoints por calendario, **antes** del lanzamiento.
  5. SLA con umbrales trazables.
  6. Entry-point-responsibility map si hay más de una ruta.
  7. Capturar la métrica de negocio *antes* del deploy; definir dueño de medición; agendar el outcome document.
  8. Configuración compartida, rollout por champions, distribución de Skills con versionado, spend posture.
  9. Runbook síntoma → causa → acción y escalation path.
- **Verificación:** test de completitud — un Architect que no estuvo puede hacer un cambio seguro leyendo solo la documentación.
- **Errores frecuentes:** diagrama sin rationale (el sucesor revirtió la estrategia de contexto y rompió residencia); outcome document con volumen/latencia/errores pero sin métrica de negocio.

## D. Tools & Commands

El curso es de diseño y no trae código; los parámetros de D.1–D.3 son los que nombra. Los scripts de D.4 son **\[EXTERNO\]**: escritos para este cheatsheet y ejecutados (Python 3.13, SDK `anthropic` 2.8, con transporte simulado, sin llamadas reales). Verificá precios y model IDs antes de usarlos.

### D.1 Parámetros y respuestas de la API mencionados en el curso

| Elemento | Uso | Módulo |
| --- | --- | --- |
| `usage` (en cada respuesta) | Tokens reales de input/output (y de cache): base de límites y facturación | M1·S02, S21 |
| Token-counting API | Contar tokens antes de enviar | M1·S02 |
| `cache_control` | Marca el breakpoint del prefijo cacheable; TTL default 5 min | M1·S26, M2·S08 |
| `budget_tokens` | Presupuesto manual de thinking: deprecado en 4.6, 400 en Sonnet 5 | M1·S21 |
| Adaptive thinking + `effort` | Control recomendado de razonamiento | M1·S21 |
| `max_tokens` | Tope de salida; subirlo no mejora la calidad y sí puede subir costo/latencia | M2·S07 |
| `stop_reason: "refusal"` + `stop_details` | Categoría de política (`cyber`, `bio`, `frontier_llm`, `reasoning_extraction`) + explicación; ambos `null` si no hay categoría | M3·S07 |
| `model_context_window_exceeded` | Stop reason: la generación chocó con el techo de la ventana | M1·S02 |
| `inference_geo` | Región de inferencia en la API 1P: `"us"` o `"global"` | M2·S11 |
| `container.skills` | Adjuntar Skills a un request (requiere Code Execution Tool) | M1·S28 |
| `/v1/skills` | Publicar y versionar Skills | M1·S28 |
| Batch API | 50% más barato, hasta 100.000 requests por batch (verificar) | M2·S08 |
| Bedrock: `/anthropic/v1/messages` | Messages API en AWS; legacy: InvokeModel/Converse (boto3) | M1·S28 |

### D.2 Claude Code: permission modes

| Modo | Comportamiento | Usar en |
| --- | --- | --- |
| `default` | Pregunta antes de cada acción | Trabajo interactivo normal |
| `acceptEdits` | Aprueba ediciones y comandos de filesystem comunes (mkdir, touch, rm, mv, cp, sed); otros Bash siguen preguntando | Sesiones de edición de confianza |
| `plan` | Solo lectura hasta que el usuario aprueba el plan | Exploración y revisión a nivel de plan |
| `auto` | Un clasificador aprueba lo seguro y bloquea lo riesgoso; research preview; admin lo habilita en Team/Enterprise; provider default API de Anthropic (variable de entorno para CSPs) | Reducir fatiga de aprobaciones |
| `dontAsk` | Deniega todo lo que pediría permiso; ejecuta solo lo cubierto por allow rules | CI bloqueado |
| `bypassPermissions` | Saltea todos los checks | Solo contenedores o CI aislados |

Otros artefactos: `CLAUDE.md` (contexto persistente), `.claude/skills/` (project Skills versionadas con el repo), hooks en eventos del ciclo de vida, servidores MCP, server-managed settings (polling horario).

### D.3 Admin de Claude for Work / plataforma

- **Organization settings › Skills**: Skill provisionada para toda la organización (los usuarios pueden apagarla, no quitarla).
- **Plugins**: asignados a grupos u org; install preferences: required, installed by default, available, not available (etiquetas exactas según el admin UI, artículo de soporte 13837433); updates versionados desde un repo conectado.
- **Workspaces** (Console): API keys acotadas, límites de gasto y rate por workspace; máximo 100.
- **Spend posture**: modelo por defecto, allowlist, guía de effort, topes de gasto, rate y por usuario.

### D.4 Código de referencia \[EXTERNO\]

**1. Modelo de costo por distribución** (salida verificada: Sonnet sin cache $1.095/mes; con cache $437; request típico $288 vs distribución $893, ×3,1; volumen ×2 $1.786; Haiku con cache $146). Reproduce el checkpoint M2·S07: el cache es la palanca que mete el escenario bajo el techo de $800.

```python
"""Modelo de costo mensual por distribucion de tokens (M2 S08: sizing).
Precios en USD por millon de tokens: PARAMETROS A VERIFICAR en
platform.claude.com/docs/en/about-claude/pricing (no hardcodear en produccion)."""
from dataclasses import dataclass

@dataclass
class Prices:
    input: float          # USD / MTok
    output: float         # USD / MTok
    cache_write_mult: float = 1.25   # escritura de cache vs input (TTL 5 min) - verificar
    cache_read_mult: float = 0.10    # lectura de cache vs input - verificar
    batch_discount: float = 0.50     # descuento Batch API - verificar

def monthly_cost(requests_per_month, segments, prices, cached_prefix_tokens=0,
                 cache_hit_rate=1.0, batch=False):
    """segments: lista de (fraccion_de_requests, input_tokens_variables, output_tokens).
    cached_prefix_tokens: prefijo estable (system prompt) marcado con cache_control.
    cache_hit_rate: fraccion de requests que leen el cache (el resto lo escribe)."""
    assert abs(sum(s[0] for s in segments) - 1.0) < 1e-9, "las fracciones deben sumar 1"
    total = 0.0
    for share, in_tok, out_tok in segments:
        n = requests_per_month * share
        prefix_cost = 0.0
        if cached_prefix_tokens:
            hits, misses = n * cache_hit_rate, n * (1 - cache_hit_rate)
            prefix_cost = (hits * cached_prefix_tokens * prices.input * prices.cache_read_mult
                           + misses * cached_prefix_tokens * prices.input * prices.cache_write_mult) / 1e6
        total += prefix_cost + (n * in_tok * prices.input + n * out_tok * prices.output) / 1e6
    return total * (1 - prices.batch_discount) if batch else total

if __name__ == "__main__":
    sonnet = Prices(input=3.0, output=15.0)   # ejemplo: verificar precios vigentes
    haiku = Prices(input=1.0, output=5.0)
    # Escenario del calculador M2 S07: 50.000 req/mes, system prompt estable 5.000 tok,
    # input usuario 300, output 400, techo USD 800.
    flat = [(1.0, 300, 400)]
    sin_cache = monthly_cost(50_000, [(1.0, 5_300, 400)], sonnet)
    con_cache = monthly_cost(50_000, flat, sonnet, cached_prefix_tokens=5_000, cache_hit_rate=0.98)
    print(f"Sonnet sin cache: ${sin_cache:,.0f}/mes | con cache: ${con_cache:,.0f}/mes | techo $800")
    # Cola pesada: 80% requests cortos, 20% largos. El error tipico es estimar con el
    # request "tipico" (mediana) de la muestra en lugar de la distribucion completa.
    dist = [(0.8, 2_000, 400), (0.2, 40_000, 1_200)]
    tipico = monthly_cost(24_000, [(1.0, 2_000, 400)], sonnet)
    real = monthly_cost(24_000, dist, sonnet)
    print(f"Con request tipico: ${tipico:,.0f} | con distribucion: ${real:,.0f} "
          f"(x{real / tipico:.1f})")
    # Sensibilidad: volumen x2
    print(f"Sensibilidad volumen x2: ${monthly_cost(48_000, dist, sonnet):,.0f}")
    print(f"Haiku con cache (mismo escenario M2): ${monthly_cost(50_000, flat, haiku, 5_000, 0.98):,.0f}")
```

**2. Tamaño de muestra para un A/B** (salida verificada: 70%→75% → 1.251 por grupo, 2.502 en total, 3,1 días a 800 req/día; 62%→68% → 991 por grupo, contra las 50 que usó el equipo del caso).

```python
"""Tamano de muestra por grupo para comparar dos proporciones (A/B, M2 S14).
Formula estandar (aproximacion normal, test bilateral). Solo stdlib."""
from math import ceil, sqrt
from statistics import NormalDist

def n_per_group(p_baseline, p_target, alpha=0.05, power=0.80):
    z_a = NormalDist().inv_cdf(1 - alpha / 2)
    z_b = NormalDist().inv_cdf(power)
    p_bar = (p_baseline + p_target) / 2
    num = (z_a * sqrt(2 * p_bar * (1 - p_bar))
           + z_b * sqrt(p_baseline * (1 - p_baseline) + p_target * (1 - p_target))) ** 2
    return ceil(num / (p_target - p_baseline) ** 2)

if __name__ == "__main__":
    n = n_per_group(0.70, 0.75)                 # caso M2 S18: 70% -> 75%
    per_day = 800                               # requests/dia, split 50/50
    print(f"n por grupo = {n}; total = {2*n}; dias a 800 req/dia = {2*n/per_day:.1f}")
    print(f"Caso 50-session winner (62% -> 68%): n por grupo necesario = {n_per_group(0.62, 0.68)} (se usaron 50)")
```

**3. Retry con backoff, circuit breaker y fallback chain** (salida verificada: éxito al 3.er intento; el breaker abre tras 5 fallas, falla rápido y se recupera tras el cooldown; el fallback cae a Haiku). Nota: el SDK oficial ya reintenta transitorios (`max_retries`); este código muestra la lógica y dónde va cada control.

```python
"""Controles de confiabilidad (M2 S05): retry con backoff (junto a la llamada),
circuit breaker (limite del servicio) y fallback chain (orquestacion). Solo stdlib."""
import random, time

class TransientError(Exception):
    """429, timeout, 5xx (500/503/529): reintentable."""

def retry_with_backoff(fn, max_attempts=4, base_delay=0.5, max_delay=8.0, sleep=time.sleep):
    for attempt in range(1, max_attempts + 1):
        try:
            return fn()
        except TransientError:
            if attempt == max_attempts:
                raise
            delay = min(max_delay, base_delay * 2 ** (attempt - 1))
            sleep(delay * random.uniform(0.5, 1.0))   # jitter evita reintentos sincronizados

class CircuitOpen(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold=0.5, window=20, cooldown_s=30.0, clock=time.monotonic):
        self.threshold, self.window, self.cooldown, self.clock = failure_threshold, window, cooldown_s, clock
        self.results, self.opened_at = [], None

    def call(self, fn):
        if self.opened_at is not None:
            if self.clock() - self.opened_at < self.cooldown:
                raise CircuitOpen("dependencia degradada: fallar rapido")
            self.opened_at, self.results = None, []          # half-open: probar de nuevo
        try:
            out = fn()
            self._record(True)
            return out
        except Exception:
            self._record(False)
            raise

    def _record(self, ok):
        self.results = (self.results + [ok])[-self.window:]
        fails = self.results.count(False)
        if len(self.results) >= 5 and fails / len(self.results) >= self.threshold:
            self.opened_at = self.clock()

def with_fallback(chain):
    """chain: lista de (nombre, callable). Devuelve (nombre_usado, resultado)."""
    errors = []
    for name, fn in chain:
        try:
            return name, fn()
        except Exception as e:      # en produccion: loguear con trace_id
            errors.append(f"{name}: {e!r}")
    raise RuntimeError("todas las opciones fallaron: " + "; ".join(errors))
```

**4. Fan-out con coverage check y trace ID compartido** (salida verificada sobre el caso de 50 secciones: “48/50 revisadas → INCOMPLETO: faltan \[17, 42\]” en lugar de un falso “48 revisadas”).

```python
"""Fan-out con coverage check en la sintesis (M1 S13-S15). Solo stdlib.
Regla: resultados validos == unidades despachadas, o la corrida marca el hueco."""
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed

def run_fanout(units, worker, max_retries=1, timeout_s=60):
    trace_id = str(uuid.uuid4())              # trace ID compartido por todos los subagentes
    results, failed = {}, {}

    def attempt(u):
        last = None
        for _ in range(max_retries + 1):      # el trabajo del subagente debe ser idempotente
            try:
                out = worker(u, trace_id)
                if out is None or out == "":
                    raise ValueError("resultado vacio")
                return out
            except Exception as e:
                last = e
        raise last

    with ThreadPoolExecutor(max_workers=8) as pool:
        futs = {pool.submit(attempt, u): u for u in units}
        for f in as_completed(futs, timeout=timeout_s):
            u = futs[f]
            try:
                results[u] = f.result()
            except Exception as e:
                failed[u] = repr(e)

    missing = set(units) - set(results)
    report = {"trace_id": trace_id, "dispatched": len(units), "returned": len(results),
              "complete": not missing, "missing_units": sorted(missing), "errors": failed}
    return results, report
```

**5. Llamada guardada con el SDK de Python**: identidad server-side, prefijo cacheado, input screening *fail closed*, autorización determinística antes de la tool, refusal con `stop_details` tolerante a su ausencia y log de request/response/contexto. Verificado con transporte simulado: el reembolso de 950 pedido por un `agent` queda bloqueado por autorización; con el clasificador caído se bloquea el input; un refusal `cyber` se clasifica y pide reiniciar el contexto.

```python
"""Llamada guardada a Claude (M2 S11 + M3 S07). Requiere: pip install anthropic.
MODEL_ID es un ejemplo: fijalo (pin) segun platform.claude.com/docs."""
import json, logging, os
import anthropic

MODEL_ID = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")
log = logging.getLogger("claude")

STABLE_INSTRUCTIONS = """Sos el asistente de soporte de ACME.
Alcance: responder sobre el manual del producto. Fuera de alcance: reembolsos y plazos.
Contrato de salida: JSON {"reply": str, "manual_section": str, "needs_human": bool}.
Nunca prometas un reembolso ni un plazo: si se pide, needs_human=true."""

REFUND_TOOL = {
    "name": "issue_refund",
    "description": "Emite un reembolso para un pedido. Requiere autorizacion del servidor.",
    "input_schema": {"type": "object",
                     "properties": {"order_id": {"type": "string"}, "amount": {"type": "number"}},
                     "required": ["order_id", "amount"]},
}

def screen_input(text, classifier):
    """Fail closed: si el clasificador falla, se bloquea (no se deja pasar)."""
    try:
        return classifier(text)              # True = permitido
    except Exception as e:
        log.error("input screening caido -> bloqueo (fail closed): %r", e)
        return False

def authorize_tool(user, tool_name, tool_input):
    """Deterministico y auditable: allowlist + identidad + alcance."""
    allow = {"issue_refund": {"roles": {"supervisor"}, "max_amount": 200.0}}
    rule = allow.get(tool_name)
    if rule is None or user["role"] not in rule["roles"]:
        return False
    return float(tool_input.get("amount", 0)) <= rule["max_amount"]

def ask(client, user, question, manual_section, classifier):
    if not screen_input(question, classifier):
        return {"blocked": "input_screening"}
    resp = client.messages.create(
        model=MODEL_ID,
        max_tokens=1024,
        system=[
            {"type": "text", "text": STABLE_INSTRUCTIONS,
             "cache_control": {"type": "ephemeral"}},                  # breakpoint de cache
            {"type": "text", "text": f"Usuario autenticado: rol={user['role']}, "
                                     f"tenant={user['tenant']}"},       # inyectado server-side
        ],
        tools=[REFUND_TOOL],
        messages=[{"role": "user",
                   "content": f"<manual>{manual_section}</manual>\n<pregunta>{question}</pregunta>"}],
    )
    u = resp.usage
    log.info(json.dumps({"model": resp.model, "stop_reason": resp.stop_reason,
                         "input_tokens": u.input_tokens, "output_tokens": u.output_tokens,
                         "cache_read": getattr(u, "cache_read_input_tokens", None),
                         "role": user["role"], "session": user["session"]}))
    if resp.stop_reason == "refusal":
        details = getattr(resp, "stop_details", None)    # puede no existir segun modelo/SDK
        category = getattr(details, "category", None) if details else None
        return {"refusal": category or "generic", "reset_context": True}
    for block in resp.content:
        if block.type == "tool_use":
            if not authorize_tool(user, block.name, block.input):
                return {"blocked": "tool_authorization", "tool": block.name}
            return {"tool_authorized": block.name, "input": block.input}
    return {"text": "".join(b.text for b in resp.content if b.type == "text")}

# Uso: client = anthropic.Anthropic(max_retries=3)  # lee ANTHROPIC_API_KEY del entorno
```

> Limitaciones: el output screening no está incluido (agregá un validador de schema y/o un judge antes de devolver); `stop_details` existe desde Opus 4.7, en otros modelos el código cae al manejo genérico; para residencia EU no uses `inference_geo` sino una ruta cloud con región fijada.

## E. Decision Making

### E.1 ¿Quién es dueño de este paso?

| Si el paso es… | Dueño | Mecanismo |
| --- | --- | --- |
| Leer, resumir, clasificar, extraer de texto/imagen, redactar | Claude | Llamada con output contract / schema |
| Una regla que debe acertar siempre (umbral, elegibilidad, prioridad, cálculo) | Sistema existente | Rule engine, SQL, código; Claude lo invoca por tool |
| Un dato que cambia (stock, estado, tier, saldo, cobertura) | Sistema de registro | Tool call / MCP al sistema dueño |
| Una acción irreversible o de alto costo, o con accountability legal | Humano | Pre-action approval |
| Enviar/ejecutar algo que Claude redactó | Sistema + humano sobre umbral | Separar redactar / enviar / aprobar |

### E.2 ¿Qué patrón? (los 5 factores en orden; el primero que descarta decide)

| Factor | Augmented LLM | Workflow | Agent |
| --- | --- | --- | --- |
| Predictibilidad (¿podés enumerar los pasos?) | Tarea única acotada | Sí, vos escribís el camino | No: trayectoria impredecible por diseño |
| Costo del error | Medio (sin guardas por paso) | Bajo (guardas entre pasos) | Alto (distribución completa en múltiples turnos) |
| Observabilidad | Media (fácil de loguear, opaca por dentro) | Alta (loguea como código) | Baja (trayectoria tipo transcript; poca tooling para alertar) |
| Latencia | La más baja | Predecible pero aditiva | Abierta: presupuestar el peor caso |
| Costo por request | El más bajo | Escala con los pasos | El más alto si está mal acotado |

Atajos: ¿las trazas caerían en pocas formas conocidas? → router + chains. ¿Subtareas independientes? → parallelization. ¿Calidad verificable pero un intento no alcanza? → evaluator-optimizer. ¿No entra en un contexto? → multi-agente fan-out.

### E.3 ¿Retrieval o tool call? ¿Qué estrategia de contexto?

| Pregunta | Respuesta |
| --- | --- |
| ¿El dato era cierto ayer y lo será mañana (manual, política, FAQ)? | Retrieval (RAG) |
| ¿Su valor actual lo posee un sistema y cambia independiente del índice? | Tool call / API |
| ¿Tarea acotada, input predecible, prefijo estable? | Monolítica (+ cache) |
| ¿Multi-turno o loop de agente? | Progresiva |
| ¿Base demasiado grande o se exige citar? | RAG |
| ¿Sesión larga que llegaría al límite? | Compaction (cuidando identificadores y números) |
| ¿Documentos estructurados con secciones? | Chunking jerárquico |
| ¿Prosa larga? | Chunking semántico |
| ¿Consultas con códigos/IDs y conceptuales a la vez? | Hybrid dense + sparse con reciprocal rank fusion |

### E.4 ¿Qué modelo, thinking y técnica de prompt?

| Situación | Decisión |
| --- | --- |
| Arranque de cualquier paso | Sonnet |
| El eval muestra que Sonnet no llega al umbral | Opus solo en ese paso |
| El eval confirma que la pérdida es aceptable y hay presión de costo/latencia | Haiku (clasificadores, formateo) |
| Algunos segmentos regresan al bajar de tier | Migración parcial por ruteo |
| Brecha de precisión medida tras optimizar el prompt | Extended/adaptive thinking en ese paso |
| Clasificador de ruteo | Sin thinking |
| Tarea clara y acotada | Zero-shot |
| Formato difícil de describir | Few-shot (balanceado) |
| Respuesta depende de pasos condicionales | Chain-of-thought |
| Volumen altísimo, latencia crítica o formato que el prompting no resuelve | Evaluar fine-tuning (con el account team) |

### E.5 ¿Qué entry point, interfaz y ruta? (aplicá primero la restricción que gobierna)

| Señal del brief | Elección | Tradeoff decisivo |
| --- | --- | --- |
| Equipo no técnico, docs aprobados, sin integración | Claude.ai con un Project | Audiencia |
| Necesita governance, SSO, no-training | Claude for Work (Team/Enterprise) | Gobierno |
| Ingenieros sobre un codebase | Claude Code | Audiencia + trabajo |
| Producto para clientes o multiusuario | API/SDK (o Agent SDK) en app propia | Integración; nunca Claude Code como backend |
| Claude debe actuar varios turnos dentro de tu producto | Agent SDK | Loop gestionado vs control fino |
| La misma tool desde 2+ clientes | MCP | Reuso vs complejidad |
| Privilegio: la firma debe poseer el audit trail | API/SDK detrás de app + gateway propio + SSO | Control/gobierno |
| PHI con BAA ya confirmado en una ruta | Esa ruta (no negociar otro BAA) | Cobertura del BAA en *esa* configuración |
| Acuerdo AWS + datos en core banking | Bedrock | Procurement + profundidad de integración |
| Latencia muy ajustada y stack en GCP | Vertex AI | Latencia (ruta dentro de la nube) |
| Residencia EU | Bedrock/Vertex con región fijada | `inference_geo` no fija EU |
| FedRAMP | C4G, Bedrock GovCloud o Vertex Assured Workloads | Autorización al nivel requerido |
| Sin restricciones de procurement ni residencia | API 1P | Features primero |

### E.6 ¿Cómo evalúo esto?

| Comportamiento | Método |
| --- | --- |
| JSON válido / schema, largo, secciones presentes, campo contra fuente, número vs umbral, acción binaria (¿denegó?), fuga de identificadores entre clientes | Code-based |
| Calidad de razonamiento, tono, manejo de una queja emocional, si un resumen captura lo importante, fidelidad de un resumen | LLM-as-judge calibrado |
| Casos críticos nuevos, calibración del judge | Human review (muestreado) |

### E.7 ¿Qué control y dónde? ¿Quién revisa?

| Necesidad | Control |
| --- | --- |
| Jailbreak / prompt injection | Input screening model-based |
| Términos prohibidos exactos | Input screening determinístico |
| Toxicidad / política en la respuesta | Output screening con judge |
| String/campo prohibido o schema | Output screening con validador |
| Reembolsos, escrituras, emails | Autorización determinística antes de la tool |
| Contenido de RAG o de tools | Screening antes de entrar al contexto |
| Baja confianza + irreversible o costoso | Pre-action approval |
| Reversible y barato | Post-action audit |
| Monitorear calidad general | Sampled review |
| Refusal con categoría | Rutear por `stop_details.category`; reiniciar contexto |

### E.8 ¿Cómo distribuyo una Skill al equipo? (M5·S02)

| Necesidad | Mecanismo | Gobernanza / rollback |
| --- | --- | --- |
| Toda la organización, sin versionado | Org-provisioned Skill (Organization settings › Skills) | Alta y baja por el owner; sin pin ni rollback nativo |
| Grupos específicos o despliegue gobernado; ejecución idéntica y revocable desde un lugar | Plugin asignado a grupo/org | Targeting, install preferences, updates versionados desde repo, rollback |
| Convención de un equipo en sus proyectos | Claude Code project Skill (`.claude/skills/`) | Versiona y revierte con el repo |
| Uso programático desde productos propios | API Skill (Messages API container) | Pin de versión explícito |

### E.9 ¿Veredicto de factibilidad, experimento y escalación?

| Situación | Decisión |
| --- | --- |
| Todo dentro de rango y sin control compensatorio estructural | Feasible as scoped |
| Funciona si se respeta una condición (gate, largo, reindexado) | Feasible with constraints (documentar el modo de falla) |
| Depende de un dato vivo cuyo round-trip no se validó en el SLA | No emitir veredicto hasta validarlo |
| Un mal output es inaceptable o hay poco tráfico | Shadow testing |
| Riesgo acotado y volumen alto | A/B en vivo con métrica primaria fijada |
| Alto impacto (cambio grande o consecuencias serias) | Confianza alta → muestra grande |
| Señal dentro de presupuesto / evento conocido | Noise o monitoreo interno |
| Tendencia sostenida de calidad | Architect review → stakeholder review si se confirma |
| Umbral de costo cruzado, auditoría o confirmación de residencia programada | Stakeholder review |
| Problema que vuelve a aparecer | Runbook (no Architect) |
| Problema nuevo | Escalation path al Architect |

## F. Best Practices

**Diseño**

- &#91;OBLIGATORIO\] Nombrá el usuario antes de elegir entry point; la elección sigue al trabajo, no a lo que se usó en el proyecto anterior.
- &#91;OBLIGATORIO\] Toda decisión en la que no elegís explícitamente (tier de modelo, fail direction, retención) se resuelve sola y casi siempre hacia lo más caro o lo menos seguro: elegí por escrito.
- &#91;RECOMENDADO\] La menor cantidad de primitivas, agentes y arquitecturas que cumpla; ante la duda, una sola arquitectura.
- &#91;RECOMENDADO\] Retrieval y tool use son dos mecanismos para dos tipos de datos: mantenelos separados (la base de conocimiento guarda el FAQ; la base transaccional, los pedidos).
- &#91;RECOMENDADO\] Restablecé el objetivo junto a la instrucción cuando letra e intención pueden divergir.
- &#91;RECOMENDADO\] Estático antes que dinámico en todo prompt reusable.

**Producción**

- &#91;OBLIGATORIO\] Pin de versión de modelo + monitoreo de deprecations + runbook de actualización.
- &#91;OBLIGATORIO\] Retries, circuit breakers y fallbacks desde el diseño; probá el fallback dentro del eval suite.
- &#91;OBLIGATORIO\] Costo revisado durante el desarrollo, no mensual tras el lanzamiento.
- &#91;RECOMENDADO\] p95 como objetivo de diseño; descomposición por request además de dashboards agregados.
- &#91;RECOMENDADO\] Alertas: costo > 150% del promedio de 7 días; p95 sobre SLA; drift con comparación periódica de distribuciones.
- &#91;RECOMENDADO\] Mapa métrica técnica → KPI de negocio desde el diseño.

**Seguridad y compliance**

- &#91;OBLIGATORIO\] Identidad y permisos desde la capa de autenticación, nunca desde el mensaje.
- &#91;OBLIGATORIO\] Redacción de PII antes de la llamada y antes de loguear; el filtro es *necesidad para la tarea de lenguaje*, no *conveniencia*.
- &#91;OBLIGATORIO\] API keys / Workspaces por tenant en multi-tenant.
- &#91;OBLIGATORIO\] Autorización determinística antes de toda tool con efectos; guardrails propios fail closed; cada gate bloqueado o fallado queda logueado.
- &#91;OBLIGATORIO\] Contenido recuperado y salidas de tools son input no confiable.
- &#91;OBLIGATORIO\] BAA verificado **por configuración** y features elegibles (beta suele quedar fuera).
- &#91;OBLIGATORIO\] Cada obligación con control, dueño y evidencia viva; revalidación periódica.
- &#91;RECOMENDADO\] Skills de terceros: auditoría + sandbox + fuentes firmadas/verificadas + veredicto registrado.
- &#91;RECOMENDADO\] No asumas que el entrenamiento cubre fairness de tu sistema: instrumentá los 4 puntos de entrada y desglosá métricas por subgrupo.

**Evals y experimentos**

- &#91;OBLIGATORIO\] Evals antes del código; umbral de rollback antes de correr; dataset representativo y actualizado.
- &#91;RECOMENDADO\] Código donde se pueda; judge con otro modelo, calibrado y con razonamiento; humanos para calibrar y para lo crítico.
- &#91;RECOMENDADO\] Hipótesis falsable, métrica primaria y tamaño de muestra definidos antes del A/B; controlar la distribución de inputs entre grupos.
- &#91;RECOMENDADO\] En regulados, shadow testing antes que exponer usuarios a un cambio no validado.

**Stakeholders y handoff**

- &#91;OBLIGATORIO\] Discovery completo (4 categorías) antes de proponer arquitectura.
- &#91;OBLIGATORIO\] Tradeoffs con costo de revertir; en regulados, efecto en la postura de compliance.
- &#91;OBLIGATORIO\] Decisiones con alternativas rechazadas y rationale; supuestos rotulados.
- &#91;RECOMENDADO\] Forecast de consumo a volumen de producción y postura de control de gasto antes de la primera factura.
- &#91;RECOMENDADO\] Medir el baseline de negocio antes del deploy (sin “antes” no hay historia).

**Equipo**

- &#91;RECOMENDADO\] Configuración compartida versionada; rollout por champions y batches.
- &#91;RECOMENDADO\] Toda Skill compartida con versión, dueño y camino de rollback.
- &#91;OBLIGATORIO\] El código generado por IA pasa por el mismo estándar que el humano y quien lo mergea puede explicarlo.
- &#91;RECOMENDADO\] Enseñar el camino síntoma → causa y dejarlo en el runbook en lugar de resolver vos el incidente.

## G. Troubleshooting

**Diagnóstico en 3 pasos:** (1) clasificá la falla (prompt, alucinación, model mismatch, orchestrator-workers; o drift de modelo / de datos / update de modelo) → (2) mirá la traza del request (tokens, latencia, stop reason, tool calls, cache hit) → (3) compará contra el eval set. Cada clase tiene un arreglo distinto: confundirlas lleva al arreglo equivocado.

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Salidas distintas para el mismo input | No-determinismo tratado como determinístico | Checks alrededor de la salida; regla en código | Evals; nunca concluir determinismo de una demo |
| Casos mal ruteados por umbral (“alrededor de cinco mil”) | Regla determinística dentro del modelo | Claude extrae; el sistema aplica el umbral | Descomposición; tests de la regla |
| Respuesta segura pero vieja (pedido “enviado” que volvió al depósito) | RAG sobre estado vivo; similitud ≠ verdad | Tool call al servicio dueño | Separar conocimiento y estado vivo |
| Resumen “completo” que omite unidades | Sin coverage check; subagente timeout o resultado vacío | Reintentar/marcar; conciliar despachadas vs devueltas | Coverage check + trace ID |
| Costo 7× lo modelado y latencia sobre SLA | Opus en todo; thinking en el clasificador | Eval por paso; Haiku/Sonnet donde no regresa | Decisión de tier por paso; costo en desarrollo |
| Cache que nunca acierta | Contenido dinámico antes del bloque fijo | Reordenar: fijo primero, breakpoint, dinámico | Revisar orden y frecuencia vs TTL |
| Ahorro de cache inconsistente | Frecuencia de requests menor que el TTL (5 min) | Evaluar TTL o aceptar sin cache | Modelar frecuencia antes de activar |
| `400 invalid_request_error` “prompt too long” | Request mayor que la ventana | Chunking, carga progresiva, compaction | Medir con token counting y `usage` |
| `413 request_too_large` | Body supera el límite de bytes | Reducir payload | Validar tamaño antes de enviar |
| Salida truncada con `model_context_window_exceeded` | La generación chocó con el techo | Liberar contexto; partir la tarea | No presupuestar la ventana completa |
| 400 con `budget_tokens` en Sonnet 5 | Parámetro removido | Adaptive thinking + effort | Revisar soporte por modelo |
| Caída total con 529 en el pico | Sin fallback ni breaker | Fallback chain + circuit breaker | Probar fallas en el eval suite |
| Factura muy por encima del POC | Costos de demo sin extrapolar; distribución uniforme asumida | Re-modelar con volumen y distribución reales | Sizing con sensibilidad antes del SOW |
| Agente que no termina o se dispara en costo | Tools sin presupuesto ni límite | Presupuesto por turno, máx. tool calls, criterio de parada | Evaluar comportamiento de parada |
| Calidad que cae lento sin cambio de código | Cambio de modelo/prompt o drift de retrieval por corpus que crece | Comparar contra eval; revisar modelo, prompt, corpus/índice | Retrieval en el eval loop; entrada de runbook; trigger de drift |
| Latencia que salta | Contexto crecido, tool lenta o cache que dejó de acertar | Trazas: span más lento, tokens por request, cache | Alertas de p95; budget de tokens |
| Fallas intermitentes de tools | Autorización, rate limits o camino de error no manejado | Revisar auth y límites; trazar una falla punta a punta | Manejo de errores y backoff |
| Costo sube sin cambio de uso | Tier subió o el cache regresó | Revisar tier por request y cache hit rate | Spend posture; alertas |
| Un tenant limita a todos | API key compartida | Workspaces / keys por tenant | Aislamiento desde el diseño |
| PII en logs | Datos en el user message | Redacción server-side; IDs de referencia | Filtro de necesidad |
| Usuario accede a datos ajenos | Rol tomado del mensaje o política de dominio asumida en el modelo | Autorización server-side; filtrar en retrieval | Capa de aplicación dueña de la regla |
| Instrucciones maliciosas dentro de un documento | Indirect prompt injection | Screening de contenido recuperado y outputs de tools | Tratar todo contenido externo como no confiable |
| Guardrail caído pero el tráfico sigue | Fail open heredado por defecto | Fail closed + alerta | Prueba de caos del control |
| Acción ejecutada antes de cualquier chequeo | Solo filtro de salida | Autorización antes de la tool + input screening | Tres puntos de control |
| Refusals en cadena | Se reenvía el mismo contexto rechazado | Quitar/reformular el turno o limpiar historial | Manejar `stop_reason: "refusal"` por categoría |
| Cola de revisión aprobada a ciegas | Ruteo por volumen; revisor sin inputs ni razón | Ruteo por stakes; vista con inputs + flag | Medir capacidad del revisor |
| No se puede probar a un regulador que no hubo sesgo | Sin decision logging; métricas solo agregadas | Loguear inputs, contexto, salida, ruteo; desglose por subgrupo | Instrumentar los 4 puntos |
| Auditoría encuentra datos fuera de región | Cambio de logging que escribió en otra región; sin dueño | Corregir y registrar data-flow | Control con dueño y confirmación programada |
| “Ganador” de A/B que se desvanece | Muestra chica, inputs no controlados, métrica elegida después | Re-diseñar con tamaño calculado | Pre-registrar hipótesis y métrica |
| Aprobación que el stakeholder retira tras la factura | No se expuso el costo de revertir ni el costo mensual | Paquete de decisión con 3 elementos | Forecast de consumo |
| Sucesor rompe compliance al optimizar | Rationale no documentado | Restaurar decisión; documentar alternativa rechazada | Decision log |
| El CFO no puede justificar expansión | Outcome document solo con métricas técnicas | Medir before/after de negocio con control auditable | Baseline antes del deploy |
| Skill compartida rompe a todos y no hay vuelta atrás | Bundle plano sin versionado | Distribuir vía plugin con versionado y dueño | Gobernanza de distribución por activo |
| Código que pasó tests pero filtra datos | Nadie pudo explicar el manejo de un input | Bloquear merge hasta que el autor lo explique | Checklist de verificación con dimensión de comprensión |

## H. Practical Examples

Los escenarios del curso con la respuesta correcta (extraída de la lógica de cada checkpoint) y la razón que la sostiene. Sirven como banco de práctica: en todos se evalúa **la respuesta y el porqué**.

### H.1 M1 — Platform & Solution Design

**Field-service (S09):** Claude → resumir notas del caso, extraer el número de pieza de la foto, redactar el email de demora. Sistemas → stock de la SKU 78-A, total facturable de tres tickets, si aplica la garantía al número de serie. Humano → aprobar reembolso > £2.000, escalar un incidente de seguridad. *Las trampas parecen tareas de lenguaje pero son datos autoritativos o decisiones con consecuencias.*

**Logística (S10):** leer la nota del transportista → Claude; elegibilidad para reembolso automático → sistema (regla publicada); tier de contrato → sistema (estado vivo); redactar notificación → Claude; **emitir el reembolso → humano**.

**Primitivas (S06):** working memory → carga progresiva; MCP → build-time interface; tool reutilizable desde varios clientes → MCP. Tools = act, Subagents = isolate/parallelize, Hooks = guarantee, Skills = package a procedure.

**Orquestación (S15), 3 defectos:** síntesis que suma veredictos sin conciliar cobertura; acción irreversible (auto-archive) sin gate humano; sin retry ni gap-flag para subagentes fallidos. *Sanos:* la descomposición por documento, los subagentes en paralelo y el trace ID compartido.

**Diagrama de soporte (S18), 3 mal aplicados:** retrieval sobre “Order Status Index” (estado vivo); loop de agente con refund/cancel/update-address sin guarda; falta el camino de escalación a humano (el que más se pasa por alto porque no está dibujado).

**RAG (S20), corpus de 4.000 docs:** contratos y handbook → jerárquico; write-ups en prosa → semántico; índice → híbrido dense + sparse; restricción dominante = variedad de consultas.

**Calculadora de costo/latencia (S23):** el control *load-bearing* es el que mueve el presupuesto con menos margen (latencia → tier y thinking; costo → tier y estrategia de contexto).

**Técnicas (S25):** clasificar ticket en 5 categorías → zero-shot; extraer campos de recibos variados → few-shot; cláusula con 3 condiciones que interactúan → chain-of-thought; resumir 400 palabras en 2 oraciones → zero-shot.

**Prompt asset de soporte (S27):** prefijo estable = rol, reglas de tono, output contract y guardrail; dinámico = ticket y sección del manual. El “nunca prometer reembolso” va como restricción del output contract. Empaquetado = Skill versionada.

**Entry points (S30):**

| Escenario | Respuesta | Por qué |
| --- | --- | --- |
| Ops no técnico con docs aprobados | Claude.ai + Project | Audiencia |
| Banco en AWS, datos de core banking | AWS Bedrock | Acuerdo AWS + acceso programático; Claude.ai Enterprise no integra core banking; la API directa ignora el procurement |
| Firma legal, privilegio, auditoría propia | API/SDK detrás de app y gateway propios | Importa ser *dueño* del audit trail, no que exista; Bedrock no es una cuestión de residencia |
| Depósito, staff no técnico en tablets compartidas | Claude.ai + Project | Audiencia; no hace falta integración |
| Salud con BAA confirmado en Bedrock | Bedrock por gobierno/control | La cobertura del BAA en *esa* configuración decide; no es geografía; un nuevo BAA solo suma demora |
| Comentario de trades < 400 ms, firma en GCP | Vertex AI | Latencia + infraestructura existente |

**Ensamblado final (S31), firma legal de 180 abogados:** opción D = API/SDK en app interna con SSO y gateway aprobado; workflow paralelizado por sección con evaluator y schema estricto; playbook versionado recuperado por cláusula; iManage para el fetch; Sonnet + contexto progresivo; thinking solo donde el eval lo justifica; el senior associate firma todo y las cláusulas de baja confianza se marcan. *A falla por Claude.ai (privilegio), B por playbook completo en el system prompt (se vuelve viejo y se reprocesa en cada llamada), C por agente abierto + Opus en todo.*

### H.2 M2 — Enterprise Integration & Production

**Tipos de eval (S04):** code → JSON contra schema, < 500 tokens, número de reclamo vs fuente, secciones presentes. Model → solidez del razonamiento, manejo de una queja emocional, si el resumen captura lo importante, tono de marca.

**Calculadora (S07):** 50.000 req/mes, prompt estable de 5.000 tokens, 300 in / 400 out, techo $800, p95 ≤ 3 s → la palanca es **activar el cache** (B). Opus rompe el costo; subir `max_tokens` sube costo y latencia.

**Factibilidad (S10):**

| Escenario | Veredicto y restricción load-bearing |
| --- | --- |
| Resúmenes de reportes de 10–40 pág., 50/semana, 24 h, $500/mes | Feasible as scoped (todo en rango con Sonnet; un gate humano es una elección de diseño, no una restricción de factibilidad) |
| Extraer demoras y ETAs de 5.000 emails/día y escribirlos al OMS | Feasible with constraints: precisión de extracción en una escritura transaccional → eval code-based + gate humano para baja confianza |
| Recomendaciones de trading en tiempo real < 2 s | Not feasible as described hasta validar que el round-trip al feed vivo entra en 2 s (gap de conocimiento de estado vivo) |

**Diagrama de integración multi-tenant (S13), 5 problemas:** Claude Code como backend de chat de clientes; API key compartida; “soy cliente premium” como chequeo de capacidad; número de cuenta y email en el user message; escritura al CRM sin logging. *Sanos:* autenticación server-side y aislamiento de datos por tenant en storage.

**Plano de experimentos (S16):** wording de FAQ → efecto chico / confianza baja; intake médico → confianza alta (manda la consecuencia del error, no el efecto); nueva categoría que captura 30% → efecto grande / confianza alta; Sonnet→Haiku en formateo → efecto grande en costo / confianza moderada; prompt de retrieval con 200 req/día → efecto chico / confianza moderada.

**Eval framework de una aseguradora (S17):** extracción → código; latencia → código; seguridad → código para el auto-deny (binario) + judge para la fidelidad del resumen; fuga entre reclamantes → código (buscar identificadores de otros inputs); costo → código.

**Production readiness builder (S18), knowledge assistant de consultora:** 12.000 docs de 5–80 pág. (\~175M tokens: el límite es el corpus, no el documento de \~29.000 tokens) → RAG; 800 req/día (24.000/mes), \~5.200 in / 600 out con Sonnet + cache dentro de $3.000 (verificar con sensibilidad: la distribución de excerpts es bimodal); fallback Sonnet → Haiku; falla principal = drift de calidad de retrieval; veredicto *feasible with constraints* con condición de borde = cobertura y frescura del índice; Okta verificado server-side; control de acceso en la capa de retrieval para docs bajo NDA; anonimizar nombres de clientes; A/B 70% → 75%.

### H.3 M3 — Responsible AI

**Responsabilidad (S04):** entrenamiento → rechazar síntesis de un arma peligrosa, contenido claramente odioso. Aplicación → nunca devolver datos de otro tenant, bloquear consejos fuera del script aprobado, exigir sign-off antes de un reembolso.

**Riesgos de un agente de soporte con KB + refund + log (S06):** indirect injection por la KB → tratar lo recuperado como no confiable; abuso de la tool de reembolso → autorización antes de ejecutar; token exhaustion por docs grandes → chunking, límites, monitoreo; exposición en el log → redacción server-side.

**Grilla de controles (S09):** jailbreak/injection → input, model-based; blocklist → input, determinístico; toxicidad → output, model-based; política de reembolso → autorización, determinística.

**Decision logging (S12), gaps:** ruteo sin log; contexto recuperado no capturado; salida guardada sin sus inputs; dashboard sin desglose por subgrupo. *Adecuados:* inputs/salidas/ruteo con session ID; log consultable por decisión con 90 días de retención.

**Regla de ruteo (S14):** B — baja confianza **y** (irreversible **o** costoso) a pre-action review. Los controles decisivos son reversibilidad y costo; la confianza filtra el volumen.

**Control para HIPAA (S17):** A — plan HIPAA-ready o API 1P bajo BAA firmado, porque el acuerdo firmado + la configuración habilitada son el artefacto inspeccionable (no “el modelo fue instruido” ni un filtro de contenido).

**Benefits assistant FedRAMP (S18):** reglas de elegibilidad en la capa de aplicación; fail closed; instrumentar los 4 puntos y un decision log compartido; denegación de baja confianza y difícil de revertir → pre-action approval; registro de controles por obligación FedRAMP con artefacto.

### H.4 M4 — Stakeholders, lifecycle & GTM

**Supuesto no documentado (S04):** el ítem 4 (retener transcripts 60 días) no traza a ninguna frase del stakeholder.

**Tradeoff de una aseguradora regulada (S07):** recomendar A (logging integrado y audit trail completo); a la opción B le falta el **costo de revertir** (restaurar logging cuando el diseño ya depende de la latencia ganada).

**Triage de señales (S10):** monitoreo interno → p99 +40 ms dentro del presupuesto, tokens por pico estacional conocido. Architect review → eval score cae 3 semanas seguidas. Stakeholder review → confirmación de residencia programada, costo por interacción sobre el umbral, auditoría trimestral. Noise → un request malformado de cliente conocido, retry nocturno que funcionó, nuevo template con error rate plano.

**Artefactos (S13):** diagrama, decision log y assumption register → handoff · intención; runbook → handoff · evidencia; control register y resumen de tests → compliance · evidencia.

**Documentación clínica multi-plataforma (S17):** must-prove = obligación de salud con audit trail; tradeoff de recortar logging con costo de revertir = rediseño + exposición a disclose; fila de gobierno = auditoría trimestral por calendario con dueño compliance; decision log = Bedrock en región explícita (rechazado: endpoint global); primaria Bedrock con región en el cliente, secundaria API 1P para back-end no regulado; outcome = tiempo dictado → nota autorizada, con el log de autorización clínica como control; a la semana 4 el gate de fase no está cumplido (falta el “después”).

### H.5 M5 — Team Enablement

**Distribución (S03):** procedimiento de compliance idéntico y reversible → plugin; capacidad para todos sin versionado → org-provisioned; convención de ingeniería en cada proyecto → project Skill; capacidad llamada por productos propios → API Skill.

**Quiz (S07):** adopción despareja → champions + batches; ejecución idéntica y revocable → plugin con versionado; fuga de seguridad en código generado → faltaba checklist con dimensión de seguridad; el autor no explica el código → retener hasta que lo explique; calidad que cae 2 meses sin cambios → modelo/prompt o drift de retrieval.

## I. Checklists

Copialas por engagement; cada ítem es verificable con un artefacto.

### I.1 Discovery

- [ ] Objetivo de negocio anotado con las palabras del stakeholder
- [ ] Cada palabra de experiencia (seamless, rápido…) traducida a restricción medible
- [ ] Debe hacer / no debe hacer / debe costar / debe probar: las 4 cubiertas
- [ ] Volumen, tamaño de input y SLA obtenidos del dueño de negocio
- [ ] Revisiones humanas mencionadas: autoridad, timing y obligatoriedad confirmados
- [ ] Obligaciones regulatorias y residencia confirmadas con compliance
- [ ] Tabla de traducción con supuestos rotulados y dueño para confirmarlos

### I.2 Revisión de arquitectura

- [ ] Mapa Claude / sistemas / humanos con justificación (reversibilidad, stakes, accountability)
- [ ] Ninguna regla determinística ni dato vivo resuelto dentro del modelo
- [ ] Patrón elegido con los 5 factores y costo de las alternativas nombrado
- [ ] Agente (si aplica) con tools mínimas, presupuesto por turno, máx. de tool calls y criterio de parada
- [ ] Multi-agente: coverage check, retry/gap-flag, trace ID, gates antes de lo irreversible
- [ ] Arquitectura de referencia identificada y eval set por arquitectura
- [ ] Tier de modelo decidido **por paso** con eval; thinking solo con brecha medida
- [ ] Estrategia de contexto (baseline, ventana progresiva, retrieval, compaction) y margen de ventana
- [ ] System prompt con alcance, restricciones y output contract; prefijo cacheable al frente
- [ ] Entry point, build-time interface y delivery route elegidos en ese orden, con la restricción regulatoria aplicada primero

### I.3 Production readiness (POC → producción)

- [ ] Eval suite escrito antes del código; umbrales del negocio; adversariales incluidos
- [ ] Judge calibrado con humanos y distinto del modelo evaluado
- [ ] Modelo de costo a volumen de producción con distribución y sensibilidad, bajo el techo
- [ ] p95 bajo carga concurrente dentro del SLA
- [ ] Retries con backoff, circuit breaker y fallback chain; fallback probado
- [ ] Modo de falla de la arquitectura nombrado con mitigación
- [ ] Versión de modelo fijada y runbook de actualización
- [ ] Veredicto de factibilidad con condiciones de borde trasladadas al SOW
- [ ] Value statement con baseline, proyección, run cost y payback con sensibilidad

### I.4 Integración y seguridad

- [ ] Ruta y entry point sobreviven a la regulación (BAA por configuración, FedRAMP, región)
- [ ] Identidad verificada y rol inyectado server-side
- [ ] Autorización heredada del sistema subyacente; filtrado en la capa de retrieval
- [ ] Solo los campos necesarios entran al contexto; PII redactada antes de la llamada y del log
- [ ] Auditoría least-privilege de tools con justificación registrada
- [ ] Workspaces o keys por tenant
- [ ] Logging de request, response, contexto y outcome; acciones agénticas en audit log
- [ ] Evaluación de riesgos escrita (5 categorías) con dueños
- [ ] Input screening, screening de contenido externo, output screening y autorización determinística de tools
- [ ] Todos los guardrails propios fallan cerrados y loguean bloqueos/fallas
- [ ] Manejo de `stop_reason: "refusal"` por categoría y reset de contexto
- [ ] Skills de terceros auditadas, en sandbox, de fuente confiable, con veredicto

### I.5 Fairness, revisión humana y compliance

- [ ] Los 4 puntos de entrada de sesgo identificados e instrumentados
- [ ] Decision log consultable por decisión (inputs, contexto, salida, ruteo) y gobernado como dato sensible
- [ ] Métricas con desglose por subgrupo
- [ ] Regla de ruteo por confianza + reversibilidad + costo; ubicación elegida (pre, post, muestreo)
- [ ] Confianza calibrada; la cola cabe en la capacidad del revisor
- [ ] Vista del revisor con inputs, salida y razón del flag
- [ ] Registro de controles: obligación → control → dueño → artefacto de evidencia vivo
- [ ] Cadencia de revalidación del registro definida

### I.6 Experimento A/B

- [ ] Hipótesis con tratamiento, métrica primaria, umbral y restricciones sobre secundarias
- [ ] Tamaño de muestra calculado (efecto mínimo, baseline, potencia, significancia) y duración estimada
- [ ] Asignación aleatoria y consistente por usuario/sesión
- [ ] Distribución de inputs controlada o segmentada
- [ ] Decidido si es live A/B o shadow testing según riesgo y tráfico
- [ ] Lectura: efecto útil, secundarias sin degradar, sin outcome-shopping

### I.7 Handoff y operación

- [ ] Decision log con fecha, alternativas rechazadas y tradeoff (gana / cede / revertir)
- [ ] Assumption register y pendientes con dueño y criterio de cierre
- [ ] Tabla de gobierno de señales con triggers para drift lento y checkpoints por calendario
- [ ] SLA con umbrales trazables (UX, criticidad, evals)
- [ ] Entry-point-responsibility map si hay varias rutas; región configurada explícitamente
- [ ] Baseline de negocio medido antes del deploy; dueño de medición; fecha del outcome document
- [ ] Test de completitud: un Architect ajeno puede hacer un cambio seguro

### I.8 Enablement del equipo

- [ ] Configuración compartida (CLAUDE.md, tools, MCP, permisos) versionada
- [ ] Champion por departamento y plan de batches
- [ ] Mecanismo de distribución por Skill con dueño y rollback
- [ ] Spend posture: modelo default, allowlist, effort, topes
- [ ] Checklist de verificación de código IA: corrección, seguridad, mantenibilidad, comprensión humana
- [ ] Runbook síntoma → causa → acción y escalation path publicados

## J. Glossary

| Término | Definición operativa |
| --- | --- |
| 4D / AI Fluency competencies | Delegation (qué se le confía a Claude), Description (decir con precisión qué se quiere), Discernment (juzgar la salida: aceptable / revisar / override), Diligence (responsabilidad y accountability humana) |
| Adaptive thinking | Thinking donde el modelo decide si piensa y cuánto; se dirige con `effort` en lugar de `budget_tokens` |
| Agent | Patrón donde el modelo decide su secuencia de tool calls; el control de flujo vive en el modelo |
| Agent SDK | Runtime de loop de agente (el de Claude Code) embebible en tu app; distinto del SDK de Anthropic |
| Assumption register | Registro de supuestos rotulados con dueño y criterio de cierre |
| Augmented LLM | Una invocación acotada, con tools/retrieval/thinking opcionales, sin ramificar según el modelo |
| Authoritative | Fuente acordada como correcta (sistema de registro, tabla viva) |
| BAA | Business Associate Agreement de HIPAA; la cobertura es por configuración |
| Build-time interface | Capa contra la que programa el equipo: API, SDKs, MCP, Agent SDK |
| Champion-per-department rollout | Un champion por equipo prueba el workflow y siembra la adopción por batches |
| Circuit breaker | Corta llamadas a una dependencia cuando la tasa de error supera un umbral, durante un cooldown |
| Compaction | Resumir/comprimir contexto acumulado preservando decisiones |
| Consent fatigue | Aprobación automática por exceso de pedidos de aprobación |
| Constitution | Documento con el que Anthropic entrena valores y prioridades de Claude (versión de enero 2026) |
| Control register | Obligación → control técnico → dueño → artefacto de evidencia |
| Coverage check | Conciliación en la síntesis: resultados devueltos = unidades despachadas |
| Data drift / model drift / model update | Cambio en la distribución de inputs / en el comportamiento con inputs estables / por cambio de versión |
| Data-residency pinning | Fijar la región de ejecución en la capa de integración y verificarla por request |
| Decision log (rationale) | Decisión + alternativas rechazadas + tradeoff resuelto |
| Decision logging (fairness) | Inputs, contexto recuperado, salida y ruteo por decisión, consultables |
| Delivery route | Dónde termina el tráfico: Anthropic 1P, Bedrock, Vertex, Foundry |
| DPA | Data Processing Agreement entre controller y processor |
| Entry point | Lo que una persona o sistema usa directamente: Claude.ai, Claude Code, Cowork, app propia |
| Entry-point-responsibility map | Qué ruta/entry point posee qué tarea y por qué, antes de integrar |
| Eval / golden dataset | Test estructurado / set etiquetado representativo con salidas esperadas |
| Evaluator-optimizer | Generador + evaluador en loop hasta criterio o límite |
| Evidence artifact | Prueba inspeccionable de que un control opera (acuerdo, pantalla de configuración, registro, query) |
| Exponential backoff | Reintentos con esperas crecientes (típicamente duplicadas) |
| Fail open / fail closed | Ante falla del guardrail: dejar pasar / bloquear |
| Fallback chain | Ruta alternativa (otro tier, respuesta cacheada) si el primario no está |
| Fan-out | El orquestador reparte unidades independientes a subagentes y sintetiza |
| Feasibility verdict | As scoped / with constraints / not feasible + restricción load-bearing |
| Feedback loop | Signals → Triage → Decide → Act → Review sobre la observabilidad |
| Governance table | Señal → trigger → acción → checkpoint regulado, antes del lanzamiento |
| Hallucination rate | % de respuestas con información no sustentada por input o fuente |
| Hooks | Código determinístico en eventos del ciclo de vida que el modelo no puede saltear |
| Hybrid index / RRF | Dense + sparse combinados; reciprocal rank fusion para unir rankings |
| Indirect prompt injection | Instrucciones maliciosas que llegan por contenido recuperado o salidas de tools |
| Injection point (fairness) | Corpus, framing, ejemplos, ruteo: donde entra la desigualdad |
| Inference-time control vs training-time alignment | Controles de tu despliegue vs comportamiento seguro entrenado |
| Joint scoping | Sesión con Anthropic Applied AI \[PARTNER TRACK\] |
| Least-privilege tool configuration | Solo las tools esenciales, cada remoción justificada |
| Limit placement | Nombrar 1–2 límites de antemano en la demo \[PARTNER TRACK\] |
| Live state | Datos que cambian durante la conversación; requieren lookup al sistema de registro |
| Load-bearing | La decisión o restricción de la que depende el resto (revertirla rompe algo) |
| MCP | Model Context Protocol: expone tools, prompts y resources a cualquier cliente MCP |
| Monolithic / progressive context | Todo de una vez / por etapas según el paso |
| Outcome document | Caso y alcance, métrica antes, después, control auditable, dueño de medición, reuso |
| p95 | Latencia bajo la cual termina el 95% de los requests |
| Parametric knowledge | Lo que el modelo aprendió en el entrenamiento |
| PHI | Protected Health Information (HIPAA) |
| Prompt caching | Reutilizar el prefijo procesado; requiere `cache_control`; TTL default 5 min |
| Reversal cost | Lo que cuesta deshacer una decisión cuando el sistema ya depende de ella |
| Runbook / escalation path | Síntoma → causa → acción conocidos / quién atiende qué y cuándo sale del equipo |
| Shadow testing | Versión nueva sobre copia del tráfico, puntuada offline, invisible al usuario |
| Skill | Unidad versionada (SKILL.md + scripts opcionales) que empaqueta un procedimiento |
| SLA | Qué se mide, qué es breach, qué pasa ante breach |
| Spend posture | Modelo default, allowlist, effort, topes de gasto, rate y por usuario |
| Subagent | Subtarea en contexto aislado |
| Tool-call authorization | Chequeo determinístico (allowlist + identidad + scope) antes de una acción con efectos |
| Translation table | Declaración → restricción → decisión → supuesto |
| Verification checklist | Corrección, seguridad, mantenibilidad y comprensión humana del código generado |
| Workflow | Pasos nombrados orquestados en tu código; sub-patrones chaining, routing, parallelization, evaluator-optimizer |
| Workspaces | Aislamiento de keys, gasto y rate por workspace (máx. 100 por organización) |

## Contradicciones e inconsistencias detectadas

| # | Qué | Dónde | Cómo resolverlo |
| --- | --- | --- | --- |
| 1 | El encabezado de M1 dice “Claude Certified Architect **Foundations** · Module 1” dentro del curso Professional | M1 portada | Error de rótulo; el contenido es del Professional |
| 2 | M1 separa entry points de build-time interfaces, pero M2 llama “five entry points” a Direct API, SDK, Claude Code, Agent SDK y MCP; y M1·S30 ofrece Bedrock (una ruta) como “entry point” | M1·S03/S28 vs M2·S11, M1·S30 | Usar la taxonomía de 3 capas de M1; en preguntas tipo S30, leer “entry point” como la elección completa |
| 3 | MCP: M1 dice que con un solo cliente agrega overhead sin retorno; M2 lo presenta como forma estándar de separar la capa de integración aun sin multi-cliente (y advierte que complica el debugging) | M1·S28 vs M2·S11 | Criterio de examen: MCP cuando hay reuso entre clientes |
| 4 | El calculador de M1 usa Opus a $15/$75 por MTok como “list pricing June 2026”; los precios vigentes de Opus 4.5+ son menores \[EXTERNO: \~$5/$25\] | M1·S23 (código del calculador) | Tratar sus cifras como ilustrativas; verificar en la página de pricing |
| 5 | Tamaño de muestra 70%→75% (80% potencia, α 0,05): el curso dice \~1.500 por grupo y \~4 días; la fórmula estándar da 1.251 por grupo y \~3,1 días | M2·S18 vs D.4 | El valor del curso es conservador; ambos implican días, no semanas |
| 6 | El glosario de M1 dice que el paquete `@anthropic-ai/claude-agent-sdk` es para TypeScript **y** Python; el cuerpo dice Python = `claude-agent-sdk` en PyPI | M1 glosario vs M1·S28 | npm para TS, PyPI para Python |
| 7 | M1 dice que Opus es “el modelo más capaz disponible” y en la misma sección menciona Claude Fable 5 | M1·S21 | Fable es otro tier; para el examen la familia es Opus / Sonnet / Haiku |
| 8 | Las fuentes de M1 y M2 citan Claude 101 para la familia de modelos y las ventanas de contexto; las fuentes de M4 dicen que Claude 101 no enseña eso | Sources M1/M2 vs M4 | Verificar modelos y ventanas en platform.claude.com |
| 9 | La fuente de plugins de M5 dice “support.code.com” | M5 Sources | Probable typo de support.claude.com |
| 10 | Prompt caching: M2 da TTL default de 5 min; M1 habla de “TTL selection” sin nombrar opciones (el cheatsheet de Foundations ya había marcado 1 h vs 5 min) | M1·S26 vs M2·S08 | Default 5 min; existe una opción más larga \[EXTERNO, verificar\] |

## Información faltante en el material

- **Sintaxis** de adaptive thinking/`effort`, `inference_geo`, `container.skills` y `/v1/skills`: el curso los nombra pero no muestra cómo se envían. Consultar platform.claude.com/docs.
- **Uso concreto del Agent SDK** (inicialización, tools, hooks): no hay ejemplos.
- **Tarifas exactas** de cache write, batch y por modelo: el curso remite a la página de pricing; los calculadores son ilustrativos.
- **Latencias por modelo**: no hay valores reales, solo los del calculador.
- **Formato del examen** Architect – Professional (cantidad de preguntas, puntaje, duración): no figura en el material; solo se indica qué partes de M4 no se evalúan.
- **ZDR** (zero data retention): fuera de alcance explícito de las secciones de integración.
- **Residencia EU en Foundry**: “Coming 2026” sin fecha; verificar.
- **Claude in Chrome / Claude for Excel**: sin tradeoffs documentados.
- **Mapa completo del checkpoint M4·S16** (plataforma × obligación × restricción → recomendación): la lógica no está en el texto; usar la matriz de E.5 y B.17.

## Auditoría de calidad

Criterio del proyecto: ¿alcanza este documento para trabajar mañana sin el curso? Sí para las tareas que el curso cubre. Recordar conceptos: A y J. Elegir herramientas: E. Ejecutar procedimientos: C y D. Resolver problemas: G. Decidir con fundamento: E y H. Buenas prácticas: F. Verificar resultados: I. Donde el curso no alcanza (sintaxis de API, precios, Agent SDK, formato del examen), queda indicado arriba y en las marcas \[EXTERNO\].

## Fuentes

- *Claude Certified Architect – Professional Prep Course* (Anthropic, Skilljar): M1 Claude Platform & Solution Design (34 pantallas), M2 Enterprise Integration & Production (21), M3 Responsible AI, Safety & Risk for Architects (22), M4 Stakeholder Engagement, Lifecycle & GTM (20), M5 Team Enablement & Operational Productivity (10). Incluye la lógica de respuestas de cada checkpoint.
- Páginas que el curso pide verificar (no consultadas para este documento): platform.claude.com/docs (pricing, models, model-deprecations, test-and-evaluate/develop-tests, stop reasons), github.com/anthropics/claude-cookbooks (misc/building\_evals.ipynb), anthropic.com/research/measuring-agent-autonomy, anthropic.com/research/trustworthy-agents.
- Cheatsheet complementario en este proyecto: *Claude Certified Architect – Foundations*.
