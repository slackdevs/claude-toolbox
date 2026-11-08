import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Validador de JSON Schema',
  path: '/json-schema',
  description: 'Valida la salida de Claude contra un schema (extracción, structured output) y genera un schema a partir de un ejemplo.',
  keywords: ['validación', 'structured output', 'extracción', 'schema'],
  icon: '{}',
  category: 'tools',
  certs: ['D', 'AF'],
  order: 2,
  component: () => import('./json-schema.vue'),
});
