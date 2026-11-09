import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Generador de Message Batches', en: 'Message Batches generator' },
  path: '/batch',
  description: {
    es: 'Convierte una lista de prompts en el body de /v1/messages/batches con custom_id válidos. 50% de descuento para cargas no urgentes.',
    en: 'Turns a list of prompts into a /v1/messages/batches body with valid custom_ids. 50% discount for non-urgent workloads.',
  },
  keywords: ['batches', 'jsonl', 'asíncrono', 'asynchronous'],
  icon: '≡',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 5,
  component: () => import('./batch.vue'),
});
