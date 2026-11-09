import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Claude Code headless y CI/CD', en: 'Claude Code headless and CI/CD' },
  path: '/ci',
  description: {
    es: 'Comando claude -p para scripts y pipelines, y workflow de GitHub Actions con claude-code-action.',
    en: 'claude -p command for scripts and pipelines, and a GitHub Actions workflow with claude-code-action.',
  },
  keywords: ['github actions', 'pipeline', 'headless', '-p', 'automatización', 'automation'],
  icon: '▶',
  category: 'code',
  certs: ['AF', 'B'],
  order: 6,
  component: () => import('./ci.vue'),
});
