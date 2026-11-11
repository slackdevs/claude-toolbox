# Cheatsheet profesional - Claude Certified Associate Foundations

Nov 9, 2026 · @Sebastian Larrauri

## Cómo usar este cheatsheet

El Associate no programa: **opera Claude**. Elige dónde y con qué trabajar, especifica bien la tarea, valida lo que vuelve, decide qué delegar, configura el entorno para el equipo, gobierna el uso y corrige cuando algo falla. Este documento es la referencia para hacer eso sin volver al curso.

**Fuente:** los 8 módulos del *Claude Certified Associate – Foundations Prep Course* (Anthropic Academy / Skilljar, contenido fechado en junio de 2026), leídos completos desde tu carpeta, incluidas las claves de respuesta de ejercicios y quizzes.

**Convenciones**

| Marca | Significado |
| --- | --- |
| **\[OBLIGATORIO\]** | Regla que el curso presenta como no negociable (ej.: revisión humana de entregables a clientes). |
| **\[RECOMENDADO\]** | Práctica que el curso aconseja, con margen de criterio. |
| **\[OPCIONAL\]** | Funcionalidad útil según el caso. |
| **(Mx)** | Módulo de origen. M1 = módulo 1. |
| **\[Externo\]** | Contexto que no viene del curso. Se usa poco y siempre marcado. |
| **\[Verificar\]** | El propio curso pide confirmar el dato en el producto o en el Help Center porque cambia seguido. |

**Límite del rol (M8).** Integración por API, construcción de agentes y desarrollo de tools son del *Claude Developer*. Arquitectura empresarial, diseño de integraciones y governance a escala son del *Claude Architect*. Reconocer ese borde y escalar es, en sí, una habilidad Associate.

**Mapa del curso**

| Módulo | Min | Qué te deja hacer | Competencia AI Fluency |
| --- | --- | --- | --- |
| M1 Platform & Model Foundations | 59 | Elegir entry point, capas, modelo y estrategia de contexto | Base |
| M2 Prompting & Task Execution | 53 | Prompt de 5 componentes, descomponer, iterar, ajustar por tipo de tarea | Description |
| M3 Evaluating & Validating Output | 74 | Revisar contra 3 referencias, detectar fallas, grounding, umbrales de revisión humana | Discernment + Diligence |
| M4 Workflow Integration & Solution Design | 63 | Requisitos, planes con números verificados, delegation mapping, comunicar a stakeholders | Delegation |
| M5 Configuration & Knowledge Management | 47 | Configurar Projects, conectores, instrucciones precisas y mantenimiento | Description aplicada al entorno |
| M6 Governance, Risk & Responsible Use | 55 | Clasificar casos de uso, evaluar Skills, manejar datos sensibles, ética | Diligence + Delegation |
| M7 Troubleshooting & Optimization | 30 | Diagnosticar la causa raíz, persistir arreglos, optimizar | Las cuatro |
| M8 Course Summary & Next Steps | 8 | Conectar todo, preparar el examen, escalar al track correcto | Las cuatro |

**Índice:** A. Quick Reference · B. Core Knowledge · C. Practical Workflows · D. Features y prompts verbatim · E. Decision Making · F. Best Practices · G. Troubleshooting · H. Practical Examples · I. Checklists · J. Glosario · K. Examen, contradicciones y fuentes.

## A. Quick Reference

Cuatro decisiones antes del prompt fijan el techo de calidad; cuatro competencias guían todo lo demás.

### A.1 Las 4 decisiones previas a cualquier prompt (M1)

| # | Decisión | Pregunta | Opciones |
| --- | --- | --- | --- |
| 1 | Entry point | ¿Dónde trabajo? | Chat · Project · Artifact · Research |
| 2 | Capability layer | ¿Qué capacidades activo? | Project (contexto) · Skill (procedimiento) · Code Execution (cálculo verificado) · Memory (continuidad) |
| 3 | Modelo | ¿Qué tier? | Haiku · Sonnet · Opus |
| 4 | Contexto | ¿Cómo sostengo la sesión? | Restart · Summarize · Persist |

### A.2 Las 4 competencias del AI Fluency Framework (4D)

| Competencia | Qué es | Dónde se practica |
| --- | --- | --- |
| **Description** | Decirle a Claude con precisión qué querés | M2 prompting, M5 instrucciones, M4 comunicación a stakeholders |
| **Discernment** | Evaluar críticamente el output contra requisitos, fuentes y estándares | M3 |
| **Diligence** | Decidir cuándo verificar y hacerse responsable del resultado | M3, M6 |
| **Delegation** | Decidir qué hace la IA, qué queda humano y qué se hace en conjunto | M4, M6 |

Regla mnemotécnica del curso: *Discernment es cómo revisás; Diligence es por qué debés hacerlo.*

### A.3 Las 5 propiedades de comportamiento de Claude (M1)

1. **Las respuestas varían.** Misma pregunta, dos respuestas distintas: el output es probabilístico. Planeá variación y revisión.
2. **El tono seguro no indica exactitud.** Un dato inventado suena igual que uno verificado.
3. **El contexto es un presupuesto.** Al acercarse al límite, claude.ai resume mensajes viejos (planes pagos con Code Execution activado) y el detalle se comprime.
4. **El conocimiento tiene corte de entrenamiento.** Para lo reciente: conector, web search o Research.
5. **Un procedimiento configurado igual varía.** Una Skill reduce la varianza, no la elimina. La revisión sigue.

### A.4 Reglas que siempre hay que recordar

- **\[OBLIGATORIO\]** Sos responsable de todo lo que entregás, lo haya escrito vos o Claude. La responsabilidad no se delega (M3, M4, M6).
- **\[OBLIGATORIO\]** Todo número que se reporta o usa sale de **Code Execution**, no de prosa (M1, M3, M4).
- **\[OBLIGATORIO\]** Nunca sale sin revisión humana: entregables finales a clientes, cálculos auditables o materialmente financieros, datos regulados/confidenciales/sensibles, comunicaciones públicas o legales (M3).
- **\[OBLIGATORIO\]** Los pasos irreversibles o de alta responsabilidad (aprobar, firmar, enviar, pagar) quedan humanos (M4).
- **\[OBLIGATORIO\]** Datos regulados: primero "¿está permitido este entry point?", después "¿cómo lo manejo?". Incognito no vuelve seguro un dato rojo (M6).
- Exactitud y completitud son revisiones separadas: un output 100% correcto puede omitir lo decisivo (M3).
- Calidad de presentación ≠ riesgo. Decide el *stake*, no el pulido (M3).
- Arreglo que se repite → se promueve a configuración (instrucción, knowledge base o Skill) (M7).
- Instrucción vaga = falla silenciosa. Test: ¿dos personas la leerían igual? (M5)
- Una Skill es software: fuente, alcance y adecuación antes de habilitarla (M6).

### A.5 Tablas rápidas

**Entry point**

| Si la tarea es… | Usá |
| --- | --- |
| Pregunta o tarea puntual, sin reutilizar | Chat |
| Recurrente con contexto estable | Project |
| Entregable que el destinatario va a abrir y leer | Artifact |
| Investigación profunda multi-fuente o síntesis actual | Research (dato actual rápido: web search en Chat) |

**Modelo**

| Perfil | Modelo |
| --- | --- |
| Extracción/clasificación estructurada a volumen | Haiku |
| La mayoría del drafting, síntesis y análisis profesional | Sonnet (punto de partida) |
| Juicio complejo, alto riesgo, inputs ambiguos o multicapa | Opus |

**Dónde va cada cosa (test regla / referencia / procedimiento)**

| Es un… | Va en |
| --- | --- |
| Regla de comportamiento ("citá siempre la fuente") | Standing instructions |
| Referencia o hecho ("paleta de marca", "playbook") | Knowledge base |
| Procedimiento de varios pasos ("formatá al template") | Skill (nivel cuenta, en Customize) |
| Decisiones ya tomadas del Project que evolucionan | Scoped Memory |
| Cálculo que debe ser correcto | Code Execution |

**Contexto degradado**

| Respuesta | Cuándo |
| --- | --- |
| Restart | La sesión se desvió sin arreglo o empieza una tarea nueva del mismo workstream |
| Summarize | Querés continuidad: pedí resumen (decisiones, trabajo en curso, preguntas abiertas) y pegalo en una conversación nueva |
| Persist | Lo vas a necesitar en todas las sesiones futuras: Memory o knowledge base |

**Triage de output (M3):** Ready to use · Needs revision · Needs human override.

**Delegación de pasos (M4):** AI-appropriate · Collaborative · Human-retained, según reversibilidad, stakes y accountability.

**Clasificación de casos de uso (M6):** Fully appropriate · Appropriate with human review (con gate quién/qué/cuándo) · Inappropriate.

**Datos (M6):** Verde = usar · Amarillo = revisar primero · Rojo = afuera salvo camino aprobado.

**Diagnóstico (M7):** primera respuesta mal → sub-especificación · se degradó con el tiempo → context overload · error de tipo específico → feature o modelo equivocado · "antes andaba" → configuración desactualizada.

## B. Core Knowledge

Los siete módulos de contenido forman una cadena: lo que elegís define qué promptear, el prompt define qué evaluás, la evaluación hace confiable la integración y la configuración, y governance y troubleshooting sostienen el conjunto (M8).

### B.1 Plataforma: los 4 entry points (M1)

- **Chat.** Conversación sin estructura. Se guarda en el historial; Memory y la búsqueda de chats pasados pueden traer contexto. Le falta lo que da un Project: persistencia deliberada, instrucciones permanentes y knowledge base curada. *Señal de que el workstream superó al Chat:* pegás el mismo párrafo de contexto que la semana pasada.
- **Projects.** Workspace persistente con tres cosas: **standing instructions** (qué debe saber y hacer Claude en toda conversación del Project), **knowledge base** (documentos subidos una vez) y **conversation history** propia. Las conversaciones comparten instrucciones y knowledge base pero **no comparten contexto entre sí**.
- **Artifacts.** Bloque separado y editable junto al chat, para entregables: borradores, tablas de datos, reportes con formato, código. La respuesta inline es para lo que vas a usar dentro de la conversación.
- **Research.** Síntesis profunda multi-fuente con búsquedas en varios pasos (planes pagos). **Web search** existe en todos los planes como toggle por chat; en Team/Enterprise un Owner o Primary Owner debe habilitarlo primero en las capability settings de la organización. La documentación no dice si el toggle viene prendido por defecto.

**Test para construir un Project:** ¿la tarea se repite? ¿el contexto de fondo es el mismo? ¿el formato de salida es consistente? Con **2 de 3 "sí"**, construilo: la inversión se recupera en 2 o 3 sesiones.

### B.2 Capability layer: 4 capas independientes (M1)

| Capa | Resuelve | Detalle clave |
| --- | --- | --- |
| **Projects** | Llevar contexto | Instrucciones + knowledge base del workstream |
| **Skills** | Definir procedimientos | Built-in de Anthropic para Excel, Word, PowerPoint y PDF; custom desde settings. Viven a **nivel cuenta**, no dentro de un Project, y Claude las invoca automáticamente cuando aplican, dentro o fuera de Projects. Reducen varianza, no la eliminan. Requieren evaluación de confianza. |
| **Code Execution** | Verificar cálculos | Sandbox donde Claude escribe y corre código; vos no escribís código. Úsalo para: todo número que se reporta, transformar o limpiar datos (fechas, duplicados, campos), gráficos, y archivos descargables reales (.xlsx, .pptx, .docx, .pdf). |
| **Memory** | Persistir continuidad | Rol recurrente, preferencias de formato, colaboradores frecuentes, restricciones permanentes. |

