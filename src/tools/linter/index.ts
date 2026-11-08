import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Linter de prompts',
  path: '/linter',
  description: 'Revisa un prompt contra buenas prácticas: claridad, contexto, ejemplos, formato, XML, instrucciones en positivo y énfasis excesivo.',
  keywords: ['revisar', 'calidad', 'buenas prácticas'],
  icon: '✓',
  category: 'prompt',
  certs: ['A', 'D', 'AF'],
  order: 2,
  component: () => import('./linter.vue'),
});
