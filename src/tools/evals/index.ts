import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Generador de evals (LLM como juez)', en: 'Eval generator (LLM as judge)' },
  path: '/evals',
  description: {
    es: 'Define criterios y escala y obtené un prompt de evaluación con salida JSON, más recomendaciones para calibrar evals.',
    en: 'Define criteria and a scale and get an evaluation prompt with JSON output, plus recommendations for calibrating evals.',
  },
  keywords: ['evaluación', 'rúbrica', 'judge', 'testing', 'evaluation', 'rubric'],
  icon: '★',
  category: 'prompt',
  certs: ['A', 'D', 'AF', 'AP'],
  order: 3,
  component: () => import('./evals.vue'),
});
