# Cheatsheet profesional: Claude Partner Badge - Claude Code

Nov 10, 2026 · @Sebastian Larrauri

Este cheatsheet convierte los 9 módulos y 57 lecciones del **Claude Partner Badge: Claude Code** en una guía de trabajo para consultores que despliegan, gobiernan y miden Claude Code en un cliente durante una activación de 30 días.

**Índice**

1. [A. Quick Reference](#a-quick-reference): reglas, tablas rápidas, archivos y variables clave
2. [B. Core Knowledge](#b-core-knowledge): producto, modelos, rutas de despliegue, configuración, extensibilidad, seguridad, medición, metodología
3. [C. Practical Workflows](#c-practical-workflows): 14 procedimientos paso a paso
4. [D. Tools & Commands](#d-tools--commands): CLI, slash commands, JSON de configuración, hooks, MCP, OTel, APIs
5. [E. Decision Making](#e-decision-making): tablas para elegir ruta, modelo, scope, extensión y superficie de datos
6. [F. Best Practices](#f-best-practices)
7. [G. Troubleshooting](#g-troubleshooting)
8. [H. Practical Examples](#h-practical-examples): escenarios de cliente del curso
9. [I. Checklists](#i-checklists)
10. [J. Glossary](#j-glossary), notas de auditoría y fuentes

**Leyenda**

| Marca | Significado |
| --- | --- |
| **\[OBL\]** | Obligatorio: sin esto la activación falla o no pasa la revisión de seguridad |
| **\[REC\]** | Recomendado por el curso como práctica profesional |
| **\[OPC\]** | Opcional: según el cliente o el caso |
| **\[Externo\]** | Dato que no viene del curso (documentación oficial o conocimiento general); verificalo |
| **(M3.4)** | Módulo 3, lección 4 del curso |

> Los valores de producto (modelos, precios, claves de configuración, endpoints) son los que enseña el curso a noviembre de 2026. El propio curso pide confirmarlos en code.claude.com/docs y trust.anthropic.com antes de cada despliegue.

## A. Quick Reference

Lo que hay que tener en la cabeza antes de cualquier reunión con el cliente: diez reglas, las tablas que más se consultan y los archivos y variables que resuelven el 80% de los casos.

### A.1 Diez reglas que siempre aplican

1. **Claude Code es el mismo agente en todas las superficies.** CLI, extensión IDE, Agent SDK y web/desktop/mobile comparten modelo, loop y herramientas; cambia el punto de integración y la superficie de acceso (M1.1).
2. **La ruta de despliegue es una puerta de un solo sentido.** Se decide en pre-kickoff (D‑14 a D0), no como change request (M3.1).
3. **Los compromisos cloud y el compliance eligen la ruta**; tu trabajo es hacerlos visibles antes de que el cliente elija por defecto (M3.1).
4. **Una brecha avisada en el contrato es consultoría; descubierta en la semana 3 es un defecto con tu nombre** (M3.2).
5. **Managed settings no se puede sobrescribir.** Todo requisito de seguridad que deba sobrevivir a una reinstalación va ahí (M4.1, M6.1).
6. **CLAUDE.md es contexto, no política.** Para imponer: hooks o managed settings (M4.2, M6.3).
7. **Deny gana siempre.** Orden de evaluación: deny → ask → allow → default (ask). Las reglas se fusionan entre scopes (M4.3).
8. **PreToolUse bloquea, PostToolUse reacciona.** Solo un PreToolUse con exit 2 detiene la herramienta (M5.6).
9. **Sin baseline antes del Día 1 no hay ROI en el Día 30** (M8.3).
10. **Nunca improvises una garantía** de seguridad o residencia: respondé con lo citable y nombrá lo que vas a verificar (M3.5).

### A.2 Modelos (M1.2)

| Modelo | Costo | Contexto | Uso típico |
| --- | --- | --- | --- |
| Claude Haiku 4.5 | Más bajo | 200k | Subagentes, CI/CD, completions, tareas masivas y sensibles a latencia |
| Claude Sonnet 4.6 | Medio | 1M | **Default de producción**: features, tests, docs; donde arrancan los pilotos |
| Claude Opus 4.8 | Más alto | 1M | Refactors autónomos, tareas de horas, revisión arquitectónica |

Antes de cambiar de modelo, subí el **effort**: `xhigh` en Opus 4.8 (recomendado para coding/agentic), hasta `high` en Sonnet 4.6. Verificá precios en anthropic.com/pricing.

### A.3 Rutas de despliegue (M3.1, M3.2)

| Ruta | Billing | Auth | Lo que ganás | Lo que perdés |
| --- | --- | --- | --- | --- |
| Claude for Enterprise (directo) | Seats + uso | Claude.ai SSO | Web bundleado, SSO/SCIM, managed settings, Compliance API, **única ruta con ZDR** | Proveedor nuevo; tráfico a plataforma Anthropic |
| Amazon Bedrock | PAYG en AWS (quema EDP) | IAM / Bedrock API keys | CloudTrail, Cost Explorer, Guardrails, región elegida | Sin web, sin ZDR, **sin WebSearch**, telemetría off, pinning propio |
| Google Vertex AI | GCP (quema CUD) | GCP creds / ADC | Cloud Audit Logs, endpoints global/multi/regional | Igual que Bedrock; Model Garden tarda 24–48 h |
| Microsoft Foundry | Azure (quema MACC) | API key / Entra ID | Azure RBAC, Monitor | **Rutea a infraestructura operada por Anthropic**: no garantiza tenancy |

### A.4 Precedencia de configuración (M4.1)

| Prioridad | Scope | Ubicación | Dueño |
| --- | --- | --- | --- |
| 1 (máxima) | Managed | macOS `/Library/Application Support/ClaudeCode/` · Linux `/etc/claude-code/` · consola admin · MDM | IT / seguridad |
| 2 | Flags CLI | `--model`, `--allowedTools`… (solo la sesión) | Quien invoca |
| 3 | Local | `.claude/settings.local.json` (gitignored) | Desarrollador, en ese repo |
| 4 | Project | `.claude/settings.json` (en git) | Equipo |
| 5 (mínima) | User | `~/.claude/settings.json` | Desarrollador, todos sus proyectos |

Excepción: las listas `allow`/`deny` **se fusionan**; un local puede agregar allows pero nunca quitar un deny de project o managed.

### A.5 Archivos clave

| Archivo | Para qué | Módulo |
| --- | --- | --- |
| `managed-settings.json` | Política org: login, MCP, permisos, hooks, versiones, telemetría | M6.1 |
| `managed-mcp.json` | Despliega servidores MCP fijos a todos | M5.2 |
| `.claude/settings.json` / `.local.json` | Config de equipo / personal | M4.3 |
| `CLAUDE.md`, `CLAUDE.local.md`, `~/.claude/CLAUDE.md` | Memoria de proyecto, personal, usuario | M4.2 |
| `.mcp.json` / `~/.claude.json` | Servidores MCP de proyecto / usuario y local | M5.1 |
| `.claude/commands/*.md` | Slash commands de equipo | M4.4 |
| `.claude/output-styles/*.md` | Estilos de salida custom | M4.5 |
| `skills/<nombre>/SKILL.md` | Skills | M5.4 |
| `agents/*.md` | Subagentes | M5.7 |
| `hooks/hooks.json` | Hooks de un plugin | M5.6 |
| `.claude-plugin/plugin.json` | Manifiesto de plugin | M5.8 |
| `.devcontainer/devcontainer.json` | Contenedor con la feature oficial | M2.4 |

### A.6 Variables de entorno más usadas (M2.3, M3.3, M3.4, M7.4)

| Variable | Categoría | Función |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Auth | API key; si está, **pisa el login por suscripción** |
| `ANTHROPIC_AUTH_TOKEN` | Auth | Bearer token (gateways); tiene prioridad sobre la API key |
| `ANTHROPIC_BASE_URL` | Gateway | Redirige el tráfico a un LLM gateway |
| `CLAUDE_CODE_USE_BEDROCK` / `_USE_VERTEX` | Ruta | `1` para rutear por Bedrock / Vertex |
| `HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` | Red | Proxy corporativo y bypass |
| `NODE_EXTRA_CA_CERTS` | Red | CA corporativa para inspección TLS |
| `CLAUDE_CODE_CLIENT_CERT` / `_KEY` | Red | mTLS |
| `DISABLE_AUTOUPDATER` | Gobierno | Fija versión |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Gobierno | Corta telemetría, changelog, etc. |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | OTel | Interruptor maestro de telemetría |

### A.7 Qué superficie responde qué pregunta (M7.3–M7.6)

| Pregunta del cliente | Superficie | Acceso |
| --- | --- | --- |
| ¿Funciona? (DAU, sesiones, spend) | Admin Console › Analytics | Owners, sin setup |
| ¿Qué se **ejecutó**? | OpenTelemetry | Opt-in, tiempo real |
| ¿Qué se **dijo**? | Compliance API | Solo Primary Owner; hasta 6 años |
| ¿Qué **cambió** en la org? | Audit logs | Owners; CSV, 180 días |
| ¿Cuánto gasta cada equipo? | OTel `claude_code.cost.usage` + `OTEL_RESOURCE_ATTRIBUTES` | Estimación, no factura |

### A.8 Metas del scorecard del Día 30 (M7.2)

| Métrica | Meta | Alerta |
| --- | --- | --- |
| DAU | 60% de la cohorte en la semana 3 | <50% en semana 2; <40% en semana 4 = problema de change management |
| Sesiones por usuario | 2–3 por día | <1,5 por día |
| Retención semana 2 | ≥80% | <80% predice churn en la expansión |
| Costo por desarrollador | Seguimiento semanal | Picos sin aumento de sesiones u output |

## B. Core Knowledge

El curso forma a un consultor de entrega, no a un usuario: cada bloque de conocimiento se usa para tomar una decisión frente al cliente y producir un entregable.

### B.1 Qué es Claude Code y cómo se comporta (M1.1)

- **Agente, no chat.** Lee y escribe archivos, corre bash, edita en todo el codebase, mantiene contexto de sesión y sigue hasta terminar.
- **Loop agéntico:** Observe (grep, abre archivos, lee terminal) → Plan (pasos, archivos, comandos; puede mostrar el plan antes) → Act (cada tool call es una operación real, visible y auditable) → Verify (muestra el resultado; si falla vuelve a Observe). Corre hasta terminar o hasta que lo pausás.
- **Superficies:**

| Superficie | Acceso | Nota |
| --- | --- | --- |
| CLI | Nativo, nivel SO | Referencia para toda decisión de configuración |
| Extensión IDE (VS Code, JetBrains) | Igual que CLI | Es un wrapper del agente local, no una versión reducida |
| Agent SDK | El que otorga el host | En CI tiene el acceso del runner |
| Desktop / Web / Mobile | Acotado | Corre en la nube; llega a filesystem/terminal solo invocando las herramientas del agente |

### B.2 Selección de modelo (M1.2)

- **Regla:** Sonnet por defecto; Opus para razonamiento sostenido y tareas largas autónomas; Haiku cuando dominan volumen, latencia y costo.
- **Model selection es arquitectura; effort es un lever de performance.** Probá effort antes de cambiar de tier.
- **Mezcla típica:** 50 devs en Sonnet para features y tests + Opus para refactors nocturnos. Opus para todos suma \~65% de costo sin ganancia real (escenario M1.2).
- **Escalar effort solo donde rinde:** un test de 20 líneas no mejora; un refactor multi-módulo sí.

### B.3 Plataformas, seats y rutas (M1.3, M3.1)

- **Tres categorías:** Claude-managed (Teams/Enterprise, default para activaciones GSI), cloud-native (Bedrock/Vertex/Foundry), API/Console (un dev o prototipo; nunca para un rollout gobernado).
- **Enterprise no es "más seats": es el tier de controles.** SSO con domain capture, SCIM, RBAC, Compliance API, managed settings. Si seguridad pregunta por audit logs o managed settings, Teams no alcanza.
- **Seats (modelo usage-based):** Chat (sin Code) → Chat + Code (mínimo para Claude Code) → Claude Enterprise (todo incluido: Claude.ai, Code, Cowork; uso a tarifa API más fee por seat). Legacy: Standard (sin Code) y Premium (con Code; solo el Primary Owner los compra). Los planes legacy y transicionales migran en la próxima renovación (M7.1).
- **Cuatro preguntas de discovery, en orden:** 1) ¿dónde están los compromisos cloud (EDP, CUD, MACC)? — preguntale a compras, no solo a IT; 2) ¿cómo quiere comprar compras (contrato nuevo vs marketplace)?; 3) ¿qué exige compliance (ZDR → Enterprise; tenancy propia → Bedrock/Vertex)?; 4) ¿quién gestiona usuarios y presupuestos?
- **Ruta cloud = compromiso, no requisito de seguridad.** Siempre nombrá la brecha de gobierno frente a Enterprise.
- **Intune/MDM** define cómo se distribuye a endpoints, no la arquitectura.

### B.4 Arquitectura de red (M3.3, M3.4)

| Componente | Qué resuelve | Cómo se configura | Dueño |
| --- | --- | --- | --- |
| Proxy corporativo | Sacar tráfico por el perímetro, inspección TLS, egress | `HTTPS_PROXY`, `NO_PROXY`, `NODE_EXTRA_CA_CERTS` (variables del SO, vía MDM) | Red / seguridad |
| LLM gateway | Auth centralizada, chargeback por equipo, budgets, routing de modelos, audit log | `ANTHROPIC_BASE_URL` + token, flags skip-auth | Plataforma |

Se apilan: muchos clientes usan ambos. El gateway "entiende" el tráfico del modelo; el proxy solo pasa paquetes. Recomendá gateway **antes** de que pregunten quién gasta cuánto, ante más de un equipo, necesidad de chargeback o routing multi-cloud.

**Headers de atribución que Claude Code envía solo:** `X-Claude-Code-Session-Id`, `X-Claude-Code-Agent-Id` (subagentes), `X-Claude-Code-Parent-Agent-Id` (atribución anidada).

### B.5 Datos, retención y compliance (M3.5, M6.5, M6.6)

| Palanca | Qué responde | Cómo se obtiene |
| --- | --- | --- |
| No-training | "¿Entrenan con nuestro código?" → No bajo términos comerciales, salvo opt-in explícito (Development Partner Program; no disponible en Bedrock/Vertex) | Por defecto en todos los planes comerciales |
| Custom retention | "¿Cuánto guardan y lo controlamos?" | Consola admin, 1 día a indefinido, por superficie |
| ZDR | "No guarden nada" | Acuerdo separado; habilitado por org por el account team; solo Enterprise directo |
| BAA + ZDR | PHI / HIPAA en Claude Code | Con ambos activos, el BAA se extiende a Claude Code |

**ZDR cubre** la inferencia de Claude Code (prompts y respuestas no se guardan). **No cubre** claude.ai chat, Cowork, metadata admin ni lo que procesen MCP de terceros. **Desactiva** Claude Code on the web, sesiones remotas desde desktop y `/feedback`. Sesiones marcadas por política de uso pueden retenerse hasta 2 años. Con ZDR, analytics muestra uso pero no métricas de contribución. Cada org nueva requiere su propia habilitación.

**Transcripts locales:** Claude Code cachea transcripts en texto plano en el home del usuario (configurable). Es una conversación de gestión de dispositivos, no de nube.

**Retención por defecto (M6.5):** Claude.ai Enterprise y Claude Code: indefinida si el admin no la configura. Cowork: local en el dispositivo. Office Agents: 30 días fijos.

**Encriptación por ruta:** directo AES‑256 (+ZDR opcional); Bedrock AES‑256, KMS opcional; Vertex claves Google, CMEK opcional; Foundry: confirmar el routing con Anthropic.

**Certificaciones** (siempre desde trust.anthropic.com, nunca de memoria): SOC 2 Type 2, ISO 27001:2022, ISO 27017, ISO 27018, ISO 42001, CSA STAR Level 2, UK Cyber Essentials, HIPAA (BAA), GDPR, NIST 800‑171, FedRAMP High (**solo Claude for Government**), resúmenes anuales de pentest.

### B.6 Configuración (M4)

- **Settings:** cuatro scopes más flags (ver A.4). El scope es una pregunta de propiedad: ¿quién lo controla, a quién afecta, puede sobrescribirlo?
- **CLAUDE.md:** jerarquía Managed → User → Project → Local, que **se concatenan** (no se pisan). Los CLAUDE.md de subdirectorios cargan bajo demanda al tocar archivos de esa carpeta. `claudeMdExcludes` excluye archivos ruidosos desde cualquier scope salvo managed. `@path/to/file` importa documentación en vez de copiarla. Meta: menos de 200 líneas por archivo. `/init` crea uno o sugiere mejoras si ya existe.
- **Slash commands:** archivo `.md` con frontmatter (`description`, `allowed-tools`) y `$ARGUMENTS`. `.claude/commands/` (equipo) o `~/.claude/commands/` (personal). Subcarpetas = namespaces (`security/audit.md` → `/security:audit`). Se descubren sin reiniciar.
- **Output styles:** cambian *cómo* comunica Claude, no *qué sabe*. Built-in según el curso: Default, Explanatory (secciones "Insights"), Learning (marcadores `TODO(human)`), Proactive (ejecuta y asume). \[Externo: la doc actual también lista **Concise**.\] Custom en `.claude/output-styles/` con `keep-coding-instructions: true` para conservar las instrucciones de ingeniería (default `false`). Se aplica al inicio de sesión; un cambio rige tras `/clear` o en sesión nueva.

### B.7 Extensibilidad (M5)

| Pieza | Qué es | Cuándo usarla |
| --- | --- | --- |
| MCP server | Estándar abierto que agrega Tools, Resources y Prompts | Conectar ticketing, observabilidad, sistemas internos |
| MCP relay/tunnel | Servidor MCP dentro de la red expuesto por HTTP/SSE vía VPN | Sistema aprobado pero inalcanzable desde la laptop |
| Skill | Carpeta con `SKILL.md` + archivos; carga por relevancia | Estándares, materiales de referencia, brechas de capacidad |
| Hook | Comando shell en un evento del ciclo de vida | Notificar, formatear, loguear, imponer |
| Subagente | Agente especializado con contexto aislado que devuelve resultados | Delegar sin contaminar el contexto principal |
| Plugin | Paquete versionado con commands, agents, skills, hooks y `.mcp.json` | Entregar y distribuir todo lo anterior al CoE |

- **Progressive disclosure de Skills:** Scan (solo name + description) → Load (cuerpo de SKILL.md) → Fetch (archivos enlazados). Una librería de 10–20 skills no degrada cada sesión. También se invocan por nombre (`/skill-name`).
- **Tres patrones de Skill:** 1) refinado por experiencia (estándar existente, salida inconsistente); 2) la calidad depende de materiales (referencia que no llega a Claude); 3) brecha de capacidad (formato que Claude no conoce, p. ej. ISO 20022).
- **Subagentes vs instancias paralelas:** los subagentes devuelven resultados al principal (como workstreams que reportan a un PM); las instancias paralelas entregan trabajo independiente (PRs separados, coordinación manual, TMUX).
- **Lo que el subagente NO ve:** historial del principal, conexiones MCP de la sesión (salvo que se pasen), estado de archivos fuera de la tarea. Diseñá tareas autocontenidas.
- **Fallas de subagente:** no hay reintento automático; el principal recibe un error y sus instrucciones deciden (reintentar, saltear, escalar).

### B.8 Seguridad y gobierno (M6)

- **Defense in depth, 5 capas:** 01 Identidad y entorno (cliente) · 02 Plataforma y runtime — aquí están allowlist MCP y egress (compartida) · 03 Runtime safety (Anthropic) · 04 Model safety (Anthropic) · 05 Observabilidad y auditoría.
- **Modelo de dos baldes:** Anthropic es dueño del piso (Constitutional AI, RLHF, clasificadores, integridad de plataforma: no se desactiva). El cliente configura gating, RBAC, consentimiento de conectores, managed settings, SSO/SCIM, retención, Compliance API.
- **Aislamiento por capas (M2.4):**

| Superficie | Bash sandbox | Sandbox runtime | Contenedor / VM |
| --- | --- | --- | --- |
| Comandos bash | Restringido | Restringido | Restringido |
| File tools (Read/Write) | Acceso total | Restringido | Restringido |
| MCP servers | Acceso total | Acceso total | Restringido |
| Hooks | Acceso total | Acceso total | Restringido |
| Web | Acceso total | Restringido | Restringido |

Nunca digas "está sandboxeado": decí qué capa está activa.

- **Roles (M7.1):** Primary Owner (uno por org; compra/asigna seats, exportaciones, Compliance API) · Owner (SSO/SCIM, audit logs, retención, analytics, managed settings) · Admin (solo invita/remueve miembros y ve analytics; **no** configura SSO ni seats) · User/Member. Los roles son aditivos entre grupos. Los grupos también gobiernan límites de gasto y distribución de plugins.
- **Identidad:** SSO (SAML 2.0/OIDC) + **domain capture** (sin él quedan cuentas personales con mail corporativo) + SCIM (deprovisioning automático) + IP allowlisting + tenant restrictions (bloquean orgs Claude no autorizadas) + timeout de sesión.
- **Roadmap:** controles de rol por conector todavía no existen; hoy se usa plugin enterprise + asignación RBAC/SCIM.

### B.9 Medición (M7)

- **Admin Console** (Settings › Analytics): DAU/WAU, sesiones por usuario, spend de org, utilización de seats; incluye Analytics Chat. Responde "¿funciona?".
- **OTel:** 8 métricas (sesiones, tokens, `cost.usage`, líneas de código, commits, PRs, decisiones de edición, tiempo activo) + eventos por cada tool call, request, cambio de permission mode, conexión MCP y auth. Responde "¿funciona para el negocio?".
- **Privacidad OTel:** prompts no se capturan salvo `OTEL_LOG_USER_PROMPTS=1`; parámetros y comandos bash requieren `OTEL_LOG_TOOL_DETAILS=1`; contenido completo de herramientas requiere `OTEL_LOG_TOOL_CONTENT=1` + `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` (truncado a 60 KB).
- **Costos:** `claude_code.cost.usage` es una **estimación client-side**; la factura real viene de Console, Bedrock o Vertex. Reconciliá trimestralmente. Patrón super-user: 10–15 devs concentran gran parte del costo; la palanca es emparejar modelo y tarea.

### B.10 Metodología de entrega (M8)

- **Ganancia marginal** (misma tarea, más rápido) vs **estructural** (cambia la unidad de trabajo). Solo la estructural sostiene una lectura ante el CIO.
- **Modos:** Modo 1, training de 2 días (señales de adopción, sin ROI). Modo 2, programa de 30–45 días (mide ROI porque la medición se arma antes del Día 1).
- **Tres patrones ganadores:** modernización de código, desarrollo de features nuevas, migración de frameworks/cloud.
- **Cuatro criterios de calificación:** volumen, complejidad, medibilidad (no negociable), predisposición del equipo.
- **Curva de adopción:** semana 1 supervisada (la velocidad baja, es esperable) → semanas 2–3 más autonomía (plan mode, auto-accept en tareas de bajo riesgo) → semanas 3–4 modo agéntico para clases de tareas definidas → Día 30+ patrón institucionalizado.
- **Dos dinámicas propias de IA:** la caída de la semana 1 (es calibración, no intervengas por velocidad) y la meseta (se estabiliza bajo el techo sin un catalizador como Code 201).
- **Champion:** influencia + motivación intrínseca + capacidad de mantener CLAUDE.md. No es el help desk. Se identifica en la fase 2, idealmente se autopropone; nombrarlo antes del Día 15.

&#91;embedded content: Activación de 30 días · 5 fases con gate de salida (M8.7)\]

No se pasa de fase sin cumplir el gate: un baseline que falta en el pre-kickoff ya no se recupera en el Día 30.

## C. Practical Workflows

Diecisiete procedimientos ordenados como ocurren en una activación: pre-kickoff, configuración, extensión, medición, CI y cierre. Cada uno indica cuándo, requisitos, pasos, verificación y errores. El código completo está en la sección D.

### C.1 Llamada pre-kickoff con IT e instalación (M2.1) \[OBL\]

- **Cuándo:** la semana anterior al kickoff (dentro de D‑14 a D0).
- **Requisitos:** contacto de IT y plataforma; tipo de seat y método de auth definidos.
- **Pasos:**
  1. Abrí por **red**: los cambios de firewall tardan días. Pedí acceso a `api.anthropic.com`, `claude.ai`, `platform.claude.com`, `downloads.claude.ai`, `raw.githubusercontent.com`.
  2. Confirmá proxy e inspección TLS (Zscaler, Netskope, CrowdStrike) → C.2.
  3. Definí auth: login por navegador (devs interactivos en Team/Enterprise) o API key (CI, headless). Cohortes mixtas pueden usar ambos.
  4. Definí el camino Windows: nativo (PowerShell/CMD, Git for Windows recomendado; sin él usa PowerShell como shell) o WSL 2 (toolchains Linux o sandboxing; requiere habilitación de IT).
  5. Instalá con el comando del SO (D.1) y autenticá.
- **Verificación:** `claude --version` devuelve versión; `claude doctor` en una máquina representativa lista settings inválidos con archivo y campo; `/status` muestra proxy, gateway, seat y proveedor de auth.
- **Errores:** `curl: (7) Failed to connect to claude.ai port 443` → red bloqueada, escalá a IT con el hostname. `command not found: claude` → PATH sin recargar, abrí otra terminal.
- **Entregable:** checklist para IT dentro del *Installation Configuration Pack*.

### C.2 Red corporativa: proxy, TLS y allowlist (M3.3) \[OBL si hay proxy\]

- **Cuándo:** pre-kickoff, antes de que 40 personas instalen a la vez.
- **Pasos:**
  1. Probá una laptop en hotspot si todo cuelga: aísla el problema al perímetro en 5 minutos.
  2. Definí `HTTPS_PROXY` (o `HTTP_PROXY`) y `NO_PROXY`; credenciales en la URL solo desde un gestor de secretos.
  3. **Desplegá por MDM** (Jamf/Kandji en macOS, política de registro en Windows): son variables del SO, no se pueden poner en los settings de Claude Code.
  4. Ante `self-signed certificate in certificate chain` apuntá `NODE_EXTRA_CA_CERTS` a la CA corporativa. **Nunca** `NODE_TLS_REJECT_UNAUTHORIZED=0`.
  5. Entregá a seguridad la allowlist por escrito con el propósito de cada dominio, el matiz del preflight de WebFetch y la telemetría opcional que se puede desactivar.
- **Límites:** SOCKS no está soportado. NTLM/Kerberos no se hablan directamente: resolver con un LLM gateway.
- **Verificación:** `/status` dentro de Claude Code.
- **Matiz:** `api.anthropic.com` se usa también para el chequeo de seguridad de dominio de WebFetch en todas las rutas. Si lo bloqueás en Bedrock, WebFetch falla aunque el modelo responda (salvo que se desactive el preflight en settings).

### C.3 LLM gateway (M3.4) \[REC con más de un equipo\]

- **Cuándo:** más de un equipo, chargeback, budgets por equipo, routing multi-cloud o auth NTLM/Kerberos.
- **Pasos:**
  1. Definí qué ruta fronta (API, Bedrock, Vertex o varias).
  2. Configurá `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` o las variantes de Bedrock/Vertex con `CLAUDE_CODE_SKIP_*_AUTH=1` (el gateway inyecta las credenciales del proveedor).
  3. Para tokens rotativos por usuario, `apiKeyHelper` en settings con un script que lee del vault.
  4. Mapeá tokens a equipos y usá los headers `X-Claude-Code-*` para chargeback.
- **Criterio de aceptación (go/no-go del piloto):** el gateway reenvía intactos `anthropic-beta` y `anthropic-version`. Si los elimina, Claude Code se degrada y parece un bug del producto.
- **Referencia:** LiteLLM (formato Anthropic Messages y OpenAI). **No instales LiteLLM 1.82.7 ni 1.82.8**: fueron comprometidas con malware robacredenciales. Verificá la versión segura en code.claude.com/docs/en/llm-gateway.

### C.4 Pre-flight de administración (M7.1, M6.1) \[OBL\]

- **Cuándo:** D‑14 a D0, en este orden.
- **Pasos:**
  1. **Roles primero.** Confirmá quién es Primary Owner (agendá su tiempo: es difícil de conseguir) y que el contacto de IT sea **Owner, no Admin**.
  2. **Identidad** (Owner): SSO SAML 2.0/OIDC probado con un grupo chico, domain capture, SCIM si hay más de 20 devs.
  3. **Seats y spend** (Primary Owner para seats): Settings › Organization › Members. En usage-based fijá el **spend limit de org (default $0)** antes de cualquier llamada; opcional límite por usuario.
  4. **managed-settings.json antes de que instalen** (no aplica a sesiones en curso): `forceLoginMethod`, `forceLoginOrgUUID`, allowlist MCP, permisos, piso de versión, telemetría (D.4).
  5. **Verificá auth de un dev:** `claude` → "Claude account with subscription" → SSO → `/status`. Si antes usó cuenta personal, `/logout` primero.
- **Canales de entrega de managed settings:** server-managed (consola admin), MDM/SO (plist macOS, registro Windows vía Jamf/Kandji/Intune/GPO) o file-based (pilotos; no escala).
- **Errores frecuentes:** Admin no puede configurar SSO ni seats; seat Standard o Chat no autentica Claude Code; spend en $0 rechaza todas las llamadas.

### C.5 Identidad y red de acceso (M6.4) \[OBL antes de producción\]

1. SSO a través del IdP (Okta, Entra ID).
2. Domain capture.
3. SCIM desde el IdP. Patrón: piloto de 50–100 usuarios, 2–4 semanas de monitoreo, expansión por departamento, luego toda la org. En paralelo al diseño del piloto.
4. IP allowlisting a rangos corporativos/VPN.
5. &#91;REC\] Tenant restrictions contra shadow AI.
6. Post-launch: timeout de sesión y re-autenticación.

JIT crea cuentas pero no las borra; manual sirve para pilotos de 20–50.

### C.6 Sandbox y permisos (M2.4, M6.2, M6.3) \[OBL\]

1. Clasificá operaciones: **allow** lo no destructivo y frecuente (tests, lecturas); **ask** lo irreversible y la red externa (`git push`, APIs); **deny** lo que nunca debe correr (`rm -rf`, `curl`, `.env`, `~/.ssh`).
2. Escribí `sandbox.filesystem` (`allowWrite`, `denyRead`, `denyWrite`) y `sandbox.network` (`allowedDomains`, `deniedDomains`; deny tiene precedencia) (D.3).
3. Dejá un **deny explícito** para registros públicos aunque el default sea deny: queda en el audit trail y el default puede cambiar entre versiones.
4. Bloqueá con `allowManagedPermissionRulesOnly: true` y `disableAutoMode` en managed settings.
5. Si seguridad pregunta por file tools, MCP o hooks: el Bash sandbox no los cubre. Agregá `permissions.deny` o un contenedor/VM.

- **Verificación:** probá cada deny antes del rollout ("lo imponemos y lo testeamos", no "probablemente no lo hará").

### C.7 Escribir el CLAUDE.md de proyecto (M4.2, M9.1) \[OBL\]

1. Corré `/init` para el borrador.
2. Secciones: `## Build & Test` (comandos exactos), `## Architecture` (2–3 frases + `@docs/...`), `## Code Style` (2–3 reglas verificables), tests inestables conocidos, rutas fuera de límites con su motivo.
3. Agregá "What NOT to do" cuando Claude repite un error (p. ej. un patrón de ORM deprecado).
4. Mové preferencias personales a `~/.claude/CLAUDE.md` y notas locales a `CLAUDE.local.md` (en `.gitignore`).
5. En monorepos, un CLAUDE.md por servicio; `claudeMdExcludes` para el ruido de otros equipos.

- **Verificación:** un dev corre una tarea real antes de cerrar el Día 3; el archivo tiene menos de 200 líneas.
- **Mantenimiento:** revisión semanal por el champion (\~30 min por semana).

### C.8 Slash command de equipo (M4.4) \[OBL: 3–5 en el handoff\]

1. Detectá un prompt que se repite más de dos veces.
2. Creá `.claude/commands/<nombre>.md` con `description`, `allowed-tools` y `$ARGUMENTS` (D.6).
3. Especificá audiencia y formato de salida: tiene que correr "sin pensar" y leerse en menos de 30 segundos.
4. Verificá que aparezca al tipear `/` en una sesión.
5. Agregalo al catálogo: nombre, qué hace, roles que lo usan, parámetros, ejemplo.

### C.9 MCP: conectar, gobernar y alcanzar sistemas internos (M5.1–M5.3)

1. **Inventario pre-kickoff** de los servidores que ya usa el equipo: van directo a la allowlist.
2. **Día 0 \[OBL\]:** cargar `allowedMcpServers` + `allowManagedMcpServersOnly: true` en managed settings y confirmar dominios de egress. Compartí el inventario 48 h antes; la sesión debe durar menos de una hora. Lanzá con lo aprobado y dejá lo pendiente para el CoE.
3. **Instalar:** `claude mcp add ...` y `/mcp` para ver servidores y herramientas activas.
4. **Red restringida:** servidor `stdio` local que usa la red de la laptop. **Sistema inalcanzable:** relay, un servidor MCP dentro de la red expuesto por HTTP/SSE vía VPN.
5. **Auth:** OAuth (hereda permisos del usuario), headers estáticos o `headersHelper` (SSO interno, Kerberos, tokens cortos). Con API keys o service accounts el acceso puede diferir del del usuario: revisalo.
6. **Semanal:** solicitudes nuevas al CoE con respuesta en la misma semana; seguridad revisa los dominios no estándar.

- **Despliegue org-wide:** `managed-mcp.json` (problema de distribución), no relay (problema de alcance).

### C.10 Crear un Skill (M5.4, M5.5) \[REC\]

1. Revisá si ya existe uno en el cliente o en el marketplace.
2. Identificá el patrón (1, 2 o 3) y el disparador.
3. Escribí la **description**: condición de disparo + salida o contexto + materiales distintivos (D.7).
4. Cuerpo: formato, un ejemplo trabajado, campos requeridos, link a archivos de referencia.
5. Atajo: *"Build a Skill for \[task\]. Here are 5 examples."*
6. Probá: ¿cargó? ¿la salida cumple? Si no cargó, corregí la description; si cargó mal, corregí una instrucción.
7. Versionalo en git. Un skill por flujo de trabajo.

### C.11 Configurar un hook (M5.6) \[REC; seguridad en semana 4\]

1. Elegí el evento: PreToolUse para bloquear, PostToolUse para reaccionar, Notification, Stop, SubagentStop.
2. Escribí el comando leyendo el JSON de **stdin** con `jq` (`$TOOL_INPUT` y `$EDITED_FILE` no existen).
3. Definí exit codes: 0 sigue; 1 error no bloqueante; **2 bloquea** (solo en PreToolUse).
4. Configurá por `/hooks` o en `hooks/hooks.json` del plugin.
5. Dispará la condición y confirmá la respuesta.

- **Secuencia:** semana 1 (Días 3–5) notificación + autoformato; semana 4 logging de seguridad y compliance en el plugin. El CoE es dueño y versiona los hooks.

### C.12 Orquestar subagentes (M5.7, M9.1)

1. Spec en `agents/<nombre>.md` con `name`, `description` (disparador) y `tools` (mínimo necesario).
2. Patrón canónico de auditoría: principal escribe → auditor OWASP (Read, Grep, Bash) devuelve informe estructurado → remediador corrige → principal recibe el resultado limpio.
3. Escribí el manejo de fallas en las instrucciones del principal: registrar el error, marcar el archivo para revisión manual y seguir con los demás resultados.
4. Validá el resultado del auditor antes de pasarlo al remediador.
5. Para refactors multi-módulo, paralelizá solo los módulos con tests estables; los inestables van después, en secuencia.

- **Si IT dice que el proxy bloquea subagentes:** preguntá qué bloquea. Se crean dentro de la sesión y no abren conexiones salientes propias. Igual verificá que red y credenciales apliquen como esperás.

### C.13 Empaquetar el plugin y hacer el handoff (M5.8) \[OBL en el Día 30\]

1. Semana 3: acordá con el CoE dónde vivirá (marketplace enterprise o registro compartido).
2. Día 28: aplicá el test de aptitud (E.6).
3. Estructura `<cliente>-activation/` con `.claude-plugin/plugin.json`, `commands/`, `agents/`, `skills/`, `hooks/hooks.json`, `.mcp.json` (D.10).
4. Fijá versiones de los MCP; versión semántica del plugin.
5. `/plugin install ./<cliente>-activation/` y verificá que el skill carga, el hook dispara y el MCP conecta.
6. Marketplace: crear y aprobar → publicar → asignar a grupos SCIM. Los nuevos devs heredan la config el primer día.
7. Documentá contenido, versiones y dueño.

### C.14 Pipeline de OpenTelemetry (M7.4) \[REC; OBL en rutas cloud para medir\]

1. `CLAUDE_CODE_ENABLE_TELEMETRY=1`: sin esto todo lo demás se ignora.
2. Exporters: `OTEL_METRICS_EXPORTER` y `OTEL_LOGS_EXPORTER` (`otlp`, `prometheus` solo métricas, `console`).
3. Endpoint y auth: `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`; gRPC en 4317 por defecto, `http/json` si el collector no soporta gRPC.
4. Atribución: `OTEL_RESOURCE_ATTRIBUTES` con un bloque distinto por equipo vía MDM.
5. Despliegue con el bloque env en managed-settings.json vía MDM (el único camino escalable para 100+ devs; los tokens no quedan con los devs).
6. Verificá con `OTEL_METRIC_EXPORT_INTERVAL=10000`, una sesión y datos en el backend; quitá el override antes de producción.

- **Opt-ins:** detalles de herramientas y prompts solo si la política de seguridad lo pide; documentá la decisión.

### C.15 Habilitar la Compliance API (M7.3) \[OBL si legal o seguridad lo requiere\]

1. Identificá el requisito: eDiscovery, DLP, legal hold o SIEM.
2. Confirmá que esté el **Primary Owner** (un Owner no ve la opción).
3. Organization settings › API → Enable (Compliance API).
4. `+ Create key`: una clave por integración; se muestra una sola vez.
5. Conectá la integración (endpoints en D.11).

- **Checklist pre-launch:** API habilitada, acceso a audit logs (Organization settings › Data and Privacy), retención documentada, proceso de legal hold acordado, DLP/SIEM conectado si aplica.
- **Claude Platform (clientes API):** se habilita desde la consola de la plataforma; ver platform.claude.com/docs/en/manage-claude/compliance-api.

### C.16 Headless y GitHub Actions (M2.5, M9.3)

1. **Básico:** `/install-github-app` en una sesión; después se invoca con `@claude` en issues y PRs.
2. **Custom:** workflow en `.github/workflows/` con trigger, `ANTHROPIC_API_KEY` desde Secrets, comando con `-p`/`--print`, `--output-format json`, `--allowedTools`, y manejo de salida (comentario en el PR, archivo).
3. **Auth:** preferir clave de service account (rotación controlada; no se rompe si un dev se va). Nunca loguear la clave.
4. **Gateway:** `ANTHROPIC_BASE_URL` explícito en el workflow; no se hereda de la config local.
5. **Reproducible:** `--bare` (sin hooks, skills, plugins, MCP, auto memory ni CLAUDE.md).
6. **JSON:** el esquema va en el prompt; validá y reintentá en el pipeline.

- **Verificación:** primera corrida headless exitosa, runner llegando al gateway y no directo a Anthropic.

### C.17 Piloto, baseline y readout del Día 30 (M8, M7.2)

1. Calificá el caso de uso (E.8) y etiquetalo estructural o marginal.
2. Cohorte: los dueños del trabajo (8–10), no los voluntarios.
3. Duración: al menos dos ciclos ticket→merge por dev (25–30 días en migraciones).
4. Criterio de éxito: *"\[Métrica\] \[mejorará/bajará\] \[umbral\] respecto del baseline del Día 1 para \[fecha\]"*.
5. **Baseline sprint** la semana anterior: PR cycle time, horas autorreportadas de la tarea, NPS o satisfacción.
6. Agendá antes del kickoff el CoE touchpoint (30 min, Días 8 y 15) y las office hours (60 min).
7. Semana 4: scorecard Verde (en meta o arriba) / Ámbar (dentro del 15%) / Rojo; una frase por métrica; plan de remediación para lo rojo.
8. Enviá el readout al sponsor 48 h antes. Showcase de 30 min: demo en vivo (10), métricas con titular primero (10), renovación con un próximo paso concreto (10). Sin sponsor, reprogramá.

## D. Tools & Commands

Referencia lista para copiar. Todo lo que no tiene marca sale del curso; lo marcado \[Externo\] completa piezas que el curso describe pero no muestra enteras.

### D.1 Instalación y verificación (M2.1, M2.2)

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell (recomendado)
irm https://claude.ai/install.ps1 | iex

# Windows CMD
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd

# Verificación
claude --version     # "command not found" = PATH sin recargar
claude doctor        # valida config: lista settings inválidos con archivo y campo
```

| IDE | Instalación | Nota |
| --- | --- | --- |
| VS Code | Marketplace "Claude Code" o `vscode:extension/anthropic.claude-code` | La extensión incluye el CLI y agrega un panel |
| Cursor | `cursor:extension/anthropic.claude-code` | Misma funcionalidad que VS Code |
| Otros forks (Kiro, Devin Desktop) | Open VSX o vista de Extensions | Misma extensión |
| JetBrains (IntelliJ, PyCharm…) | 1) CLI con el instalador; 2) plugin del JetBrains Marketplace | Requiere terminal integrada habilitada y reinicio completo del IDE |

Tres capacidades para mostrar el Día 1: diff en el visor nativo (configurable con `/config`), contexto de selección automático, referencias `@app.ts#5-10` (VS Code `Option+K` / `Alt+K`; JetBrains `Cmd+Option+K` / `Alt+Ctrl+K`). Settings de IDE de usuario: `autoConnectIde`, `autoInstallIdeExtension`, `externalEditorContext`, `editorMode` (`normal`/`vim`).

### D.2 Comandos, flags y atajos

| Comando / atajo | Tipo | Qué hace | Cuándo enseñarlo |
| --- | --- | --- | --- |
| `! <cmd>` | Bash mode | Corre el comando; la salida queda en el contexto de Claude | **Día 1, primero** |
| `Shift+Tab` | Atajo | Rota modos: default → auto-accept edits → plan | Día 1 (plan mode para equipos con code review estricto) |
| `Esc` / `Esc Esc` | Atajo | Cancela / menú rewind (Fork, Rewind code, Fork + Rewind) con input vacío | Día 1 |
| `@ruta` | Contexto | Agrega archivo o carpeta | Día 1 |
| `/clear` | Slash | Resetea la conversación (**no** deshace archivos: para eso, git) | Semana 2 |
| `/compact` | Slash | Condensa el contexto | Semana 2 |
| `/context` | Slash | Muestra el uso de la ventana de contexto | Semana 2 |
| `/model` | Slash | Cambia de modelo en la sesión | Cuando haga falta |
| `/config` | Slash | Menú interactivo de settings (diff, output style, etc.) | Día 1 |
| `/status` | Slash | Seat, proveedor de auth, proxy y gateway aplicados | Instalación |
| `/logout` | Slash | Cierra sesión (antes de pasar de cuenta personal a SSO) | Instalación |
| `/init` | Slash | Crea CLAUDE.md o sugiere mejoras | Setup del repo |
| `/mcp` | Slash | Servidores MCP conectados y sus herramientas | Cada sesión con MCP |
| `/hooks` | Slash | Configura hooks | Semana 1 |
| `/install-github-app` | Slash | Instala la GitHub App para `@claude` | Día 14 |
| `/plugin install \| browse \| update` | Slash | Gestión de plugins | Handoff |
| `/feedback` | Slash | Envía feedback (desactivado con ZDR; bundle local en rutas cloud) | — |
| `claude -c` / `--continue` | Flag | Retoma la última conversación | — |
| `claude --resume <session-id>` | Flag | Retoma una sesión específica | — |

**Flags headless (M2.5):**

| Flag | Función |
| --- | --- |
| `-p` / `--print` | No interactivo: toma el prompt, ejecuta y sale |
| `--allowedTools "Bash,Read,Edit"` | Restringe herramientas en esa ejecución |
| `--append-system-prompt "..."` | Instrucción de sistema para la etapa del pipeline |
| `--output-format json` | Salida JSON (el esquema va en el prompt) \[Externo: también `text` y `stream-json`; el texto queda en el campo `result`\] |
| `--bare` | Sin hooks, skills, plugins, MCP, auto memory ni CLAUDE.md: reproducible |
| `--model` | Modelo de la sesión |

```bash
# Revisión de seguridad de un PR en JSON
gh pr diff "$1" | claude -p \
  --append-system-prompt "Review for security vulnerabilities" \
  --output-format json

# Correr tests y arreglar fallas con herramientas acotadas
claude -p "Run test suite, fix any failures" --allowedTools "Bash,Read,Edit"

# Extracción estructurada
claude -p 'List all API endpoints in this codebase. Output a JSON array where each item has "path" (string) and "method" (string).' \
  --output-format json

# Pipes
cat error.log | claude
git log --oneline -20 | claude -p "Summarise these commits for a release note"

# CI reproducible
claude -p --bare 'Your prompt here'
```

> El ejercicio de M2.5 usa `claude -p --stdin`. \[Externo\] `--stdin` no aparece en la referencia oficial; el modo `-p` ya lee stdin: `echo "What does this function do?" | claude -p --output-format text`.

### D.3 Project settings: permisos y sandbox (M2.4, M4.3)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Bash(git status)",
      "Bash(git log *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(~/.ssh/**)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyRead": ["/"],
      "allowRead": ["/project", "~/.claude"],
      "allowWrite": ["/project"]
    },
    "network": {
      "allowedDomains": ["api.anthropic.com", "*.client-internal.com"]
    }
  },
  "companyAnnouncements": [
    "Review our coding guidelines at docs.acme.com/claude"
  ]
}
```

- `$schema` activa autocompletado y validación en VS Code y Cursor.
- **Fuera del archivo compartido:** `model` (va en user), credenciales (nunca en archivos commiteados), `defaultMode` (va en local).
- `permissions.defaultMode`: `default`, `acceptEdits` (auto-aprueba ediciones y pide bash), `plan`, `auto`.
- La sintaxis de reglas admite `Bash(patrón *)`, `Read(ruta/**)`, `WebFetch(domain:host)` (M4.3).

### D.4 managed-settings.json de referencia (M5.2, M6.1, M6.3, M7.4)

Armado con las claves que enseña el curso; el curso pide confirmar los nombres en la documentación antes del primer despliegue.

```json
{
  "forceLoginMethod": "claudeai",
  "forceLoginOrgUUID": "00000000-0000-0000-0000-000000000000",

  "allowManagedMcpServersOnly": true,
  "allowedMcpServers": [
    { "serverUrl": "https://api.github.com/*" },
    { "serverUrl": "https://linear.app/mcp/*" },
    { "serverCommand": ["npx", "-y", "@playwright/mcp@latest"] },
    { "serverUrl": "https://*.client-internal.com/*" }
  ],

  "allowManagedHooksOnly": true,
  "allowManagedPermissionRulesOnly": true,
  "disableAutoMode": true,

  "requiredMinimumVersion": "X.Y.Z",
  "requiredMaximumVersion": "X.Y.Z",

  "permissions": {
    "deny": ["Bash(curl *)", "Read(./.env)", "WebFetch(domain:internal-ledger.apex.com)"]
  },

  "sandbox": {
    "filesystem": {
      "allowWrite": ["~/finco-app"],
      "denyWrite": ["~/Dropbox"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["npm.finco.internal", "*.finco.internal"],
      "deniedDomains": ["registry.npmjs.org"]
    }
  },

  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.example.com:4317",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer your-token",
    "OTEL_RESOURCE_ATTRIBUTES": "department=engineering,team.id=platform,cost_center=eng-123"
  }
}
```

| Clave | Efecto |
| --- | --- |
| `forceLoginMethod` | `"claudeai"` o `"console"`; bloquea login por API key (que saltea SSO y auditoría) |
| `forceLoginOrgUUID` | El login falla si la cuenta no es de esa org (evita cuentas personales con mail corporativo) |
| `allowedMcpServers` | Allowlist; un array vacío bloquea todo MCP |
| `allowManagedMcpServersOnly` | Solo servidores definidos por el admin; convierte la allowlist en obligatoria |
| `deniedMcpServers` | Bloquea por nombre (no cierra la categoría de riesgo) |
| `allowManagedHooksOnly` / `disableAllHooks` | Solo hooks aprobados / ninguno |
| `allowManagedPermissionRulesOnly` | Los usuarios no agregan ni cambian reglas allow/ask/deny |
| `disableAutoMode` | Impide desactivar las aprobaciones |
| `requiredMinimumVersion` / `requiredMaximumVersion` | Claude Code no arranca fuera del rango |
| `claudeMd` | CLAUDE.md de la org inyectado antes que cualquier otro; no se puede excluir |
| `env` | Variables con alta precedencia que el dev no puede sobrescribir |

`managed-mcp.json` (separado) despliega servidores fijos a todos sin acción del usuario.

### D.5 Red y gateway (M3.3, M3.4)

```bash
# Proxy corporativo (desplegar por MDM: son variables del SO)
export HTTPS_PROXY=https://proxy.client.com:8080
export HTTP_PROXY=http://proxy.client.com:8080
export NO_PROXY="localhost,.client.com,169.254.169.254"
# Con basic auth (credenciales desde un gestor de secretos)
export HTTPS_PROXY=http://user:pass@proxy.client.com:8080

# Inspección TLS y mTLS
export NODE_EXTRA_CA_CERTS=/etc/ssl/corp-root-ca.pem
export CLAUDE_CODE_CERT_STORE=system        # bundled,system (default) | bundled | system
export CLAUDE_CODE_CLIENT_CERT=/path/to/client-cert.pem
export CLAUDE_CODE_CLIENT_KEY=/path/to/client-key.pem

# Gateway con formato Anthropic API
export ANTHROPIC_BASE_URL=https://llm-gateway.client.com
export ANTHROPIC_AUTH_TOKEN=team-token-from-gateway

# Bedrock detrás del gateway
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_BEDROCK_BASE_URL=https://llm-gateway.client.com/bedrock
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1

# Vertex detrás del gateway
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_BASE_URL=https://llm-gateway.client.com/vertex
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
# Vertex directo requiere además ANTHROPIC_VERTEX_PROJECT_ID y CLOUD_ML_REGION
```

Otras variables del curso: `DISABLE_TELEMETRY`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `DISABLE_AUTOUPDATER`, `CLAUDE_CODE_MAX_TURNS` (límite de turnos para controlar costo en el piloto \[Externo: verificá el nombre; la referencia CLI documenta el flag `--max-turns`\]). Lista completa: code.claude.com/docs/en/env-vars.

### D.6 Slash command (M4.4)

```markdown
---
description: Review a pull request against the security checklist
allowed-tools: Read, Bash(git *)
---
## PR Review: $ARGUMENTS
You are reviewing PR $ARGUMENTS against Acme Corp's security checklist.
Run `git diff main` to inspect the changed files, then evaluate:
- No credentials, tokens, or API keys in changed files
- No new eval() or dynamic code execution patterns
- No new external network calls without logging
- Dependency changes have corresponding security review notes
Summarise your findings as: approved / needs changes / blocked.
For each finding, cite the specific file and line number.
```

Ruta: `.claude/commands/review-pr.md` → `/review-pr 847`.

### D.7 SKILL.md (M5.4, M5.5)

```markdown
---
name: TypeScript API Documentation Standard
description: Apply the client's TypeScript documentation standard when writing or reviewing function signatures, API endpoints, or service interfaces. Includes JSDoc format, required fields, and example patterns.
---
## Format
All functions and endpoints must use JSDoc with the following
required fields: @param, @returns, @throws, @example.

## Example
[One complete compliant function signature with JSDoc block]

## Required fields
[List of fields and their formats]

Read ./spec-template.yaml for the full endpoint schema.
```

```text
api-docs-skill/
├── SKILL.md
├── spec-template.yaml     # se lee bajo demanda
├── example-spec.yaml      # se lee bajo demanda
└── apply_template.py      # se ejecuta si hace falta
```

### D.8 Hooks (M5.6)

| Evento | Cuándo dispara | Uso |
| --- | --- | --- |
| `PreToolUse` | Antes de cualquier herramienta | Bloquear (exit 2) |
| `PostToolUse` | Después de la herramienta | Logging, formato, side effects |
| `Notification` | Cuando Claude notifica | Slack, sonido, webhook |
| `Stop` | Al terminar la tarea del agente principal | Resumen, limpieza |
| `SubagentStop` | Al terminar un subagente | Coordinación, avisos por subagente |
| Avanzados | `SessionStart`, `PermissionRequest`, `PermissionDenied`, `FileChanged`, `ConfigChange` (20+ en total) | Gobierno fino, drift |

Exit codes: `0` continúa · `1` error no bloqueante (aparece en el contexto) · `2` bloquea la herramienta (solo en PreToolUse).

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | xargs -I {} sh -c 'echo \"[$(date)] Bash: {}\" >> ~/claude-bash-log.txt'"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file; [[ \"$file\" == *.ts ]] && npx prettier --write \"$file\"; }"
          }
        ]
      }
    ]
  }
}
```

El input de la herramienta llega como JSON por stdin. `$TOOL_INPUT` y `$EDITED_FILE` no existen. \[Externo\] `[[ ]]` es sintaxis de bash; si el shell del hook es `sh`, usá `case`.

&#91;Externo\] Hook bloqueante para `/config` sin ticket (patrón del escenario de M5.6):

```bash
#!/usr/bin/env bash
# .claude/hooks/protect-config.sh  (chmod +x)
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */config/*)
    if [ -z "${TICKET_ID:-}" ]; then
      echo "Bloqueado: editar /config requiere TICKET_ID en el entorno" >&2
      exit 2
    fi
    ;;
esac
exit 0
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [ { "type": "command", "command": ".claude/hooks/protect-config.sh" } ]
      }
    ]
  }
}
```

### D.9 MCP (M5.1–M5.3)

```bash
claude mcp add linear                                            # ticketing
claude mcp add --transport stdio playwright -- npx @playwright/mcp@latest
claude mcp add --transport sse internal-api https://mcp.client-internal.com/sse   # relay
# --scope project → .mcp.json · --scope user → ~/.claude.json · default (local) → ~/.claude.json, ligado al proyecto
/mcp                                                             # dentro de la sesión
```

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "sse",
      "url": "https://mcp.client-internal.com/sse"
    }
  }
}
```

Auth del endpoint: OAuth, headers estáticos o `headersHelper`. El curso no muestra la sintaxis de `headers`/`headersHelper` en `.mcp.json`: consultala en la doc de MCP.

### D.10 Subagente y plugin (M5.7, M5.8)

```markdown
---
name: security-auditor
description: Scans for SQL injection, XSS, CSRF, and OWASP Top 10 vulnerabilities in modified code. Returns a structured findings report.
tools: Read, Grep, Bash
---
```

```text
finserv-activation/
├── .claude-plugin/
│   └── plugin.json        # obligatorio
├── commands/code-review.md
├── agents/security-auditor.md
├── skills/coding-standards/SKILL.md
├── hooks/hooks.json
└── .mcp.json
```

```json
{
  "name": "finserv-activation",
  "version": "1.0.0",
  "description": "Claude Code activation plugin for FinServ Corp engineering team"
}
```

```bash
/plugin install ./finserv-activation/     # local
/plugin install @org/plugin-name          # desde el marketplace
/plugin browse
/plugin update @org/plugin-name
```

&#91;Externo\] Fuera de un plugin, los subagentes de proyecto viven en `.claude/agents/` y los de usuario en `~/.claude/agents/`; el curso muestra `agents/` en la raíz del proyecto.

### D.11 Compliance API y Admin API (M7.3, M7.6)

| Endpoint | Uso | Plan |
| --- | --- | --- |
| `GET /v1/organizations/{id}/audit-events` | SIEM (Splunk, Sentinel) | Enterprise y Platform |
| `GET /v1/organizations/{id}/conversations` | DLP/CASB (Nightfall, Purview, Symantec) | Enterprise |
| `GET /v1/organizations/{id}/conversations/{conversation_id}` | eDiscovery (Relativity, Exterro) | Enterprise |
| Admin API `/organizations/{id}/spend-limits` | Topes mensuales por workspace | — |

El curso no da el host base ni el formato del header de auth: tomalos de platform.claude.com/docs/en/api/compliance. Hay más de 28 integraciones de vendors de seguridad.

### D.12 OpenTelemetry (M7.2, M7.4)

```bash
# Debug local
CLAUDE_CODE_ENABLE_TELEMETRY=1
OTEL_METRICS_EXPORTER=console
OTEL_LOGS_EXPORTER=console
OTEL_METRIC_EXPORT_INTERVAL=10000   # 10 s; volver al default (60 s) antes de producción

# Prometheus (scrape por máquina; para 20+ devs pasar a OTLP)
CLAUDE_CODE_ENABLE_TELEMETRY=1
OTEL_METRICS_EXPORTER=prometheus
OTEL_EXPORTER_PROMETHEUS_PORT=9464

# Producción OTLP con atribución (desplegar en managed-settings, no en .env)
CLAUDE_CODE_ENABLE_TELEMETRY=1
OTEL_METRICS_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=grpc      # o http/json
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4317
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer your-token
OTEL_RESOURCE_ATTRIBUTES=department=engineering,team.id=platform,cost_center=eng-123

# Opt-ins de privacidad (off por defecto)
OTEL_LOG_TOOL_DETAILS=1               # parámetros y comandos bash
OTEL_LOG_USER_PROMPTS=1               # texto de prompts
OTEL_LOG_TOOL_CONTENT=1               # contenido completo (requiere la beta siguiente; 60 KB)
CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
```

| Métrica / evento | Para qué |
| --- | --- |
| `session.count`, `active_time.total` | Adopción y profundidad |
| `lines_of_code.count`, `commit.count`, `pull_request.count` | Output (base de ROI) |
| `claude_code.cost.usage` | USD estimado por sesión. Atributos: `model`, `query_source` (human, subtask, tool\_use), `speed`, `effort`, `agent.name`, `skill.name`, `plugin.name`, `mcp_server.name`, `mcp_tool.name` |
| `claude_code.token.usage` | Tokens por tipo: input, output, cacheRead, cacheCreation |
| `claude_code.permission_mode_changed` (evento) | Alerta en SIEM ante cambio a bypass |

### D.13 GitHub Actions: workflow custom \[Externo, armado con los bloques de M2.5 y M9.3\]

```yaml
name: Claude security review
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: read
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Claude Code
        run: |
          curl -fsSL https://claude.ai/install.sh | bash
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
      - name: Review PR diff
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}   # quitala si no hay gateway
          GH_TOKEN: ${{ github.token }}
        run: |
          gh pr diff ${{ github.event.pull_request.number }} \
            | claude -p --bare \
                --append-system-prompt "Review for security vulnerabilities. Output a JSON array where each item has 'file' (string), 'line' (number), 'severity' (string) and 'finding' (string)." \
                --output-format json \
                --allowedTools "Read" > review.json
      - name: Validate output
        run: jq -e '.result' review.json > /dev/null
      - uses: actions/upload-artifact@v4
        with:
          name: claude-review
          path: review.json
```

Verificá la ruta de instalación del binario en el runner y agregá reintentos si el JSON no valida.

### D.14 Dev container (M2.4)

```json
{
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}
  },
  "containerEnv": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

La versión de la feature fija el script de instalación, no la versión de Claude Code: dentro del contenedor se autoactualiza salvo `DISABLE_AUTOUPDATER`. \[Externo\] `containerEnv` es la forma estándar de devcontainer.json de fijar esa variable. Doc: code.claude.com/docs/en/devcontainer.

### D.15 Output style custom (M4.5)

```markdown
---
name: Security Review
description: Formats every finding with severity, file path, line number and recommended fix
keep-coding-instructions: true
---
For every finding, output:
- Severity (Critical / High / Medium / Low)
- File path and line number
- Description of the issue
- Recommended fix
```

Ruta: `.claude/output-styles/security-review.md` (proyecto, usuario o managed). Activación: `/config` (guarda en `settings.local.json`) o `"outputStyle": "Explanatory"` en cualquier settings. \[Externo\] El nombre distingue mayúsculas.

## E. Decision Making

Quince tablas para responder rápido "¿qué uso?". Leelas por la primera columna: la situación del cliente.

### E.1 ¿Qué ruta de despliegue? (M1.3, M3.1)

| Si el cliente… | Recomendá | Y avisá |
| --- | --- | --- |
| No tiene requisito duro de cloud y quiere el camino más rápido | Claude for Enterprise directo | Proveedor nuevo; procesamiento según la infraestructura de Anthropic |
| Necesita ZDR | Enterprise directo (única opción) | Habilitación por org, desactiva Claude Code on the web |
| Tiene EDP de AWS sin quemar o exige región AWS | Bedrock (+ gateway) | Memo de brechas: web, ZDR, WebSearch, pinning, telemetría |
| Tiene CUD de GCP o exige región GCP | Vertex AI | Model Garden 24–48 h: pedilo el Día 1 del pre-kickoff |
| Tiene MACC de Azure y quiere billing y Entra ID | Foundry | **No** satisface "los datos no salen de nuestro tenant" |
| Es un dev o un prototipo | API / Console | Nunca para un rollout gobernado de 200 seats |
| Pide SSO, audit logs, managed settings o Compliance API | Enterprise (no Teams) | Teams no cumple |
| Seguridad todavía no revisó | Recomendación condicional | Nombrá la condición que cambiaría tu decisión |

### E.2 ¿Qué modelo? (M1.2)

| Carga de trabajo | Modelo | Primer lever |
| --- | --- | --- |
| Features, tests, docs del día a día | Sonnet 4.6 | Effort `high` antes de pasar a Opus |
| Refactor autónomo nocturno, tareas de horas, arquitectura | Opus 4.8 | Effort `xhigh` |
| Subagentes, CI, completions, alto volumen | Haiku 4.5 | — |
| Equipo mixto | Escalonado: Sonnet por defecto + Opus para tareas largas + Haiku para volumen | Revisar super-users en la semana 4 |

### E.3 ¿Dónde va este setting? (M4.1, M4.3)

| Requisito | Scope | Archivo |
| --- | --- | --- |
| Debe sobrevivir a una reinstalación y aplicar a todas las máquinas | Managed | managed-settings.json vía MDM o consola |
| Regla para todo el equipo de un repo (allow `docker compose up *`) | Project | `.claude/settings.json` |
| Probar un MCP nuevo antes de recomendarlo | Local | `.claude/settings.local.json` |
| Modelo preferido de un dev | User | `~/.claude/settings.json` |
| Override de una sola corrida | CLI | `--model`, `--allowedTools` |
| Bloqueo cross-repo (`WebFetch(domain:...)`) | Managed | managed-settings.json |

### E.4 ¿Con qué mecanismo resuelvo esto?

| Necesidad | Mecanismo | Por qué no otro |
| --- | --- | --- |
| Hechos que Claude debe saber en cada sesión | CLAUDE.md | Es contexto, no obliga |
| Un procedimiento de varios pasos o un área concreta | Skill o regla por ruta | No infla el CLAUDE.md |
| Un prompt que se repite | Slash command | Corre igual para cualquiera |
| Cómo presenta Claude su trabajo | Output style | No cambia conocimiento |
| Imponer algo en un evento sin excepción | Hook (PreToolUse) | CLAUDE.md puede ignorarse |
| Límite que el dev no pueda quitar | Managed settings | User/project son editables |
| Acceso a un sistema externo | MCP | — |
| Trabajo especializado sin contaminar el contexto | Subagente | — |
| Distribuir todo a otro equipo | Plugin | — |

### E.5 ¿Allow, ask o deny? (M6.2)

| Operación | Clasificación | Razón |
| --- | --- | --- |
| Correr tests, leer archivos | Allow | No destructivo y frecuente |
| `git push` a repo compartido | Ask | Irreversible; firma trazable |
| Llamada a API externa (Jira) | Ask | Sale del entorno local |
| `rm -rf`, `curl *`, leer `.env` o `~/.ssh` | Deny | No tiene lugar en un flujo asistido |
| Todo en ask | Evitar | Fatiga de alertas: se aprueba sin leer |

### E.6 ¿Entra al plugin? (M5.8)

| Componente | Se empaqueta si… |
| --- | --- |
| Skill | Lo usan al menos dos personas y está probado |
| MCP config | Lo aprobó seguridad y la conexión es estable |
| Hook | Funciona, está testeado y sirve a todo el equipo |
| Subagente | Probado en al menos un escenario real |
| Slash command | Patrón frecuente, no un experimento |

La etiqueta "experimental" no reemplaza la revisión de seguridad. Plugin de equipo (iteración propia) y plugin del CoE (MCP aprobados, hooks de seguridad, skills de compliance) tienen dueños y cadencias separados.

### E.7 ¿Qué control de datos pide el cliente? (M6.5)

| El cliente dice… | Control | Tipo |
| --- | --- | --- |
| "¿Cuánto tiempo guardan las conversaciones y lo controlamos?" | Custom retention | Setting en consola |
| "Garantícenme que no entrenan con nuestro código" | No-training | Ya incluido |
| "No guarden inputs ni outputs en ningún lado" | ZDR | Contrato; ciclo de venta |
| "Manejamos PHI" | BAA + ZDR | Contrato; avisar al AE temprano |
| "Que Anthropic no guarde nuestro código" (ambiguo) | Preguntá: ¿acceso del staff o entrenamiento? | Suele ser retención |

### E.8 ¿El caso de uso califica? (M8.1)

| Criterio | Pasa si… | Falla si… |
| --- | --- | --- |
| Volumen | Se repite lo suficiente para generar datos en 30 días | Proyecto único |
| Complejidad | A un senior le lleva semanas | Un junior lo hace en una tarde |
| Medibilidad (no negociable) | Hay baseline antes del Día 1 | No se puede medir antes |
| Predisposición | El equipo cambia su flujo | Lo usan "alrededor" de sus hábitos |

Ejemplos del curso: Java → Spring Boot (califica) vs agregar tests a un repo con 82% de cobertura (marginal).

### E.9 ¿Qué modelo de provisioning? (M6.4)

| Escala | Modelo |
| --- | --- |
| Piloto de 20–50 | Manual |
| Para empezar rápido | JIT (crea, no borra) |
| Departamento u org, deprovisioning automático | **SCIM** (default de producción) |

### E.10 ¿Cómo entrego managed settings? (M6.1)

| Entorno del cliente | Mecanismo |
| --- | --- |
| Sin MDM | Server-managed desde la consola (completo en Enterprise; básico en Teams) |
| Con Jamf, Kandji, Intune o GPO | MDM / políticas del SO |
| Piloto o prueba escalonada | File-based (planeá la migración) |

### E.11 ¿Qué exporter de OTel? (M7.2)

| Situación | Exporter |
| --- | --- |
| Verificar que el pipeline emite | Console |
| Ya usan Prometheus/Grafana, equipo chico | Prometheus (`:9464`) |
| Más de 20–50 devs o control central | OTLP vía managed-settings |

### E.12 ¿Cómo conecto este MCP? (M5.1–M5.3)

| Situación | Patrón |
| --- | --- |
| SaaS alcanzable (GitHub, Linear, Slack) | `claude mcp add` directo |
| La política bloquea llamadas externas desde la laptop pero Jira es alcanzable por la red corporativa | Servidor `stdio` local |
| Sistema aprobado solo accesible desde subredes internas (Confluence detrás de VPN) | Relay HTTP/SSE dentro de la red |
| Que todos lo tengan sin instalar | `managed-mcp.json` |
| Que nadie instale nada fuera de lo aprobado | `allowManagedMcpServersOnly: true` |

### E.13 ¿Subagentes o instancias paralelas? (M5.7)

| Criterio | Subagentes | Instancias paralelas |
| --- | --- | --- |
| Relación | Devuelven resultados al principal | Trabajos independientes |
| Contexto | Aislado, no ve el historial | Completo por instancia |
| Coordinación | Automática | Manual (terminales, TMUX) |
| Caso | Auditoría en paralelo al desarrollo | Dos features que serán PRs distintos |

### E.14 ¿Intervengo o espero? (M8.4, M9.2)

| Señal | Diagnóstico | Acción |
| --- | --- | --- |
| Semana 1, velocidad baja | Calibración | No intervengas por velocidad; ayudá con setup y CLAUDE.md |
| Cada intento explora algo distinto | Itera | Esperá |
| Mismo prompt, misma falla, 3 veces | Loop | Evaluá el alcance y el CLAUDE.md, después intervení |
| Uso estable (45 min/día), PR cycle time plano, mismos patrones | Meseta | Code 201: plan mode y auto-accept en subtareas de bajo riesgo |
| Claude no hace lo que piden (alucinación, contexto) | Problema técnico | Ayudá ya |
| Usa Claude como autocompletado | Problema de diseño del flujo | Repensá la delegación |
| Un dev despega (-40% cycle time) | Champion potencial | Demo de 30 min a pares |

### E.15 ¿Qué output style según la fase? (M4.5)

| Fase | Estilo |
| --- | --- |
| Adopción; el equipo pregunta "por qué" | Explanatory |
| Juniors que deben completar piezas críticas | Learning |
| Equipo que ya confía; empuje de productividad | Default |
| Formato institucional persistente para todo el equipo | Custom con `keep-coding-instructions: true` en `.claude/output-styles/` |

## F. Best Practices

Las prácticas que el curso repite en todos los módulos se reducen a una idea: configurar y medir antes del Día 1, y dejar todo en manos de alguien del cliente antes del Día 30.

### F.1 Seguridad

- &#91;OBL\] Políticas en settings, no en instrucciones: "las instrucciones son guía, los settings son política" (M6.3).
- &#91;OBL\] Configuración activa y testeada, nunca "por defecto no lo hace" (M2.4).
- &#91;OBL\] Deny explícito para secretos (`.env`, `~/.ssh/**`, `~/.aws/credentials`) y para exfiltración (`curl *`, carpetas de sync, registros públicos).
- &#91;OBL\] Cerrar la categoría de riesgo (`allowManagedMcpServersOnly`), no el síntoma (`deniedMcpServers`).
- &#91;OBL\] Nunca desactivar la verificación TLS; confiar la CA corporativa.
- &#91;REC\] Revisar todo hook antes de desplegarlo: corre con los permisos del dev y un hook comprometido es un camino de movimiento lateral.
- &#91;REC\] Allowlist de dominios con propósito por dominio en lugar de wildcards amplios (`*.anthropic.com`).
- &#91;REC\] Una clave de Compliance API por integración; una service account por pipeline.
- &#91;REC\] Verificar que red y credenciales aplican a los subagentes; el aislamiento es de contexto, no de proceso ni de red.
- &#91;REC\] Revisar el *permission creep* en las semanas 3–4, sobre todo `--allowedTools` en CI.

### F.2 Gobierno

- &#91;OBL\] Allowlist MCP el Día 0: segura aunque no esté completa. Lo pendiente va al CoE con respuesta en la misma semana.
- &#91;OBL\] El CLAUDE.md de la org solo contiene política ("¿violarlo genera un problema legal o de compliance?"), con el porqué de cada restricción y sin reglas de estilo.
- &#91;REC\] Redactar el CLAUDE.md de la org con Claude a partir de la política de uso aceptable del cliente y después editarlo.
- &#91;REC\] Asignar plugins por grupos SCIM: el acceso a la herramienta y la configuración gobernada llegan juntos.
- &#91;REC\] Asignar grupos con intención: los roles se acumulan.

### F.3 Configuración y contenido

- &#91;REC\] CLAUDE.md específico y verificable ("2 espacios; npm test antes de commit"), de menos de 200 líneas, podado (si Claude lo hace bien sin la regla, borrala).
- &#91;REC\] Referenciar documentación con `@` en lugar de pegarla; resumen de 3 párrafos y link al log de 60 páginas.
- &#91;REC\] Skills enfocados (uno por flujo), con un ejemplo trabajado, testeados de a un cambio por vez y versionados como código.
- &#91;REC\] Ante una conducta errónea consistente, una regla explícita en SKILL.md; más ejemplos no la corrigen.
- &#91;REC\] Commands de equipo en el repo; atajos personales en `~/.claude/commands/`.
- &#91;REC\] `$schema` en cada settings.json de proyecto.

### F.4 Producción y CI

- &#91;REC\] `--bare` en CI para resultados reproducibles.
- &#91;REC\] Esquema en el prompt + validación + reintentos para salida JSON.
- &#91;REC\] `ANTHROPIC_BASE_URL` explícito en cada workflow detrás de un gateway.
- &#91;REC\] Fijar versiones: `DISABLE_AUTOUPDATER` o `requiredMinimumVersion`/`requiredMaximumVersion`; model IDs fijos en rutas cloud; deployments con versión fija en Foundry.
- &#91;REC\] Fijar versiones de servidores MCP en el plugin y promover actualizaciones de forma deliberada.
- &#91;REC\] En rutas cloud, revisar disponibilidad de prompt caching por región y habilitar MCP tool search en Vertex.

### F.5 Costo y medición

- &#91;OBL\] Spend limit de la org antes de la primera llamada.
- &#91;REC\] Alertas SIEM sobre `cost.usage` por equipo como aviso; spend limit por workspace (Admin API) como tope duro.
- &#91;REC\] Comunicar siempre que el costo de OTel es una estimación; la factura viene del proveedor. Reconciliar trimestralmente.
- &#91;REC\] Revisar a los super-users y emparejar modelo con tarea en el readout de la semana 4, no después de una sorpresa en la factura.
- &#91;REC\] Diseñar el scorecard con lo que será medible (ZDR oculta métricas de contribución; rutas cloud sin telemetría por defecto).

### F.6 Entrega y adopción

- &#91;OBL\] Baseline antes del Día 1; un baseline tomado después ya está contaminado.
- &#91;OBL\] Memo de brechas con la recomendación de ruta, antes de la firma, con la mitigación por delante.
- &#91;REC\] Enseñar en orden: bash mode y piping el Día 1; gestión de contexto en la semana 2; `/model` cuando haga falta.
- &#91;REC\] Proteger el alcance del piloto: lo nuevo va a la fase 2.
- &#91;REC\] Las office hours son el mecanismo de handoff: la primera la lleva el consultor, la segunda la co-facilita el champion, la tercera la lleva el champion.
- &#91;REC\] Agendar todos los touchpoints con link de video antes del kickoff.
- &#91;REC\] Traducir la métrica a lenguaje de negocio acotado al caso ("features en 5,4 días que antes llevaban 8,2"), nunca "34% más productivos".
- &#91;REC\] Ante un CISO: respondé con lo citable, nombrá la única cosa que vas a verificar y mandá los links del Trust Center en la misma reunión.

## G. Troubleshooting

La mayoría de las fallas de una activación no son del producto: son red, roles, seats, spend limit o configuración que no llegó al entorno donde corre Claude Code.

### G.1 Instalación, red y auth

| Problema | Causa probable | Solución | Prevención |
| --- | --- | --- | --- |
| `curl: (7) Failed to connect to claude.ai port 443` | Firewall bloquea el instalador | Escalar a IT con el hostname | Allowlist en la llamada pre-kickoff |
| `command not found: claude` | PATH sin recargar | Abrir otra terminal o hacer `source` del perfil | Incluirlo en la guía de instalación |
| Todas las terminales cuelgan en el primer prompt | Proxy no configurado | `HTTPS_PROXY`/`NO_PROXY` vía MDM | Confirmar proxy e inspección TLS antes del kickoff |
| `self-signed certificate in certificate chain` | Inspección TLS re-firma el tráfico | `NODE_EXTRA_CA_CERTS` a la CA corporativa | Distribuir la CA con el bloque de MDM |
| El proxy del cliente es SOCKS | No soportado | Proxy HTTP/HTTPS o gateway | Preguntar el tipo de proxy |
| El proxy exige NTLM/Kerberos | Claude Code no los habla | LLM gateway con auth enterprise | Detectarlo en discovery |
| WebFetch falla en Bedrock aunque el modelo responde | `api.anthropic.com` bloqueado (preflight de dominio) | Permitir el dominio o desactivar el preflight | Explicarlo en la allowlist |
| Dev no puede autenticar Claude Code | Seat Standard (legacy) o Chat | Asignar Premium, Chat + Code o Claude Enterprise | Verificar el tier comprado antes del kickoff |
| Todas las llamadas fallan el día del kickoff | Spend limit de org en $0 | Fijar el límite | Paso 2 del pre-flight |
| El contacto de IT no puede configurar SSO ni seats | Tiene rol Admin | Elevar a Owner; seats con Primary Owner | Confirmar roles en la primera llamada |
| Dev entra con su cuenta personal | Domain capture apagado o sesión previa | `/logout`, domain capture, `forceLoginOrgUUID` | Day 0 controls |
| La API key salta SSO | `ANTHROPIC_API_KEY` presente pisa la suscripción | Quitar la variable; `forceLoginMethod: "claudeai"` | Managed settings |
| Funciones degradadas detrás del gateway, "parece un bug" | El gateway elimina `anthropic-beta`/`anthropic-version` | Reenviar los headers intactos | Criterio go/no-go del piloto |
| Settings inválidos o política que no aplica | Error de campo o archivo | `claude doctor` muestra archivo y campo | Correrlo en una máquina representativa |

### G.2 Rutas cloud

| Problema | Causa | Solución | Prevención |
| --- | --- | --- | --- |
| "WebSearch no funciona para nadie" (Bedrock) | No disponible en Bedrock | Responder con la línea del memo y la alternativa MCP aprobada | Memo de brechas en el contrato |
| "¿Dónde están los datos de uso?" | Telemetría a Anthropic off en rutas cloud | OTel + Cost Explorer/Billing o gateway | Instrumentar antes del Día 1 |
| Un modelo "no existe" o hay comportamiento inesperado | Alias sin fijar o modelo no habilitado en la cuenta o región | Fijar model IDs en settings compartidos | Pinning antes de instalar |
| Tareas de fondo caras | Usan el modelo principal en vez de uno clase Haiku | Configurar los modelos | Revisar en el pinning |
| Cache hits en cero | Prompt caching no disponible en la región | Verificar la región | Revisarlo en pre-kickoff |
| Vertex no habilitado en el kickoff | Model Garden demora 24–48 h | Esperar o escalar | Pedirlo el Día 1 del pre-kickoff |

### G.3 Configuración y extensiones

| Problema | Causa | Solución | Prevención |
| --- | --- | --- | --- |
| Claude repite un patrón deprecado | Falta la regla | Entrada "What NOT to do" en CLAUDE.md | Revisión semanal |
| Las sugerencias se sienten "off" sin métricas rotas | Context drift del CLAUDE.md | Revisarlo con el champion | Responsabilidad nombrada del champion |
| Ruido de CLAUDE.md de otros equipos | Carga de subdirectorios | `claudeMdExcludes` en local | Estructura de monorepo |
| Un dev ignora una regla del CLAUDE.md | Es contexto, no obliga | Hook o managed settings | Usar el mecanismo correcto (E.4) |
| El output style no cambia | Se aplica al inicio de sesión | `/clear` o sesión nueva | — |
| El Skill nunca carga | Description vaga | Agregar disparador, salida y marcador distintivo | Probar la carga tras cada cambio |
| El Skill carga en todo | Description demasiado amplia | Acotar | — |
| El Skill hace casi todo bien salvo una cosa | Falta una restricción | Regla explícita en SKILL.md | — |
| El hook no bloquea | Es PostToolUse o sale con 1 | PreToolUse con exit 2 | Tests del hook |
| El hook no ve los datos | Usa `$TOOL_INPUT`/`$EDITED_FILE` | Leer stdin con `jq` | Plantillas de D.8 |
| Slack avisa decenas de veces por auditoría | PostToolUse sobre Bash | SubagentStop | — |
| El MCP no aparece | Scope distinto o no permitido por la allowlist | `/mcp`, revisar scope y allowlist | — |
| El componente del plugin no se activa | Auth del MCP, permisos del hook, conflictos | Verificar cada componente tras instalar | Paso 5 de C.13 |
| La pipeline de subagentes se detiene | Falla sin manejo | Manejo de errores en el principal | Tareas atómicas |
| El remediador recibe basura | Resultado fallido sin validar | Validar antes de pasarlo | — |

### G.4 CI/CD

| Problema | Causa | Solución | Prevención |
| --- | --- | --- | --- |
| Action con timeout o 403, local funciona | Falta `ANTHROPIC_BASE_URL` en el workflow | Agregarlo como secret y referenciarlo en el step | Checklist del Día 14 |
| La Action falla con la clave correcta y la URL bien | Política de red del runner | Revisar egress del runner con IT | Después de descartar lo anterior |
| El dashboard no puede parsear la salida | `--output-format json` sin esquema | Esquema en el prompt + validación | Testear en una corrida controlada |
| Salida variable entre corridas | Contexto insuficiente o formato sin restringir | Más contexto, formato explícito, `--bare` | — |
| Comportamiento distinto según la máquina | Hooks, skills, MCP o CLAUDE.md locales | `--bare` | — |

### G.5 Medición

| Problema | Causa | Solución | Prevención |
| --- | --- | --- | --- |
| OTel no emite nada | Falta `CLAUDE_CODE_ENABLE_TELEMETRY=1` | Definirla antes que las demás | Paso 1 de C.14 |
| No hay eventos de herramientas | Falta `OTEL_LOGS_EXPORTER` | Definirlo | — |
| Eventos sin el comando bash | Falta `OTEL_LOG_TOOL_DETAILS=1` | Activarlo si la política lo permite | Documentar los opt-ins |
| El collector rechaza gRPC | No soporta gRPC | `OTEL_EXPORTER_OTLP_PROTOCOL=http/json` | — |
| SIEM 3% por debajo de la factura | El costo de OTel es una estimación | Explicar; la factura manda | Disclosure en cada briefing |
| Faltan eventos anteriores al pipeline | OTel no hace backfill | CSV de audit logs o Compliance API | Encender OTel el Día 0 |
| Se necesitan eventos de más de 180 días | Ventana de audit logs | Compliance API | Exportar o rutear por SIEM |
| Un Owner no ve la Compliance API | Solo Primary Owner | Sumar al Primary Owner | Confirmarlo antes de la sesión |
| El CoE no tiene before/after | No se tomó baseline | Progreso absoluto contra metas; recomendar baseline en la próxima ola | Baseline sprint |

### G.6 Adopción (M8.6, M9.4)

| Síntoma | Falla | Prevención |
| --- | --- | --- |
| Sin número defendible en el Día 30 | No hay baseline | Baseline sprint la semana anterior |
| La adopción cae 30–60 días después | No hay champion | Nombrarlo antes del Día 15 |
| Métricas planas con mucho uso | Caso de uso marginal | Calificación estructural |
| "Es lento", uso bajo tras la semana 1 | Estancamiento en modo supervisado | CoE semanal + coaching de flujo |
| Claude vuelve a respuestas genéricas | CLAUDE.md sin mantener | Revisión semanal del champion |
| El CIO no se involucra, la conversación gira al costo | Readout sin resultado de negocio | Alinear la narrativa con el sponsor en la semana 1 |

## H. Practical Examples

Los escenarios del curso resueltos: la situación, la jugada correcta y la trampa que hay que evitar. Sirven como ensayo antes de cada reunión.

### H.1 Arquitectura y despliegue

| Escenario | Jugada correcta | Trampa |
| --- | --- | --- |
| **Financiera AWS, 200 devs, datos en regiones AWS aprobadas, Intune** (M1.3) | Bedrock + LLM gateway, con la brecha frente a Enterprise explícita | Enterprise directo: es SaaS y el cliente no controla la región. Intune no decide la ruta |
| **Meridian Capital, 800 devs** (M3.1) | 1) Fijar primero compromisos cloud y vía de compra. 2) EDP de 3 años sin quemar → Bedrock condicionado a la revisión de seguridad. 3) CISO: "¿ZDR en Bedrock?" → "No; la retención la rige AWS". 4) CIO: "¿qué perdemos?" → nombrar las brechas y ofrecer un memo de una página | Decir "funcionalmente nada" o "ZDR aplica en todas las rutas" |
| **Northgate Logistics firmó Bedrock** (M3.2) | Mantener todas las líneas del memo y presentarlas como mitigaciones; ante "WebSearch no anda", responder con la línea del memo y la alternativa MCP; ante "no hay datos de uso", explicar el default y proponer OTel o gateway | Recortar el memo, abrir un ticket de soporte, mandar a la gente a claude.ai personal |
| **Halvern Bank, 40 terminales colgadas** (M3.3) | Llamar a red (¿proxy? ¿inspección TLS?) → `HTTPS_PROXY`/`NO_PROXY` por MDM → `NODE_EXTRA_CA_CERTS` → allowlist por escrito con propósito por dominio | Reinstalar todo, usar SOCKS, `NODE_TLS_REJECT_UNAUTHORIZED=0`, wildcards |
| **Corvane Health, CISO en vivo** (M3.5) | Entrenamiento: "no bajo términos comerciales, salvo opt-in". Retención: server-side según acuerdo + transcripts locales. ZDR y web: "chocan, elijan". Foundry: "no, rutea a infraestructura de Anthropic". Evidencia: links del Trust Center hoy mismo | "Está anonimizado", "nada se guarda", "todo queda en su tenant" |

### H.2 Seguridad y administración

| Escenario | Jugada correcta |
| --- | --- |
| **FinCo**, 1.800 devs, AWS us-east-1/us-west-2, Okta, Jamf (M6) | MDM (Jamf) para managed settings; `forceLoginMethod: "claudeai"` + `forceLoginOrgUUID`; allowlist MCP estrecha; SSO Okta + domain capture + SCIM + IP allowlisting antes de producción; ruta Bedrock por la regla de regiones |
| Devs conectaron un GitHub MCP personal (M6.1) | `allowManagedMcpServersOnly: true` (cierra la categoría) |
| Tests, push a GitLab y API de Jira (M6.2) | Allow / Ask / Ask |
| Proteger `~/Dropbox` (M6.3) | Deny de directorio en managed-settings, no en CLAUDE.md |
| Registro npm interno sí, público no (M6.3) | `allowedDomains: npm.finco.internal` + `deniedDomains: registry.npmjs.org` |
| Priya tiene rol Admin; hay que configurar SSO y 30 seats en 14 días (M7.1) | Ambas tareas bloqueadas: elevar el rol ya. Kickoff con todas las llamadas fallando → spend limit en $0. MCP no autorizados → allowlist en managed-settings |
| Legal pide 90 días de conversaciones de un empleado (M7.3) | Compliance API por user ID |
| Alerta en tiempo real por comando bash (M7.3) | OTel con `OTEL_LOG_TOOL_DETAILS=1` al SIEM |
| Retener 3 años a un empleado (M7.3) | Legal hold por Compliance API (no subir la retención de toda la org) |
| Detectar PII en conversaciones (M7.3) | DLP conectado a la Compliance API |
| 18 meses de conversaciones para una auditoría (M7.5) | Compliance API con filtro de usuario y fecha |
| Alerta en 60 s al pasar a bypass mode (M7.5) | Regla SIEM sobre `claude_code.permission_mode_changed` |
| 500 devs: bash en Splunk, costo por departamento, sin overrides (M7.4) | `OTEL_LOGS_EXPORTER=otlp` + `OTEL_LOG_TOOL_DETAILS=1`; `OTEL_RESOURCE_ATTRIBUTES` por MDM; bloque env en managed-settings; prompts no capturados por defecto |
| CTO: gasto mensual por modelo / finanzas: chargeback a 8 equipos / SIEM 3% bajo (M7.6) | Admin dashboard / `OTEL_RESOURCE_ATTRIBUTES` + query sobre `cost.usage` / "es una estimación; la factura manda" |

### H.3 Configuración y extensibilidad

| Escenario | Jugada correcta |
| --- | --- |
| Meridian Bank: bloquear curl en todas las máquinas / modelo preferido de un dev / allow `docker run` para el equipo (M4.1) | Managed / User / Project |
| Whitmore: log de 60 páginas / patrón ORM deprecado / CLAUDE.md largo con preferencias personales (M4.2) | Resumen + `@docs/architecture.md` / "What NOT to do" / mover a `~/.claude/CLAUDE.md` |
| Apex: bloquear `WebFetch(domain:internal-ledger.apex.com)` en todas las máquinas / probar un MCP / allow `docker compose up *` (M4.3) | Managed / settings.local.json / settings.json |
| Vantage: comando de standup / "Explain this function" / formato personal de notas (M4.4) | `.claude/commands/` / `$ARGUMENTS` + `allowed-tools: Read` + audiencia / `~/.claude/commands/` |
| Hartfield: Día 1 con preguntas "por qué" / Día 3 productividad / formato documental persistente (M4.5) | Explanatory / Default / custom style con `keep-coding-instructions: true` |
| Política bloquea llamadas externas; Jira interno (M5.1) | MCP `stdio` local por la red corporativa |
| Confluence solo dentro de la red (M5.3) | Relay HTTP/SSE; el túnel lleva solo tráfico MCP, no es una VPN |
| Playwright pendiente de evaluación el Día 0 (M5.2) | Lanzar con lo aprobado; Playwright al CoE |
| Figma MCP para el viernes; CoE el jueves (M5.2) | Agenda del jueves e instalación si se aprueba |
| Catálogo de servicios pegado a mano por 3 devs / severidad P2 vs P4 / ISO 20022 que falla el esquema (M5.4) | Patrón 2 / Patrón 1 / Patrón 3 |
| "Lessons learned" en incidentes menores (M5.5) | Regla explícita: solo para P1/P2 |
| Bloquear edición de `/config` sin ticket (M5.6) | PreToolUse sobre Edit con exit 2 |
| Paquete del Día 28 (M5.8) | Auditor de seguridad + skill de API docs (8/10) + hook de logging + Jira MCP; ISO 20022 (2/10) queda en una rama de desarrollo |

### H.4 Metodología

| Escenario | Jugada correcta |
| --- | --- |
| **Arvana** (60 devs) (M8.1) | Migración Java → Spring Boot; baseline de PR cycle time; cohorte de 8–10 dueños del backlog |
| **Kellner** (45 devs, C++ → Rust) (M8.2) | Los 8 del backlog; PR cycle time con baseline del Día 1; documentación a la fase 2 |
| **Voxfield** (PR 8,2 → 5,4 días, satisfacción 6,2 → 7,8, LOC +55%) (M8.3) | Titular: PR cycle time -34%. Traducción: "features en 5,4 días que antes llevaban 8,2, \~35% de aceleración del roadmap para este caso". Expansión: el mismo caso a 20 devs + un caso nuevo con su baseline |
| **Helios** Día 16 (cycle time plano, 45 min/día) (M8.4) | Meseta → Code 201 (plan mode + auto-accept en subtareas) → demo de Priya a sus pares |
| **Día 28**: DAU 48%, 1,6 sesiones/día, retención 84%, $3,10/dev/día (M7.2) | Ámbar en DAU y sesiones, Verde en retención y costo, con plan de empuje. Sin baseline: progreso absoluto + recomendación. ROI: menos de $2 por sesión asistida frente al costo horario de un dev |
| **Riesgos del Día 28** en un piloto de 12 (M8.6) | Sin baseline, sin champion, sin commands. No son riesgos: 4 devs aún supervisados, PR -20%, 3 super-users |

### H.5 Capstone: la activación de punta a punta (M9)

| Momento | Situación | Jugada correcta |
| --- | --- | --- |
| Día 3 | Refactor de auth, API y billing (tests inestables) | Auth y API en paralelo con subagentes; billing después, en secuencia, tras revisar los tests |
| Día 8 | 45 min, misma falla tres veces en test generation | Está en loop: intervenir evaluando alcance y CLAUDE.md |
| Día 14 | La Action falla a los 30 s; la key está; local anda | Revisar `ANTHROPIC_BASE_URL` en el workflow antes que la red |
| Semana 4 | Sugerencias "off", métricas y CI limpios | Context drift: revisar el CLAUDE.md con el champion |

## I. Checklists

Listas para tildar en cada engagement; cada una cierra con su criterio de salida.

### I.1 Pre-kickoff (D‑14 a D0)

- [ ] Ruta de despliegue decidida con las 4 preguntas y documentada en el Deployment Decision Doc
- [ ] Memo de brechas entregado antes de la firma
- [ ] Tipo de seat confirmado (incluye Claude Code) y plan (usage-based o legacy)
- [ ] Primary Owner identificado y agendado; IT con rol Owner
- [ ] Cuestionario de seguridad respondido; links del Trust Center enviados
- [ ] Dominios en allowlist (`api.anthropic.com`, `claude.ai`, `platform.claude.com`, `downloads.claude.ai`, `raw.githubusercontent.com`)
- [ ] Proxy e inspección TLS confirmados; variables y CA listas para MDM
- [ ] Método de auth definido por cohorte; claves de CI en un gestor de secretos
- [ ] Camino Windows definido (nativo o WSL)
- [ ] Ruta cloud: modelos habilitados en las regiones, Model Garden pedido (Vertex), IDs y deployments fijados
- [ ] Inventario de MCP, Skills y plugins que ya usa el equipo
- [ ] Caso de uso calificado como estructural; cohorte confirmada
- [ ] Baseline capturado (PR cycle time, horas, NPS)
- [ ] CLAUDE.md de proyecto en borrador
- [ ] CoE touchpoints (Días 8 y 15) y office hours agendados con link

* **Salida:** baseline capturado, CLAUDE.md en borrador, cohorte confirmada, fecha de kickoff.

### I.2 Día 0: controles de organización

- [ ] SSO (SAML/OIDC) probado con un grupo piloto
- [ ] Domain capture activo
- [ ] SCIM desde el IdP (más de 20 devs)
- [ ] IP allowlisting y, si hay riesgo de shadow AI, tenant restrictions
- [ ] Seats asignados; spend limit de org distinto de $0; límites por usuario si hace falta
- [ ] Retención configurada (no dejar indefinida por accidente)
- [ ] managed-settings.json desplegado antes de instalar: `forceLoginMethod`, `forceLoginOrgUUID`, `allowedMcpServers`, `allowManagedMcpServersOnly`, permisos, hooks, versiones, telemetría
- [ ] ZDR o BAA solicitados al account team si aplica
- [ ] Compliance API habilitada y claves creadas si legal o seguridad lo requieren
- [ ] Acceso a audit logs confirmado

### I.3 Instalación de un desarrollador

- [ ] `claude --version` responde
- [ ] `claude doctor` sin errores
- [ ] Login "Claude account with subscription" por SSO (`/logout` antes si hubo cuenta personal)
- [ ] `/status` muestra seat, auth, proxy y gateway correctos
- [ ] Extensión de VS Code/Cursor o CLI + plugin de JetBrains, con el IDE reiniciado
- [ ] Demo de diff, contexto de selección y `@archivo#líneas`

### I.4 Repo listo para el piloto (Día 3)

- [ ] Scope activo verificado (managed no pisa lo que vas a configurar)
- [ ] CLAUDE.md con build y test, arquitectura, estilo verificable, tests inestables y rutas fuera de límites; menos de 200 líneas
- [ ] `.claude/settings.json` con `$schema`, allow, ask y deny
- [ ] `.claude/settings.local.json` y `CLAUDE.local.md` en `.gitignore`
- [ ] Output style elegido para la fase
- [ ] Al menos un dev corrió una tarea real

### I.5 Seguridad: "¿qué puede tocar Claude Code?"

- [ ] Capa de aislamiento identificada (Bash sandbox, sandbox runtime o contenedor/VM)
- [ ] `sandbox.filesystem` y `sandbox.network` con allow y deny explícitos
- [ ] Deny de secretos y de exfiltración probados
- [ ] `allowManagedPermissionRulesOnly` y `disableAutoMode` si el entorno es regulado
- [ ] Hooks revisados y en manos del CoE
- [ ] Auth de cada MCP revisada (OAuth vs credenciales estáticas)

### I.6 MCP en el Día 0

- [ ] Inventario compartido con seguridad 48 h antes
- [ ] Allowlist cargada con `allowManagedMcpServersOnly: true`
- [ ] Dominios de egress confirmados
- [ ] Pendientes registrados para el CoE
- [ ] `/mcp` muestra los servidores esperados en una máquina de prueba

### I.7 CI/CD (Día 14)

- [ ] Workflow en `.github/workflows/`
- [ ] `ANTHROPIC_API_KEY` en Secrets; clave de service account; nunca en logs
- [ ] `ANTHROPIC_BASE_URL` explícito si hay gateway
- [ ] `-p` + `--allowedTools` mínimo + `--output-format json` + esquema en el prompt
- [ ] `--bare` para reproducibilidad
- [ ] Validación y reintentos de la salida
- [ ] Primera corrida exitosa; el runner llega al gateway
- [ ] Documentación del pipeline entregada al equipo

### I.8 OpenTelemetry

- [ ] `CLAUDE_CODE_ENABLE_TELEMETRY=1`
- [ ] Exporters de métricas y logs elegidos
- [ ] Endpoint, protocolo y headers definidos; token fuera de `.env`
- [ ] `OTEL_RESOURCE_ATTRIBUTES` por equipo vía MDM
- [ ] Opt-ins de privacidad decididos y documentados
- [ ] Verificado con intervalo de 10 s y luego revertido
- [ ] Dashboard: sesiones por dev, devs activos, tokens por modelo, costo por equipo
- [ ] Alerta de gasto por equipo y spend limit por workspace

### I.9 Compliance pre-launch

- [ ] Compliance API habilitada por el Primary Owner y clave creada por integración
- [ ] Audit logs accesibles en Organization settings › Data and Privacy
- [ ] Política de retención documentada y configurada
- [ ] Proceso de legal hold acordado con legal
- [ ] DLP o SIEM conectado si la política lo exige

### I.10 Plugin (Día 28–30)

- [ ] Marketplace o registro definido con el CoE (semana 3)
- [ ] Componentes aprobados con el test de aptitud
- [ ] `plugin.json` con name, version y description
- [ ] Versiones de MCP fijadas
- [ ] Instalado y verificado: skill carga, hook dispara, MCP conecta
- [ ] Publicado y asignado a grupos SCIM
- [ ] Documento de handoff: contenido, versiones y dueño

### I.11 Readout del Día 30

- [ ] Métricas contra los criterios de éxito acordados
- [ ] Titular con before/after y traducción a negocio
- [ ] Métricas de soporte de las otras tres categorías
- [ ] Scorecard Verde, Ámbar o Rojo con una frase por métrica y plan para lo rojo
- [ ] Readout enviado al sponsor 48 h antes
- [ ] Demo con 2–3 devs en etapa 3–4 de la curva
- [ ] Sponsor confirmado en la sala
- [ ] Propuesta de fase 2 y meta del Día 60

### I.12 Handoff al champion y cierre limpio

- [ ] Champion actualizó el CLAUDE.md al menos una vez sin que se lo pidan
- [ ] Responde preguntas básicas de troubleshooting
- [ ] Sabe leer las cuatro métricas y dónde están
- [ ] Camino de escalamiento nombrado
- [ ] Office hours a cargo del champion
- [ ] Readout revisado con el champion antes de la sesión con el sponsor
- [ ] Delivery Plan Pack completo (calificación, diseño del piloto, scorecard de ROI, plan del champion)
- [ ] CLAUDE.md enterprise + al menos uno de repo + catálogo de 3–5 commands documentados
- [ ] Fecha del check-in a 30 días post-engagement en la documentación

## J. Glossary

Términos del curso en orden alfabético, con el módulo donde se definen.

| Término | Definición |
| --- | --- |
| Activación de 30 días | Programa estructurado: pre-kickoff, onboarding, piloto activo, preparación del showcase y readout (M8.7) |
| Agentic loop | Observe → Plan → Act → Verify, hasta terminar o pausar (M1.1) |
| `apiKeyHelper` | Setting que ejecuta un script para obtener tokens rotativos de un vault (M3.4) |
| BAA | Business Associate Agreement (HIPAA); para Claude Code requiere ZDR activo (M6.5) |
| Bare mode (`--bare`) | Ejecución sin hooks, skills, plugins, MCP, auto memory ni CLAUDE.md (M2.5) |
| Baseline | Medición previa al Día 1 contra la que se prueba el ROI (M8.3) |
| Bash mode | Prefijo `!` que corre un comando y deja su salida en el contexto (M2.3) |
| Champion | Persona del cliente que mantiene CLAUDE.md, lleva office hours y onboardea (M8.5) |
| Chargeback | Imputación de costos por equipo (gateway o `OTEL_RESOURCE_ATTRIBUTES`) (M3.4, M7.6) |
| `claudeMdExcludes` | Setting para excluir CLAUDE.md ruidosos; no aplica a los managed (M4.2) |
| CMEK / KMS | Claves de cifrado gestionadas por el cliente en GCP / AWS (M3.5) |
| Code 101 / Code 201 | Sesiones de enablement: básica (semana 1) y profundización en delegación y observabilidad (semanas 2–3) (M8.4) |
| CoE | Center of Excellence: el equipo del cliente que gobierna conectores, plugins y métricas (M5.2) |
| CoE touchpoint | Reunión semanal de 30 min (Días 8 y 15): uso, devs trabados, acción de coaching, CLAUDE.md (M8.7) |
| Compliance API | Acceso programático al contenido de conversaciones y eventos; solo Primary Owner; hasta 6 años (M7.3) |
| Connector consent | Aprobación del Owner antes de que un MCP OAuth acceda a recursos por usuario (M6.2) |
| Context drift | CLAUDE.md desactualizado respecto del codebase (M9.4) |
| Context isolation | El subagente solo ve su prompt, su tarea y sus resultados de herramientas (M5.7) |
| CUD / EDP / MACC | Compromisos de consumo de GCP / AWS / Azure (M3.1) |
| Defense in depth | Modelo de 5 capas de seguridad (M5.2) |
| Delivery Plan Pack | Entregable de M8: calificación, diseño del piloto, scorecard de ROI, plan del champion |
| Deployment Decision Doc | Entregable de M3: ruta, memo de brechas, red, gateway, compliance |
| Domain capture | Enruta todo login del dominio corporativo al workspace gobernado (M6.4) |
| Effort | Parámetro de profundidad de razonamiento dentro de un modelo (`high`, `xhigh`) (M1.2) |
| Gap memo | Memo de una página con brechas de paridad: brecha, momento y mitigación (M3.2) |
| `headersHelper` | Mecanismo de auth custom para servidores MCP (SSO interno, Kerberos, tokens cortos) (M5.3) |
| Hook | Comando shell en un evento del ciclo de vida; corre con los permisos del dev (M5.6) |
| Installation Configuration Pack | Entregable de M2: sección de settings + container spec |
| JIT | Just-in-Time provisioning: crea la cuenta en el primer login, no la borra (M6.4) |
| LLM gateway | Middleware que entiende el tráfico del modelo: auth, budgets, routing, logs (M3.4) |
| Managed settings | Capa de política no sobrescribible (consola, MDM o archivo) (M6.1) |
| MCP | Model Context Protocol: Tools, Resources y Prompts de sistemas externos (M5.1) |
| MCP relay / tunnel | Servidor MCP dentro de la red expuesto por HTTP/SSE; lleva solo tráfico MCP (M5.3) |
| Meseta (plateau) | Uso estable bajo el potencial sin un catalizador (M8.4) |
| Modo 1 / Modo 2 | Training de 2 días / programa de 30–45 días con medición (M8.1) |
| Output style | Instrucciones que cambian cómo comunica Claude (M4.5) |
| Parity gap | Capacidad ausente o reducida en una ruta frente a Enterprise directo (M3.2) |
| Permission creep | Ampliación progresiva de permisos durante el piloto (M9.4) |
| Plan mode | Modo que presenta los cambios propuestos y espera aprobación (M2.3) |
| Plugin | Carpeta con `plugin.json` y extensiones; se instala con un comando (M5.8) |
| Primary Owner | Rol único por org: seats, exportaciones, transferencia, Compliance API (M7.1) |
| Progressive disclosure | Scan → Load → Fetch en la carga de Skills (M5.4) |
| SCIM | Provisioning automático desde el IdP, con deprovisioning (M6.4) |
| Skill | Carpeta con SKILL.md y recursos; carga por relevancia (M5.4) |
| Structural vs marginal gain | Cambia la unidad de trabajo vs hace lo mismo más rápido (M8.1) |
| Subagente | Agente especializado con contexto aislado que devuelve resultados al principal (M5.7) |
| Super-user pattern | 10–15 devs concentran gran parte del costo y del output (M7.2) |
| Technical Activation Plan | Entregable del capstone: setup, monitoreo y lo que el champion debe asumir (M9.4) |
| Tenant restrictions | Impiden entrar a orgs de Claude no autorizadas desde la red corporativa (M6.4) |
| Trust Center | trust.anthropic.com: reportes, certificaciones, cuestionarios (M6.6) |
| ZDR | Zero Data Retention: Anthropic no persiste inputs ni outputs de Claude Code; solo Enterprise directo (M3.5, M6.5) |

### J.1 Notas de auditoría: contradicciones en el material

El curso se contradice en estos puntos. La columna "Qué hacer" indica cómo actuar mientras no lo confirmes en la documentación vigente.

| # | Tema | Contradicción | Qué hacer |
| --- | --- | --- | --- |
| 1 | Número de rutas | M1.3 habla de "siete paths" (Teams, Enterprise, Bedrock, Vertex, Foundry, API, Console); M3 y la portada, de cuatro | Cuatro para un rollout gobernado; las siete incluyen opciones que solo se nombran para descartarlas |
| 2 | IDE | La intro de M1 dice que "no es un plugin de IDE"; M2.2 describe una extensión de VS Code con panel nativo | Es el mismo agente: CLI y extensión son superficies del mismo motor |
| 3 | Managed settings en rutas cloud | M1.3: "no managed settings" en Bedrock/Vertex/Foundry; M3.1: "fijá versiones en managed settings" | \[Externo\] Lo que falta es la entrega server-managed desde la consola de Claude; MDM y archivo siguen funcionando. Verificalo |
| 4 | Foundry y residencia | M3.1 y el escenario de M3.5: rutea a infraestructura de Anthropic; el cuerpo de M3.5: "confirmá el routing con Anthropic" | Nunca prometas tenancy Azure; confirmalo con el account team |
| 5 | Retención | M3.5: no citar números; la respuesta "correcta" del quiz dice 30 días server-side y transcripts locales por 30 días; M6.5: indefinida por defecto si no se configura | Respondé "según acuerdo y configuración; el default es indefinido si no se fija" y confirmá el número con el account team |
| 6 | ZDR | M3.5: el account team lo habilita por org tras revisar elegibilidad; M6.5: requiere un acuerdo separado y, en un pasaje, "requiere un BAA" (cuando el BAA es lo que requiere ZDR para cubrir Claude Code) | ZDR = acuerdo + habilitación por org; BAA + ZDR solo para HIPAA |
| 7 | Roles | M6.2 lista tres roles por defecto + consentimiento, después "Primary Owner, Owner, Admin, Member"; M7.1: "Primary Owner, Owner, Admin, User" | Usá los cuatro de M7.1 (User = Member) |
| 8 | Formato de `allowedMcpServers` | M6.1: lista de nombres; M5.2: objetos (`serverUrl`, `serverCommand`), "no strings" | Usá objetos y verificá la doc |
| 9 | Telemetría en managed settings | M7.2: bloque `telemetry: {enabled, otlpEndpoint}`; M7.4: bloque `env` con variables OTEL | Usá el bloque `env` (D.4) |
| 10 | Analytics API | M7.2: no sirve para Claude Code; M7.6: cubre todo el uso de Claude y sirve para reportes de costo | Para Claude Code, Admin Console u OTel; Analytics API para costo agregado por workspace |
| 11 | Emisión de `cost.usage` | "Al final de cada sesión" vs "en tiempo real, no por lotes" | Consultá el total por sesión en el SIEM |
| 12 | Métricas del scorecard | M7.2 y M9.2: DAU, sesiones/usuario, retención semana 2, costo/dev; Technical Activation Plan (M9.4): adopción, tareas/sesión, aceptación de código, tiempo/tarea | Usá las cuatro de M7.2 como scorecard y las de M9.4 como complemento |
| 13 | Estilos de salida | M4.5: Default, Explanatory, Learning, Proactive; M9.2 y M9.4 hablan de "concise vs verbose" | \[Externo\] La doc actual tiene Default, Proactive, Concise, Explanatory y Learning |
| 14 | `ANTHROPIC_BASE_URL` en CI | M9.3 la llama "variable de proxy" y dice que local la toma del CLAUDE.md; M3.3 separa proxy (`HTTPS_PROXY`) y gateway (`ANTHROPIC_BASE_URL`) | \[Externo\] CLAUDE.md no define variables de entorno; vienen del shell o del bloque `env` de settings. Si en CI hay proxy, también hace falta `HTTPS_PROXY` |
| 15 | Artefacto de M6 | La intro de M6 dice "cuestionario de seguridad"; el bloque de M6.6 dice "OTel config + dashboard spec" (que es el de M7) | El artefacto de M6 es el cuestionario |
| 16 | Curva de adopción | M8.4 dice "tres fases" y lista cuatro etapas | Usá las cuatro etapas |
| 17 | Ritmo del programa | M8.1: check de mitad de programa en los Días 20–25; M8.7: CoE touchpoints solo en los Días 8 y 15 | Agendá ambos |
| 18 | Nombre de la certificación | "Claude Code Delivery Readiness certification" (M9) vs "Partner Specialization: Claude Code badge"; 34 preguntas "de los ocho cursos" | Mismo examen final del path |
| 19 | Seat Chat + Code | M1.3: mínimo para Claude Code; M7.1: en retirada desde la próxima renovación | Para nuevas compras, Claude Enterprise |

### J.2 Detalles a verificar \[Externo\]

- `claude -p --stdin` (M2.5): `--stdin` no aparece en la referencia oficial; el pipe directo funciona.
- `CLAUDE_CODE_MAX_TURNS` (M2.3): confirmá el nombre; la referencia CLI documenta `--max-turns`.
- Ubicación de subagentes: el curso usa `agents/` en la raíz; fuera de plugins la doc usa `.claude/agents/` y `~/.claude/agents/`.
- `claude mcp add linear` (M5.1) aparece sin transporte ni URL; en la práctica cada servidor indica su comando de alta.
- El propio curso advierte que las claves de sandbox deben verificarse antes del primer despliegue (M6.3).

### J.3 Información que falta para ejecutar

- Host base y formato de autenticación de la Compliance API y de la Admin API (`spend-limits`), y el payload para fijar límites.
- Sintaxis de `headers` y `headersHelper` en `.mcp.json`.
- Nombre del setting que desactiva el preflight de dominio de WebFetch.
- Model IDs exactos para fijar versiones en Bedrock, Vertex y Foundry.
- Un workflow YAML completo de GitHub Actions (el curso da bloques; D.13 es una propuesta externa).
- Pasos de configuración de tenant restrictions y del timeout de sesión.
- Ventana concreta de retención server-side y de transcripts locales.
- Setup del dev container del ejercicio de M2.5 (el curso lo declara fuera de alcance).

### J.4 Fuentes

- Material del curso **Claude Partner Badge: Claude Code** (Anthropic Academy en Skilljar, 9 módulos, 57 lecciones), guardado en tu carpeta *5 - Claude Partner Badge Claude Code*.
- Documento complementario de la misma carpeta: *Toolkit profesional — Claude Partner Badge Claude Code* (perfil, herramientas y roadmap; no se duplicó aquí).
- [Output styles — Claude Code Docs](https://code.claude.com/docs/en/output-styles): estilos built-in actuales y `keep-coding-instructions`.
- [Headless / Agent SDK CLI — Claude Code Docs](https://code.claude.com/docs/en/headless.md): `-p`, `--bare`, `--output-format`, lectura de stdin.
- [CLI reference — Claude Code Docs](https://code.claude.com/docs/en/CLI-reference): flags.
- Referencias citadas por el curso para verificar: code.claude.com/docs/en/env-vars, code.claude.com/docs/en/llm-gateway, code.claude.com/docs/en/devcontainer, platform.claude.com/docs/en/manage-claude/compliance-api, trust.anthropic.com, anthropic.com/pricing.
