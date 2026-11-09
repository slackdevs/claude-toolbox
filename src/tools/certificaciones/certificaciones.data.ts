import type { Localized } from '@/i18n';
import type { CertKey } from '@/lib/certs';

export interface CertInfo { code: string; name: string; audience: string; focus: string; format: string; key: CertKey }
export interface Domain { name: string; weight: number; topics: string[] }

// Formato, precios y ponderaciones de fuentes públicas (2026). Confirmar en la guía oficial.
// El orden de DOMAINS y de sus topics debe coincidir entre idiomas: el progreso se guarda por índice.
export const CERT_INFO: Localized<CertInfo[]> = {
  es: [
    { code: 'CCAO-F', name: 'Claude Certified Associate – Foundations', audience: 'Usuarios no técnicos, consultores, PMs', focus: 'Prompting, evaluación de salidas, uso responsable, elección de producto, diseño de workflows, gobernanza.', format: '60 ítems · 120 min · 720/1000 · USD 99', key: 'A' },
    { code: 'CCDV-F', name: 'Claude Certified Developer – Foundations', audience: 'Ingenieros que construyen apps y agentes', focus: 'Claude API, tools, MCP, optimización (caching, batch), seguridad, testing y despliegue.', format: '53 ítems · 120 min · 720/1000 · USD 125', key: 'D' },
    { code: 'CCAR-F', name: 'Claude Certified Architect – Foundations', audience: 'Arquitectos de soluciones', focus: 'Decisiones de diseño en 4 escenarios de producción tomados de un banco de 6; 5 dominios ponderados.', format: '60 ítems · 120 min · 720/1000', key: 'AF' },
    { code: 'CCAR-P', name: 'Claude Certified Architect – Professional', audience: 'Arquitectos con experiencia en producción', focus: 'Nivel avanzado de la vía de arquitecto. Consultá la guía oficial para el temario detallado.', format: 'USD 175 (según fuentes públicas)', key: 'AP' },
    { code: 'Badge', name: 'Claude Partner Badge – Claude Code', audience: 'Consultores de empresas partner', focus: 'Alcanzar, desplegar, configurar y operar activaciones de Claude Code de punta a punta.', format: '8 cursos + proyecto capstone + evaluación · se renueva', key: 'B' },
  ],
  en: [
    { code: 'CCAO-F', name: 'Claude Certified Associate – Foundations', audience: 'Non-technical users, consultants, PMs', focus: 'Prompting, output evaluation, responsible use, product selection, workflow design, governance.', format: '60 items · 120 min · 720/1000 · USD 99', key: 'A' },
    { code: 'CCDV-F', name: 'Claude Certified Developer – Foundations', audience: 'Engineers building apps and agents', focus: 'Claude API, tools, MCP, optimization (caching, batch), security, testing and deployment.', format: '53 items · 120 min · 720/1000 · USD 125', key: 'D' },
    { code: 'CCAR-F', name: 'Claude Certified Architect – Foundations', audience: 'Solution architects', focus: 'Design decisions across 4 production scenarios drawn from a bank of 6; 5 weighted domains.', format: '60 items · 120 min · 720/1000', key: 'AF' },
    { code: 'CCAR-P', name: 'Claude Certified Architect – Professional', audience: 'Architects with production experience', focus: 'Advanced level of the architect track. See the official guide for the detailed syllabus.', format: 'USD 175 (per public sources)', key: 'AP' },
    { code: 'Badge', name: 'Claude Partner Badge – Claude Code', audience: 'Consultants at partner companies', focus: 'Scoping, deploying, configuring and operating Claude Code rollouts end to end.', format: '8 courses + capstone project + assessment · renewable', key: 'B' },
  ],
};

export const DOMAINS: Localized<Domain[]> = {
  es: [
    { name: 'Arquitectura agéntica y orquestación', weight: 27, topics: ['Loop agéntico controlado por stop_reason (tool_use / end_turn)', 'Coordinador–subagentes y paso explícito de contexto', 'Descomposición de tareas y handoffs', 'Hooks para garantías deterministas vs. instrucciones en prompt', 'Sesiones: reanudar, bifurcar, estado'] },
    { name: 'Configuración y flujos de Claude Code', weight: 20, topics: ['Jerarquía de CLAUDE.md y .claude/rules con paths', 'Skills y comandos slash', 'Plan mode vs. ejecución directa', 'Claude Code en CI/CD con -p y salida JSON', 'Permisos, settings y MCP por alcance'] },
    { name: 'Prompt engineering y salida estructurada', weight: 20, topics: ['Criterios explícitos en lugar de instrucciones vagas', 'Few-shot con ejemplos variados', 'Salida estructurada vía tool use / JSON Schema', 'Loops de validación y reintento', 'Batch API para cargas no urgentes'] },
    { name: 'Diseño de tools e integración MCP', weight: 18, topics: ['Descripciones de tools que diferencian casos', 'Errores estructurados y reintentables en tool_result', 'Distribución de tools por agente (mínimo privilegio)', 'tool_choice: auto / any / tool', 'Configuración de servidores MCP y alcance'] },
    { name: 'Gestión de contexto y confiabilidad', weight: 15, topics: ['Preservar hechos clave en conversaciones largas', 'Compactación y resumen del historial', 'Escalamiento a humanos y criterios de confianza', 'Propagación de errores entre agentes', 'Procedencia y citas de las fuentes'] },
  ],
  en: [
    { name: 'Agentic architecture and orchestration', weight: 27, topics: ['Agentic loop driven by stop_reason (tool_use / end_turn)', 'Coordinator–subagents and explicit context passing', 'Task decomposition and handoffs', 'Hooks for deterministic guarantees vs. prompt instructions', 'Sessions: resume, fork, state'] },
    { name: 'Claude Code configuration and workflows', weight: 20, topics: ['CLAUDE.md hierarchy and .claude/rules with paths', 'Skills and slash commands', 'Plan mode vs. direct execution', 'Claude Code in CI/CD with -p and JSON output', 'Permissions, settings and MCP by scope'] },
    { name: 'Prompt engineering and structured output', weight: 20, topics: ['Explicit criteria instead of vague instructions', 'Few-shot with varied examples', 'Structured output via tool use / JSON Schema', 'Validation and retry loops', 'Batch API for non-urgent workloads'] },
    { name: 'Tool design and MCP integration', weight: 18, topics: ['Tool descriptions that tell cases apart', 'Structured, retryable errors in tool_result', 'Distributing tools per agent (least privilege)', 'tool_choice: auto / any / tool', 'MCP server configuration and scope'] },
    { name: 'Context management and reliability', weight: 15, topics: ['Preserving key facts in long conversations', 'History compaction and summarization', 'Escalation to humans and confidence criteria', 'Error propagation across agents', 'Provenance and source citations'] },
  ],
};
