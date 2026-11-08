import type { CertKey } from '@/lib/certs';

// Formato, precios y ponderaciones de fuentes públicas (2026). Confirmar en la guía oficial.
export const CERT_INFO: { code: string; name: string; audience: string; focus: string; format: string; key: CertKey }[] = [
  { code: 'CCAO-F', name: 'Claude Certified Associate – Foundations', audience: 'Usuarios no técnicos, consultores, PMs', focus: 'Prompting, evaluación de salidas, uso responsable, elección de producto, diseño de workflows, gobernanza.', format: '60 ítems · 120 min · 720/1000 · USD 99', key: 'A' },
  { code: 'CCDV-F', name: 'Claude Certified Developer – Foundations', audience: 'Ingenieros que construyen apps y agentes', focus: 'Claude API, tools, MCP, optimización (caching, batch), seguridad, testing y despliegue.', format: '53 ítems · 120 min · 720/1000 · USD 125', key: 'D' },
  { code: 'CCAR-F', name: 'Claude Certified Architect – Foundations', audience: 'Arquitectos de soluciones', focus: 'Decisiones de diseño en 4 escenarios de producción tomados de un banco de 6; 5 dominios ponderados.', format: '60 ítems · 120 min · 720/1000', key: 'AF' },
  { code: 'CCAR-P', name: 'Claude Certified Architect – Professional', audience: 'Arquitectos con experiencia en producción', focus: 'Nivel avanzado de la vía de arquitecto. Consultá la guía oficial para el temario detallado.', format: 'USD 175 (según fuentes públicas)', key: 'AP' },
  { code: 'Badge', name: 'Claude Partner Badge – Claude Code', audience: 'Consultores de empresas partner', focus: 'Alcanzar, desplegar, configurar y operar activaciones de Claude Code de punta a punta.', format: '8 cursos + proyecto capstone + evaluación · se renueva', key: 'B' },
];

export const DOMAINS: { name: string; weight: number; topics: string[] }[] = [
  { name: 'Arquitectura agéntica y orquestación', weight: 27, topics: ['Loop agéntico controlado por stop_reason (tool_use / end_turn)', 'Coordinador–subagentes y paso explícito de contexto', 'Descomposición de tareas y handoffs', 'Hooks para garantías deterministas vs. instrucciones en prompt', 'Sesiones: reanudar, bifurcar, estado'] },
  { name: 'Configuración y flujos de Claude Code', weight: 20, topics: ['Jerarquía de CLAUDE.md y .claude/rules con paths', 'Skills y comandos slash', 'Plan mode vs. ejecución directa', 'Claude Code en CI/CD con -p y salida JSON', 'Permisos, settings y MCP por alcance'] },
  { name: 'Prompt engineering y salida estructurada', weight: 20, topics: ['Criterios explícitos en lugar de instrucciones vagas', 'Few-shot con ejemplos variados', 'Salida estructurada vía tool use / JSON Schema', 'Loops de validación y reintento', 'Batch API para cargas no urgentes'] },
  { name: 'Diseño de tools e integración MCP', weight: 18, topics: ['Descripciones de tools que diferencian casos', 'Errores estructurados y reintentables en tool_result', 'Distribución de tools por agente (mínimo privilegio)', 'tool_choice: auto / any / tool', 'Configuración de servidores MCP y alcance'] },
  { name: 'Gestión de contexto y confiabilidad', weight: 15, topics: ['Preservar hechos clave en conversaciones largas', 'Compactación y resumen del historial', 'Escalamiento a humanos y criterios de confianza', 'Propagación de errores entre agentes', 'Procedencia y citas de las fuentes'] },
];
