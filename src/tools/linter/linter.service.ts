import type { Lint } from '@/lib/types';

export interface LintResult { score: number; items: Lint[] }

const ALLOWED_CAPS = /^(JSON|XML|HTML|API|HTTP|CSV|YAML|SQL|URL|INPUT|UUID)$/;

/** Heurísticas de buenas prácticas de prompting. No reemplaza a una eval real. */
export function lintPrompt(t: string): LintResult {
  const items: Lint[] = [];
  let s = 100;
  const bad = (m: string, p: number) => { items.push(['bad', m]); s -= p; };
  const warn = (m: string, p: number) => { items.push(['warn', m]); s -= p; };
  const ok = (m: string) => items.push(['ok', m]);

  if (t.trim().length < 80) bad('Muy corto: falta contexto (quién es la audiencia, para qué se usa, qué es “bueno”).', 20);
  else ok('Longitud razonable.');

  const caps = (t.match(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/g) ?? []).filter((w) => !ALLOWED_CAPS.test(w));
  if (caps.length >= 2) warn(`Énfasis excesivo (${caps.slice(0, 5).join(', ')}): los modelos actuales siguen instrucciones con precisión; el énfasis en mayúsculas puede provocar sobre-aplicación. Explicá el porqué en tono normal.`, 12);

  const neg = (t.match(/\b(no|nunca|jamás|don't|never|do not|evita)\b/gi) ?? []).length;
  const pos = (t.match(/\b(usa|escribe|responde|incluye|devuelve|use|write|include|return)\b/gi) ?? []).length;
  if (neg > pos && neg >= 2) warn(`Predominan instrucciones negativas (${neg} vs ${pos}). Decí qué hacer en lugar de qué no hacer: “Responde en prosa fluida” en vez de “No uses markdown”.`, 10);

  const vague = t.match(/\b(algo|cosas|etc\.?|bueno|bien|something|stuff|good|nice)\b/gi) ?? [];
  if (vague.length) warn(`Términos vagos: ${[...new Set(vague.map((v) => v.toLowerCase()))].join(', ')}. Definí criterios concretos y medibles.`, 8 + Math.min(vague.length, 3) * 2);

  if (!/(formato|format|json|xml|markdown|tabla|lista|bullet|párrafo|<output|schema)/i.test(t)) warn('No se especifica formato de salida. Indicalo (y si es JSON, considerá tool use con input_schema o structured outputs).', 12);
  else ok('Define formato de salida.');

  if (!/(ejemplo|example|<example)/i.test(t)) warn('Sin ejemplos: 2–5 ejemplos variados (few-shot) mejoran mucho la consistencia, sobre todo en clasificación y extracción.', 10);
  else ok('Incluye ejemplos.');

  if (!/(porque|para que|ya que|el objetivo|se usará|because|so that|the goal|audiencia|audience)/i.test(t)) warn('No explica el propósito. Dar el “por qué” ayuda a Claude a generalizar a casos no previstos.', 8);
  else ok('Explica el propósito/contexto.');

  if (t.length > 1500 && !/<\w+>/.test(t)) warn('Prompt largo sin etiquetas XML: separá datos, instrucciones y ejemplos con &lt;documents&gt;, &lt;instructions&gt;, &lt;examples&gt;.', 10);
  else if (/<\w+>/.test(t)) ok('Usa etiquetas XML para estructurar.');

  if (/<documents?/i.test(t)) {
    const iDoc = t.search(/<documents?/i), iQ = t.search(/\?|tarea|task|pregunta/i);
    if (iQ > -1 && iQ < iDoc) warn('Con documentos largos, poné los documentos primero y la pregunta/tarea al final.', 6);
  }

  const vars = [...new Set(t.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? [])];
  if (vars.length) ok(`Variables de plantilla detectadas: ${vars.join(', ')}.`);

  if (/(inventes|alucin|hallucinat|make up)/i.test(t) && !/(no sé|no lo sé|I don't know|si no (está|hay)|if .* not)/i.test(t))
    warn('Para reducir alucinaciones, dale una salida explícita: “Si la respuesta no está en el documento, di que no está”.', 6);

  const order = { bad: 0, warn: 1, ok: 2 };
  items.sort((a, b) => order[a[0]] - order[b[0]]);
  return { score: Math.max(0, Math.min(100, Math.round(s))), items };
}
