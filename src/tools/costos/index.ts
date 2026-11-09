import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Calculadora de costos API', en: 'API cost calculator' },
  path: '/costos',
  description: {
    es: 'Costo por request, día y mes por modelo, con prompt caching y Batch API. Compara los 4 modelos.',
    en: 'Cost per request, day and month per model, with prompt caching and the Batch API. Compares all 4 models.',
  },
  keywords: ['precio', 'pricing', 'cache', 'batch', 'presupuesto', 'price', 'budget'],
  icon: '$',
  category: 'api',
  certs: ['A', 'D', 'AF', 'AP', 'B'],
  order: 1,
  component: () => import('./costos.vue'),
});
