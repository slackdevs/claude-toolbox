import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Configurador de servidores MCP',
  path: '/mcp',
  description: 'Genera el comando claude mcp add, el .mcp.json de proyecto y la config de Claude Desktop, para stdio o HTTP remoto.',
  keywords: ['model context protocol', 'servidor', '.mcp.json', 'conector'],
  icon: '⧉',
  category: 'tools',
  certs: ['D', 'AF', 'AP', 'B'],
  order: 3,
  component: () => import('./mcp.vue'),
});
