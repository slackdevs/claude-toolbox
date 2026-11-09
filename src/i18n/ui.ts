// Textos compartidos de la interfaz. `en` debe tener las mismas claves que `es`.
const es = {
  menu: 'Menú',
  search: 'Buscar herramienta… ( / )',
  articles: 'Artículos',
  articlesTitle: 'Artículos y publicaciones',
  langTitle: 'Switch to English',
  home: 'Inicio',
  favorites: 'Favoritos',
  addFav: 'Agregar a favoritos',
  removeFav: 'Quitar de favoritos',
  copy: 'Copiar',
  copied: '¡Copiado!',
  copyManual: 'Seleccioná y copiá manualmente',
  terms: 'TÉRMINOS',
  privacy: 'PRIVACIDAD',
  disclaimer: (author: string) =>
    `Proyecto independiente de ${author}, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic. Precios y datos de exámenes de fuentes públicas: verificalos en la documentación oficial.`,
  docTitle: 'Claude Toolbox · SlackDevs — herramientas para profesionales de Claude',
  heroBadge: (n: number) => `Toolbox · ${n} herramientas · 100% en tu navegador`,
  heroTitle: 'Herramientas para profesionales de Claude',
  agents: 'Agentes',
  heroText:
    'Utilidades para diseñar prompts, estimar costos, configurar Claude Code, MCP y agentes, organizadas según lo que evalúan las certificaciones Associate, Developer y Architect y el Partner Badge de Claude Code. Nada se envía a ningún servidor.',
  all: 'Todas',
  noMatch: 'Ninguna herramienta coincide con la búsqueda.',
  notFound: 'Esa herramienta no existe.',
  backHome: 'Volver al inicio',
  review: 'Revisión',
  model: 'Modelo',
};

export type UiMessages = typeof es;

const en: UiMessages = {
  menu: 'Menu',
  search: 'Search tools… ( / )',
  articles: 'Articles',
  articlesTitle: 'Articles and posts',
  langTitle: 'Cambiar a español',
  home: 'Home',
  favorites: 'Favorites',
  addFav: 'Add to favorites',
  removeFav: 'Remove from favorites',
  copy: 'Copy',
  copied: 'Copied!',
  copyManual: 'Select and copy manually',
  terms: 'TERMS',
  privacy: 'PRIVACY',
  disclaimer: (author: string) =>
    `Independent project by ${author}, not affiliated with or endorsed by Anthropic. “Claude” and “Claude Code” are trademarks of Anthropic. Pricing and exam data come from public sources: verify them in the official documentation.`,
  docTitle: 'Claude Toolbox · SlackDevs — tools for Claude professionals',
  heroBadge: (n: number) => `Toolbox · ${n} tools · 100% in your browser`,
  heroTitle: 'Tools for Claude professionals',
  agents: 'Agents',
  heroText:
    'Utilities to design prompts, estimate costs, and configure Claude Code, MCP and agents, organized around what the Associate, Developer and Architect certifications and the Claude Code Partner Badge assess. Nothing is sent to any server.',
  all: 'All',
  noMatch: 'No tools match your search.',
  notFound: 'That tool does not exist.',
  backHome: 'Back to home',
  review: 'Review',
  model: 'Model',
};

export const UI = { es, en };
