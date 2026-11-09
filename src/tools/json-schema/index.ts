import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Validador de JSON Schema', en: 'JSON Schema validator' },
  path: '/json-schema',
  description: {
    es: 'Valida la salida de Claude contra un schema (extracción, structured output) y genera un schema a partir de un ejemplo.',
    en: 'Validates Claude output against a schema (extraction, structured output) and generates a schema from an example.',
  },
  keywords: ['validación', 'structured output', 'extracción', 'schema', 'validation', 'extraction'],
  icon: '{}',
  category: 'tools',
  certs: ['D', 'AF'],
  order: 2,
  component: () => import('./json-schema.vue'),
});
