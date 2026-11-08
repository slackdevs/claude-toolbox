import type { CategoryKey, Tool } from './tool';

export const categories: { key: CategoryKey; name: string }[] = [
  { key: 'api', name: 'API, costos y tokens' },
  { key: 'prompt', name: 'Prompts y evaluación' },
  { key: 'tools', name: 'Tools, MCP y salida estructurada' },
  { key: 'code', name: 'Claude Code' },
  { key: 'arch', name: 'Arquitectura y certificación' },
];

// Registro automático: cada carpeta src/tools/<nombre>/index.ts exporta `tool`.
const modules = import.meta.glob<{ tool: Tool }>('./*/index.ts', { eager: true });

const catOrder = (c: CategoryKey) => categories.findIndex((x) => x.key === c);

export const tools: Tool[] = Object.values(modules)
  .map((m) => m.tool)
  .sort((a, b) => catOrder(a.category) - catOrder(b.category) || (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));

export const toolsByCategory = categories.map((c) => ({ ...c, tools: tools.filter((t) => t.category === c.key) }));

export const findTool = (path: string) => tools.find((t) => t.path === path);