Las capas se combinan según la tarea: una pregunta puntual no usa ninguna; un análisis recurrente puede usar las cuatro.

**Por qué Code Execution:** la prosa produce la secuencia de texto más probable; en cálculo eso da números plausibles que pueden estar mal. Code Execution corre el cálculo y devuelve un resultado trazable. Ojo (M3): el determinismo es de la ejecución; el código lo escribe Claude y puede tener un bug. La garantía es que lo podés leer, verificar y re-correr.

### B.3 Memory, Incognito y aislamiento (M1, M5, M6)

- **Curar Memory.** Revisarla al menos **una vez por mes** si sos usuario activo, borrar o actualizar lo vencido, mantener solo lo que realmente recurre. Importa la exactitud, no el volumen.
- **Project-scoped Memory.** Cada Project tiene su Memory separada: lo del cliente A no aparece en el cliente B. Un Project por workstream o cliente.
- **Memory vs knowledge base.** Hecho de referencia estable → knowledge base. Registro evolutivo de decisiones del Project → Memory.
- **Ciclo de vida.** Revisar, editar o borrar, **exportar como backup antes de un cambio grande** y hacer **reset completo** cuando lo acumulado ya confunde.
- **Incognito.** Saca la sesión de Memory y del historial (aplica a chats sueltos, fuera de Projects). **No** anula la retención de datos de la organización y los chats pueden aparecer en exports organizacionales.
- **Controles de Memory por plan.** Team no tiene controles de Memory a nivel organización; en Enterprise, Owners y Primary Owners los tienen, incluido deshabilitarla para toda la org. **\[Verificar\]**
- **Importar memorias de otras IA.** Experimental a junio 2026; documentado para Free, Pro, Max y Team (no Enterprise). Si no tenés el import automático, cargalas a mano en la configuración de Memory, no en la knowledge base de un Project. **\[Verificar\]**

### B.4 Modelos (M1)

- **Haiku:** el más rápido y eficiente. Clasificación, extracción, formato, resúmenes simples, trabajo rutinario a volumen donde un output imperfecto cuesta poco. La ventaja de velocidad se acumula sobre cientos de ítems.
- **Sonnet:** el equilibrado y punto de partida para casi todo el trabajo del knowledge worker: drafting, síntesis, análisis, apoyo a investigación, revisión de documentos.
- **Opus:** mayor capacidad. Juicio matizado, razonamiento complejo de varios pasos, inputs ambiguos, entregables a clientes, análisis documental complejo, planificación estratégica, síntesis de alto riesgo. Más lento.
- **Regla de ajuste:** empezá en Sonnet; si la calidad no alcanza en algo complejo, subí a Opus; si manda la velocidad y la tarea es estructurada, bajá a Haiku.
- **Costo:** en planes medidos o con presupuesto de uso (incluida la API), más capacidad = más uso por llamada. En la suscripción de claude.ai, la eficiencia (velocidad y margen de uso) es el proxy del costo.
- **Nota del curso:** a junio 2026 existe un cuarto tier sobre Opus (Claude Fable 5, GA 2026-06-09) y la latencia de Opus se describe como moderada. La certificación fija el marco de tres tiers; **no entra en el examen**. El selector de modelos, el default y el cambio automático varían por plan. **\[Verificar\]**

### B.5 Gestión de contexto y límites de uso (M1)

- **Señales de intervención:** Claude deja de seguir instrucciones que seguía; responde solo al último intercambio sin decisiones previas; la precisión cae de forma compatible con contexto temprano perdido.
- **Por qué pasa:** al llenarse la ventana, claude.ai resume mensajes viejos (el historial completo sigue disponible como referencia). El detalle se comprime y las instrucciones del minuto 10 pierden fuerza en el minuto 90. No es que Claude las ignore.
- **Límites de uso:** ventana de sesión corta y rotativa + límites semanales en planes pagos que aplican a todos los modelos, con un pool semanal aparte para el tier más alto. Varían por plan. **\[Verificar\]** Para trabajo intensivo: segmentá tareas grandes, guardá avances en la knowledge base y reiniciá desde un resumen.

### B.6 Prompting: el stack de 5 componentes (M2)

| Componente | Controla | Nota |
| --- | --- | --- |
| **Role** | Vocabulario, profundidad y supuestos | "Sos un analista financiero" |
| **Context** | Lo que Claude no puede saber: audiencia, situación, decisiones previas, material fuente | El que más se omite y la causa n°1 de output genérico |
| **Task** | La acción concreta | Un verbo principal, sin ambigüedad: resumir, comparar, redactar, identificar |
| **Constraints** | Límites: largo, tono, qué incluir y qué no | Mantienen el output usable sin mucha edición |
| **Output format** | Forma del resultado: tabla, lista, memo de 3 párrafos, email | Declararlo ahorra una iteración |

No todo prompt necesita los cinco: una pregunta rápida, task y quizá una restricción; un entregable a cliente, los cinco. Claude no ve tu inbox, tu organigrama ni la reunión de la semana pasada salvo por un conector, y aun así solo ve lo que autorizaste. **Todo lo que vive solo en tu cabeza es un context gap.**

**Descomposición.** Una tarea con varias etapas en un solo prompt produce trabajo superficial en todas. Partila en pasos ordenados con resultados intermedios verificables. Pasos que se construyen uno sobre otro: misma conversación. Pasos independientes, o conversación ya degradada: conversación nueva. Si varios entregables comparten una base, construí y verificá primero esa base.

**Iteración diagnóstica.** Cada defecto apunta a un componente: genérico → context; respondió otra cosa → task; largo/tono/forma → constraint o format; casi bien salvo una sección → iterar solo esa sección. Cambiá un componente por ronda. **Pará cuando cada ronda da cambios marginales:** ahí rinde más editar a mano.

**Estrategia por tipo de tarea**

| Tipo | Ajustá | Aflojá | Latitud |
| --- | --- | --- | --- |
| Análisis | Criterios, estándares, alcance, manejo de ambigüedad | Fraseo | Baja |
| Research | Pregunta, límites, fuentes actuales, citas | Enfoque de síntesis | Media-baja |
| Drafting | Audiencia, tono, formato | Elección de palabras | Media |
| Brainstorming | Solo objetivo y guardrails | Cantidad y dirección | Alta; filtrar después |

Las citas son verificables cuando vienen de una fuente con grounding (web search o Research). Las que salen solo de memoria de entrenamiento se ven igual de seguras y hay que verificarlas aparte.

### B.7 Evaluación: Discernment y Diligence (M3)

Es la **sección más pesada del examen**, porque firmás cada afirmación de lo que entregás.

**Las 3 referencias de evaluación**

1. **Requisitos:** releé tu pedido y confirmá que cada parte está cubierta, no solo las fáciles.
2. **Material fuente:** trazá afirmaciones específicas hasta el documento; no supongas que Claude leyó bien.
3. **Estándares profesionales:** un número sin unidades, una recomendación sin razonamiento o una cita que no encontrás fallan aunque suenen fluidos.

La **profundidad de revisión** depende del stake del dominio: legal, cifras financieras y compliance son tolerancia cero; un brainstorming interno admite revisión liviana. El riesgo es revisar todo igual de livianamente.

**Patrones de falla**

| Patrón | Firma | Cómo detectarlo |
| --- | --- | --- |
| Afirmación plausible sin respaldo | Suena razonable, no tiene base | Contrastar con la fuente |
| Especificidad fabricada | Estadísticas, fechas, nombres, citas inventadas | **La precisión sin fuente es la señal** ("63%" sin cita = adivinanza con forma de número) |
| Tono seguro que oculta incertidumbre | Una adivinanza llega con la misma voz que un hecho | Desconfiar en temas jurisdiccionales o con fecha |
| Contradicción interna | Pág. 2 dice $2.000 M; pág. 8 proyecta sobre $2.600 M | Pase de consistencia sobre todo el documento |
| Sesgo de confirmación | El prompt sugiere la respuesta y Claude la sigue | Preguntas realmente abiertas; desconfiar del acuerdo fácil |
| Falla de completitud | Resume bien los archivos fáciles y calla sobre el importante | Revisión de completitud separada |
| Alucinación de capacidad | "Ya lo envié por mail", "guardé el archivo" | Toda acción externa no confirmada es no verificada |

**Los 4 umbrales de riesgo (Diligence):** **Stakes** (costo del error) · **Reversibilidad** (¿se puede deshacer?) · **Audiencia** (externa, ejecutiva o regulatoria sube la vara) · **Exposición regulatoria** (si una norma, contrato o ley lo rige, la asistencia de IA no quita obligaciones).

**Iterar vs escalar:** si las rondas dejan de mejorar el output, no corresponde otro prompt sino un experto humano. Más prompting no fabrica el juicio que la situación exige.

**Edición por audiencia (3 pasadas):** claridad (cortar rodeos y relleno) → tono (registro según relación y ocasión) → formato (escaneable para ejecutivos, detallado para el equipo, limpio para externos). Mismos hechos, distinta selección, profundidad y tono. Si la calidad importa, generá más de un borrador (corridas o modelos) y editá desde el mejor.

**Formato según confiabilidad:** inline para responder en el chat; Artifacts para documentos y código; formatos estructurados (tablas, esquemas) para datos; Code Execution cuando los números tienen que estar bien.

**Curar inputs:** deduplicar fuentes, etiquetar el rol de cada input ("esta es la política aprobada; estos son los borradores") y podar lo irrelevante. El ruido que entra sale.

### B.8 Delegación e integración en workflows (M4)

- De "yo uso Claude" a "nuestro workflow usa Claude": el valor viene de **elegir qué pasos delegar**, no de automatizar todo.
- **3 criterios por paso:** **Reversibilidad** (lo reversible tolera más delegación) · **Stakes** (lo caro queda humano o revisado por humano) · **Accountability** (no se delega aunque se delegue la redacción).
- **3 clases de paso:** AI-appropriate · Collaborative (IA redacta, humano juzga) · Human-retained.
- **Rediseño:** en cada paso de IA, la feature correcta: **Skill** para procedimientos repetibles, **Code Execution** para datos. Los pasos humanos se vuelven **review gates explícitos**.
- **Errores de mapeo:** *halo delegation* (delegar un paso porque el anterior salió bien), *colapsar collaborative en automate* (el gate de revisión nunca se staffea: un paso colaborativo sin revisor real es automatizado), *mapear la herramienta en vez del trabajo* (primero el trabajo, después las features). **Over-delegation:** dar a la IA más de lo que justifica el riesgo, por ejemplo que apruebe o envíe porque redactó bien.
- **Requisitos:** Claude convierte inputs desordenados en requisitos estructurados, trazables y testeables. Después, *pressure-test*: que cuestione su propia lista para encontrar requisitos ambiguos, con doble lectura o implícitos.
- **Planificación:** síntesis (donde Claude rinde más) + números con Code Execution. Los pasos de juicio (apetito de riesgo, realidad política, presupuesto) quedan humanos.
- **Diseño de soluciones:** loop ideación → prototipo → feedback → refinamiento, dentro de un Project para mantener estable el contexto.
- **Señal de escalamiento:** cuando otros dependen de la solución como infraestructura (uptime, seguridad, integración), sale del alcance Associate y va a Developer o Architect.

### B.9 Configuración y knowledge management (M5)

