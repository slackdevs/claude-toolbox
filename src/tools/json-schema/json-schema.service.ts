import type { Localized } from '@/i18n';

// Validador JSON Schema mínimo (subset de draft 2020-12) suficiente para salidas de extracción.
export type Schema = boolean | { [k: string]: unknown };

export interface ValidationMessages {
  notAllowed: string;
  notInEnum: (v: string, e: string) => string;
  mustBe: (c: string) => string;
  expected: (types: string, got: string) => string;
  anyOf: string;
  oneOf: string;
  missing: (k: string) => string;
  extra: (k: string) => string;
  minItems: (n: number) => string;
  maxItems: (n: number) => string;
  minLength: (n: number) => string;
  maxLength: (n: number) => string;
  pattern: (p: string) => string;
  minimum: (n: number) => string;
  maximum: (n: number) => string;
}

export const VALIDATION_MESSAGES: Localized<ValidationMessages> = {
  es: {
    notAllowed: 'no permitido',
    notInEnum: (v, e) => `${v} no está en enum ${e}`,
    mustBe: (c) => `debe ser ${c}`,
    expected: (ts, got) => `se esperaba ${ts}, llegó ${got}`,
    anyOf: 'no cumple ninguna opción de anyOf',
    oneOf: 'debe cumplir exactamente una opción de oneOf',
    missing: (k) => `falta la propiedad requerida "${k}"`,
    extra: (k) => `propiedad no permitida "${k}"`,
    minItems: (n) => `mínimo ${n} elementos`,
    maxItems: (n) => `máximo ${n} elementos`,
    minLength: (n) => `longitud mínima ${n}`,
    maxLength: (n) => `longitud máxima ${n}`,
    pattern: (p) => `no cumple pattern ${p}`,
    minimum: (n) => `menor que minimum ${n}`,
    maximum: (n) => `mayor que maximum ${n}`,
  },
  en: {
    notAllowed: 'not allowed',
    notInEnum: (v, e) => `${v} is not in enum ${e}`,
    mustBe: (c) => `must be ${c}`,
    expected: (ts, got) => `expected ${ts}, got ${got}`,
    anyOf: 'does not match any anyOf option',
    oneOf: 'must match exactly one oneOf option',
    missing: (k) => `missing required property "${k}"`,
    extra: (k) => `property not allowed "${k}"`,
    minItems: (n) => `at least ${n} items`,
    maxItems: (n) => `at most ${n} items`,
    minLength: (n) => `minimum length ${n}`,
    maxLength: (n) => `maximum length ${n}`,
    pattern: (p) => `does not match pattern ${p}`,
    minimum: (n) => `less than minimum ${n}`,
    maximum: (n) => `greater than maximum ${n}`,
  },
};

export const typeName = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;

const typeOk = (t: string, v: unknown) => {
  const n = typeName(v);
  return t === n || (t === 'number' && n === 'integer');
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function validate(
  schema: Schema | undefined,
  v: unknown,
  path = '$',
  errs: string[] = [],
  m: ValidationMessages = VALIDATION_MESSAGES.es,
): string[] {
  if (schema === true || schema == null) return errs;
  if (schema === false) {
    errs.push(`${path}: ${m.notAllowed}`);
    return errs;
  }
  const s = schema as Record<string, unknown>;
  if (Array.isArray(s.enum) && !s.enum.some((e) => same(e, v))) errs.push(`${path}: ${m.notInEnum(JSON.stringify(v), JSON.stringify(s.enum))}`);
  if ('const' in s && !same(s.const, v)) errs.push(`${path}: ${m.mustBe(JSON.stringify(s.const))}`);
  if (s.type) {
    const ts = ([] as string[]).concat(s.type as string | string[]);
    if (!ts.some((t) => typeOk(t, v))) {
      errs.push(`${path}: ${m.expected(ts.join('|'), typeName(v))}`);
      return errs;
    }
  }
  if (Array.isArray(s.anyOf) && !s.anyOf.some((x) => !validate(x as Schema, v, path, [], m).length)) errs.push(`${path}: ${m.anyOf}`);
  if (Array.isArray(s.oneOf) && s.oneOf.filter((x) => !validate(x as Schema, v, path, [], m).length).length !== 1) errs.push(`${path}: ${m.oneOf}`);

  const t = typeName(v);
  if (t === 'object') {
    const o = v as Record<string, unknown>;
    ((s.required as string[]) ?? []).forEach((k) => { if (!(k in o)) errs.push(`${path}: ${m.missing(k)}`); });
    const props = (s.properties as Record<string, Schema>) ?? {};
    Object.keys(o).forEach((k) => {
      if (props[k] !== undefined) validate(props[k], o[k], `${path}.${k}`, errs, m);
      else if (s.additionalProperties === false) errs.push(`${path}: ${m.extra(k)}`);
      else if (typeof s.additionalProperties === 'object') validate(s.additionalProperties as Schema, o[k], `${path}.${k}`, errs, m);
    });
  }
  if (t === 'array') {
    const a = v as unknown[];
    if (s.items !== undefined) a.forEach((x, i) => validate(s.items as Schema, x, `${path}[${i}]`, errs, m));
    if (typeof s.minItems === 'number' && a.length < s.minItems) errs.push(`${path}: ${m.minItems(s.minItems)}`);
    if (typeof s.maxItems === 'number' && a.length > s.maxItems) errs.push(`${path}: ${m.maxItems(s.maxItems)}`);
  }
  if (t === 'string') {
    const str = v as string;
    if (typeof s.minLength === 'number' && str.length < s.minLength) errs.push(`${path}: ${m.minLength(s.minLength)}`);
    if (typeof s.maxLength === 'number' && str.length > s.maxLength) errs.push(`${path}: ${m.maxLength(s.maxLength)}`);
    if (typeof s.pattern === 'string') {
      try {
        if (!new RegExp(s.pattern).test(str)) errs.push(`${path}: ${m.pattern(s.pattern)}`);
      } catch { /* pattern inválido */ }
    }
  }
  if (t === 'integer' || t === 'number') {
    const x = v as number;
    if (typeof s.minimum === 'number' && x < s.minimum) errs.push(`${path}: ${m.minimum(s.minimum)}`);
    if (typeof s.maximum === 'number' && x > s.maximum) errs.push(`${path}: ${m.maximum(s.maximum)}`);
  }
  return errs;
}

/** Infiere un schema estricto a partir de un valor de ejemplo. */
export function inferSchema(v: unknown): Record<string, unknown> {
  const t = typeName(v);
  if (t === 'object') {
    const o = v as Record<string, unknown>;
    const props: Record<string, unknown> = {};
    Object.keys(o).forEach((k) => (props[k] = inferSchema(o[k])));
    return { type: 'object', properties: props, required: Object.keys(o), additionalProperties: false };
  }
  if (t === 'array') {
    const a = v as unknown[];
    return { type: 'array', items: a.length ? inferSchema(a[0]) : {} };
  }
  return { type: t };
}

/** Extrae JSON de un bloque <result> o ```json si el modelo devolvió texto alrededor. */
export function extractJson(raw: string): { text: string; extracted: boolean } {
  const m = raw.match(/<result>([\s\S]*?)<\/result>/) ?? raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return m ? { text: m[1]!, extracted: true } : { text: raw, extracted: false };
}
