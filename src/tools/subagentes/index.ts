import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de subagentes', en: 'Subagent builder' },
  path: '/subagentes',
  description: {
    es: 'Crea .claude/agents/*.md con frontmatter válido, herramientas mínimas y un system prompt enfocado.',
    en: 'Creates .claude/agents/*.md with valid frontmatter, minimal tools and a focused system prompt.',
  },
  keywords: ['agents', 'subagent', 'delegar', 'frontmatter', 'delegate'],
  icon: '⑂',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 4,
  component: () => import('./subagentes.vue'),
});
