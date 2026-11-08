import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Presupuesto de ventana de contexto',
  path: '/contexto',
  description: 'Planificá cuánto ocupan system prompt, tools, documentos, historial y salida. Alertas de compactación y buenas prácticas.',
  keywords: ['context window', 'compactación', 'historial'],
  icon: '▤',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 3,
  component: () => import('./contexto.vue'),
});
