// Validador JSON Schema mínimo (subset de draft 2020-12) suficiente para salidas de extracción.
export type Schema = boolean | { [k: string]: unknown };

export const typeName = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;

const typeOk = (t: string, v: unknown) => {
  const n = typeName(v);
  return t === n || (t === 'number' && n === 'integer');
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function validate(schema: Schema | undefined, v: unknown, path = '$', errs: string[] = []): string[] {
  if (schema === true || schema == null) return errs;
  if (schema === false) {
    errs.push(`${path}: no permitido`);
    return errs;
  }
  const s = schema as Record<string, unknown>;
  if (Array.isArray(s.enum) && !s.enum.some((e) => same(e, v))) errs.push(`${path}: ${JSON.stringify(v)} no está en enum ${JSON.stringify(s.enum)}`);
  if ('const' in s && !same(s.const, v)) errs.push(`${path}: debe ser ${JSON.stringify(s.const)}`);
  if (s.type) {
    const ts = ([] as string[]).concat(s.type as string | string[]);
    if (!ts.some((t) => typeOk(t, v))) {
      errs.push(`${path}: se esperaba ${ts.join('|')}, llegó ${typeName(v)}`);
      return errs;
    }
  }
  if (Array.isArray(s.anyOf) && !s.anyOf.some((x) => !validate(x as Schema, v, path, []).length)) errs.push(`${path}: no cumple ninguna opción de anyOf`);
  if (Array.isArray(s.oneOf) && s.oneOf.filter((x) => !validate(x as Schema, v, path, []).length).length !== 1) errs.push(`${path}: debe cumplir exactamente una opción de oneOf`);

  const t = typeName(v);
  if (t === 'object') {
    const o = v as Record<string, unknown>;
    ((s.required as string[]) ?? []).forEach((k) => { if (!(k in o)) errs.push(`${path}: falta la propiedad requerida "${k}"`); });
    const props = (s.properties as Record<string, Schema>) ?? {};
    Object.keys(o).forEach((k) => {
      if (props[k] !== undefined) validate(props[k], o[k], `${path}.${k}`, errs);
      else if (s.additionalProperties === false) errs.push(`${path}: propiedad no permitida "${k}"`);
      else if (typeof s.additionalProperties === 'object') validate(s.additionalProperties as Schema, o[k], `${path}.${k}`, errs);
    });
  }
  if (t === 'array') {
    const a = v as unknown[];
    if (s.items !== undefined) a.forEach((x, i) => validate(s.items as Schema, x, `${path}[${i}]`, errs));
    if (typeof s.minItems === 'number' && a.length < s.minItems) errs.push(`${path}: mínimo ${s.minItems} elementos`);
    if (typeof s.maxItems === 'number' && a.length > s.maxItems) errs.push(`${path}: máximo ${s.maxItems} elementos`);
  }
  if (t === 'string') {
    const str = v as string;
    if (typeof s.minLength === 'number' && str.length < s.minLength) errs.push(`${path}: longitud mínima ${s.minLength}`);
    if (typeof s.maxLength === 'number' && str.length > s.maxLength) errs.push(`${path}: longitud máxima ${s.maxLength}`);
    if (typeof s.pattern === 'string') {
      try {
        if (!new RegExp(s.pattern).test(str)) errs.push(`${path}: no cumple pattern ${s.pattern}`);
      } catch { /* pattern inválido */ }
    }
  }
  if (t === 'integer' || t === 'number') {
    const x = v as number;
    if (typeof s.minimum === 'number' && x < s.minimum) errs.push(`${path}: menor que minimum ${s.minimum}`);
    if (typeof s.maximum === 'number' && x > s.maximum) errs.push(`${path}: mayor que maximum ${s.maximum}`);
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
