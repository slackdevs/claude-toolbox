import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de prompts con XML',
  path: '/prompt',
  description: 'Estructura rol, contexto, documentos, instrucciones, ejemplos y formato de salida con etiquetas XML, documentos arriba y pregunta al final.',
  keywords: ['xml', 'few-shot', 'system prompt', 'plantilla'],
  icon: '✎',
  category: 'prompt',
  certs: ['A', 'D', 'AF'],
  order: 1,
  component: () => import('./prompt.vue'),
});
