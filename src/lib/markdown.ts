// Parser mínimo de Markdown a un árbol propio. No produce ni acepta HTML: todo lo que no reconoce queda como texto.
// Sin dependencias (ni de Vue ni del navegador): lo usan MarkdownView y scripts/seo.ts.
//
// Dos perfiles:
// - simple (por defecto): párrafos, listas, negrita, cursiva, código en línea y links. Para texto de usuarios.
// - full: además títulos con id, tablas, bloques de código, citas, separadores y links internos (#ancla). Para cheatsheets.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'code'; v: string }
  | { t: 'br' }
  | { t: 'strong' | 'em'; c: Inline[] }
  | { t: 'link'; href: string; c: Inline[] };

export interface ListItem {
  /** true/false en listas de tareas ("- [ ]"); undefined en el resto. */
  checked?: boolean;
  c: Block[];
}

export type Block =
  | { t: 'p'; c: Inline[] }
  | { t: 'h'; level: number; id: string; text: string; c: Inline[] }
  | { t: 'list'; ordered: boolean; start: number; items: ListItem[] }
  | { t: 'pre'; lang: string; v: string }
  | { t: 'table'; head: Inline[][]; rows: Inline[][][] }
  | { t: 'quote'; c: Block[] }
  | { t: 'hr' };

export interface MarkdownOptions {
  full?: boolean;
}

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;
const ITEM_RE = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const FENCE_RE = /^\s*(`{3,}|~{3,})\s*([\w+-]*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Texto plano de una secuencia de inlines (para ids, índices y extractos). */
export function inlineText(nodes: Inline[]): string {
  return nodes.map((n) => (n.t === 'text' || n.t === 'code' ? n.v : n.t === 'br' ? ' ' : inlineText(n.c))).join('');
}

/** Mismo criterio que los anclajes de GitHub: "D. Tools & Commands" → "d-tools--commands". */
export function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

export function parseInline(s: string, opts: MarkdownOptions = {}): Inline[] {
  const out: Inline[] = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push({ t: 'text', v: buf });
    buf = '';
  };
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    const next = s[i + 1];

    if (ch === '\\' && next && /[\\`*_{}[\]()#+\-.!~|<>]/.test(next)) {
      buf += next;
      i += 2;
      continue;
    }

    if (ch === '`') {
      const ticks = /^`+/.exec(s.slice(i))![0];
      const end = s.indexOf(ticks, i + ticks.length);
      if (end !== -1) {
        flush();
        out.push({ t: 'code', v: s.slice(i + ticks.length, end).trim() });
        i = end + ticks.length;
        continue;
      }
    }

    if (ch === '*' && next === '*') {
      const end = s.indexOf('**', i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: 'strong', c: parseInline(s.slice(i + 2, end), opts) });
        i = end + 2;
        continue;
      }
    }

    // Cursiva: *texto* o _texto_ (el guion bajo sólo en borde de palabra, para no romper nombres_con_guiones).
    if ((ch === '*' || ch === '_') && next && next !== ch && !/\s/.test(next) && (ch === '*' || i === 0 || /[\s([{"'¿¡>]/.test(s[i - 1]!))) {
      let end = i + 1;
      for (;;) {
        end = s.indexOf(ch, end + 1);
        if (end === -1) break;
        const after = s[end + 1];
        if (!/\s/.test(s[end - 1]!) && s[end - 1] !== '\\' && (ch === '*' || !after || !/[\p{L}\p{N}]/u.test(after))) break;
      }
      if (end !== -1) {
        flush();
        out.push({ t: 'em', c: parseInline(s.slice(i + 1, end), opts) });
        i = end + 1;
        continue;
      }
    }

    if (ch === '[') {
      const m = /^\[((?:[^[\]\\]|\\.)*)\]\(([^()\s]+)\)/.exec(s.slice(i));
      if (m) {
        const href = m[2]!;
        const label = parseInline(m[1]!, opts);
        flush();
        if (SAFE_HREF.test(href) || (opts.full && /^#[\w-]+$/.test(href))) out.push({ t: 'link', href, c: label });
        else out.push(...label); // destino no permitido: queda sólo el texto
        i += m[0].length;
        continue;
      }
    }

    if (opts.full && ch === '<') {
      const m = /^<br\s*\/?>/i.exec(s.slice(i));
      if (m) {
        flush();
        out.push({ t: 'br' });
        i += m[0].length;
        continue;
      }
    }

    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** Divide una fila de tabla por barras que no estén escapadas ni dentro de código en línea. */
function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  const s = line.trim();
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (ch === '\\' && s[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (ch === '`') {
      inCode = !inCode;
      cur += ch;
    } else if (ch === '|' && !inCode) {
      cells.push(cur);
      cur = '';
    } else cur += ch;
  }
  cells.push(cur);
  if (s.startsWith('|')) cells.shift();
  if (s.endsWith('|') && !s.endsWith('\\|')) cells.pop();
  return cells.map((c) => c.trim());
}

