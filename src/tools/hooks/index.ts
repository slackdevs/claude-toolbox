import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Constructor de hooks',
  path: '/hooks',
  description: 'Arma hooks deterministas (PreToolUse, PostToolUse, Stop, SessionStart…) con plantillas y semántica de exit codes.',
  keywords: ['PreToolUse', 'PostToolUse', 'exit code', 'automatización'],
  icon: '⚓',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 3,
  component: () => import('./hooks.vue'),
});
