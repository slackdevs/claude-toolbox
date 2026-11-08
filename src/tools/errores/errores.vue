<script setup lang="ts">
import { computed, ref } from 'vue';
import { REFERENCE } from './errores.data';

const q = ref('');
const rows = computed(() => {
  const t = q.value.trim().toLowerCase();
  return REFERENCE.filter((r) => Object.values(r).join(' ').toLowerCase().includes(t));
});
</script>

<template>
  <div class="card">
    <input v-model="q" placeholder="Filtrar (ej: 429, tool_use, retry)…">
    <div style="margin-top:12px">
      <table v-if="rows.length">
        <tr><th>Tipo</th><th>Valor</th><th>Significado</th><th>Qué hacer</th></tr>
        <tr v-for="r in rows" :key="r.value"><td>{{ r.kind }}</td><td><code>{{ r.value }}</code></td><td>{{ r.meaning }}</td><td>{{ r.action }}</td></tr>
      </table>
      <div v-else class="empty">Sin resultados</div>
    </div>
  </div>
</template>