const indentOf = (line: string) => /^\s*/.exec(line)![0].length;

export function parseMarkdown(src: string, opts: MarkdownOptions = {}): Block[] {
  const used = new Map<string, number>();
  const uniqueId = (text: string) => {
    const base = slugify(text) || 'seccion';
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };

  function blocks(lines: string[]): Block[] {
    const out: Block[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i]!;
      if (!line.trim()) {
        i++;
        continue;
      }

      if (opts.full) {
        const fence = FENCE_RE.exec(line);
        if (fence) {
          const close = new RegExp(`^\\s*${fence[1]![0]}{${fence[1]!.length},}\\s*$`);
          const body: string[] = [];
          i++;
          while (i < lines.length && !close.test(lines[i]!)) body.push(lines[i++]!);
          i++;
          out.push({ t: 'pre', lang: fence[2] ?? '', v: body.join('\n') });
          continue;
        }

        const heading = HEADING_RE.exec(line);
        if (heading) {
          const c = parseInline(heading[2]!, opts);
          const text = inlineText(c);
          out.push({ t: 'h', level: heading[1]!.length, id: uniqueId(text), text, c });
          i++;
          continue;
        }

        if (HR_RE.test(line)) {
          out.push({ t: 'hr' });
          i++;
          continue;
        }

        if (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1]!)) {
          const head = splitRow(line).map((c) => parseInline(c, opts));
          const rows: Inline[][][] = [];
          i += 2;
          while (i < lines.length && lines[i]!.trim() && lines[i]!.includes('|')) {
            const cells = splitRow(lines[i++]!);
            rows.push(head.map((_, k) => parseInline(cells[k] ?? '', opts)));
          }
          out.push({ t: 'table', head, rows });
          continue;
        }

        if (/^\s*>/.test(line)) {
          const body: string[] = [];
          while (i < lines.length && /^\s*>/.test(lines[i]!)) body.push(lines[i++]!.replace(/^\s*>\s?/, ''));
          out.push({ t: 'quote', c: blocks(body) });
          continue;
        }
      }

      const item = ITEM_RE.exec(line);
      if (item) {
        const base = item[1]!.length;
        const ordered = /\d/.test(item[2]!);
        const list: Block = { t: 'list', ordered, start: ordered ? parseInt(item[2]!, 10) : 1, items: [] };
        while (i < lines.length) {
          const m = ITEM_RE.exec(lines[i]!);
          if (!m || m[1]!.length !== base || /\d/.test(m[2]!) !== ordered) break;
          // El ítem incluye las líneas siguientes con más sangría (sublistas, párrafos de continuación).
          const content = base + m[2]!.length + 1;
          const body = [m[3]!];
          i++;
          while (i < lines.length) {
            const l = lines[i]!;
            if (!l.trim()) {
              const nextLine = lines.slice(i + 1).find((x) => x.trim());
              if (nextLine === undefined || indentOf(nextLine) <= base) break;
              body.push('');
            } else if (indentOf(l) > base) body.push(l.slice(Math.min(indentOf(l), content)));
            else break;
            i++;
          }
          const task = /^\[([ xX])\]\s+/.exec(body[0]!);
          if (task) body[0] = body[0]!.slice(task[0].length);
          list.items.push({ checked: task ? task[1] !== ' ' : undefined, c: blocks(body) });
          // Línea en blanco entre ítems de la misma lista.
          let j = i;
          while (j < lines.length && !lines[j]!.trim()) j++;
          const again = j < lines.length ? ITEM_RE.exec(lines[j]!) : null;
          if (again && again[1]!.length === base && /\d/.test(again[2]!) === ordered) i = j;
        }
        out.push(list);
        continue;
      }

      // Párrafo: hasta una línea en blanco o el comienzo de otro bloque.
      const para: string[] = [];
      while (i < lines.length && lines[i]!.trim()) {
        const l = lines[i]!;
        if (para.length && (ITEM_RE.test(l) || (opts.full && (FENCE_RE.test(l) || HEADING_RE.test(l) || /^\s*>/.test(l) || HR_RE.test(l))))) break;
        para.push(l.trim());
        i++;
      }
      out.push({ t: 'p', c: parseInline(para.join(' '), opts) });
    }
    return out;
  }

  return blocks(src.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n'));
}

