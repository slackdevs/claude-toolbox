// Rutas de la capa comunitaria. Los componentes se cargan de forma diferida: si esta capa falla, las herramientas siguen.
import type { RouteRecordRaw } from 'vue-router';

export const communityRoutes: RouteRecordRaw[] = [
  {
    path: '/propuestas', name: 'proposals', component: () => import('./pages/ProposalsPage.vue'),
    meta: {
      community: true, icon: '▲',
      title: { es: 'Propuestas de la comunidad', en: 'Community proposals' },
      description: {
        es: 'Proponé herramientas, mejoras o contenido para Claude Toolbox, votá lo que querés ver e impulsalo con una donación. El ranking define el roadmap.',
        en: 'Propose tools, improvements or content for Claude Toolbox, vote for what you want to see and boost it with a donation. The ranking drives the roadmap.',
      },
    },
  },
  {
    path: '/propuestas/nueva', name: 'proposal-new', component: () => import('./pages/ProposalNewPage.vue'),
    meta: {
      community: true, noindex: true, icon: '＋',
      title: { es: 'Nueva propuesta', en: 'New proposal' },
      description: {
        es: 'Proponé una herramienta nueva, una mejora o contenido. Sebastián la revisa y le asigna un tiempo estimado antes de abrirla a votación.',
        en: 'Propose a new tool, an improvement or content. Sebastián reviews it and assigns an estimated time before opening it to voting.',
      },
    },
  },
  {
    path: '/propuestas/:id', name: 'proposal', component: () => import('./pages/ProposalDetailPage.vue'),
    meta: {
      community: true, icon: '▲',
      title: { es: 'Propuesta', en: 'Proposal' },
      description: { es: 'Detalle, puntaje, votos y donaciones de una propuesta de la comunidad.', en: 'Details, score, votes and donations of a community proposal.' },
    },
  },
  {
    path: '/roadmap', name: 'roadmap', component: () => import('./pages/RoadmapPage.vue'),
    meta: {
      community: true, icon: '◆',
      title: { es: 'Roadmap', en: 'Roadmap' },
      description: {
        es: 'Qué está planificado, en desarrollo y publicado en Claude Toolbox. El orden sale del ranking de propuestas, con revisión de Sebastián.',
        en: 'What is planned, in progress and published in Claude Toolbox. The order comes from the proposal ranking, reviewed by Sebastián.',
      },
    },
  },
  {
    path: '/admin', name: 'admin', component: () => import('./pages/AdminPage.vue'),
    meta: {
      community: true, noindex: true, icon: '⚙',
      title: { es: 'Revisión (demo)', en: 'Review (demo)' },
      description: { es: 'Cola de revisión simulada de las propuestas.', en: 'Simulated review queue for proposals.' },
    },
  },
];
