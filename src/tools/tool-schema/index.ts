import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de definiciones de tools', en: 'Tool definition builder' },
  path: '/tool-schema',
  description: {
    es: 'Diseñá una tool (nombre, descripción, parámetros, enums) y obtené el JSON para la API, con tool_choice y lint de calidad.',
    en: 'Design a tool (name, description, parameters, enums) and get the JSON for the API, with tool_choice and a quality lint.',
  },
  keywords: ['tool use', 'function calling', 'input_schema', 'tool_choice'],
  icon: '⚙',
  category: 'tools',
  certs: ['D', 'AF', 'AP'],
  order: 1,
  component: () => import('./tool-schema.vue'),
});
