import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Mapa de certificaciones y plan de estudio', en: 'Certification map and study plan' },
  path: '/certificaciones',
  description: {
    es: 'Las 5 credenciales, a quién apuntan, qué evalúan y un checklist por dominio del CCAR-F con progreso guardado.',
    en: 'The 5 credentials, who they target, what they assess and a per-domain CCAR-F checklist with saved progress.',
  },
  keywords: ['examen', 'estudio', 'certificación', 'dominios', 'checklist', 'exam', 'study', 'certification', 'domains'],
  icon: '🎓',
  category: 'arch',
  certs: ['A', 'D', 'AF', 'AP', 'B'],
  order: 2,
  component: () => import('./certificaciones.vue'),
});
