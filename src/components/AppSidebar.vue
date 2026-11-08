<script setup lang="ts">
import { computed } from 'vue';
import { favorites, sidebarOpen } from '@/composables/useAppState';
import { findTool, toolsByCategory } from '@/tools';

const favTools = computed(() => favorites.value.map(findTool).filter((t) => !!t));
</script>

<template>
  <aside :class="{ open: sidebarOpen }" @click="sidebarOpen = false">
    <RouterLink to="/" exact-active-class="on">⌂ Inicio</RouterLink>
    <template v-if="favTools.length">
      <h4>Favoritos</h4>
      <RouterLink v-for="t in favTools" :key="t.path" :to="t.path" active-class="on">★ {{ t.name }}</RouterLink>
    </template>
    <template v-for="c in toolsByCategory" :key="c.key">
      <h4>{{ c.name }}</h4>
      <RouterLink v-for="t in c.tools" :key="t.path" :to="t.path" active-class="on">
        <span style="width:18px;text-align:center;color:var(--acc)">{{ t.icon }}</span>{{ t.name }}
      </RouterLink>
    </template>
  </aside>
</template>
