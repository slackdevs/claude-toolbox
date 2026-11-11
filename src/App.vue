<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AboutModal from '@/components/AboutModal.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import CertTags from '@/components/CertTags.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import DemoBanner from '@/community/components/DemoBanner.vue';
import { aboutOpen, pageTitle, query, sidebarOpen } from '@/composables/useAppState';
import { toastMessage, toastVisible } from '@/composables/useToast';
import { locale, toggleLocale, tr, ui } from '@/i18n';
import { BRAND } from '@/lib/brand';
import { findTool } from '@/tools';

// Diferido: si la capa comunitaria no carga, el resto de la app sigue funcionando.
const CommunityHost = defineAsyncComponent(() => import('@/community/components/CommunityHost.vue'));

const route = useRoute();
const router = useRouter();
const searchInput = ref<HTMLInputElement>();
const tool = computed(() => findTool(String(route.meta.toolPath ?? '')));
const site = computed(() => (locale.value === 'es' ? BRAND.siteEs : BRAND.siteEn));

// Título y descripción de la página actual: de la herramienta, o de route.meta en las páginas nuevas (cheatsheets, comunidad).
const page = computed(() => {
  if (tool.value) return { title: tr(tool.value.name), description: tr(tool.value.description) };
  const { title, description } = route.meta;
  return title ? { title: pageTitle.value || tr(title), description: description ? tr(description) : ui.value.heroText } : null;
});

const setMeta = (sel: string, attr: string, value: string) => document.querySelector(sel)?.setAttribute(attr, value);

function setRobots(noindex: boolean) {
  let el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!el) {
    if (!noindex) return;
    el = document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'robots' }));
  }
  el.content = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
}

// Mantiene title, description, canonical y robots al navegar dentro de la SPA (el HTML inicial ya los trae de scripts/seo.ts).
watchEffect(() => {
  document.documentElement.lang = locale.value;
  document.title = page.value ? `${page.value.title} — Claude Toolbox · SlackDevs` : ui.value.docTitle;
  const path = route.path.replace(/^\/+|\/+$/g, '');
  const url = page.value && path ? `${BRAND.tools}${path}/` : BRAND.tools;
  setMeta('meta[name="description"]', 'content', page.value?.description ?? ui.value.heroText);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:url"]', 'content', url);
  setRobots(!!route.meta.noindex || route.name === 'not-found');
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
    <button class="hbtn menu-btn" :aria-label="ui.menu" @click="sidebarOpen = !sidebarOpen">☰</button>
    <RouterLink to="/" class="header-brand" title="Claude Toolbox">
      <div class="brand-logo-hex">SL</div>
      <div class="brand-text">
        <span class="brand-name">Claude Toolbox</span>
        <span class="brand-role-tag">SlackDevs · Tools</span>
      </div>
    </RouterLink>
    <button class="pill amber beta-pill" type="button" :title="ui.about" :aria-label="ui.about" @click="aboutOpen = true">Beta</button>
    <!-- En pantallas chicas estos accesos viven en el menú lateral (sección "Comunidad"). -->
    <nav class="header-nav" :aria-label="ui.communityNav">
      <RouterLink to="/cheatsheets" active-class="on">{{ ui.cheatsheets }}</RouterLink>
      <RouterLink to="/propuestas" active-class="on">{{ ui.proposals }}</RouterLink>
      <RouterLink to="/roadmap" active-class="on">{{ ui.roadmap }}</RouterLink>
    </nav>
    <div class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input ref="searchInput" v-model="query" type="search" :placeholder="ui.search" autocomplete="off" @input="onSearch">
    </div>
    <button class="header-btn lang-btn" :title="ui.langTitle" :aria-label="ui.langTitle" @click="toggleLocale">
      <span :class="{ on: locale === 'es' }">ES</span><span class="sep">/</span><span :class="{ on: locale === 'en' }">EN</span>
    </button>
    <a :href="BRAND.articles" class="header-btn" target="_blank" rel="noopener" :title="ui.articlesTitle">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
      <span class="label">{{ ui.articles }}</span>
    </a>
    <a :href="BRAND.coffee" class="header-btn" target="_blank" rel="noopener" :title="ui.coffeeTitle" :aria-label="ui.coffeeTitle">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
        <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
      </svg>
      <span class="label">Buy me a Coffee</span>
    </a>
    <a :href="site" class="header-btn accent" target="_blank" rel="noopener" title="slackdevs.com">
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
          <h1>{{ tr(tool.name) }}</h1>
          <p>{{ tr(tool.description) }}</p>
          <CertTags :certs="tool.certs" />
        </div>
        <FavoriteButton :path="tool.path" inline />
      </div>
      <DemoBanner v-if="route.meta.community" />
      <!-- La key incluye el idioma: al cambiarlo, la herramienta se remonta con sus valores de ejemplo traducidos. -->
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="`${route.path}:${locale}`" />
        </Transition>
      </RouterView>

      <footer class="site-footer">
        <div class="brand-line">CLAUDE TOOLBOX // SLACKDEVS.COM</div>
        <div>
          <a href="#" @click.prevent="aboutOpen = true">{{ ui.about.toUpperCase() }}</a> ·
          <a :href="site" target="_blank" rel="noopener">SLACKDEVS.COM</a> ·
          <a :href="BRAND.github" target="_blank" rel="noopener">GITHUB</a> ·
          <a :href="BRAND.legal.tos" target="_blank" rel="noopener">{{ ui.terms }}</a> ·
          <a :href="BRAND.legal.privacy" target="_blank" rel="noopener">{{ ui.privacy }}</a>
        </div>
        <div>HAIKU · SONNET · OPUS · FABLE // {{ new Date().getFullYear() }}</div>
        <div style="margin-top:6px;letter-spacing:.02em;text-transform:none;font-family:var(--font-sans)">
          {{ ui.disclaimer(BRAND.author) }}
        </div>
      </footer>
    </main>
  </div>

  <CommunityHost v-if="route.meta.community" />
  <AboutModal />
  <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
</template>
