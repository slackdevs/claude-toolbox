import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de definiciones de tools',
  path: '/tool-schema',
  description: 'Diseñá una tool (nombre, descripción, parámetros, enums) y obtené el JSON para la API, con tool_choice y lint de calidad.',
  keywords: ['tool use', 'function calling', 'input_schema', 'tool_choice'],
  icon: '⚙',
  category: 'tools',
  certs: ['D', 'AF', 'AP'],
  order: 1,
  component: () => import('./tool-schema.vue'),
});