- **Configurar es apalancamiento:** lo armás una vez y rinde en cada conversación. Es lo que convierte habilidad individual en capacidad del equipo: dos personas, misma pregunta, misma calidad.
- **4 mecanismos de un Project:** standing instructions (comportamiento, no hechos) · knowledge base (hechos y referencias, no comportamiento) · Skills (procedimiento; nivel cuenta en Customize, reutilizable en cualquier Project) · scoped Memory (continuidad aislada por Project).
- **Regla de emparejamiento:** muchas necesidades ocupan dos slots. "Citá el documento fuente" (instrucción) necesita los documentos (knowledge base); una Skill de status report necesita la guía de marca (knowledge base).
- **Error de configuración más común:** meter un procedimiento en las instrucciones o una regla de comportamiento en la knowledge base.
- **Compartir:** en Team o Enterprise el Project se comparte con el equipo bajo permisos. **\[Verificar\]**
- **Conectores** (Google Drive, Gmail…): alcanzan sistemas externos que vos autorizás. Mantenelos curados, no conectes todo por defecto. Cada uno tiene un **límite de capacidad** (ej.: un conector de mail puede buscar y leer pero no enviar). Pedirle una acción fuera de su límite produce una falla confusa, no un error claro.
- **Instrucciones precisas:** las vagas fallan en silencio. "Sé profesional" no da nada para actuar; "registro formal, definí cada sigla en el primer uso, párrafos de menos de 4 oraciones" sí.
- **Mantenimiento:** revisión mensual de cada Project activo. Las Skills de Anthropic y las provistas por la organización se actualizan solas; las custom tuyas solo cambian cuando las volvés a subir. La señal de que esperaste demasiado: la calidad cae sin causa visible.

### B.10 Governance y uso responsable (M6)

- Governance es una **habilidad del practicante**: se ejerce decisión por decisión, no en un manual.
- **4 criterios de delegación para casos de uso:** reversibilidad · consecuencia del error · necesidad de creatividad o empatía humana · accountability. Interactúan: corré los cuatro y nombrá el **criterio load-bearing** (el que, si cambiara, movería la clasificación).
- **El gate es la clasificación:** "appropriate with human review" exige **quién** revisa (el rol con la accountability), **qué** verifica (el riesgo concreto: exactitud, equidad, compliance) y **cuándo** (antes de usar el output). "Mantenemos un humano en el loop" no es un gate.
- **Confianza en Skills:** fuente · alcance (una Skill hereda el acceso de la sesión; auditar instrucciones, dependencias y archivos del bundle) · adecuación. Resultados: **Enable / Escalate / Decline**. "Interno" no significa "vetado". Principio de **mínimo privilegio** para toda feature que lea o actúe sobre datos.
- **Datos:** clasificar antes de subir (verde/amarillo/rojo). Ante la duda entre dos niveles, tratalo como el más sensible. **Redactar o anonimizar** cuando la tarea no necesita los identificadores, sin dejar campos que re-identifiquen. Si la tarea sí los necesita, redactar no es la solución: confirmá un camino aprobado o dejalo afuera.
- **Controles por feature:** sandbox de Code Execution (revisá lo que subís), persistencia de Memory, Incognito, controles de Memory a nivel org. Los entry points pueden manejar la retención distinto según la configuración de la org: ante la duda, preguntá antes de subir.
- **Políticas como hábito:** aplicarlas también en decisiones rutinarias, **auditar el uso real contra la política**, mantenerse al día. Si el camino aprobado tiene fricción, la gente se va al no aprobado: el arreglo es sacar la fricción, y la brecha es de la organización, no solo de los individuos.
- **Ética:** sesgo y equidad (riesgo máximo donde hay más en juego para personas: contratación, evaluación), transparencia (ante la duda, **revelar** la asistencia de IA). Casos ambiguos: quién se afecta, qué puede salir mal, cómo es el resultado justo, qué disclosure corresponde, y documentar el razonamiento. Si la población es grande, el daño significativo o el tema excede al equipo: escalar con el razonamiento documentado.

### B.11 Troubleshooting y optimización (M7)

- **4 causas raíz, leídas por el momento del síntoma:** primera respuesta mal → sub-especificación · empezó bien y se degradó → context overload · error repetible de un tipo (números levemente mal, análisis superficial) → feature o modelo equivocado · "antes andaba" → configuración desactualizada. Quinta posibilidad, al final: **expectation mismatch** (la tarea nunca fue algo que Claude haga bien).
- **Secuencia diagnóstica, de la más barata a la más cara:** prompt vs 5 componentes → largo de la conversación → feature y modelo → configuración → solo entonces, ¿la tarea encaja? El error típico es saltar directo a "modelo más capaz" o "es imposible".
- **De reacción a instrucción:** "demasiado genérico" → "nombrá la audiencia y la acción que quiero". Si no podés nombrar la palanca (prompt, contexto cargado, configuración), todavía es una reacción.
- **Capturar lo que funcionó:** si la misma corrección se va a necesitar otra vez, por vos o por otro, va a configuración. Memory puede captar patrones, pero es por usuario y best-effort; la configuración es el hogar deliberado y compartido.
- **Optimizar:** 3 señales de fricción (repetición, corrección, varianza entre personas), 2 movimientos (**consolidar** pasos y **promover** patrones a Projects/Skills), probar el cambio unos ciclos con el enfoque viejo disponible, y **medir** con la métrica que importa (tiempo, rondas de revisión, consistencia, calidad).

## C. Practical Workflows

Veinte procedimientos, en el orden en que aparecen en una pieza de trabajo real. Cada uno: cuándo, prerrequisitos, herramientas, pasos, parámetros, resultado, verificación y errores frecuentes.

### WF-01 · Configurar una sesión antes del primer prompt (M1)

- **Cuándo:** antes de cualquier trabajo que no sea una pregunta puntual.
- **Prerrequisitos:** saber si la tarea se repite, qué stakes tiene y si necesita datos actuales.
- **Herramientas:** selector de Project, selector de modelo, toggles de web search/Research, Code Execution.
- **Pasos:**
  1. Entry point: Chat (puntual) / Project (recurrente) / Artifact (entregable) / Research (multi-fuente actual).
  2. Capas: ¿contexto estable? Project. ¿procedimiento fijo? Skill. ¿números? Code Execution. ¿continuidad? Memory.
  3. Modelo: Sonnet por defecto; Haiku si es estructurado y a volumen; Opus si hay juicio ambiguo y alto riesgo.
  4. Contexto: ¿la sesión va a ser larga? Planeá puntos de resumen o segmentá la tarea.
- **Resultado esperado:** una configuración justificable en una frase (ej.: "Project + Code Execution + Skill · Sonnet").
- **Verificación:** podés explicar qué te compra cada elección y qué te cuesta.
- **Errores frecuentes:** pedir cálculos en prosa; usar Opus para clasificación con rúbrica clara; usar Chat para algo semanal.

### WF-02 · Construir un Project para trabajo recurrente (M1, M5)

- **Cuándo:** el test de 3 preguntas da 2 o más "sí" (recurre · contexto estable · formato consistente).
- **Prerrequisitos:** documentos de referencia vigentes, formato de salida definido, reglas de comportamiento acordadas.
- **Herramientas:** Projects, knowledge base, standing instructions, Skills (Customize, nivel cuenta), Memory.
- **Pasos:**
  1. Crear un Project por workstream o por cliente.
  2. Escribir standing instructions precisas (comportamiento: tono, formato por defecto, hábitos de verificación).
  3. Subir a la knowledge base las referencias estables, sin duplicados ni versiones viejas.
  4. Crear o habilitar la Skill del procedimiento repetible (previa evaluación de confianza, WF-16).
  5. Dejar que la scoped Memory acumule decisiones y preferencias del Project.
  6. En Team/Enterprise, compartir el Project con el equipo bajo permisos.
- **Resultado esperado:** cada conversación nueva arranca con el contexto ya cargado. Caso del curso: 40 → 25 min por sesión.
- **Verificación:** abrí una conversación nueva y pedí la tarea sin re-explicar nada; el primer borrador debe salir en formato y con el contexto correcto.
- **Errores frecuentes:** procedimiento escrito como instrucción; regla de comportamiento metida como documento; mezclar dos clientes en un Project.

### WF-03 · Escribir un prompt profesional (M2)

- **Cuándo:** antes de enviar cualquier pedido que importe.
- **Prerrequisitos:** saber quién va a leer el resultado y para qué decisión.
- **Pasos:**
  1. Role: quién es Claude para esta tarea.
  2. Context: audiencia, situación, decisiones previas, material fuente (lo que Claude no puede inferir).
  3. Task: un verbo principal sin ambigüedad.
  4. Constraints: largo, tono, qué incluir y excluir, y "usá code execution" si hay cálculos.
  5. Output format: tabla, lista, memo, email.
  6. Ajustar la latitud al tipo de tarea (análisis, research, drafting, brainstorming).
- **Resultado esperado:** un borrador que se refina en minutos en vez de rehacerse.
- **Verificación:** "30 segundos de especificación": ¿están role, contexto, tarea, restricciones y formato?
- **Errores frecuentes:** omitir contexto; pedir "profesional y pulido" (eso no cierra ningún gap); sobre-restringir un brainstorming.

### WF-04 · Descomponer una tarea compleja (M2)

- **Cuándo:** la tarea tiene varias etapas distintas o varios entregables con una base común.
- **Pasos:**
  1. Identificar las etapas (ej.: derivar criterios → puntuar → trade-offs → recomendar).
  2. Si hay entregables paralelos, poner primero la extracción compartida y su verificación.
  3. Correr un paso por prompt, revisando cada resultado intermedio.
  4. Pasos dependientes: misma conversación. Pasos independientes o conversación degradada: conversación nueva.
- **Resultado esperado:** razonamiento auditable y errores atrapados antes de propagarse.
- **Verificación:** podés mostrar cómo se llegó a la recomendación.
- **Errores frecuentes:** recomendar primero y justificar después; conversaciones aisladas por proveedor que pierden los criterios compartidos; redactar 3 documentos antes de confirmar la lista de cambios.

### WF-05 · Iterar un prompt diagnósticamente (M2)

- **Cuándo:** el primer output no llega.
- **Pasos:**
  1. Leer el output como diagnóstico y mapear el síntoma al componente (tabla en B.6).
  2. Cambiar **un** componente.
  3. Reenviar y comparar.
  4. Si una sección falla, iterar solo esa y conservar lo que funciona.
  5. Parar cuando el cambio por ronda es marginal y terminar a mano.
- **Resultado esperado:** convergencia en 2 o 3 rondas (ejemplo del curso: email de demora en 3 rondas).
- **Errores frecuentes:** reescribir todo el prompt (perdés lo que andaba y no sabés qué lo arregló); cambiar de modelo para arreglar sub-especificación.

### WF-06 · Revisar y clasificar un output (protocolo Discernment, M3)

- **Cuándo:** antes de usar o entregar cualquier output.
- **Prerrequisitos:** tu pedido original, las fuentes y el stake de la tarea.
- **Pasos:**
  1. Fijar el stake del dominio para decidir la profundidad de revisión.
  2. Contra **requisitos**: cada parte pedida está cubierta.
  3. Contra **fuente**: trazar afirmaciones específicas.
  4. Contra **estándares profesionales**: unidades, razonamiento, citas localizables.
  5. Revisión de **completitud** aparte: ¿qué falta?
  6. Pase de **consistencia** en documentos largos.
  7. Aplicar los 4 umbrales de riesgo (stakes, reversibilidad, audiencia, regulación).
  8. Veredicto documentado: Ready to use / Needs revision / Needs human override.
- **Resultado esperado:** cada output con un veredicto y su razón.
- **Errores frecuentes:** dejar pasar un borrador pulido de alto riesgo; sobre-revisar algo interno de bajo riesgo; preguntarle a Claude si omitió algo y creerle.

### WF-07 · Producir números verificados con Code Execution (M1, M3, M4)

