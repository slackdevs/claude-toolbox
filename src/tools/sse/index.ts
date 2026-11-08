import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Visor de streaming SSE',
  path: '/sse',
  description: 'Pegá un stream crudo de la API y reconstruí texto, inputs de tool_use, thinking, stop_reason y uso de tokens.',
  keywords: ['stream', 'eventos', 'delta'],
  icon: '⋯',
  category: 'api',
  certs: ['D'],
  order: 6,
  component: () => import('./sse.vue'),
});
