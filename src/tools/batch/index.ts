import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Generador de Message Batches',
  path: '/batch',
  description: 'Convierte una lista de prompts en el body de /v1/messages/batches con custom_id válidos. 50% de descuento para cargas no urgentes.',
  keywords: ['batches', 'jsonl', 'asíncrono'],
  icon: '≡',
  category: 'api',
  certs: ['D', 'AF', 'AP'],
  order: 5,
  component: () => import('./batch.vue'),
});