- **Cuándo:** cualquier cifra que se reporta o alimenta una decisión; limpieza o transformación de datos; gráficos; archivos .xlsx/.pptx/.docx/.pdf reales.
- **Prerrequisitos:** Code Execution habilitado; archivo de datos limpio y etiquetado; datos clasificados (WF-17).
- **Pasos:**
  1. Subir el dataset.
  2. Pedir explícitamente "Using code execution on the attached…, calculate…".
  3. Pedir que muestre supuestos.
  4. Recién después pedir la síntesis o recomendación sobre las cifras calculadas.
- **Resultado esperado:** cifra exacta y trazable a las filas (ej.: $4,712,380 en vez de "alrededor de $4.7 M").
- **Verificación:** subtotales que reconcilian con las partidas; revisar la lógica del código y re-correr si algo no cierra.
- **Errores frecuentes:** suponer que el código está bien por haberse ejecutado; pedir "recalculá 3 veces y promediá" en prosa.

### WF-08 · Trabajar con documentos sin alucinaciones (grounding, M3)

- **Cuándo:** preguntas sobre contratos, políticas o cualquier documento cargado.
- **Pasos:**
  1. Curar inputs: deduplicar, dejar la versión aprobada, etiquetar cada documento.
  2. Restringir a las fuentes provistas.
  3. Permitir "no sé".
  4. Exigir citas auditables (sección y cláusula).
  5. En documentos largos: extraer citas textuales primero, analizar después.
  6. Si importa: best-of-N (comparar corridas) y validar contra una fuente autorizada externa, no contra otra respuesta de Claude.
- **Herramientas:** prompts verbatim de D.3; Claude for Excel para citas a nivel de celda.
- **Resultado esperado:** respuestas acotadas al documento y una lista de lo "no cubierto".
- **Errores frecuentes:** confiar en que Claude se queda en el documento sin pedirlo; validar contra una segunda respuesta de Claude.

### WF-09 · Rescatar una sesión con contexto degradado (M1, M7)

- **Cuándo:** Claude deja de seguir instrucciones que seguía o pierde decisiones previas.
- **Pasos:**
  1. Confirmar que es degradación en el tiempo, no sub-especificación desde el inicio.
  2. Pedir resumen del estado: decisiones tomadas, trabajo en curso, preguntas abiertas.
  3. Abrir conversación nueva (en el Project: instrucciones y knowledge base viajan solas) y pegar el resumen.
  4. Persistir lo que se va a necesitar siempre: Memory o knowledge base; formatos, como standing instruction.
- **Errores frecuentes:** repetir las instrucciones en la misma sesión degradada; subir a Opus; activar Research.

### WF-10 · Rediseñar un workflow con delegation mapping (M4)

- **Cuándo:** antes de integrar Claude en un proceso de equipo.
- **Prerrequisitos:** el proceso real descrito paso a paso (el trabajo, no las features).
- **Pasos:**
  1. Listar cada paso del trabajo.
  2. Evaluar cada paso por separado: reversibilidad, stakes, accountability.
  3. Clasificar: AI-appropriate / Collaborative / Human-retained. Todo paso irreversible es humano por defecto.
  4. Asignar feature a cada paso de IA: Skill (procedimiento), Code Execution (datos), ninguna.
  5. Convertir los pasos humanos en review gates con revisor real asignado.
  6. Probar unos ciclos y medir.
- **Resultado esperado:** mapa defendible ante auditoría (ver H.5, H.6).
- **Errores frecuentes:** halo delegation; colaborativo sin revisor; mapear alrededor de una Skill que te gusta.

### WF-11 · Analizar requisitos con pressure-test (M4)

- **Cuándo:** inputs desordenados (RFP, hilo de mails, pedido verbal) antes de construir algo.
- **Pasos:**
  1. Subir inputs crudos y pedir análisis estructurado en tabla, no resumen narrativo.
  2. Por requisito: etiqueta, sección de origen, si ya hay respuesta, ambigüedades.
  3. Pressure-test: "¿cuáles son ambiguos? ¿cuáles admiten dos lecturas? ¿cuáles están implícitos?".
  4. Convertir necesidades vagas en definiciones de tarea (qué, para quién, cada cuánto, de qué datos, en qué formato).
- **Verificación:** cada requisito es testeable; los no cuantificados ("muchos usuarios") quedan marcados.
- **Errores frecuentes:** quedarse con la primera extracción; perder requisitos enterrados en cláusulas subordinadas o criterios de evaluación.

### WF-12 · Comunicar valor y límites a stakeholders (M4)

- **Pasos:**
  1. Decir qué hace Claude en este caso, con precisión.
  2. Nombrar el checkpoint humano.
  3. Calibrar al nivel de AI literacy: técnico (features + modos de falla), ejecutivo (resultado + supervisión + postura de riesgo), riesgo/cliente (garantía de sign-off humano).
  4. Documentar los review gates.
- **Verificación:** ninguna frase dice "fully automated", "Claude handles X" ni "tan bueno como una persona".

### WF-13 · Conectar y gestionar conectores (M5)

- **Pasos:**
  1. Confirmar con el admin la ruta correcta: el camino obvio puede llevar a un directorio público y no a los conectores vetados de la org (patrón observado en campo).
  2. Conectar solo lo necesario.
  3. Documentar el límite de capacidad de cada uno (ej.: leer sí, enviar no).
  4. Diseñar el workflow dentro de esos límites.
- **Errores frecuentes:** reportar como bug un límite de capacidad (el reporte va al equipo equivocado); conectar un look-alike.

### WF-14 · Mantener y auditar una configuración (M5)

- **Cuándo:** mensualmente en Projects activos, o cuando la calidad cae sin causa visible.
- **Pasos:**
  1. Standing instructions: ¿coinciden con el proceso actual (métricas, períodos, templates)?
  2. Knowledge base: ¿hay versiones superadas o duplicadas?
  3. Skills: ¿están las correctas habilitadas? ¿la custom está re-subida a su última versión?
  4. Memory: borrar entradas vencidas (gente que se fue, períodos viejos); exportar backup antes de cambios grandes; reset si confunde.
  5. Agregar explícitamente lo que Claude no capturó solo.
- **Resultado esperado:** el output vuelve al estándar sin cambiar cómo se promptea.
- **Errores frecuentes:** culpar al modelo; borrar la versión nueva en vez de corregir la instrucción vieja.

### WF-15 · Clasificar un caso de uso (M6)

- **Pasos:**
  1. Correr los 4 criterios: reversibilidad, consecuencia del error, creatividad o empatía humana, accountability.
  2. Nombrar el criterio load-bearing.
  3. Clasificar: Fully appropriate / Appropriate with human review / Inappropriate.
  4. Si es "with review", definir el gate: **quién** (rol con accountability), **qué** (riesgo a atrapar), **cuándo** (antes del uso).
  5. Si es inapropiado, explicar por qué y qué rol humano debe ser dueño.
  6. Documentar el razonamiento.
- **Verificación:** el gate se puede escribir en forma quién/qué/cuándo. Si no, el caso no está listo.

### WF-16 · Evaluar una Skill antes de habilitarla (M1, M6)

- **Pasos:**
  1. **Fuente:** ¿Anthropic, aprobada por la org, otro equipo interno o tercero desconocido?
  2. **Alcance:** la Skill hereda todo el acceso de la sesión; ¿qué podría alcanzar donde va a correr? Auditar instrucciones, dependencias y archivos del bundle.
  3. **Adecuación:** ¿es la herramienta justa o más capacidad de la necesaria?
  4. Si es interna de otro equipo: confirmar con quien la publicó qué accede y por qué, y que cumpla la política actual.
  5. Decidir: **Enable** (todo claro) / **Escalate** (útil pero fuente desconocida o acceso amplio → admin o seguridad) / **Decline** (desproporcionada o fuente no establecible).
- **Errores frecuentes:** "me la pasó un colega" como fuente confiable; "habilitémosla y miremos una semana".

### WF-17 · Manejar datos sensibles (M6)

- **Pasos:**
  1. Clasificar: verde, amarillo o rojo (ante la duda, el más sensible).
  2. Verde: usar normalmente.
  3. Amarillo: revisar contra política; si no debe persistir, Incognito; si la tarea no necesita identificadores, redactar.
  4. Rojo: confirmar primero que el entry point está aprobado para ese dato. Si no hay camino aprobado, frenar y escalar al admin.
  5. Al redactar: quitar todo campo que re-identifique (número de cuenta, cargo raro, fecha específica).
- **Errores frecuentes:** usar Incognito como si volviera seguro un dato regulado; redacción parcial; redactar datos que la tarea necesita.

### WF-18 · Auditar el uso del equipo contra la política (M6)

- **Pasos:**
  1. Revisar un período de uso real (ej.: un mes).
  2. Comparar con la política: entry points aprobados, Skills vetadas, gates de revisión cumplidos.
  3. Registrar cada brecha como acción cerrable a nivel hábito.
  4. Si la causa es fricción del camino aprobado, quitar esa fricción.
- **Resultado esperado:** riesgo invisible convertido en acciones concretas (caso del curso: 3 brechas, 3 acciones).

### WF-19 · Diagnosticar un output que rinde mal (M7)

- **Pasos (en este orden, del arreglo más barato al más caro):**
  1. Releer el prompt contra los 5 componentes.
  2. Revisar el largo de la conversación: ¿restart o resumen?
  3. Revisar feature y modelo: ¿cálculo sin Code Execution? ¿tarea profunda en un tier de velocidad?
  4. Revisar configuración: ¿instrucciones, knowledge y Skills vigentes?
  5. Solo entonces: ¿la tarea encaja? Si no, reformularla (ej.: rango con supuestos en vez de cifra exacta futura).
- **Resultado esperado:** en uno o dos minutos, un arreglo concreto o un "hay que reformular" razonado.

### WF-20 · Optimizar un workflow recurrente (M7)

- **Pasos:**
  1. Correr un ciclo completo anotando cada paso manual repetido (backlog de optimización).
  2. Clasificar fricción: repetición → contexto guardado o instrucción; corrección → cambio de configuración; varianza entre personas → Skill o knowledge base compartida.
  3. Ubicar cada arreglo con el test regla/referencia/procedimiento.
  4. Consolidar pasos que pueden ir juntos.
  5. Probar unos ciclos con el enfoque viejo disponible.
  6. Medir con la métrica que importa y parar cuando alcanza.
- **Resultado esperado:** caso del curso, 45 → 25 min por analista, formato consistente y una ronda de revisión menos.

## D. Features, configuraciones y prompts verbatim

El curso no tiene comandos ni código: las "herramientas" son features de claude.ai y las "sintaxis" son prompts e instrucciones. Los prompts van en inglés, tal como los da el curso; funcionan igual en español.

### D.1 Inventario de features

| Feature | Para qué | Disponibilidad y límites según el curso |
| --- | --- | --- |
| Chat | Trabajo puntual | Todos los planes; se guarda en historial |
| Projects | Contexto persistente: instrucciones + knowledge base + historial propio | Compartibles en Team/Enterprise bajo permisos |
| Artifacts | Entregables editables (docs, tablas, reportes, código, dashboards simples) | Sirven para herramientas internas chicas; si otros dependen de ellas, escalar |
| Web search | Consulta rápida de información actual | Todos los planes, toggle por chat; en Team/Enterprise lo habilita antes un Owner o Primary Owner |
| Research | Investigación multi-paso y multi-fuente | Planes pagos |
| Skills | Procedimientos repetibles | Built-in (Excel, Word, PowerPoint, PDF) + custom en Customize; nivel cuenta; se invocan solas cuando aplican; heredan el acceso de la sesión |
| Code Execution | Cálculo verificado, limpieza de datos, gráficos, archivos reales | Sandbox; habilita también el resumen automático de contexto en planes pagos |
| Memory | Continuidad entre sesiones | Scoped por Project; revisar mensualmente; export y reset |
| Incognito | Sesión fuera de Memory e historial | Chats sueltos; no anula retención org ni exports |
| Memory import | Traer memorias de otra IA | Experimental; Free, Pro, Max, Team (no Enterprise) |
| Conectores | Acceso a Google Drive, Gmail y otros | Cada uno con límite de capacidad; usar la ruta de conectores vetados de la org |
| Claude for Excel | Citas a nivel de celda que atan cifras a inputs | Ayuda de verificación |
| Org settings de Memory | Deshabilitar Memory para la org | Solo Enterprise (Owners / Primary Owners); Team no tiene |

