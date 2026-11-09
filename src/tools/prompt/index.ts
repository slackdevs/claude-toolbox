import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de prompts con XML', en: 'XML prompt builder' },
  path: '/prompt',
  description: {
    es: 'Estructura rol, contexto, documentos, instrucciones, ejemplos y formato de salida con etiquetas XML, documentos arriba y pregunta al final.',
    en: 'Structure role, context, documents, instructions, examples and output format with XML tags, documents first and the question last.',
  },
  keywords: ['xml', 'few-shot', 'system prompt', 'plantilla', 'template'],
  icon: '✎',
  category: 'prompt',
  certs: ['A', 'D', 'AF'],
  order: 1,
  component: () => import('./prompt.vue'),
});
