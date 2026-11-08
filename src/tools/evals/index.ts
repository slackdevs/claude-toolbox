import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Generador de evals (LLM como juez)',
  path: '/evals',
  description: 'Define criterios y escala y obtené un prompt de evaluación con salida JSON, más recomendaciones para calibrar evals.',
  keywords: ['evaluación', 'rúbrica', 'judge', 'testing'],
  icon: '★',
  category: 'prompt',
  certs: ['A', 'D', 'AF', 'AP'],
  order: 3,
  component: () => import('./evals.vue'),
});
