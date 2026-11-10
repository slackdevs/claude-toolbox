import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import NotFound from './pages/NotFound.vue';
import { tools } from './tools';

// History real (/tools/costos/): cada herramienta tiene su HTML estático generado por scripts/seo.ts.
// Enlaces viejos con hash (#/costos) → ruta real (/costos). Debe ir antes de crear el history, que lee la URL al crearse.
if (location.hash.startsWith('#/')) history.replaceState(null, '', import.meta.env.BASE_URL + location.hash.slice(2));

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    ...tools.map((t) => ({ path: t.path, name: t.path.slice(1), component: t.component, meta: { toolPath: t.path } })),
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
