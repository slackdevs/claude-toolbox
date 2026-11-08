import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de skills y comandos',
  path: '/skills',
  description: 'Genera SKILL.md o un comando slash con frontmatter, argumentos ($ARGUMENTS) y estructura de carpetas con divulgación progresiva.',
  keywords: ['SKILL.md', 'slash command', 'comando', 'arguments'],
  icon: '◆',
  category: 'code',
  certs: ['D', 'AF', 'B'],
  order: 5,
  component: () => import('./skills.vue'),
});
