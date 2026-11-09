import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Constructor de hooks', en: 'Hooks builder' },
  path: '/hooks',
  description: {
    es: 'Arma hooks deterministas (PreToolUse, PostToolUse, Stop, SessionStart…) con plantillas y semántica de exit codes.',
    en: 'Build deterministic hooks (PreToolUse, PostToolUse, Stop, SessionStart…) with templates and exit code semantics.',
  },
  keywords: ['PreToolUse', 'PostToolUse', 'exit code', 'automatización', 'automation'],
  icon: '⚓',
  category: 'code',
  certs: ['AF', 'AP', 'B'],
  order: 3,
  component: () => import('./hooks.vue'),
});
