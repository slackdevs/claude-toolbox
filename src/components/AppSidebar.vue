<script setup lang="ts">
import { computed } from 'vue';
import { favorites, sidebarOpen } from '@/composables/useAppState';
import { tr, ui } from '@/i18n';
import { findTool, toolsByCategory } from '@/tools';

const favTools = computed(() => favorites.value.map(findTool).filter((t) => !!t));
</script>

<template>
  <aside :class="{ open: sidebarOpen }" @click="sidebarOpen = false">
    <RouterLink to="/" exact-active-class="on">⌂ {{ ui.home }}</RouterLink>
    <h4>{{ ui.community }}</h4>
    <RouterLink to="/cheatsheets" active-class="on"><span class="nav-ico">¶</span>{{ ui.cheatsheets }}</RouterLink>
    <RouterLink to="/propuestas" active-class="on"><span class="nav-ico">▲</span>{{ ui.proposals }}</RouterLink>
    <RouterLink to="/roadmap" active-class="on"><span class="nav-ico">◆</span>{{ ui.roadmap }}</RouterLink>
    <template v-if="favTools.length">
      <h4>{{ ui.favorites }}</h4>
      <RouterLink v-for="t in favTools" :key="t.path" :to="t.path" active-class="on">★ {{ tr(t.name) }}</RouterLink>
    </template>
    <template v-for="c in toolsByCategory" :key="c.key">
      <h4>{{ tr(c.name) }}</h4>
      <RouterLink v-for="t in c.tools" :key="t.path" :to="t.path" active-class="on">
        <span style="width:18px;text-align:center;color:var(--acc)">{{ t.icon }}</span>{{ tr(t.name) }}
      </RouterLink>
    </template>
  </aside>
</template>
