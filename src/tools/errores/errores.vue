<script setup lang="ts">
import { computed, ref } from 'vue';
import { tr, useMessages } from '@/i18n';
import { REFERENCE } from './errores.data';

const t = useMessages({
  es: { filter: 'Filtrar (ej: 429, tool_use, retry)…', kind: 'Tipo', value: 'Valor', meaning: 'Significado', action: 'Qué hacer', empty: 'Sin resultados' },
  en: { filter: 'Filter (e.g. 429, tool_use, retry)…', kind: 'Type', value: 'Value', meaning: 'Meaning', action: 'What to do', empty: 'No results' },
});

const q = ref('');
const rows = computed(() => {
  const s = q.value.trim().toLowerCase();
  return tr(REFERENCE).filter((r) => Object.values(r).join(' ').toLowerCase().includes(s));
});
</script>

<template>
  <div class="card">
    <input v-model="q" :placeholder="t.filter">
    <div style="margin-top:12px">
      <table v-if="rows.length">
        <tr><th>{{ t.kind }}</th><th>{{ t.value }}</th><th>{{ t.meaning }}</th><th>{{ t.action }}</th></tr>
        <tr v-for="r in rows" :key="r.value"><td>{{ r.kind }}</td><td><code>{{ r.value }}</code></td><td>{{ r.meaning }}</td><td>{{ r.action }}</td></tr>
      </table>
      <div v-else class="empty">{{ t.empty }}</div>
    </div>
  </div>
</template>