**\[Nota\]** El listado de videos embebidos en la página del curso menciona Cowork, Scheduled Tasks, Dispatch, Plugins, Claude for Chrome y Microsoft 365, pero el contenido de los módulos no los enseña; M4 figura con tag de producto Cowork.

### D.2 Prompts por componente y por tipo de tarea (M2)

Prompt fuerte con los 5 componentes:

```text
You are an operations analyst (role). I am preparing a one-page update for our regional director, who cares about throughput and cost, not process detail (context and audience). Summarize the attached Q3 operations data (task), covering only the three metrics that moved more than 10 percent against target (constraint). Format as a short headline followed by three bullet points, each one sentence (output format).
```

Prompt reparado del ejercicio de M2 (análisis de encuesta):

```text
You are a product analyst. Attached are 200 customer survey responses. Identify the three most frequently raised issues, ranked by how many responses mention each, and for each issue include one representative verbatim quote and the approximate share of responses it appears in. Use code execution to count accurately rather than estimating. Format as a ranked list, most frequent first.
```

Uno por tipo de tarea:

```text
ANALYSIS: Compare these two vendor contracts on payment terms, termination rights, and liability caps. For each, state which contract is more favorable to us and why, in a three-row table.

RESEARCH: Using current sources, summarize how three named competitors positioned their Q2 launches. Cite each source. Flag anything you cannot verify.

DRAFTING: Draft a 150-word LinkedIn post announcing our new reporting feature, aimed at operations managers, in a confident but not salesy voice.

BRAINSTORMING: Give me 20 angles for a campaign around faster month-end close. Range widely; do not self-edit yet.
```

Iteración en rondas (email por demora):

```text
Round 1: Write a follow-up email to the client about the delayed deliverable.

Round 2: Write a follow-up to the client about the two-day delay on the analytics deliverable. The cause was a data-quality issue we have now fixed; new delivery is Thursday. Tone: accountable, not over-apologetic. Keep it under 120 words.

Round 3: Good. Add a subject line that signals resolution, not just delay.
```

### D.3 Prompts de grounding y verificación (M3)

```text
PERMISSION TO NOT KNOW: If the answer is not supported by the documents I provided, say so explicitly rather than estimating. It is acceptable to answer 'the provided materials do not cover this.'

SOURCE RESTRICTION: Answer using only the attached contract. Do not use general knowledge. For anything the contract does not address, list it under 'Not covered by this document.'

AUDITABLE CITATION: For every claim, cite the section and clause number it comes from, in parentheses, so I can verify it against the source.

QUOTE-GROUNDING: Before you analyze, extract the exact sentences from the document that bear on my question. Then base your analysis only on those quotes.
```

Técnicas sin texto fijo: **best-of-N** (re-correr y comparar; donde divergen están los puntos blandos) y **validar contra una fuente autorizada externa**.

### D.4 Prompts de workflow (M4)

```text
REQUIREMENTS EXTRACTION: From the attached RFP and the email thread, extract every distinct requirement the client is asking us to address. For each, give a short label, the exact RFP section it comes from, whether our thread already has an answer, and any requirement that is ambiguous and needs clarification. Return it as a table.

PRESSURE-TEST: Review the requirements you extracted. Which are ambiguous as written? Which could be interpreted two ways by our proposal team? Which imply a requirement the RFP states only indirectly?

VERIFIED PLAN: Using code execution on the attached ticket data, calculate quarterly volume growth and average tickets resolved per analyst. Then, from those figures, recommend the headcount needed to hold our current resolution time next quarter, and show the assumptions.
```

Herramienta interna como Artifact, en 3 ciclos y sin escribir código:

```text
Cycle 1: Build a simple dashboard artifact that shows these five metrics from the attached data, with a chart for each.
Cycle 2: Add a filter by region and a summary row at the top with the totals.
Cycle 3: The month-over-month deltas should be color-coded, green for improvement, and the layout should print cleanly.
```

### D.5 Standing instructions de ejemplo (M5, M7)

```text
CLIENT PROJECT: Write in a formal register. Always cite the source document for any factual claim. Flag anything you are unsure of rather than guessing.

VERIFICATION GUARDRAIL: Cite the source document for every factual claim, and say 'I don't know' rather than guessing when the documents do not cover something.

PRECISE REPORTING: For every figure in a report, state its source. If a figure is not in the provided data, mark it 'unverified' rather than including it. Lead each report with a one-sentence headline.

PRECISE STYLE: Use a formal register, define any acronym on first use, and keep paragraphs under four sentences.

MEETING NOTES: List each decision as its own bullet; record every action item as owner plus due date; flag any unassigned action as 'owner TBD'.

CAPTURED FIXES: Always state the target segment in the first line. Place the call to action in its own closing section.
```

Antiejemplos que fallan en silencio: "Be professional", "Make the reports good and accurate", "Capture the meeting clearly and thoroughly", "Write up the notes nicely".

### D.6 Prompt de handoff para reiniciar una sesión (M1)

El curso define el contenido del resumen (decisiones, trabajo en curso, preguntas abiertas) pero no da texto. Redacción sugerida **\[Externo\]**:

```text
Before we close this conversation, write a handoff summary I can paste into a new one: (1) decisions made and the reasoning, (2) work in progress and its current state, (3) open questions, (4) the standing constraints and format rules I gave you at the start.
```

### D.7 Mensajes a stakeholders (M4)

| Audiencia | Mensaje modelo del curso |
| --- | --- |
| Legal lead (alta literacy) | "Claude extracts clauses, flags playbook departures, and drafts the redline. It does not approve changes, that gate stays with you. Known failure mode: it can miss obligations implied indirectly, so the playbook-departure flags are a prompt for your read, not a substitute." |
| Ejecutivo de la práctica | "Review time is down about half at the same approval standard. Every change is still approved by a lawyer before it leaves the building." |
| Cliente / función de riesgo | "AI assists drafting; qualified human reviews and approves every term. No contract is sent without human sign-off." |

Frases que sobrevenden: "Our new AI system reviews contracts automatically", "fully automated", "Claude handles X", "It's basically as good as a person at Y".

## E. Decision Making

Tablas para decidir en segundos. Si dos filas parecen aplicar, gana la que tiene más stakes.

### E.1 ¿Qué configuración uso? (ejercicio de M1, con clave)

| Escenario | Configuración | Por qué |
| --- | --- | --- |
| Qué competidores lanzaron productos en los últimos 90 días | Research · Sonnet | Información posterior al corte de entrenamiento |
| Notas de reunión semanales, mismo template durante 6 meses | Project + Skill · Sonnet | Recurrente, contexto estable, formato fijo |
| Análisis de 15 páginas para directorio desde 4 informes con señales ambiguas | Project (knowledge base) + Artifact · Opus | Multi-fuente, ambiguo, alto riesgo |
| Tasas de respuesta por área sobre 800 encuestas, marcar menores a 60% | Code Execution · Haiku o Sonnet | Cálculo sobre dataset definido |
| Variance analysis mensual: actuals vs budget, marcar desvíos > 10%, template | Project + Code Execution + Skill · Sonnet | Recurrente + números verificados + formato |
| Respuesta puntual a un proveedor sobre condiciones de pago | Chat + Artifact · Sonnet | Única vez, no requiere capas |

### E.2 ¿Qué modelo?

| Señal | Haiku | Sonnet | Opus |
| --- | --- | --- | --- |
| Tarea estructurada con rúbrica clara | ✓ |  |  |
| Cientos de ítems en secuencia | ✓ |  |  |
| Drafting, síntesis, análisis general |  | ✓ |  |
| Inputs ambiguos o juicio matizado |  |  | ✓ |
| Entregable a cliente o directorio |  |  | ✓ |
| Output superficial pese a buen prompt en tier rápido |  |  | Subí de tier |

Trampa de examen: 500 contratos con rúbrica inequívoca → **Haiku**, no Opus. Opus solo si clasificar exigiera juicio matizado.

### E.3 ¿Dónde va esta pieza de configuración?

| Pregunta | Sí → |
| --- | --- |
| ¿Le dice a Claude qué **hacer** siempre? | Standing instruction |
| ¿Le dice a Claude qué **saber**? | Knowledge base |
| ¿Es una secuencia de pasos que se repite? | Skill |
| ¿Es una decisión o preferencia que el Project ya fijó y evoluciona? | Scoped Memory |
| ¿Es un número que debe ser exacto? | Code Execution |
| ¿Necesita dos cosas a la vez (regla + documentos)? | Dos slots conectados |

Clave del checkpoint de M1 (revisión de contratos): "marcá toda cláusula que se aparte del playbook" → instrucción · procedimiento que extrae y formatea al template → Skill · playbook → knowledge base · exposición por penalidad con tasa variable → Code Execution · contratos del ciclo → knowledge base (ver contradicción en K.2).

### E.4 ¿Este output sale? (triage, M3)

| Situación | Veredicto | Acción |
| --- | --- | --- |
| Bajo riesgo, interno, etiquetado como borrador | Ready to use (con edición liviana) | Recortar lo flojo y seguir |
| Total que no coincide con la suma de las partidas | Needs revision | Recalcular con Code Execution y confirmar |
| Estadísticas sin fuente verificable | Needs revision | Exigir citas o validar contra fuente autorizada |
| Precio que omite una condición del PDF ("mínimo 10 seats") | Needs revision | Re-prompt restringido a la fuente |
| Análisis regulatorio sin la norma cargada | Needs human override | Insumo para el experto, no reemplazo |
| Borrador para presentar a un regulador, aunque los puntos chequeados estén bien | Needs human override | Revisión experta obligatoria |
| Resumen financiero para directorio, se ve impecable | Revisión humana + recalcular | Activa 3 umbrales: stakes, audiencia, irreversibilidad |
| Propuesta iterada 5 veces sin mejora desde la 3 | Escalar a un colega | La curva plana es la señal |

### E.5 ¿Delego este paso? (M4)

| Reversible | Stakes | Accountability | Clase |
| --- | --- | --- | --- |
| Sí | Bajos | No crítica | AI-appropriate |
| Sí | Medios | Humano juzga cada cambio | Collaborative |
| No, o externo / legalmente vinculante | Altos | Indelegable | Human-retained |
| Sí, pero numérico | Variable | — | AI-appropriate con Code Execution |

### E.6 ¿Este caso de uso es apropiado? (M6)

| Caso | Clasificación | Criterio load-bearing / gate |
| --- | --- | --- |
| FAQ interna desde políticas aprobadas | Fully appropriate | Reversible, bajo riesgo, con grounding |
| Respuestas a reclamos de facturación | Appropriate with human review | Accountability: un agente valida contra el registro de la cuenta y ajusta tono antes de enviar |
| Shortlist de CVs | Appropriate with human review + salvaguardas de sesgo | El hiring manager es dueño de la selección y revisa los excluidos |
| Resúmenes de evaluación de desempeño desde notas propias | Appropriate with human review + chequeo de equidad | El manager verifica cada resumen contra sus notas; considerar disclosure |
| Nota de condolencias a un cliente | Debe ser del humano | Necesidad de empatía y relación, aunque sea reversible |
| Determinación médica, legal o de elegibilidad final sin revisión | Inappropriate | Irreversible + accountability profesional intransferible |

