export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const fmt = (n: number, d = 0): string =>
  Number(n).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const usd = (n: number): string =>
  '$' + (n >= 1 || n === 0 ? fmt(n, 2) : n >= 0.01 ? fmt(n, 4) : fmt(n, 5));

/** Convierte un valor de input (que puede ser '' o string) en número seguro. */
export const n = (v: unknown): number => {
  const x = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
};

export const lines = (s: string): string[] => s.split('\n').map((x) => x.trim()).filter(Boolean);

/** Comillas simples seguras para shell. */
export const shq = (s: string): string => "'" + String(s).replace(/'/g, "'\\''") + "'";

/** Escalar YAML: sin comillas si es seguro, si no como string JSON (válido en YAML). */
export const yamlStr = (s: string): string =>
  /^[\w .,()/-]*$/.test(s) && s && !/^\s|\s$/.test(s) ? s : JSON.stringify(s);

/** Serializa un valor JS como literal de Python. */
export function toPy(v: unknown, ind = 0): string {
  const p = '    '.repeat(ind + 1);
  const e = '    '.repeat(ind);
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return v.length ? '[\n' + v.map((x) => p + toPy(x, ind + 1)).join(',\n') + '\n' + e + ']' : '[]';
  const ks = Object.keys(v as object);
  return ks.length
    ? '{\n' + ks.map((k) => p + JSON.stringify(k) + ': ' + toPy((v as Record<string, unknown>)[k], ind + 1)).join(',\n') + '\n' + e + '}'
    : '{}';
}

/** Parsea líneas "KEY<sep>valor" a objeto. */
export function kvLines(s: string, sep: string): Record<string, string> {
  return Object.fromEntries(
    lines(s)
      .map((l) => {
        const i = l.indexOf(sep);
        return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ['', ''];
      })
      .filter((x) => x[0]),
  );
}