/** Texto plano del documento, sin formato (para extractos y búsquedas). */
export function plainText(nodes: Block[]): string {
  return nodes
    .map((b): string => {
      switch (b.t) {
        case 'p': case 'h': return inlineText(b.c);
        case 'list': return b.items.map((it) => plainText(it.c)).join(' ');
        case 'quote': return plainText(b.c);
        case 'pre': return b.v;
        case 'table': return [b.head, ...b.rows].map((r) => r.map(inlineText).join(' ')).join(' ');
        default: return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function inlineHtml(nodes: Inline[]): string {
  return nodes
    .map((n): string => {
      switch (n.t) {
        case 'text': return esc(n.v);
        case 'code': return `<code>${esc(n.v)}</code>`;
        case 'br': return '<br>';
        case 'link': return `<a href="${esc(n.href)}"${n.href.startsWith('#') ? '' : ' rel="noopener nofollow"'}>${inlineHtml(n.c)}</a>`;
        default: return `<${n.t}>${inlineHtml(n.c)}</${n.t}>`;
      }
    })
    .join('');
}

/** HTML estático del árbol, con todo el texto escapado. Para el build de SEO (no se usa en la app). */
export function toHtml(nodes: Block[]): string {
  return nodes
    .map((b): string => {
      switch (b.t) {
        case 'p': return `<p>${inlineHtml(b.c)}</p>`;
        case 'h': return `<h${b.level} id="${esc(b.id)}">${inlineHtml(b.c)}</h${b.level}>`;
        case 'hr': return '<hr>';
        case 'pre': return `<pre><code>${esc(b.v)}</code></pre>`;
        case 'quote': return `<blockquote>${toHtml(b.c)}</blockquote>`;
        case 'list': {
          const tag = b.ordered ? 'ol' : 'ul';
          const items = b.items.map((it) => `<li>${it.checked === undefined ? '' : it.checked ? '☑ ' : '☐ '}${itemHtml(it.c)}</li>`).join('');
          return `<${tag}${b.ordered && b.start !== 1 ? ` start="${b.start}"` : ''}>${items}</${tag}>`;
        }
        case 'table':
          return `<table><thead><tr>${b.head.map((c) => `<th>${inlineHtml(c)}</th>`).join('')}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      }
    })
    .join('\n');
}

/** Un ítem con un solo párrafo se escribe sin <p>, como en una lista "compacta". */
function itemHtml(c: Block[]): string {
  const [first, ...rest] = c;
  if (first?.t === 'p') return inlineHtml(first.c) + toHtml(rest);
  return toHtml(c);
}
