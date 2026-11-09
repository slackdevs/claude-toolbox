import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Estimador de tokens', en: 'Token estimator' },
  path: '/tokens',
  description: {
    es: 'Estimación rápida de tokens, % de ventana de contexto y costo de entrada. Incluye snippet de count_tokens para el valor exacto.',
    en: 'Quick estimate of tokens, % of the context window and input cost. Includes a count_tokens snippet for the exact value.',
  },
  keywords: ['count_tokens', 'tokenizer', 'caracteres', 'characters'],
  icon: '#',
  category: 'api',
  certs: ['A', 'D', 'AF'],
  order: 2,
  component: () => import('./tokens.vue'),
});
