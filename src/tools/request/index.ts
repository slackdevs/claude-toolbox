import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de requests Messages API',
  path: '/request',
  description: 'Armá un request a /v1/messages y obtené cURL, Python y TypeScript listos, con caching del system prompt y streaming.',
  keywords: ['curl', 'python', 'typescript', 'sdk', 'messages'],
  icon: '⇄',
  category: 'api',
  certs: ['D', 'AF'],
  order: 4,
  component: () => import('./request.vue'),
});