### E.7 ¿Qué hago con estos datos? (M6)

| Nivel | Ejemplos | Acción |
| --- | --- | --- |
| Verde | Publicado, anonimizado, agregado, interno ya liberado | Usar (Code Execution para conteos) |
| Amarillo | Interno que no debe salir de la empresa, nombres o contactos, borradores de deals o productos no anunciados | Revisar contra política · Incognito si no debe persistir · redactar si no hacen falta identificadores |
| Rojo | Salud, financiero o gubernamental regulado; credenciales y secretos; datos bajo obligación de confidencialidad con terceros | Afuera salvo camino aprobado confirmado; si no hay, frenar y escalar |

### E.8 ¿Habilito esta Skill? (M6)

| Fuente | Alcance vs tarea | Decisión |
| --- | --- | --- |
| Anthropic u org-aprobada | Proporcional | Enable |
| Otro equipo interno | No confirmado | Confirmar con quien la publicó → Enable o Escalate |
| Desconocida o foro público | Amplio o sin límite claro | Escalate a admin o seguridad |
| No establecible | Claramente desproporcionado | Decline |

### E.9 ¿Quién resuelve esto? (M4, M8)

| Necesidad | Track |
| --- | --- |
| Prompting, Projects, Skills, validación, governance del día a día | Associate |
| API, SDKs, agentes, tools, sistemas de los que otros dependen | Developer |
| Arquitectura empresarial, diseño de integraciones, governance a escala | Architect |
| Cuestiones éticas de gran alcance o fuera de la competencia del equipo | Función de AI governance o ética de la org |
| Datos regulados sin camino aprobado | Admin |

## F. Best Practices

Agrupadas por área y marcadas por obligatoriedad.

### F.1 Selección y sesión

- **\[RECOMENDADO\]** Decidí entry point, capas, modelo y contexto antes de escribir el prompt.
- **\[RECOMENDADO\]** Empezá en Sonnet y movéte solo con una razón: calidad insuficiente → Opus; volumen estructurado → Haiku.
- **\[RECOMENDADO\]** En trabajo intensivo, segmentá tareas y reiniciá desde resúmenes antes de chocar el límite de uso.
- **\[RECOMENDADO\]** Separá workstreams y clientes en Projects distintos; Memory sigue esos límites.

### F.2 Prompting

- **\[RECOMENDADO\]** Corré el checklist de 5 componentes antes de todo prompt que importe.
- **\[RECOMENDADO\]** Contexto explícito: lo que vive solo en tu cabeza no existe para Claude.
- **\[RECOMENDADO\]** Construí y verificá primero la base compartida de varios entregables.
- **\[RECOMENDADO\]** Cambiá un componente por iteración y pará con rendimientos decrecientes.
- **\[RECOMENDADO\]** Brainstorming: latitud primero, filtro después. Análisis: criterios primero.

### F.3 Verificación

- **\[OBLIGATORIO\]** Calculá con Code Execution todo número que se reporta.
- **\[OBLIGATORIO\]** Revisión humana de la lista *do-not-ship-without-review*: entregables finales a clientes; cálculos auditables o materialmente financieros; datos regulados, confidenciales o muy sensibles; comunicaciones públicas o legales.
- **\[OBLIGATORIO\]** Decidí los umbrales de escalamiento **antes** del momento, por política.
- **\[RECOMENDADO\]** Construí la verificación en el prompt: permitir "no sé", restringir a fuentes, exigir citas auditables, citar antes de analizar.
- **\[RECOMENDADO\]** Tomá toda acción externa que Claude dice haber hecho como no verificada hasta confirmarla.
- **\[RECOMENDADO\]** Calibrá la profundidad de revisión al stake: sobre-verificar lo trivial también es un error, gasta el tiempo que la herramienta ahorró.
- **\[OPCIONAL\]** Best-of-N y comparación entre modelos cuando la calidad importa.

### F.4 Workflows y stakeholders

- **\[OBLIGATORIO\]** Los pasos irreversibles, legalmente vinculantes o de accountability quedan humanos.
- **\[OBLIGATORIO\]** Cada paso colaborativo tiene un revisor real asignado.
- **\[RECOMENDADO\]** Mapeá el trabajo primero y las features después.
- **\[RECOMENDADO\]** Una Skill configurada le gana a un "heroic prompting" que depende de recordar la frase justa.
- **\[RECOMENDADO\]** Comunicá límites con la misma claridad que el valor, y nombrá el gate humano en la misma frase.

### F.5 Configuración

- **\[RECOMENDADO\]** Escribí los guardrails de verificación una vez como standing instruction.
- **\[RECOMENDADO\]** Instrucciones testeables: dos personas deben leerlas igual.
- **\[RECOMENDADO\]** Knowledge base sin duplicados; sacá la versión vieja cuando subís la nueva.
- **\[RECOMENDADO\]** Revisión mensual de Projects activos y de Memory.
- **\[RECOMENDADO\]** Exportá Memory antes de un cambio grande.
- **\[RECOMENDADO\]** Re-subí tus Skills custom cuando cambia el proceso: no se actualizan solas.

### F.6 Seguridad, privacidad y governance

- **\[OBLIGATORIO\]** Clasificá el dato antes de que entre a una feature. Ante la duda, el nivel más sensible y preguntar antes de subir.
- **\[OBLIGATORIO\]** Dato rojo: entry point aprobado confirmado o no se sube.
- **\[OBLIGATORIO\]** Ninguna Skill de fuente desconocida o con alcance desproporcionado se habilita bajo tu sola autoridad.
- **\[RECOMENDADO\]** Mínimo privilegio para conectores, tools e integraciones; revisarlo cuando cambia la tarea.
- **\[RECOMENDADO\]** Redactá o anonimizá cuando la tarea no necesita identificadores, sin dejar campos que re-identifiquen.
- **\[RECOMENDADO\]** Hacé fácil el camino compliant: la fricción empuja a cuentas personales.
- **\[RECOMENDADO\]** Ante la duda, revelá la asistencia de IA.
- **\[RECOMENDADO\]** Evaluación de sesgo y equidad como parte de la revisión rutinaria, sobre todo en trabajo sobre personas.

### F.7 Producción y mejora continua

- **\[RECOMENDADO\]** Promové a configuración todo arreglo que se va a repetir.
- **\[RECOMENDADO\]** Probá una optimización unos ciclos con el método viejo disponible antes de depender de ella.
- **\[RECOMENDADO\]** Medí con la métrica que importa: un reporte a cliente optimiza consistencia y exactitud; un borrador interno, tiempo.
- **\[RECOMENDADO\]** Cuando una solución pasa a ser infraestructura de otros, escalá a Developer o Architect.

## G. Troubleshooting

Primero leé **cuándo** apareció el síntoma; eso ya señala la causa. Después corré la secuencia diagnóstica de WF-19.

### G.1 Mapa síntoma → causa raíz (M7)

| Momento del síntoma | Causa raíz | Arreglo |
| --- | --- | --- |
| Mal desde la primera respuesta, en chat nuevo | Sub-especificación | Agregar lo que falta: contexto, restricciones, formato |
| Empezó bien y se degradó con la sesión | Context overload | Restart o resumen; persistir el formato como instrucción |
| Error repetible de un tipo: números levemente mal o análisis superficial | Feature o modelo equivocado | Code Execution o un tier más capaz |
| "El mes pasado andaba" | Configuración desactualizada | Checklist de mantenimiento (WF-14) |
| Nada de lo anterior lo arregla | Expectation mismatch | Reformular la tarea |

### G.2 Problemas frecuentes

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| Output genérico ("podría ser de cualquier empresa") | Falta contexto y audiencia | Agregar audiencia, canal, beneficio, formato | Checklist de 5 componentes |
| Respondió otra cosa | Verbo de tarea ambiguo ("mejorá esto") | Nombrar la dimensión: más corto, más formal, pedido más claro | Un verbo principal por prompt |
| Largo o tono incorrecto | Falta restricción o formato | Ajustar solo esos componentes y reenviar | Declarar largo y tono de entrada |
| "Contame todo sobre X" devuelve un mar de texto | Sin alcance ni restricciones | Industria, riesgos, decisión que informa, largo | Acotar antes de enviar |
| Brainstorming pobre | Restricciones excesivas | Aflojar, pedir volumen y rango, filtrar después | Latitud según tipo de tarea |
| Recomendación sin razonamiento visible | Todo en un solo prompt | Descomponer en pasos verificables | WF-04 |
| Deja de seguir instrucciones a mitad de sesión | Contexto resumido | Resumen y conversación nueva | Persistir instrucciones en el Project |
| Promedio o total "raro" | Cálculo en prosa | Code Execution | Constraint fija: "use code execution" |
| Subtotal no coincide con las partidas | Inconsistencia interna | Recalcular y reconciliar antes de usar | Pase de consistencia |
| Estadística precisa sin fuente | Especificidad fabricada | Pedir cita o validar contra fuente autorizada | Citas auditables obligatorias |
| Cita que no se encuentra | Cita desde memoria de entrenamiento | Usar web search o Research; verificar aparte | Grounding |
| "Ya envié el mail" o "guardé el archivo" | Alucinación de capacidad | Confirmar en el sistema real | Conocer qué tools hay en la sesión |
| Resumen que mezcla y contradice versiones | Inputs duplicados o no etiquetados | Dejar la versión aprobada, etiquetar, re-correr | Curar inputs |
| Omite lo más importante de un lote | Falla de completitud | Revisión de completitud separada | Revisar el archivo crítico primero |
| Claude coincide demasiado con tu hipótesis | Sesgo de confirmación del prompt | Reformular como pregunta abierta | No insinuar la respuesta |
| Conector "no funciona" al enviar | Límite de capacidad (solo lee) | Hacer el paso por otra vía | Documentar límites de cada conector |
| Conector conectado no es el oficial | Ruta al directorio público | Rehacer por la ruta de la org | Confirmar con el admin |
| Cifras desactualizadas sin error visible | Instrucción o Memory fijadas a un período viejo | Actualizar instrucción y Memory | Revisión mensual |
| Formato levemente mal en cada corrida | Skill desactualizada o mal configurada | Corregir y re-subir la Skill | Versionar Skills custom |
| Mismo arreglo a mano cada semana | Arreglo no capturado | Promoverlo a instrucción o Skill | Test: ¿se va a necesitar otra vez? |
| Resultados distintos según quién corre la tarea | Setup no compartido | Skill o knowledge base compartida | Projects compartidos |
| Análisis superficial en tier rápido | Modelo inadecuado | Subir de tier | Opus para profundidad |
| Contexto de un cliente aparece en otro | Projects mezclados | Un Project por cliente con scoped Memory | Separar desde el inicio |
| Sesión cortada antes de terminar | Límite de uso | Retomar desde resumen | Segmentar y guardar avances |
| Equipo usa cuentas personales | Fricción en el camino aprobado | Quitar la fricción | Auditoría periódica de uso |
| Iterar no mejora más | Rendimientos decrecientes o falta juicio experto | Editar a mano o escalar a un humano | Reconocer la curva plana |

### G.3 Anti-patrones de diagnóstico

