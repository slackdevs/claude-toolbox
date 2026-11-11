import type { RouteRecordRaw } from 'vue-router';

export const cheatsheetRoutes: RouteRecordRaw[] = [
  {
    path: '/cheatsheets', name: 'cheatsheets', component: () => import('./pages/CheatsheetsIndex.vue'),
    meta: {
      icon: '¶',
      title: { es: 'Cheatsheets por credencial', en: 'Cheatsheets by credential' },
      description: {
        es: 'Un cheatsheet por cada credencial de Claude: CCAO-F, CCDV-F, CCAR-F, CCAR-P y el Partner Badge de Claude Code. Referencia rápida, conceptos clave, workflows y checklists.',
        en: 'One cheatsheet per Claude credential: CCAO-F, CCDV-F, CCAR-F, CCAR-P and the Claude Code Partner Badge. Quick reference, key concepts, workflows and checklists.',
      },
    },
  },
  {
    path: '/cheatsheets/:cert', name: 'cheatsheet', component: () => import('./pages/CheatsheetPage.vue'),
    meta: {
      icon: '¶',
      title: { es: 'Cheatsheet', en: 'Cheatsheet' },
      description: { es: 'Cheatsheet de una credencial de Claude.', en: 'Cheatsheet for a Claude credential.' },
    },
  },
];
