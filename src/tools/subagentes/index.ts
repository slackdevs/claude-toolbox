import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de subagentes',
  path: '/subagentes',
  description: 'Crea .claude/agents/*.md con frontmatter válido, herramientas mínimas y un system prompt enfocado.',
  keywords: ['agents', 'subagent', 'delegar', 'frontmatter'],
  icon: '⑂',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 4,
  component: () => import('./subagentes.vue'),
});
