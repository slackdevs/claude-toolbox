import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Generador de CLAUDE.md',
  path: '/claude-md',
  description: 'Memoria de proyecto concisa: comandos, arquitectura, estilo y reglas de flujo. Incluye guía de jerarquía y reglas por ruta.',
  keywords: ['memoria', 'memory', 'rules', 'init'],
  icon: '▣',
  category: 'code',
  certs: ['AF', 'B'],
  order: 1,
  component: () => import('./claude-md.vue'),
});
