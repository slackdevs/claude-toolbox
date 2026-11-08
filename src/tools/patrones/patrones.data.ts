export interface Pattern { key: string; name: string; what: string; when: string; risk: string }

export const PATTERNS: Pattern[] = [
  { key: 'single', name: 'Llamada única aumentada', what: 'Un solo request con buen prompt, retrieval y tools.', when: 'Cuando la tarea cabe en una respuesta. Es la base: empezá siempre por lo más simple.', risk: 'Sobre-ingeniería si se reemplaza por agentes sin necesidad.' },
  { key: 'chain', name: 'Encadenamiento de prompts', what: 'Secuencia fija de pasos; cada salida alimenta al siguiente, con validaciones (gates) entre pasos.', when: 'Pasos conocidos y ordenados: extraer → validar → redactar.', risk: 'Errores que se propagan si no hay gates; latencia acumulada.' },
  { key: 'route', name: 'Enrutamiento', what: 'Un clasificador dirige cada entrada a un prompt/modelo especializado (ej. Haiku para lo simple, Opus para lo complejo).', when: 'Categorías de entrada distintas que conviene tratar distinto.', risk: 'Clasificación errónea; categorías solapadas.' },
  { key: 'parallel', name: 'Paralelización', what: 'Subtareas independientes en paralelo (sectioning) o el mismo pedido varias veces para votar (voting).', when: 'Subtareas independientes o cuando se necesita mayor confianza.', risk: 'Costo multiplicado; agregación de resultados inconsistente.' },
  { key: 'orch', name: 'Orquestador–trabajadores', what: 'Un agente coordinador descompone dinámicamente la tarea y delega en subagentes con contexto aislado; luego sintetiza.', when: 'Subtareas impredecibles de antemano (investigación, cambios multi-archivo).', risk: 'Delegación con contexto insuficiente: el coordinador debe pasar explícitamente lo que cada subagente necesita.' },
  { key: 'eval', name: 'Evaluador–optimizador', what: 'Un generador produce y un evaluador critica con criterios claros, en ciclo hasta cumplirlos.', when: 'Criterios de calidad explícitos y valor en iterar (traducción, código con tests).', risk: 'Ciclos infinitos: limitá iteraciones.' },
  { key: 'agent', name: 'Agente autónomo', what: 'Loop: el modelo decide qué tool usar hasta stop_reason = end_turn, con feedback del entorno en cada paso.', when: 'Problemas abiertos, número de pasos impredecible, entorno verificable (tests, compilador).', risk: 'Costo y errores compuestos: max_turns, checkpoints, sandbox y human-in-the-loop para acciones irreversibles.' },
];

export const QUESTIONS: [string, string][] = [
  ['q1', '¿Se resuelve bien con una sola llamada (más retrieval/tools)?'],
  ['q2', '¿Los pasos son conocidos y siempre en el mismo orden?'],
  ['q3', '¿Hay tipos de entrada distintos que requieren manejo distinto?'],
  ['q4', '¿Se divide en subtareas independientes entre sí?'],
  ['q5', '¿Las subtareas no se pueden prever hasta ver el problema?'],
  ['q6', '¿Hay criterios de calidad claros y conviene iterar?'],
  ['q7', '¿Requiere explorar con un número impredecible de pasos y tools?'],
];

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
