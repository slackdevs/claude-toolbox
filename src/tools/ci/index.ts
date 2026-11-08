import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Claude Code headless y CI/CD',
  path: '/ci',
  description: 'Comando claude -p para scripts y pipelines, y workflow de GitHub Actions con claude-code-action.',
  keywords: ['github actions', 'pipeline', 'headless', '-p', 'automatización'],
  icon: '▶',
  category: 'code',
  certs: ['AF', 'B'],
  order: 6,
  component: () => import('./ci.vue'),
});
