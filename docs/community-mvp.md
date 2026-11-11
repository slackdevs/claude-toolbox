# Claude Toolbox — MVP comunitario con backend simulado

Instrucciones para Claude Code. Objetivo: una versión **funcional de punta a punta en el frontend**, con un backend **simulado en el navegador**, para validar la experiencia de usuario antes de construir la API real (Fastify + MySQL en Hostinger).

Documento de producto de referencia (fuente de verdad de las reglas): "Claude Toolbox — Centro de herramientas guiado por la comunidad" (Claude Docs, autor Sebastián Larrauri). Si algo de este archivo lo contradice, gana el documento de producto: avisá antes de seguir.

---

## 0. Cómo trabajar

1. Leé `CLAUDE.md`, `README.md`, `src/tools/tool.ts`, `src/tools/index.ts`, `src/router.ts`, `src/App.vue`, `src/pages/Home.vue`, `src/composables/*`, `src/i18n/*`, `src/lib/*`, `src/styles/main.css` y `scripts/seo.ts` antes de proponer nada.
2. Empezá en **plan mode**: presentá el plan por fases (sección 9) con la lista de archivos que vas a crear o tocar. No escribas código hasta que lo apruebe.
3. Trabajá en la rama `feature/community-mock` (creala desde la rama actual). Un commit por fase, con los prefijos del repo (`add:`, `update:`, `fix:`, `change:`, `DEL:`). **No hagas push ni deploy.**
4. Al cerrar cada fase: `npm run build` tiene que pasar (incluye `vue-tsc`), y me mostrás qué probar en el navegador.
5. **No agregues dependencias** sin preguntarme primero. El repo no usa librería de UI y así sigue.

## 1. Qué se construye (alcance)

Se mantiene **todo lo actual**: herramientas, buscador, filtros por certificación, favoritos, ES/EN, SEO por herramienta, `llms.txt`. Nada de eso cambia de comportamiento.

Se agregan cuatro áreas:

| Área | Rutas | Resumen |
| --- | --- | --- |
| Cheatsheets | `/cheatsheets/`, `/cheatsheets/:cert/` | Uno por credencial: CCAO-F, CCDV-F, CCAR-F, CCAR-P, Badge CC |
| Propuestas | `/propuestas/`, `/propuestas/nueva/`, `/propuestas/:id/` | Proponer herramientas, mejoras o contenido; votar arriba/abajo; donar por consumos |
| Roadmap | `/roadmap/` | Vista pública por estado, alimentada por las propuestas |
| Revisión (admin simulado) | `/admin/` | Cola de revisión de Sebastián: asignar tiempo estimado, aprobar, descartar, mover estados |

Fuera de alcance en esta fase: API real, cobros reales con PayPal, envío real de emails, geolocalización real por IP, login.

## 2. Reglas de negocio (resumen del documento de producto)

- **Ciclo de vida** de una propuesta: `received` (Recibida) → `open` (Abierta a votación) → `planned` (Planificada) → `in_progress` (En desarrollo) → `published` (Publicada). También `discarded` o `duplicate`, siempre con motivo público.
- **Revisión**: toda propuesta nueva entra como `received` y **no se puede votar ni donar** hasta que Sebastián la revisa, le asigna un **tiempo estimado** de desarrollo e implementación (en horas) y la abre. Esto es manual por ahora.
- **Tipos**: `tool` (herramienta nueva), `improvement` (mejora de una herramienta existente, vinculada por `toolPath`), `content` (cheatsheet, guía, template, plugin, documentación).
- **Etiquetas**: una o más credenciales (`CertKey` de `src/lib/certs.ts`).
- **Voto**: sin login. Un voto por **email** y propuesta, arriba (+1) o abajo (−1). Se puede cambiar o retirar. Se guardan email, IP y región (en el mock IP y región son simuladas). Requiere consentimiento explícito con el aviso de privacidad.
- **Donaciones por consumos**: botones **Buy Me a Coffee**, **A Beer** y **A Pizza**. Cada consumo equivale a un tiempo de desarrollo **orientativo** (café = 10 a 20 minutos; cerveza y pizza: a definir). La donación confirmada suma al puntaje.
- **Puntaje**: `score = upvotes − downvotes + donationPoints`. La fórmula de `donationPoints` está a definir: dejala en una función pura con constantes marcadas `TODO` y mostrá **siempre el desglose** (votos y donaciones por separado).
- **Desempate**: la propuesta más antigua primero.
- **Si una propuesta no avanza**: lo donado no se reembolsa; queda como crédito para contratar un desarrollo privado con Sebastián, con descuento de lo aportado. En la UI basta con explicarlo y ofrecer un botón "Consultar desarrollo privado" que abre un `mailto:` o el formulario de contacto de slackdevs.com.
- **Lo publicado es open source** y se mantiene actualizado.

