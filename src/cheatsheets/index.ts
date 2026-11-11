// Registro de cheatsheets: uno por credencial. El contenido vive en docs/Cheatsheets/*.md (única fuente):
// la app lo carga de forma diferida y scripts/seo.ts lo lee en el build para generar el HTML estático.
import type { Localized } from '@/i18n';
import { CERT_KEYS, type CertKey } from '@/lib/certs';
import { parseMarkdown, type Block } from '@/lib/markdown';

export interface Cheatsheet {
  cert: CertKey;
  /** Segmento de la URL: /cheatsheets/<slug>/ */
  slug: string;
  /** Archivo dentro de docs/Cheatsheets/. */
  source: string;
  /** Fecha de última revisión del contenido (ISO, tomada del documento fuente). */
  reviewedAt: string;
  summary: Localized;
}

/** Carpeta de las fuentes, relativa a la raíz del repo. */
export const CHEATSHEETS_DIR = 'docs/Cheatsheets';

// TODO(Sebastián): link a la guía oficial de cada examen. Por ahora, el catálogo de Anthropic Academy.
export const OFFICIAL_GUIDE_URL: Record<CertKey, string> = {
  A: 'https://anthropic.skilljar.com/',
  D: 'https://anthropic.skilljar.com/',
  AF: 'https://anthropic.skilljar.com/',
  AP: 'https://anthropic.skilljar.com/',
  B: 'https://anthropic.skilljar.com/',
};

/** Documentación oficial citada por los propios cheatsheets. */
export const OFFICIAL_DOCS: { name: string; url: string; about: Localized }[] = [
  { name: 'docs.claude.com', url: 'https://docs.claude.com/', about: { es: 'Documentación de Claude y la Claude API', en: 'Claude and Claude API documentation' } },
  { name: 'platform.claude.com/docs', url: 'https://platform.claude.com/docs', about: { es: 'Modelos, precios y referencia de la API', en: 'Models, pricing and API reference' } },
  { name: 'code.claude.com/docs', url: 'https://code.claude.com/docs', about: { es: 'Documentación de Claude Code', en: 'Claude Code documentation' } },
];

const DATA: Record<CertKey, Omit<Cheatsheet, 'cert'>> = {
  A: {
    slug: 'ccao-f', source: 'Cheatsheet - Claude Certified Associate - Foundations.md', reviewedAt: '2026-11-09',
    summary: {
      es: 'Operar Claude sin programar: elegir dónde y con qué trabajar, especificar la tarea, validar lo que vuelve, delegar, configurar el entorno del equipo y gobernar el uso.',
      en: 'Operating Claude without coding: choosing where and with what to work, specifying the task, validating output, delegating, configuring the team environment and governing usage.',
    },
  },
  D: {
    slug: 'ccdv-f', source: 'Cheatsheet - Claude Certified Developer - Foundations.md', reviewedAt: '2026-11-10',
    summary: {
      es: 'Llevar una integración con Claude de prototipo a producción: API, prompting, tools, agentes, Claude Code, MCP, evals y seguridad.',
      en: 'Taking a Claude integration from prototype to production: API, prompting, tools, agents, Claude Code, MCP, evals and security.',
    },
  },
  AF: {
    slug: 'ccar-f', source: 'Cheatsheet - Claude Certified Architect - Foundations.md', reviewedAt: '2026-11-10',
    summary: {
      es: 'Diseñar, construir y defender soluciones con Claude: API, tools, RAG, MCP, agentes y Claude Code.',
      en: 'Designing, building and defending solutions with Claude: API, tools, RAG, MCP, agents and Claude Code.',
    },
  },
  AP: {
    slug: 'ccar-p', source: 'Cheatsheet - Claude Certified Architect - Professional.md', reviewedAt: '2026-11-10',
    summary: {
      es: 'Convertir un pedido ambiguo de un partner en una solución con Claude que pasa la revisión de seguridad, logra la aprobación de los stakeholders y sobrevive al handoff.',
      en: 'Turning an ambiguous partner request into a Claude solution that passes security review, wins stakeholder approval and survives the handoff.',
    },
  },
  B: {
    slug: 'badge-cc', source: 'Cheatsheet- Claude Partner Badge Claude Code.md', reviewedAt: '2026-11-10',
    summary: {
      es: 'Desplegar, gobernar y medir Claude Code en un cliente durante una activación de 30 días.',
      en: 'Deploying, governing and measuring Claude Code at a client during a 30-day activation.',
    },
  },
};

export const cheatsheets: Cheatsheet[] = CERT_KEYS.map((cert) => ({ cert, ...DATA[cert] }));

export const findCheatsheet = (slug: string) => cheatsheets.find((c) => c.slug === slug);

export const cheatsheetPath = (cert: CertKey) => `/cheatsheets/${DATA[cert].slug}`;

export interface CheatsheetDoc {
  blocks: Block[];
  /** Secciones de primer nivel (títulos ##), para el índice. */
  sections: { id: string; text: string }[];
}

/**
 * Parsea la fuente de un cheatsheet. Quita el título y la línea de fecha y autor del documento,
 * porque la página ya los muestra en su cabecera.
 */
export function parseCheatsheet(markdown: string): CheatsheetDoc {
  const blocks = parseMarkdown(markdown, { full: true });
  if (blocks[0]?.t === 'h' && blocks[0].level === 1) blocks.shift();
  const first = blocks[0];
  if (first?.t === 'p' && first.c.length === 1 && first.c[0]!.t === 'text' && /^\w{3} \d{1,2}, \d{4} · /.test(first.c[0]!.v)) blocks.shift();
  const sections = blocks.flatMap((b) => (b.t === 'h' && b.level === 2 ? [{ id: b.id, text: b.text }] : []));
  return { blocks, sections };
}

const sources = import.meta.glob<string>('/docs/Cheatsheets/*.md', { query: '?raw', import: 'default' });

export async function loadCheatsheet(sheet: Cheatsheet): Promise<CheatsheetDoc> {
  const load = sources[`/${CHEATSHEETS_DIR}/${sheet.source}`];
  if (!load) throw new Error(`Cheatsheet sin fuente: ${sheet.source}`);
  return parseCheatsheet(await load());
}
