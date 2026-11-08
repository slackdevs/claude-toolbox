import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Estimador de tokens',
  path: '/tokens',
  description: 'Estimación rápida de tokens, % de ventana de contexto y costo de entrada. Incluye snippet de count_tokens para el valor exacto.',
  keywords: ['count_tokens', 'tokenizer', 'caracteres'],
  icon: '#',
  category: 'api',
  certs: ['A', 'D', 'AF'],
  order: 2,
  component: () => import('./tokens.vue'),
});
