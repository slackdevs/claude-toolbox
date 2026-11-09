import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Referencia de errores y stop_reason', en: 'Errors and stop_reason reference' },
  path: '/errores',
  description: {
    es: 'Códigos HTTP, tipos de error, valores de stop_reason y cómo manejarlos en producción y en loops agénticos.',
    en: 'HTTP codes, error types, stop_reason values and how to handle them in production and in agentic loops.',
  },
  keywords: ['429', '529', 'retry', 'backoff', 'overloaded', 'errors'],
  icon: '!',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 7,
  component: () => import('./errores.vue'),
});
