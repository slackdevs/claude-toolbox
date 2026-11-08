import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Calculadora de costos API',
  path: '/costos',
  description: 'Costo por request, día y mes por modelo, con prompt caching y Batch API. Compara los 4 modelos.',
  keywords: ['precio', 'pricing', 'cache', 'batch', 'presupuesto'],
  icon: '$',
  category: 'api',
  certs: ['A', 'D', 'AF', 'AP', 'B'],
  order: 1,
  component: () => import('./costos.vue'),
});
