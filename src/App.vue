<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import CertTags from '@/components/CertTags.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { query, sidebarOpen } from '@/composables/useAppState';
import { toastMessage, toastVisible } from '@/composables/useToast';
import { BRAND } from '@/lib/brand';
import { findTool } from '@/tools';

const route = useRoute();
const router = useRouter();
const searchInput = ref<HTMLInputElement>();
const tool = computed(() => findTool(String(route.meta.toolPath ?? '')));

watchEffect(() => {
  document.title = tool.value ? `${tool.value.name} — Claude Toolbox · SlackDevs` : 'Claude Toolbox · SlackDevs — herramientas para profesionales de Claude';
});

function onSearch() {
  if (route.name !== 'home') router.push('/');
}

function onKey(e: KeyboardEvent) {
  const tag = (document.activeElement?.tagName ?? '').toUpperCase();
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
    e.preventDefault();
    searchInput.value?.focus();
  }
}
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <header class="site-header">
    <button class="hbtn menu-btn" aria-label="Menú" @click="sidebarOpen = !sidebarOpen">☰</button>
    <RouterLink to="/" class="header-brand" title="Claude Toolbox">
      <div class="brand-logo-hex">SL</div>
      <div class="brand-text">
        <span class="brand-name">Claude Toolbox</span>
        <span class="brand-role-tag">SlackDevs · Tools</span>
      </div>
    </RouterLink>
    <div class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input ref="searchInput" v-model="query" type="search" placeholder="Buscar herramienta… ( / )" autocomplete="off" @input="onSearch">
    </div>
    <a :href="BRAND.articles" class="header-btn" target="_blank" rel="noopener" title="Artículos y publicaciones">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
      <span class="label">Artículos</span>
    </a>
    <a :href="BRAND.siteEs" class="header-btn accent" target="_blank" rel="noopener" title="slackdevs.com">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span class="label">slackdevs.com</span>
    </a>
  </header>

  <div class="layout">
    <AppSidebar />
    <main>
      <div v-if="tool" class="tool-head">
        <div class="ico">{{ tool.icon }}</div>
        <div style="flex:1">
          <h1>{{ tool.name }}</h1>
          <p>{{ tool.description }}</p>
          <CertTags :certs="tool.certs" />
        </div>
        <FavoriteButton :path="tool.path" inline />
      </div>
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>

      <footer class="site-footer">
        <div class="brand-line">CLAUDE TOOLBOX // SLACKDEVS.COM</div>
        <div>
          <a :href="BRAND.siteEs" target="_blank" rel="noopener">SLACKDEVS.COM</a> ·
          <a :href="BRAND.github" target="_blank" rel="noopener">GITHUB</a> ·
          <a :href="BRAND.legal.tos" target="_blank" rel="noopener">TÉRMINOS</a> ·
          <a :href="BRAND.legal.privacy" target="_blank" rel="noopener">PRIVACIDAD</a>
        </div>
        <div>HAIKU · SONNET · OPUS · FABLE // {{ new Date().getFullYear() }}</div>
        <div style="margin-top:6px;letter-spacing:.02em;text-transform:none;font-family:var(--font-sans)">
          Proyecto independiente de {{ BRAND.author }}, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic.
          Precios y datos de exámenes de fuentes públicas: verificalos en la documentación oficial.
        </div>
      </footer>
    </main>
  </div>

  <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
</template>
