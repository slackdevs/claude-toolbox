<script setup lang="ts">
import { computed } from 'vue';
import ToolCard from '@/components/ToolCard.vue';
import { certFilter, favorites, query } from '@/composables/useAppState';
import { CERT_KEYS, CERTS } from '@/lib/certs';
import { tools, toolsByCategory } from '@/tools';
import type { Tool } from '@/tools/tool';

const matches = (t: Tool) => {
  const q = query.value.trim().toLowerCase();
  if (certFilter.value && !t.certs.includes(certFilter.value)) return false;
  if (!q) return true;
  return [t.name, t.description, ...t.keywords, ...t.certs.map((c) => CERTS[c].code)].join(' ').toLowerCase().includes(q);
};

const favTools = computed(() => tools.filter((t) => favorites.value.includes(t.path) && matches(t)));
const groups = computed(() => toolsByCategory.map((c) => ({ ...c, tools: c.tools.filter(matches) })).filter((c) => c.tools.length));
</script>

<template>
  <div>
    <div class="hero">
      <h1>Herramientas para profesionales de Claude</h1>
      <p>
        {{ tools.length }} utilidades que corren en tu navegador para diseñar prompts, estimar costos, configurar Claude Code, MCP y agentes,
        organizadas según lo que evalúan las certificaciones Associate, Developer y Architect y el Partner Badge de Claude Code.
        Nada se envía a ningún servidor.
      </p>
    </div>
    <div class="chips">
      <button class="chip" :class="{ on: !certFilter }" @click="certFilter = ''">Todas</button>
      <button v-for="k in CERT_KEYS" :key="k" class="chip" :class="{ on: certFilter === k }" @click="certFilter = k">
        {{ CERTS[k].code }} · {{ CERTS[k].name }}
      </button>
    </div>

    <template v-if="favTools.length">
      <div class="sec-title">★ Favoritos</div>
      <div class="cards"><ToolCard v-for="t in favTools" :key="t.path" :tool="t" /></div>
    </template>

    <template v-for="g in groups" :key="g.key">
      <div class="sec-title">{{ g.name }}</div>
      <div class="cards"><ToolCard v-for="t in g.tools" :key="t.path" :tool="t" /></div>
    </template>
    <div v-if="!groups.length" class="empty">Ninguna herramienta coincide con la búsqueda.</div>

    <footer>
      Proyecto independiente, no afiliado ni respaldado por Anthropic. “Claude” y “Claude Code” son marcas de Anthropic.
      Precios y datos de exámenes de fuentes públicas a noviembre 2026: verificalos en la documentación oficial.
    </footer>
  </div>
</template>
