<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import CertTags from '@/components/CertTags.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { query, sidebarOpen, theme } from '@/composables/useAppState';
import { toastMessage, toastVisible } from '@/composables/useToast';
import { findTool } from '@/tools';

const route = useRoute();
const router = useRouter();
const searchInput = ref<HTMLInputElement>();
const tool = computed(() => findTool(String(route.meta.toolPath ?? '')));

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  document.title = tool.value ? `${tool.value.name} — Claude Toolbox` : 'Claude Toolbox — herramientas para profesionales de Claude';
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
  <header>
    <button class="hbtn menu-btn" aria-label="Menú" @click="sidebarOpen = !sidebarOpen">☰</button>
    <RouterLink to="/" class="logo" style="color:inherit;text-decoration:none">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--acc)" />
        <path d="M9 21l6-6m0 0l-2-2 4-4 2 2m-4 4l2 2 4-4m-2-2l4-4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Claude Toolbox <small>no oficial</small>
    </RouterLink>
    <div class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input ref="searchInput" v-model="query" type="search" placeholder="Buscar herramienta… (tecla /)" autocomplete="off" @input="onSearch">
    </div>
    <button class="hbtn" title="Cambiar tema" @click="theme = theme === 'dark' ? 'light' : 'dark'">☀ / ☾</button>
  </header>

  <div class="layout">
    <AppSidebar />
    <main>
      <div v-if="tool" class="tool-head">
        <div class="ico" style="width:44px;height:44px;font-size:21px">{{ tool.icon }}</div>
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
    </main>
  </div>

  <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
</template>
