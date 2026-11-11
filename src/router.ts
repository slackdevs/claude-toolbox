import { createRouter, createWebHistory } from 'vue-router';
import { cheatsheetRoutes } from './cheatsheets/routes';
import { communityRoutes } from './community/routes';
import type { Localized } from './i18n';
import Home from './pages/Home.vue';
import NotFound from './pages/NotFound.vue';
import { tools } from './tools';

declare module 'vue-router' {
  interface RouteMeta {
    /** Ruta de la herramienta del registro (sólo en rutas de herramientas). */
    toolPath?: string;
    /** Título y descripción de la página: los usa App.vue para <title>, description y canonical. */
    title?: Localized;
    description?: Localized;
    /** Glifo de la cabecera de página. */
    icon?: string;
    /** Página de la capa comunitaria (muestra el banner de modo demo). */
    community?: boolean;
    noindex?: boolean;
  }
}

// History real (/costos/): cada herramienta tiene su HTML estático generado por scripts/seo.ts.
// Enlaces viejos con hash (#/costos) → ruta real (/costos). Debe ir antes de crear el history, que lee la URL al crearse.
if (location.hash.startsWith('#/')) history.replaceState(null, '', import.meta.env.BASE_URL + location.hash.slice(2));

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    ...tools.map((t) => ({ path: t.path, name: t.path.slice(1), component: t.component, meta: { toolPath: t.path } })),
    ...cheatsheetRoutes,
    ...communityRoutes,
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
  // Cambiar sólo la query (filtros de un listado) no mueve el scroll.
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
});
