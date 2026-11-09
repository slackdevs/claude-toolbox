import type { Localized } from '@/i18n';

export interface Pattern { key: string; name: string; what: string; when: string; risk: string }

export const PATTERNS: Localized<Pattern[]> = {
  es: [
    { key: 'single', name: 'Llamada única aumentada', what: 'Un solo request con buen prompt, retrieval y tools.', when: 'Cuando la tarea cabe en una respuesta. Es la base: empezá siempre por lo más simple.', risk: 'Sobre-ingeniería si se reemplaza por agentes sin necesidad.' },
    { key: 'chain', name: 'Encadenamiento de prompts', what: 'Secuencia fija de pasos; cada salida alimenta al siguiente, con validaciones (gates) entre pasos.', when: 'Pasos conocidos y ordenados: extraer → validar → redactar.', risk: 'Errores que se propagan si no hay gates; latencia acumulada.' },
    { key: 'route', name: 'Enrutamiento', what: 'Un clasificador dirige cada entrada a un prompt/modelo especializado (ej. Haiku para lo simple, Opus para lo complejo).', when: 'Categorías de entrada distintas que conviene tratar distinto.', risk: 'Clasificación errónea; categorías solapadas.' },
    { key: 'parallel', name: 'Paralelización', what: 'Subtareas independientes en paralelo (sectioning) o el mismo pedido varias veces para votar (voting).', when: 'Subtareas independientes o cuando se necesita mayor confianza.', risk: 'Costo multiplicado; agregación de resultados inconsistente.' },
    { key: 'orch', name: 'Orquestador–trabajadores', what: 'Un agente coordinador descompone dinámicamente la tarea y delega en subagentes con contexto aislado; luego sintetiza.', when: 'Subtareas impredecibles de antemano (investigación, cambios multi-archivo).', risk: 'Delegación con contexto insuficiente: el coordinador debe pasar explícitamente lo que cada subagente necesita.' },
    { key: 'eval', name: 'Evaluador–optimizador', what: 'Un generador produce y un evaluador critica con criterios claros, en ciclo hasta cumplirlos.', when: 'Criterios de calidad explícitos y valor en iterar (traducción, código con tests).', risk: 'Ciclos infinitos: limitá iteraciones.' },
    { key: 'agent', name: 'Agente autónomo', what: 'Loop: el modelo decide qué tool usar hasta stop_reason = end_turn, con feedback del entorno en cada paso.', when: 'Problemas abiertos, número de pasos impredecible, entorno verificable (tests, compilador).', risk: 'Costo y errores compuestos: max_turns, checkpoints, sandbox y human-in-the-loop para acciones irreversibles.' },
  ],
  en: [
    { key: 'single', name: 'Augmented single call', what: 'A single request with a good prompt, retrieval and tools.', when: 'When the task fits in one response. This is the baseline: always start with the simplest option.', risk: 'Over-engineering if it is replaced with agents for no reason.' },
    { key: 'chain', name: 'Prompt chaining', what: 'A fixed sequence of steps; each output feeds the next, with validations (gates) between steps.', when: 'Known, ordered steps: extract → validate → draft.', risk: 'Errors propagate if there are no gates; latency adds up.' },
    { key: 'route', name: 'Routing', what: 'A classifier sends each input to a specialized prompt/model (e.g. Haiku for simple cases, Opus for complex ones).', when: 'Distinct input categories that are better handled differently.', risk: 'Misclassification; overlapping categories.' },
    { key: 'parallel', name: 'Parallelization', what: 'Independent subtasks in parallel (sectioning) or the same request several times to vote (voting).', when: 'Independent subtasks or when higher confidence is needed.', risk: 'Multiplied cost; inconsistent aggregation of results.' },
    { key: 'orch', name: 'Orchestrator–workers', what: 'A coordinator agent dynamically breaks down the task and delegates to subagents with isolated context; then synthesizes.', when: 'Subtasks that cannot be predicted upfront (research, multi-file changes).', risk: 'Delegation with insufficient context: the coordinator must explicitly pass what each subagent needs.' },
    { key: 'eval', name: 'Evaluator–optimizer', what: 'A generator produces and an evaluator critiques against clear criteria, looping until they are met.', when: 'Explicit quality criteria and value in iterating (translation, code with tests).', risk: 'Infinite loops: cap the iterations.' },
    { key: 'agent', name: 'Autonomous agent', what: 'Loop: the model decides which tool to use until stop_reason = end_turn, with feedback from the environment at each step.', when: 'Open-ended problems, unpredictable number of steps, verifiable environment (tests, compiler).', risk: 'Cost and compounding errors: max_turns, checkpoints, sandbox and human-in-the-loop for irreversible actions.' },
  ],
};

export const QUESTIONS: Localized<[string, string][]> = {
  es: [
    ['q1', '¿Se resuelve bien con una sola llamada (más retrieval/tools)?'],
    ['q2', '¿Los pasos son conocidos y siempre en el mismo orden?'],
    ['q3', '¿Hay tipos de entrada distintos que requieren manejo distinto?'],
    ['q4', '¿Se divide en subtareas independientes entre sí?'],
    ['q5', '¿Las subtareas no se pueden prever hasta ver el problema?'],
    ['q6', '¿Hay criterios de calidad claros y conviene iterar?'],
    ['q7', '¿Requiere explorar con un número impredecible de pasos y tools?'],
  ],
  en: [
    ['q1', 'Can it be solved well with a single call (plus retrieval/tools)?'],
    ['q2', 'Are the steps known and always in the same order?'],
    ['q3', 'Are there different input types that need different handling?'],
    ['q4', 'Does it split into subtasks that are independent of each other?'],
    ['q5', 'Are the subtasks impossible to predict until you see the problem?'],
    ['q6', 'Are there clear quality criteria, and is iterating worthwhile?'],
    ['q7', 'Does it require exploring with an unpredictable number of steps and tools?'],
  ],
};

export function recommend(a: Record<string, boolean>): Set<string> {
  const rec = new Set<string>();
  if (a.q1) return rec.add('single');
  if (a.q7) rec.add('agent');
  if (a.q5) rec.add('orch');
  if (a.q2) rec.add('chain');
  if (a.q3) rec.add('route');
  if (a.q4 && !a.q5) rec.add('parallel');
  if (a.q6) rec.add('eval');
  return rec;
}
