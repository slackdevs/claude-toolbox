import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Linter de prompts', en: 'Prompt linter' },
  path: '/linter',
  description: {
    es: 'Revisa un prompt contra buenas prácticas: claridad, contexto, ejemplos, formato, XML, instrucciones en positivo y énfasis excesivo.',
    en: 'Checks a prompt against best practices: clarity, context, examples, format, XML, positive instructions and excessive emphasis.',
  },
  keywords: ['revisar', 'calidad', 'buenas prácticas', 'review', 'quality', 'best practices'],
  icon: '✓',
  category: 'prompt',
  certs: ['A', 'D', 'AF'],
  order: 2,
  component: () => import('./linter.vue'),
});