Valores que **no existen todavía** (precios de cada consumo, equivalencia de cerveza y pizza, peso de las donaciones en el puntaje, plazo para considerar que una propuesta no avanza): centralizalos en un solo archivo de configuración, con valores provisorios claramente marcados `TODO` y visibles en la UI como "provisorio" mientras estemos en modo demo. **No inventes cifras definitivas.**

## 3. Arquitectura del backend simulado

Todo vive en `src/community/`, aislado del resto: si la capa comunitaria falla, las herramientas siguen funcionando.

```
src/community/
├── types.ts            # tipos del dominio (se van a compartir con la API Fastify)
├── config.ts           # consumos, equivalencias, pesos del puntaje, flags (valores TODO)
├── score.ts            # funciones puras: puntaje, desglose, orden del ranking
├── api.ts              # interfaz CommunityApi + selección de implementación
├── mock/
│   ├── mockApi.ts      # implementación con localStorage + latencia simulada
│   ├── seed.ts         # propuestas de ejemplo (autor: Slackdevs)
│   └── store.ts        # lectura/escritura versionada en localStorage
├── composables/        # useProposals, useProposal, useVoter, useVote, useDonate, useAdmin
└── components/         # VoteControl, ScoreBreakdown, DonateButtons, StatusBadge, ProposalCard, ...
```

- `CommunityApi` es la **única** puerta de entrada. Los componentes nunca tocan `localStorage` directo. Diseñala con las mismas operaciones que tendrá la API real:

  | Operación | Futuro endpoint Fastify |
  | --- | --- |
  | `listProposals(filters)` | `GET /proposals` |
  | `getProposal(id)` | `GET /proposals/:id` |
  | `createProposal(input)` | `POST /proposals` |
  | `vote(id, value: 1 \| -1 \| 0)` | `POST /proposals/:id/vote` |
  | `requestVerification(email)` / `confirmVerification(token)` | `POST /voters/verify`, `POST /voters/confirm` |
  | `createDonation(id, tier)` / `confirmDonation(orderId)` | `POST /donations` + webhook de PayPal |
  | `adminUpdateProposal(id, patch)` | `PATCH /admin/proposals/:id` |

- Selección por variable de entorno: `VITE_COMMUNITY_API=mock` (por defecto) o `http` (stub vacío que tira "no implementado", para la fase siguiente).
- El mock simula **latencia** (200 a 600 ms) y tiene un interruptor de **error aleatorio** (configurable desde `/admin/`) para probar los estados de error y los rollbacks.
- `store.ts` guarda con clave versionada (`ct-community-v1`) y migra o resetea si cambia la versión. Botón "Restablecer datos de ejemplo" en `/admin/`.
- Esta es la única excepción a "nada sale del navegador" de `CLAUDE.md`, y en el mock **tampoco sale nada**: todo queda en `localStorage`. Actualizá `CLAUDE.md` para reflejar que la capa comunitaria tendrá backend en el futuro.

### Modelo de datos (`types.ts`)

Como mínimo:

- `Proposal`: `id`, `type`, `title`, `description` (Markdown simple), `lang` (idioma en que se escribió), `certs`, `toolPath?`, `status`, `estimateHours?`, `statusReason?`, `createdAt`, `updatedAt`, `author` (`{ displayName?, emailHash }`; las semillas usan `Slackdevs`), `links?` (`issue`, `pr`, `publishedPath`).
- `Vote`: `proposalId`, `voterEmail`, `value`, `ip`, `region`, `createdAt`.
- `Donation`: `id`, `proposalId`, `tier` (`coffee` \| `beer` \| `pizza`), `amount`, `status` (`pending` \| `confirmed`), `donorDisplayName?`, `showPublicly`, `createdAt`.
- `Voter`: `email`, `verified`, `consentAt`.
- `ProposalSummary` (lo que devuelve el listado): la propuesta + `upvotes`, `downvotes`, `donationsByTier`, `donatedMinutes` (orientativo), `score`, `myVote`.

