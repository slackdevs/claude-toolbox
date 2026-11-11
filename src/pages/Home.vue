<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import ToolCard from '@/components/ToolCard.vue';
import { certFilter, favorites, query } from '@/composables/useAppState';
import { tr, ui } from '@/i18n';
import { CERT_KEYS, CERTS } from '@/lib/certs';
import { tools, toolsByCategory } from '@/tools';
import type { Tool } from '@/tools/tool';

// Bloque comunitario, diferido: si falla, la grilla de herramientas sigue igual.
const HomeCommunity = defineAsyncComponent(() => import('@/community/components/HomeCommunity.vue'));

// Busca en ambos idiomas: una palabra en inglés encuentra la herramienta aunque la UI esté en español (y viceversa).
const matches = (t: Tool) => {
  const q = query.value.trim().toLowerCase();
  if (certFilter.value && !t.certs.includes(certFilter.value)) return false;
  if (!q) return true;
  return [t.name.es, t.name.en, t.description.es, t.description.en, ...t.keywords, ...t.certs.map((c) => CERTS[c].code)]
    .join(' ').toLowerCase().includes(q);
};

const favTools = computed(() => tools.filter((t) => favorites.value.includes(t.path) && matches(t)));
const groups = computed(() => toolsByCategory.map((c) => ({ ...c, tools: c.tools.filter(matches) })).filter((c) => c.tools.length));
</script>

<template>
  <div>
    <div class="hero">
      <div class="meta-badge"><span class="dot cyan" /> {{ ui.heroBadge(tools.length) }}</div>
      <h1>{{ ui.heroTitle }}</h1>
      <p class="hero-subtitle">API · Prompts · MCP · <span class="hl">Claude Code</span> · {{ ui.agents }}</p>
      <p>{{ ui.heroText }}</p>
    </div>
    <HomeCommunity v-if="!query.trim() && !certFilter" />
    <div class="chips">
      <button class="chip" :class="{ on: !certFilter }" @click="certFilter = ''">{{ ui.all }}</button>
      <button v-for="k in CERT_KEYS" :key="k" class="chip" :class="{ on: certFilter === k }" @click="certFilter = k">
        <span class="dot" :class="CERTS[k].color" />{{ CERTS[k].code }} · {{ CERTS[k].name }}
      </button>
    </div>

    <template v-if="favTools.length">
      <div class="sec-title">{{ ui.favorites }}</div>
      <div class="cards"><ToolCard v-for="t in favTools" :key="t.path" :tool="t" /></div>
    </template>

    <template v-for="g in groups" :key="g.key">
      <div class="sec-title">{{ tr(g.name) }}</div>
      <div class="cards"><ToolCard v-for="t in g.tools" :key="t.path" :tool="t" /></div>
    </template>
    <div v-if="!groups.length" class="empty">{{ ui.noMatch }}</div>
  </div>
</template>
