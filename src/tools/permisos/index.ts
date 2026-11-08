import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de settings.json y permisos',
  path: '/permisos',
  description: 'Reglas allow / ask / deny, modo de permisos por defecto y variables de entorno, con lint de seguridad.',
  keywords: ['settings', 'permissions', 'allow', 'deny', 'seguridad'],
  icon: '🔒',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 2,
  component: () => import('./permisos.vue'),
});
