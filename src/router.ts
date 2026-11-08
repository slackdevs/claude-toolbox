import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './pages/Home.vue';
import NotFound from './pages/NotFound.vue';
import { tools } from './tools';

// Hash history: funciona en GitHub Pages sin configurar reescrituras 404.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    ...tools.map((t) => ({ path: t.path, name: t.path.slice(1), component: t.component, meta: { toolPath: t.path } })),
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
