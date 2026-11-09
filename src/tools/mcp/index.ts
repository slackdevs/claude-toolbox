import { defineTool } from '../tool';

export const tool = defineTool({
  name: { es: 'Configurador de servidores MCP', en: 'MCP server configurator' },
  path: '/mcp',
  description: {
    es: 'Genera el comando claude mcp add, el .mcp.json de proyecto y la config de Claude Desktop, para stdio o HTTP remoto.',
    en: 'Generates the claude mcp add command, the project .mcp.json and the Claude Desktop config, for stdio or remote HTTP.',
  },
  keywords: ['model context protocol', 'servidor', '.mcp.json', 'conector', 'server', 'connector'],
  icon: '⧉',
  category: 'tools',
  certs: ['D', 'AF', 'AP', 'B'],
  order: 3,
  component: () => import('./mcp.vue'),
});
