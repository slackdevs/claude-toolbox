import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de settings.json y permisos', en: 'settings.json and permissions builder' },
  path: '/permisos',
  description: {
    es: 'Reglas allow / ask / deny, modo de permisos por defecto y variables de entorno, con lint de seguridad.',
    en: 'allow / ask / deny rules, default permission mode and environment variables, with a security lint.',
  },
  keywords: ['settings', 'permissions', 'allow', 'deny', 'seguridad', 'security'],
  icon: '🔒',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 2,
  component: () => import('./permisos.vue'),
});
