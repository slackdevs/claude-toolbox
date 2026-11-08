import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Mapa de certificaciones y plan de estudio',
  path: '/certificaciones',
  description: 'Las 5 credenciales, a quién apuntan, qué evalúan y un checklist por dominio del CCAR-F con progreso guardado.',
  keywords: ['examen', 'estudio', 'certificación', 'dominios', 'checklist'],
  icon: '🎓',
  category: 'arch',
  certs: ['A', 'D', 'AF', 'AP', 'B'],
  order: 2,
  component: () => import('./certificaciones.vue'),
});
