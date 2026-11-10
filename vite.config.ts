import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { seo } from './scripts/seo';
import { BRAND } from './src/lib/brand';

// base absoluta tomada de la URL pública (/ en claudetoolbox.slackdevs.com, o una subcarpeta): las rutas son reales
// (/costos/), no hash, para que cada herramienta sea indexable. Si cambia el dominio, editá BRAND.tools.
export default defineConfig({
  base: new URL(BRAND.tools).pathname,
  plugins: [vue(), seo()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
