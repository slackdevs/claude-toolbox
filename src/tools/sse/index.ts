import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Visor de streaming SSE', en: 'SSE stream viewer' },
  path: '/sse',
  description: {
    es: 'Pegá un stream crudo de la API y reconstruí texto, inputs de tool_use, thinking, stop_reason y uso de tokens.',
    en: 'Paste a raw API stream and rebuild the text, tool_use inputs, thinking, stop_reason and token usage.',
  },
  keywords: ['stream', 'eventos', 'delta', 'events'],
  icon: '⋯',
  category: 'api',
  certs: ['D'],
  order: 6,
  component: () => import('./sse.vue'),
});
