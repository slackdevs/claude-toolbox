import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Generador de CLAUDE.md', en: 'CLAUDE.md generator' },
  path: '/claude-md',
  description: {
    es: 'Memoria de proyecto concisa: comandos, arquitectura, estilo y reglas de flujo. Incluye guía de jerarquía y reglas por ruta.',
    en: 'Concise project memory: commands, architecture, style and workflow rules. Includes a guide to the hierarchy and path-scoped rules.',
  },
  keywords: ['memoria', 'memory', 'rules', 'init'],
  icon: '▣',
  category: 'code',
  certs: ['AF', 'B'],
  order: 1,
  component: () => import('./claude-md.vue'),
});
