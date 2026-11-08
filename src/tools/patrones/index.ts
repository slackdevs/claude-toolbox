import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Selector de patrones agénticos',
  path: '/patrones',
  description: 'Respondé 7 preguntas y obtené el patrón de workflow o agente recomendado, con sus riesgos y mitigaciones.',
  keywords: ['agentes', 'workflow', 'orquestador', 'multi-agente', 'arquitectura'],
  icon: '⌘',
  category: 'arch',
  certs: ['AF', 'AP'],
  order: 1,
  component: () => import('./patrones.vue'),
});