## 4. Pantallas y flujos (foco en UX)

### 4.1 Navegación

- **Header**: agregá accesos a **Cheatsheets**, **Propuestas** y **Roadmap** sin romper el layout actual ni el botón de idioma. En mobile, que vayan al menú.
- **Sidebar**: una sección "Comunidad" arriba de las categorías, con Cheatsheets, Propuestas, Roadmap.
- **Home**: mantené la grilla de herramientas tal cual. Arriba agregá un bloque compacto con: CTA "Proponé una herramienta", las 3 propuestas mejor rankeadas y los 5 cheatsheets como tarjetas.
- **Cabecera de cada herramienta** (`tool-head` en `App.vue`): botón **"Proponer mejora"** (abre `/propuestas/nueva/?type=improvement&tool=/costos`) y un contador "N mejoras propuestas" que lleva al listado filtrado.
- **Banner de modo demo** discreto y persistente en las páginas comunitarias: "Modo demo: los datos se guardan solo en tu navegador y no se cobra nada".

### 4.2 Listado `/propuestas/`

- Tarjetas con: título, tipo, credenciales (`CertTags`), estado (`StatusBadge`), tiempo estimado, puntaje con desglose al pasar el mouse o tocar, control de voto y acceso a donar.
- Filtros: tipo, estado, credencial, y "solo mejoras de esta herramienta". Orden: ranking (por defecto), más nuevas, más donadas. Buscador que reutiliza el `query` global si tiene sentido.
- Filtros y orden **reflejados en la URL** (query string) para que se puedan compartir.
- Estados vacíos útiles ("No hay propuestas para CCAR-P. ¿Proponés la primera?"), skeletons mientras carga, y un error con reintento.
- Un enlace "¿Cómo funciona el ranking?" que abre un modal explicando votos, donaciones, revisión y ciclos. La transparencia es parte del producto.

### 4.3 Nueva propuesta `/propuestas/nueva/`

- Formulario en un paso, con vista previa al lado (o debajo en mobile): tipo, título (máx. 80), descripción (máx. 2000, Markdown simple), credenciales, herramienta vinculada si es mejora (selector con las herramientas del registro), email.
- Mientras escribe el título, mostrá **posibles duplicados** (coincidencia simple por palabras contra propuestas existentes) para evitar repetidos.
- Validación inline, accesible (`aria-invalid`, mensajes vinculados con `aria-describedby`), sin bloquear al escribir.
- Al enviar: pantalla de confirmación clara: "Recibida. Sebastián la revisa y le asigna un tiempo estimado antes de abrirla a votación". Con link a la propuesta (que se ve con estado Recibida).
- Guardá un borrador en `localStorage` mientras escribe.

### 4.4 Detalle `/propuestas/:id/`

- Título, estado y una línea de tiempo del ciclo de vida con el paso actual resaltado.
- Descripción, credenciales, herramienta vinculada (link), autor, fecha.
- **Tiempo estimado** asignado por Sebastián (o "Pendiente de revisión").
- **Puntaje** con desglose (votos ↑, votos ↓, aporte de donaciones).
- **Votar** y **donar** (deshabilitados con explicación si no está `open`).
- Para `discarded` o `duplicate`: motivo visible y, si hubo donaciones, el aviso del crédito para desarrollo privado.
- Para `published`: link a la herramienta o al contenido publicado.
- Botón compartir (copia el link con `useToast`).

### 4.5 Votar (componente `VoteControl`)

- Botones ↑ y ↓ con el puntaje neto en el medio. `aria-pressed` refleja el voto actual; volver a tocar el mismo retira el voto; tocar el otro lo cambia.
- **Actualización optimista**: el número cambia al instante; si el mock falla, se revierte y aparece un toast con el error.
- **Primera vez**: modal de identificación con email + checkbox de consentimiento (link a la política de privacidad de `BRAND.legal.privacy`, con texto breve: qué se guarda —email, IP, región, votos— y para qué). Después, verificación simulada: "Te enviamos un enlace a tu email" + botón "Simular verificación" (solo en modo demo). El voto pendiente se aplica automáticamente al verificar, sin pedirle que vuelva a tocar.
- Recordar el email verificado en este navegador y permitir "Cambiar email" o "Olvidar mis datos".
- Foco: al abrir el modal va al campo email; al cerrar vuelve al botón que lo abrió; `Esc` cierra.

