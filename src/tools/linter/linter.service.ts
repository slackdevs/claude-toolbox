import type { Localized } from '@/i18n';
import type { Lint } from '@/lib/types';

export interface LintResult { score: number; items: Lint[] }

export interface LinterMessages {
  short: string;
  length: string;
  caps: (words: string) => string;
  negative: (neg: number, pos: number) => string;
  vague: (words: string) => string;
  noFormat: string;
  format: string;
  noExamples: string;
  examples: string;
  noPurpose: string;
  purpose: string;
  noXml: string;
  xml: string;
  docsOrder: string;
  vars: (v: string) => string;
  hallucination: string;
}

export const LINTER_MESSAGES: Localized<LinterMessages> = {
  es: {
    short: 'Muy corto: falta contexto (quién es la audiencia, para qué se usa, qué es “bueno”).',
    length: 'Longitud razonable.',
    caps: (w) => `Énfasis excesivo (${w}): los modelos actuales siguen instrucciones con precisión; el énfasis en mayúsculas puede provocar sobre-aplicación. Explicá el porqué en tono normal.`,
    negative: (neg, pos) => `Predominan instrucciones negativas (${neg} vs ${pos}). Decí qué hacer en lugar de qué no hacer: “Responde en prosa fluida” en vez de “No uses markdown”.`,
    vague: (w) => `Términos vagos: ${w}. Definí criterios concretos y medibles.`,
    noFormat: 'No se especifica formato de salida. Indicalo (y si es JSON, considerá tool use con input_schema o structured outputs).',
    format: 'Define formato de salida.',
    noExamples: 'Sin ejemplos: 2–5 ejemplos variados (few-shot) mejoran mucho la consistencia, sobre todo en clasificación y extracción.',
    examples: 'Incluye ejemplos.',
    noPurpose: 'No explica el propósito. Dar el “por qué” ayuda a Claude a generalizar a casos no previstos.',
    purpose: 'Explica el propósito/contexto.',
    noXml: 'Prompt largo sin etiquetas XML: separá datos, instrucciones y ejemplos con &lt;documents&gt;, &lt;instructions&gt;, &lt;examples&gt;.',
    xml: 'Usa etiquetas XML para estructurar.',
    docsOrder: 'Con documentos largos, poné los documentos primero y la pregunta/tarea al final.',
    vars: (v) => `Variables de plantilla detectadas: ${v}.`,
    hallucination: 'Para reducir alucinaciones, dale una salida explícita: “Si la respuesta no está en el documento, di que no está”.',
  },
  en: {
    short: 'Too short: context is missing (who the audience is, what it is used for, what “good” looks like).',
    length: 'Reasonable length.',
    caps: (w) => `Excessive emphasis (${w}): current models follow instructions precisely; all-caps emphasis can cause over-application. Explain the why in a normal tone.`,
    negative: (neg, pos) => `Negative instructions dominate (${neg} vs ${pos}). Say what to do instead of what not to do: “Respond in flowing prose” instead of “Don’t use markdown”.`,
    vague: (w) => `Vague terms: ${w}. Define concrete, measurable criteria.`,
    noFormat: 'No output format specified. State it (and if it is JSON, consider tool use with input_schema or structured outputs).',
    format: 'Defines the output format.',
    noExamples: 'No examples: 2–5 varied examples (few-shot) greatly improve consistency, especially for classification and extraction.',
    examples: 'Includes examples.',
    noPurpose: 'Does not explain the purpose. Giving the “why” helps Claude generalize to unforeseen cases.',
    purpose: 'Explains the purpose/context.',
    noXml: 'Long prompt without XML tags: separate data, instructions and examples with &lt;documents&gt;, &lt;instructions&gt;, &lt;examples&gt;.',
    xml: 'Uses XML tags for structure.',
    docsOrder: 'With long documents, put the documents first and the question/task at the end.',
    vars: (v) => `Template variables detected: ${v}.`,
    hallucination: 'To reduce hallucinations, give it an explicit way out: “If the answer is not in the document, say so”.',
  },
};

const ALLOWED_CAPS = /^(JSON|XML|HTML|API|HTTP|CSV|YAML|SQL|URL|INPUT|UUID)$/;

/** Heurísticas de buenas prácticas de prompting (detecta prompts en español e inglés). No reemplaza a una eval real. */
export function lintPrompt(t: string, m: LinterMessages = LINTER_MESSAGES.es): LintResult {
  const items: Lint[] = [];
  let s = 100;
  const bad = (msg: string, p: number) => { items.push(['bad', msg]); s -= p; };
  const warn = (msg: string, p: number) => { items.push(['warn', msg]); s -= p; };
  const ok = (msg: string) => items.push(['ok', msg]);

  if (t.trim().length < 80) bad(m.short, 20);
  else ok(m.length);

  const caps = (t.match(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/g) ?? []).filter((w) => !ALLOWED_CAPS.test(w));
  if (caps.length >= 2) warn(m.caps(caps.slice(0, 5).join(', ')), 12);

  const neg = (t.match(/\b(no|nunca|jamás|don't|never|do not|evita|avoid)\b/gi) ?? []).length;
  const pos = (t.match(/\b(usa|escribe|responde|incluye|devuelve|use|write|respond|include|return)\b/gi) ?? []).length;
  if (neg > pos && neg >= 2) warn(m.negative(neg, pos), 10);

  const vague = t.match(/\b(algo|cosas|etc\.?|bueno|bien|something|stuff|good|nice)\b/gi) ?? [];
  if (vague.length) warn(m.vague([...new Set(vague.map((v) => v.toLowerCase()))].join(', ')), 8 + Math.min(vague.length, 3) * 2);

  if (!/(formato|format|json|xml|markdown|tabla|table|lista|list|bullet|párrafo|paragraph|<output|schema)/i.test(t)) warn(m.noFormat, 12);
  else ok(m.format);

  if (!/(ejemplo|example|<example)/i.test(t)) warn(m.noExamples, 10);
  else ok(m.examples);

  if (!/(porque|para que|ya que|el objetivo|se usará|because|so that|the goal|will be used|audiencia|audience)/i.test(t)) warn(m.noPurpose, 8);
  else ok(m.purpose);

  if (t.length > 1500 && !/<\w+>/.test(t)) warn(m.noXml, 10);
  else if (/<\w+>/.test(t)) ok(m.xml);

  if (/<documents?/i.test(t)) {
    const iDoc = t.search(/<documents?/i), iQ = t.search(/\?|tarea|task|pregunta|question/i);
    if (iQ > -1 && iQ < iDoc) warn(m.docsOrder, 6);
  }

  const vars = [...new Set(t.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? [])];
  if (vars.length) ok(m.vars(vars.join(', ')));

  if (/(inventes|alucin|hallucinat|make up|made up)/i.test(t) && !/(no sé|no lo sé|I don't know|si no (está|hay)|if .* not)/i.test(t))
    warn(m.hallucination, 6);

  const order = { bad: 0, warn: 1, ok: 2 };
  items.sort((a, b) => order[a[0]] - order[b[0]]);
  return { score: Math.max(0, Math.min(100, Math.round(s))), items };
}
