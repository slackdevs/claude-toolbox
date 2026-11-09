import type { Localized } from '@/i18n';
import type { CategoryKey, Tool } from './tool';

export const categories: { key: CategoryKey; name: Localized }[] = [
  { key: 'api', name: { es: 'API, costos y tokens', en: 'API, costs and tokens' } },
  { key: 'prompt', name: { es: 'Prompts y evaluación', en: 'Prompts and evaluation' } },
  { key: 'tools', name: { es: 'Tools, MCP y salida estructurada', en: 'Tools, MCP and structured output' } },
  { key: 'code', name: { es: 'Claude Code', en: 'Claude Code' } },
  { key: 'arch', name: { es: 'Arquitectura y certificación', en: 'Architecture and certification' } },
];

// Registro automático: cada carpeta src/tools/<nombre>/index.ts exporta `tool`.
const modules = import.meta.glob<{ tool: Tool }>('./*/index.ts', { eager: true });

const catOrder = (c: CategoryKey) => categories.findIndex((x) => x.key === c);

export const tools: Tool[] = Object.values(modules)
  .map((m) => m.tool)
  .sort((a, b) => catOrder(a.category) - catOrder(b.category) || (a.order ?? 99) - (b.order ?? 99) || a.name.es.localeCompare(b.name.es));

export const toolsByCategory = categories.map((c) => ({ ...c, tools: tools.filter((t) => t.category === c.key) }));

export const findTool = (path: string) => tools.find((t) => t.path === path);