### 4.6 Donar (componente `DonateButtons`)

- Tres botones: **Buy Me a Coffee**, **A Beer**, **A Pizza**, cada uno con ícono, precio (provisorio) y equivalencia orientativa ("≈ 10–20 min de desarrollo").
- Al elegir: modal de confirmación con resumen (propuesta, consumo, monto, que suma al puntaje, que no se reembolsa y queda como crédito si la propuesta no avanza), nombre público opcional y "mostrar mi apoyo públicamente".
- Pago **simulado**: un botón que imita PayPal ("Pagar con PayPal — simulado") con estados `pending` → `confirmed` (latencia), y una pantalla de gracias. Nunca uses el link real de `BRAND.coffee` desde estas pantallas en modo demo.
- El puntaje y el desglose se actualizan al confirmar.
- (A confirmar con Sebastián, detrás de un flag en `config.ts`, apagado por defecto): barra de progreso "donado vs. tiempo estimado" en minutos orientativos.

### 4.7 Roadmap `/roadmap/`

- Columnas (o secciones apiladas en mobile): Planificada, En desarrollo, Publicada. Cada tarjeta muestra puntaje, tiempo estimado y credenciales.
- Texto corto arriba: el roadmap sale del ranking, con revisión de Sebastián; si se salta una propuesta, se publica el motivo.
- Solo lectura.

### 4.8 Revisión `/admin/` (Sebastián, simulado)

- No aparece en el header ni en el sidebar, ni en `sitemap.xml` ni en `llms.txt`; `noindex`. Se activa con un interruptor "Modo Sebastián (demo)" guardado en `localStorage`.
- **Cola de revisión** (`received`): por cada propuesta, campo de tiempo estimado (horas), y acciones Aprobar (→ `open`), Descartar o Marcar duplicada (con motivo obligatorio y, para duplicada, a cuál).
- **Gestión**: cambiar estado de cualquier propuesta, editar tiempo estimado, ver votos con email, IP y región simulados, ver donaciones.
- Herramientas de demo: restablecer datos de ejemplo, activar errores aleatorios, ajustar latencia.

### 4.9 Cheatsheets `/cheatsheets/` y `/cheatsheets/:cert/`

- Índice con las 5 credenciales (insignia, color y nombre de `src/lib/certs.ts`).
- Cada cheatsheet: encabezado con la credencial, **fecha de última revisión**, aviso de que puede estar desactualizado con link a la guía oficial; secciones por dominio o tema; conceptos clave; links a docs.claude.com; y **herramientas relacionadas** (las del registro cuyo `certs` incluye esa credencial, con `ToolCard`).
- Datos en `src/cheatsheets/<cert>.data.ts` con `Localized<T>`, sin texto suelto en los componentes. Reutilizá `CERT_INFO` y `DOMAINS` de `src/tools/certificaciones/certificaciones.data.ts` donde aplique, en lugar de duplicarlos.
- **Contenido**: armá la estructura completa y llená **CCAO-F** como plantilla. **No inventes temario de examen**: lo que no puedas sostener con la guía oficial o con los datos que ya están en el repo, dejalo como `TODO` visible ("Contenido en preparación") para que lo complete Sebastián.
- Botón **Imprimir** y estilos `@media print` limpios (sin header, sidebar ni fondo).
- Botón "Proponer mejora a este cheatsheet" (propuesta tipo `content` con la credencial precargada).

## 5. Datos de ejemplo (`seed.ts`)

- Entre 10 y 15 propuestas de **Slackdevs**, repartidas entre tipos, estados y credenciales, para que todas las pantallas tengan algo que mostrar: algunas `received` (para la cola de admin), la mayoría `open`, 2 `planned`, 1 `in_progress`, 1 `published`, 1 `discarded` con motivo, 1 `duplicate`.
- Ideas plausibles y alineadas con el temario (por ejemplo, mejoras a herramientas existentes del registro). Votos y donaciones de ejemplo con emails ficticios de dominio `example.com`.
- Todo marcado como "Datos de ejemplo" en la UI del modo demo.

## 6. Estilo, accesibilidad e i18n

