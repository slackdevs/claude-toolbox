import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de requests Messages API', en: 'Messages API request builder' },
  path: '/request',
  description: {
    es: 'Armá un request a /v1/messages y obtené cURL, Python y TypeScript listos, con caching del system prompt y streaming.',
    en: 'Build a /v1/messages request and get ready-to-use cURL, Python and TypeScript, with system prompt caching and streaming.',
  },
  keywords: ['curl', 'python', 'typescript', 'sdk', 'messages'],
  icon: '⇄',
  category: 'api',
  certs: ['D', 'AF'],
  order: 4,
  component: () => import('./request.vue'),
});
