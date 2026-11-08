import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Referencia de errores y stop_reason',
  path: '/errores',
  description: 'Códigos HTTP, tipos de error, valores de stop_reason y cómo manejarlos en producción y en loops agénticos.',
  keywords: ['429', '529', 'retry', 'backoff', 'overloaded'],
  icon: '!',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 7,
  component: () => import('./errores.vue'),
});