- **Marca**: solo las variables de `src/styles/main.css` (ámbar `--color-primary`, violeta `--color-secondary`, cian `--color-tertiary`, `--color-bg-*`, fuentes `--font-serif/sans/mono`). Solo tema oscuro. Reutilizá clases existentes (`pill`, `chip`, `cards`, `sec-title`, `header-btn`, `toast`) antes de crear nuevas.
- Estados por color **y** texto o ícono (nunca solo color). Contraste AA.
- Todo navegable con teclado; foco visible; modales con foco atrapado y `Esc`.
- `prefers-reduced-motion`: sin animaciones de conteo ni transiciones largas.
- Mobile primero: el voto y la donación tienen que ser cómodos con el pulgar (objetivos táctiles de al menos 44 px).
- **ES/EN** en todo texto de interfaz: `src/i18n/ui.ts` para lo común y `useMessages()` en cada componente. El contenido que escriben los usuarios se muestra en su idioma original, con una etiqueta del idioma si no coincide con la UI.
- Fechas y números con `intlLocale()` y `fmt()`.
- Escapá siempre lo que escribe el usuario. El Markdown de la descripción se renderiza con un parser mínimo propio (negrita, cursiva, listas, links, código en línea) que escape todo lo demás; nada de `v-html` con texto sin escapar.

## 7. SEO

- Extendé `scripts/seo.ts` para generar HTML estático de `/cheatsheets/` y de cada `/cheatsheets/:cert/` (con su contenido legible sin JS), e incluirlos en `sitemap.xml`, `llms.txt` y `llms-full.txt`.
- `/propuestas/` y `/roadmap/` llevan HTML estático con title, description y canonical, pero su contenido es dinámico (en el mock no existe en build). El detalle `/propuestas/:id/` no se prerenderiza en esta fase.
- `/admin/` con `noindex` y fuera de sitemap y llms.
- Mantené el `watchEffect` de `App.vue` que actualiza title, description y canonical para las rutas nuevas.

## 8. Criterios de aceptación

- [ ] Todas las herramientas actuales funcionan igual que antes (probar al menos costos, tokens, prompt y certificaciones).
- [ ] Puedo crear una propuesta, verla como Recibida, aprobarla desde `/admin/` con un tiempo estimado y verla abierta en el listado.
- [ ] Puedo votar arriba y abajo, cambiar y retirar el voto; con otro email (simulado) el puntaje refleja dos personas distintas; con el mismo email no puedo votar dos veces.
- [ ] Puedo donar los tres consumos y el puntaje y el desglose se actualizan.
- [ ] Con errores aleatorios activados, voto y donación hacen rollback y muestran un mensaje claro.
- [ ] El roadmap refleja los cambios de estado hechos en `/admin/`.
- [ ] Los 5 cheatsheets existen, CCAO-F tiene contenido de plantilla, el resto muestra la estructura con `TODO` visibles, e imprimen limpio.
- [ ] "Proponer mejora" desde una herramienta llega al formulario con la herramienta precargada.
- [ ] Filtros y orden quedan en la URL y sobreviven a recargar la página.
- [ ] Todo está en ES y EN; cambiar de idioma no rompe ninguna pantalla nueva.
- [ ] Navegable con teclado en las pantallas nuevas; sin errores de consola.
- [ ] `npm run build` pasa y `dist/` incluye las páginas estáticas de cheatsheets y el sitemap actualizado.
- [ ] Actualizados `README.md` (nuevas áreas, modo demo, cómo pasar de mock a http) y `CLAUDE.md`.

## 9. Fases sugeridas

1. **Base**: `types.ts`, `config.ts`, `score.ts`, `api.ts`, mock con store, seed y latencia. Rutas vacías y navegación (header, sidebar, banner demo).
2. **Propuestas**: listado con filtros y URL, detalle, nueva propuesta con duplicados y borrador.
3. **Votación**: `VoteControl`, identificación por email con consentimiento y verificación simulada, optimista con rollback.
4. **Donaciones**: `DonateButtons`, confirmación, pago simulado, desglose de puntaje.
5. **Admin y roadmap**: cola de revisión, gestión de estados, herramientas de demo, vista de roadmap.
6. **Cheatsheets**: índice, plantilla CCAO-F, estructura del resto, impresión, herramientas relacionadas.
7. **Integración y pulido**: "Proponer mejora" en herramientas, bloque nuevo en Home, SEO, accesibilidad, revisión de i18n, README y CLAUDE.md.

Al terminar cada fase, decime qué decisiones tomaste que no estaban en este documento, para llevarlas al documento de producto.
