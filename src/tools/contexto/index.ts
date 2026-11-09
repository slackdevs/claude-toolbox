import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Presupuesto de ventana de contexto', en: 'Context window budget' },
  path: '/contexto',
  description: {
    es: 'Planificá cuánto ocupan system prompt, tools, documentos, historial y salida. Alertas de compactación y buenas prácticas.',
    en: 'Plan how much the system prompt, tools, documents, history and output take up. Compaction alerts and best practices.',
  },
  keywords: ['context window', 'compactación', 'historial', 'compaction', 'history'],
  icon: '▤',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 3,
  component: () => import('./contexto.vue'),
});
