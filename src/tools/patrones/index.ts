import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Selector de patrones agénticos', en: 'Agentic pattern selector' },
  path: '/patrones',
  description: {
    es: 'Respondé 7 preguntas y obtené el patrón de workflow o agente recomendado, con sus riesgos y mitigaciones.',
    en: 'Answer 7 questions and get the recommended workflow or agent pattern, with its risks and mitigations.',
  },
  keywords: ['agentes', 'workflow', 'orquestador', 'multi-agente', 'arquitectura', 'agents', 'orchestrator', 'multi-agent', 'architecture'],
  icon: '⌘',
  category: 'arch',
  certs: ['AF', 'AP'],
  order: 1,
  component: () => import('./patrones.vue'),
});