- Saltar a "modelo más capaz": no arregla sub-especificación ni contexto agotado.
- Repetir instrucciones en una sesión degradada: la extiende sin arreglarla.
- Reescribir el prompt entero: perdés lo que funcionaba.
- Pedir "esforzate más" o correr el mismo prompt varias veces esperando suerte.
- Concluir "Claude no puede" sin correr la secuencia completa.

## H. Practical Examples

Casos del curso (ilustrativos, según el propio curso) condensados para reutilizar como patrón.

### H.1 Status report semanal: de Chat a Project (M1)

Una coordinadora abría un Chat cada lunes y pegaba proyecto, equipo, stakeholders, formato y pendientes: 40 min por sesión, 12 de carga de contexto. Armó un Project: fondo, equipo y stakeholders a la knowledge base; formato y umbrales de escalamiento a las instrucciones. Ahora pega solo las novedades: **25 min**, misma calidad.

### H.2 Reporte regulatorio mensual con las 4 capas (M1)

Una analista lo hacía en Chat y verificaba cada cifra: 2 errores en el mes 1 y 1 en el mes 2, todos atrapados. En el mes 3 lo reconstruyó: contexto del portafolio e instrucciones de formato al Project, reportes previos a la knowledge base, Skill para el formato, cálculos a Code Execution. **65 → 30 min**, la verificación siguió, y 0 errores en los meses 3 a 8.

Preguntas que se hizo: ¿qué es igual cada vez? (instrucciones + Skill) · ¿qué referencia recurre? (knowledge base) · ¿qué debe ser correcto y no solo sonar bien? (Code Execution) · ¿qué contexto quiero llevar sin re-cargarlo? (Memory).

### H.3 Un anuncio, una FAQ y un briefing desde una política de 20 páginas (M2)

1. Extraer los cambios sustantivos y qué significa cada uno en la práctica.
2. Confirmar que la extracción está completa y es correcta.
3. Redactar el anuncio para el personal (audiencia general).
4. Redactar la FAQ anticipando preguntas.
5. Redactar el briefing ejecutivo, comprimido a decisiones e impacto.

Por qué este orden: si redactás antes de confirmar la lista, el mismo error de lectura se replica en tres documentos.

### H.4 Mismo análisis, dos audiencias (M3)

- **Crudo:** "The analysis indicates that processing time increased by approximately 18 percent in Q3, which may be attributable to…" (una oración larga con rodeos).
- **Ejecutivo:** "Q3 processing time rose 18 percent, driven by volume plus onboarding three new hires. Recommend standardized onboarding docs to limit the effect next time."
- **Equipo:** "Processing time was up \~18% in Q3. Two drivers: higher volume and three new staff still onboarding. Action: draft onboarding documentation so the next cohort ramps faster (owner and timeline to confirm in standup)."

### H.5 Revisión de contratos: mapa de delegación (M4)

| Paso | Clase | Por qué |
| --- | --- | --- |
| Extraer cláusulas | AI-appropriate | Reversible, bajo riesgo, mecánico |
| Marcar desvíos del playbook | AI-appropriate | Reversible; una Skill lleva las reglas |
| Redactar redline y justificación | Collaborative | IA redacta, humano juzga cada cambio |
| Aprobar o rechazar cada cambio | Human-retained | Alto riesgo, accountability |
| Calcular exposición por penalidad | AI-appropriate (Code Execution) | Numérico |
| Firmar y enviar | Human-retained | Irreversible, externo, vinculante |

Contraejemplo de la introducción de M4: un equipo dejó que Claude aprobara cláusulas de bajo riesgo sin supervisión; en un mes una cláusula aprobada creó una obligación que nadie vio, y retiraron la herramienta. El otro equipo, con el abogado dueño de cada decisión final, redujo a la mitad el tiempo de revisión sin perder calidad.

### H.6 Aprobación de gastos: solución del ejercicio de M4

| Paso | Clase | Feature | Razón |
| --- | --- | --- | --- |
| 1. Extraer partidas y montos de los comprobantes | Automate | Skill | Mecánico, reversible |
| 2. Chequear contra la política de viajes | Collaborative | Skill | La IA marca; un humano confirma casos borde |
| 3. Totalizar y calcular exceso o defecto vs límites | Automate | Code Execution | Debe calcularse |
| 4. Redactar nota explicando lo marcado | Collaborative | Ninguna | IA redacta, el aprobador ajusta |
| 5. Aprobar o rechazar | Human | Ninguna | Accountability |
| 6. Enviar a finanzas para pago | Human | Ninguna | Irreversible y material |

Onboarding de RR. HH. sigue el mismo patrón: extraer datos del HRIS (Code Execution) y redactar la oferta desde template (Skill) se delegan; personalizar la bienvenida es colaborativo; confirmar compensación y enviar la oferta firmada quedan humanos.

### H.7 Plan de capacidad con números verificados (M4)

Subir 4 trimestres de tickets → Code Execution calcula crecimiento y throughput por analista → Claude sintetiza la recomendación de headcount con supuestos. La decisión de contratar, contra presupuesto o congelamiento de contrataciones, queda del líder de operaciones.

### H.8 Workspace por cliente (M5)

Project del Cliente A: instrucciones (registro formal, citar fuente, marcar dudas), knowledge base (guía de marca, SOW vigente, últimos 3 status reports), Skill de formato de la firma (nivel cuenta), scoped Memory (stakeholders y preferencias del cliente, que nunca aparecen en el Project del Cliente B).

### H.9 Auditoría de un Project degradado (M5)

Causas encontradas: instrucción con una métrica renombrada el trimestre pasado, dos versiones del template en la knowledge base, Memory con un stakeholder que ya se fue. Arreglo: actualizar la instrucción, sacar el template viejo, borrar la entrada. Variante del quiz: instrucción y Memory fijadas a FY25 mientras la knowledge base ya tenía FY26 → se corrigen **instrucción y Memory**, no la knowledge base.

### H.10 Cuatro decisiones de datos (M6)

| Dato | Nivel | Acción |
| --- | --- | --- |
| Encuesta anonimizada para tendencias | Verde | Subir; Code Execution para conteos |
| Documento confidencial de M&A para resumir | Amarillo | Revisar contra política + Incognito; si el entry point está prohibido, afuera |
| Planilla con PII de clientes para limpiar | Amarillo/Rojo | Redactar o anonimizar, o confirmar camino aprobado con el admin |
| Historias clínicas para resumen | Rojo | ¿Entry point aprobado para PHI? Si no, frenar y escalar |

### H.11 Mini auditoría de uso (M6)

Al revisar un mes de uso aparecieron 3 brechas: spec de producto no lanzado subida a un entry point no aprobado, Skill habilitada sin chequeo de fuente, reporte a cliente que salteó su gate dos veces por apuro. Acciones: recordatorio de entry points aprobados, paso de vetting de Skills en el setup del Project, gate innegociable en entregables a clientes.

### H.12 Fix capturado vs fix perdido (M7)

- **Capturado:** a cada brief de campaña le faltaba el segmento y el call to action quedaba enterrado. Dos standing instructions y el siguiente borrador salió bien.
- **Perdido:** un analista recordaba a mano cada mes excluir las cuentas de prueba. Seis meses después seguía tipeándolo; un colega que lo cubrió no lo sabía y salió un reporte con datos de prueba.

### H.13 Auditoría de eficiencia (M7)

Reporte semanal de 45 min por analista con resultados variables. Fricciones: re-pegar el fondo, re-formatear a mano, cada uno chequeaba cosas distintas. Arreglo: fondo → knowledge base (referencia), formato → Skill (procedimiento), verificación → standing instruction (regla). Resultado: **25 min**, formato consistente, una ronda menos de revisión.

## I. Checklists

Listas reutilizables: copialas a la tarea y tildá al ejecutar.

### I.1 Antes de empezar una sesión

- [ ] Entry point elegido (Chat / Project / Artifact / Research)
- [ ] ¿Hay números? Code Execution activo y pedido explícitamente
- [ ] ¿Hay procedimiento fijo? Skill disponible y evaluada
- [ ] Modelo justificado (Sonnet por defecto)
- [ ] ¿Necesita info posterior al corte? Web search o Research
- [ ] Dato clasificado (verde / amarillo / rojo) antes de subir
- [ ] Sesión larga prevista: puntos de resumen planificados

### I.2 Antes de enviar un prompt que importa

- [ ] Role
- [ ] Context que Claude no puede inferir (audiencia, situación, decisiones previas, fuente)
- [ ] Task con un verbo principal claro
- [ ] Constraints (largo, tono, incluir y excluir, Code Execution si hay cálculos)
- [ ] Output format
- [ ] Latitud ajustada al tipo de tarea
- [ ] ¿Tiene varias etapas? Descompuesto
- [ ] Grounding si es sobre documentos: solo fuentes, "no sé" permitido, citas auditables

### I.3 Antes de usar o entregar un output

- [ ] Stake del dominio fijado
- [ ] Cubre todos los requisitos (no solo los fáciles)
- [ ] Afirmaciones específicas trazadas a la fuente
- [ ] Pasa estándares profesionales (unidades, razonamiento, citas localizables)
- [ ] Revisión de completitud hecha por separado
- [ ] Pase de consistencia en documentos largos
- [ ] Ninguna estadística precisa sin fuente
- [ ] Ninguna acción externa "hecha" sin confirmar
- [ ] Cifras de Code Execution; subtotales reconcilian
- [ ] 4 umbrales revisados: stakes, reversibilidad, audiencia, regulación
- [ ] ¿Está en la lista do-not-ship-without-review? Revisor humano asignado
- [ ] Editado para la audiencia: claridad, tono, formato
- [ ] Veredicto documentado: Ready / Revision / Human override

### I.4 Al rediseñar un workflow

- [ ] Trabajo real listado paso a paso (no las features)
- [ ] Cada paso evaluado por separado (sin halo delegation)
- [ ] Reversibilidad, stakes y accountability anotados por paso
- [ ] Todo paso irreversible o vinculante es humano
- [ ] Feature asignada a cada paso de IA (Skill / Code Execution / ninguna)
- [ ] Cada paso colaborativo tiene revisor real
- [ ] Review gates documentados
- [ ] Mensaje a stakeholders con valor, límites y gate humano
- [ ] ¿Otros van a depender de esto como infraestructura? Escalar

### I.5 Al configurar un Project

- [ ] Un Project por workstream o cliente
- [ ] Instrucciones = comportamiento, precisas y testeables
- [ ] Knowledge base = referencias vigentes, sin duplicados
- [ ] Procedimientos como Skill (nivel cuenta), evaluada
- [ ] Necesidades de dos slots conectadas (regla + documentos)
- [ ] Conectores mínimos, por la ruta de la org, con límites documentados
- [ ] Compartido con el equipo bajo permisos (Team/Enterprise)
- [ ] Prueba: conversación nueva produce el formato correcto sin re-explicar

### I.6 Mantenimiento mensual

- [ ] Instrucciones alineadas con el proceso actual (métricas, períodos, templates)
- [ ] Knowledge base sin versiones superadas
- [ ] Skills correctas habilitadas; custom re-subidas si cambiaron
- [ ] Memory revisada: vencidas borradas, cambios actualizados
- [ ] Backup de Memory antes de cambios grandes
- [ ] Datos que Claude no capturó agregados explícitamente

### I.7 Governance de un caso de uso, una Skill o un dato

- [ ] Caso de uso: 4 criterios corridos y criterio load-bearing nombrado
- [ ] Si requiere revisión: gate quién / qué / cuándo escrito
- [ ] Skill: fuente, alcance (hereda la sesión) y adecuación → Enable / Escalate / Decline
- [ ] Skill interna de otro equipo confirmada con quien la publicó
- [ ] Dato rojo: entry point aprobado confirmado antes de subir
- [ ] Redacción completa (sin campos que re-identifiquen) cuando aplica
- [ ] Incognito usado por persistencia, no como permiso
- [ ] Sesgo, equidad y disclosure evaluados en trabajo sobre personas
- [ ] Razonamiento documentado; escalado si excede al equipo

