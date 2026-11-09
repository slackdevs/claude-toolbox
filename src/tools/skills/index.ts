import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de skills y comandos', en: 'Skills and commands builder' },
  path: '/skills',
  description: {
    es: 'Genera SKILL.md o un comando slash con frontmatter, argumentos ($ARGUMENTS) y estructura de carpetas con divulgación progresiva.',
    en: 'Generates a SKILL.md or a slash command with frontmatter, arguments ($ARGUMENTS) and a folder structure with progressive disclosure.',
  },
  keywords: ['SKILL.md', 'slash command', 'comando', 'arguments', 'command'],
  icon: '◆',
  category: 'code',
  certs: ['D', 'AF', 'B'],
  order: 5,
  component: () => import('./skills.vue'),
});