### I.8 Cuando algo sale mal

- [ ] ¿Cuándo apareció? (primera respuesta / se degradó / tipo específico / antes andaba)
- [ ] Prompt vs 5 componentes
- [ ] Largo de la conversación: ¿restart o resumen?
- [ ] Feature y modelo correctos
- [ ] Configuración vigente
- [ ] Solo entonces: ¿la tarea encaja o hay que reformularla?
- [ ] Arreglo que se va a repetir, promovido a configuración
- [ ] Ganancia medida con la métrica que importa

## J. Glosario

| Término | Definición | Módulo |
| --- | --- | --- |
| Accountability | Quién responde por el resultado. No se transfiere a la herramienta | M3, M4, M6 |
| AI Fluency Framework | Marco de Anthropic con 4 competencias: Description, Discernment, Diligence, Delegation | Todos |
| AI-appropriate / Collaborative / Human-retained | Clases de un paso de workflow según quién lo ejecuta | M4 |
| Alucinación de capacidad | Claude afirma haber hecho una acción externa que no puede hacer | M3 |
| Artifact | Bloque editable separado del chat para entregables | M1, M3 |
| Audience calibration | Adaptar selección, profundidad y tono del mismo contenido según quien lee | M3, M4 |
| Best-of-N | Correr el mismo pedido varias veces y comparar para encontrar puntos débiles | M3 |
| Capability boundary | Límite de lo que un conector puede hacer (ej.: leer sí, enviar no) | M5 |
| Capability layer | Capas que extienden a Claude: Projects, Skills, Code Execution, Memory | M1 |
| Chat | Entry point por defecto, conversación sin estructura | M1 |
| Code Execution | Sandbox donde Claude escribe y corre código para resultados calculados | M1, M3 |
| Completeness check | Revisión de qué falta, separada de la de exactitud | M3 |
| Confirmation bias (en framing) | Claude se inclina hacia la respuesta que el prompt sugiere | M3 |
| Connector | Integración autorizada con un sistema externo (Google Drive, Gmail) | M2, M5 |
| Consolidate / Promote | Movimientos de optimización: juntar pasos y pasar patrones a configuración | M7 |
| Context gap | Información necesaria que solo está en tu cabeza o fuera de una fuente conectada | M2 |
| Context overload | Degradación por una conversación cerca del límite de contexto | M1, M7 |
| Context window | Presupuesto de memoria de trabajo de una conversación | M1 |
| Delegation | Competencia: decidir qué hace la IA, qué el humano y qué juntos | M4, M6 |
| Delegation mapping | Clasificar cada paso de un workflow con reversibilidad, stakes y accountability | M4 |
| Description | Competencia: decirle a Claude con precisión qué querés | M2 |
| Diligence | Competencia: decidir cuándo verificar y hacerse dueño del resultado | M3, M6 |
| Diligence gap | Brecha entre lo que dice la política y lo que se hace | M6 |
| Discernment | Competencia: evaluar output contra requisitos, fuentes y estándares | M3 |
| Do-not-ship-without-review list | Outputs que nunca salen sin revisión humana | M3 |
| Entry point | Lugar de trabajo: Chat, Project, Artifact, Research | M1 |
| Escalate | Llevar a un humano experto, admin, seguridad u otro track | M3, M4, M6 |
| Expectation mismatch | La tarea pide algo que la herramienta no puede dar (ej.: cifra futura exacta) | M7 |
| Fabricated specific | Dato preciso inventado (estadística, fecha, nombre, cita) | M3 |
| Gate (review gate) | Punto de revisión humana definido por quién, qué y cuándo | M4, M6 |
| Grounding | Técnicas para anclar respuestas a fuentes provistas | M3 |
| Halo delegation | Delegar un paso porque el anterior salió bien | M4 |
| Haiku / Sonnet / Opus | Tiers de modelo: rápido / equilibrado / mayor capacidad | M1 |
| Heroic prompting | Depender de recordar la frase exacta cada vez en vez de configurar | M4 |
| Incognito | Modo que deja la sesión fuera de Memory e historial, sin anular la retención org | M1, M6 |
| Knowledge base | Documentos de referencia de un Project, subidos una vez | M1, M5 |
| Least privilege | Dar el acceso más estrecho que permite hacer el trabajo | M6 |
| Load-bearing criterion | El criterio que, si cambia, mueve la clasificación de un caso de uso | M6 |
| Memory | Retención de hechos relevantes entre sesiones | M1, M5 |
| Memory import | Traer memorias de otra plataforma de IA (experimental) | M1 |
| Over-delegation | Dar a la IA más de lo que justifica el perfil de riesgo | M4 |
| PII / PHI | Datos personales identificables / información de salud protegida **\[Externo: siglas\]** | M6 |
| Pressure-test | Pedirle a Claude que cuestione sus propios requisitos extraídos | M4 |
| Project | Workspace persistente: instrucciones + knowledge base + historial propio | M1, M5 |
| Project-scoped Memory | Memory aislada por Project | M1, M5 |
| Quote-grounding | Extraer citas textuales antes de analizar | M3 |
| Redaction | Quitar identificadores antes de subir cuando la tarea no los necesita | M6 |
| Research | Investigación multi-paso y multi-fuente (planes pagos) | M1, M2 |
| Restart / Summarize / Persist | Las 3 respuestas a contexto degradado | M1 |
| Skill | Procedimiento reutilizable de nivel cuenta, invocado automáticamente; es software | M1, M5, M6 |
| Source restriction | Ordenar responder solo desde materiales provistos | M3 |
| Stakes | Costo de un error | M3, M4 |
| Stale configuration | Instrucciones, knowledge, Skills o Memory desactualizados que degradan en silencio | M5, M7 |
| Standing instructions | Reglas de comportamiento persistentes de un Project | M1, M5 |
| Triage | Clasificar output en Ready to use / Needs revision / Needs human override | M3 |
| Under-specification | Prompt sin el contexto, restricciones o formato necesarios | M2, M7 |
| Web search | Búsqueda rápida en Chat, toggle por conversación | M1 |

## K. Examen, contradicciones y fuentes

### K.1 Preparación del examen (M8)

- **Formato:** 60 preguntas de escenario. Piden aplicar una habilidad o emitir un juicio, no recordar datos. Refleja los 7 módulos de contenido; M3 es la sección más grande.
- **Estrategia del curso:** encontrá tu módulo más débil y estudialo contra la parte del blueprint (v1.3) que le corresponde, trabajando los marcos de decisión y no la prosa.
- **Patrones de respuesta correcta en los quizzes:**
  - La respuesta correcta casi nunca es "cambiá a un modelo más capaz". Solo lo es cuando el síntoma es profundidad insuficiente en un tier de velocidad.
  - "Pedíselo a Claude y confiá en su respuesta" siempre es incorrecto.
  - Cuando hay un cálculo de por medio, la respuesta incluye Code Execution.
  - Cuando hay aislamiento entre clientes, la respuesta es Projects separados con scoped Memory, no Incognito ni "prompting cuidadoso".
  - Cuando algo dejó de andar sin error, la respuesta es mantenimiento de configuración; buscá qué elemento quedó viejo (en el quiz de M5, la instrucción y Memory, no la knowledge base).
  - Lo pulido no se aprueba por pulido: la limpieza visual nunca es el criterio.
  - Un límite de capacidad de un conector no es un bug.
  - La instrucción correcta es la única testeable (estructura explícita).
  - "Un colega la recomendó" no es una fuente vetada.
  - Ante fricción con el camino aprobado, la solución es quitar la fricción, no prohibir ni culpar solo a individuos.
  - En screening de CVs sin revisión de los excluidos, la preocupación principal es **sesgo**, no disclosure.
  - El requisito ambiguo es el no cuantificado ("a large number of concurrent users").
  - Para reducir el tiempo de reconciliación de formatos, la palanca es una Skill compartida, no más revisores ni un modelo más rápido.

### K.2 Contradicciones detectadas entre módulos

| # | Tema | Qué dice cada parte | Cómo resolverlo |
| --- | --- | --- | --- |
| 1 | Permisos de las Skills | M1: antes de habilitar una Skill de terceros, revisá su fuente y "los permisos que solicita". M6: "las Skills no solicitan permisos; heredan el acceso de la sesión", aunque en otros párrafos de M6 sigue diciendo "permisos amplios" o "solicita acceso amplio". | Seguí M6 y su quiz (Q2): no hay manifiesto de permisos; evaluá qué podría alcanzar en la sesión y auditá el bundle. |
| 2 | Qué es knowledge base | M1 y M5 la definen como documentos subidos una vez y reutilizados. El checkpoint de M1 clasifica "los contratos de este ciclo, subidos al inicio de cada sesión" como knowledge base ("material de referencia"). | Para el examen, material de referencia que Claude consulta = knowledge base aunque sea del ciclo. En la práctica, los archivos que cambian por sesión se suben a la conversación. |
| 3 | Velocidad de Opus | M1 dice que es más lento; la nota del mismo módulo aclara que hoy la latencia es moderada y que existe un cuarto tier. | El examen usa el marco de 3 tiers. |
| 4 | Dónde se crean Skills custom | M1: "via settings". M5: "under Customize". | Probablemente el mismo lugar con nombres distintos. **\[Verificar\]** |
| 5 | Duración de M1 | Catálogo: 59 min. Pantalla del módulo: 61 min. | Irrelevante para el examen. |

### K.3 Información que el curso no da (y hace falta en la práctica)

- Puntaje de aprobación, duración y pesos por sección del examen. M8 pide confirmarlos en el blueprint y la especificación de Pearson.
- Valores concretos de límites de uso por plan.
- Si el toggle de web search viene activado por defecto.
- Lista de conectores y límites de cada uno.
- Tipos de archivo de salida de Code Execution y controles de egress del sandbox.
- Retención de datos por entry point y alcance de compliance (HIPAA, FedRAMP, ZDR): el curso dice escalarlo al account team de Anthropic.
- Cómo se construye una Skill custom (formato y empaquetado): el curso solo dice que se agregan en Customize o settings.
- Pasos de UI para exportar o resetear Memory, y niveles de permisos para compartir Projects.
- Texto para pedir un resumen de handoff (D.6 propone uno, marcado como externo).

### K.4 Auditoría de aceptación

¿Alcanza este documento para trabajar mañana? Cubre: recordar conceptos (A, B, J) · elegir herramientas (E.1–E.3, D.1) · ejecutar procedimientos (C, D) · resolver problemas (G) · tomar decisiones fundamentadas (E) · aplicar buenas prácticas (F) · verificar resultados (I.3, WF-06). Los vacíos que quedan son datos que cambian por plan o por fecha (K.3) y conviene confirmarlos en el producto.

### K.5 Fuentes

- Claude Certified Associate – Foundations Prep Course, módulos 1 a 8 (archivos `Associate_M1_vF2.html` a `Associate_M8_vF2.html` en tu carpeta *Prep Courses/1 - Claude Certified Associate - Foundations*), contenido a junio de 2026.
- Fuentes que el curso cita para verificar: [Claude Help Center](https://support.claude.com) (Projects, Skills, Memory, Incognito, conectores, Code Execution, límites de uso) y [Anthropic docs](https://platform.claude.com/docs) (prompt engineering, reducción de alucinaciones, citas, comparación de modelos).
- AI Fluency Framework de Anthropic (Description, Discernment, Diligence, Delegation).
