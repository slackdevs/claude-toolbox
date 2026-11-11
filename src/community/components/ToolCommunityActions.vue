<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMessages } from '@/i18n';
import { api } from '../api';
import { dataVersion } from '../state';

// Acciones comunitarias en la cabecera de una herramienta. Si la capa comunitaria falla, el contador simplemente no aparece.
const props = defineProps<{ toolPath: string }>();

const t = useMessages({
  es: { propose: 'Proponer mejora', count: (n: number) => (n === 1 ? '1 mejora propuesta' : `${n} mejoras propuestas`) },
  en: { propose: 'Propose an improvement', count: (n: number) => (n === 1 ? '1 proposed improvement' : `${n} proposed improvements`) },
});

const count = ref(0);
let seq = 0;

async function load() {
  const n = ++seq;
  count.value = 0;
  try {
    const list = await api.listProposals({ toolPath: props.toolPath });
    if (n === seq) count.value = list.length;
  } catch {
    /* sin contador */
  }
}
watch([() => props.toolPath, dataVersion], load, { immediate: true });
</script>

<template>
  <div class="tool-community">
    <RouterLink class="btn ghost sm" :to="{ path: '/propuestas/nueva', query: { type: 'improvement', tool: toolPath } }">↑ {{ t.propose }}</RouterLink>
    <RouterLink v-if="count" :to="{ path: '/propuestas', query: { tool: toolPath } }">{{ t.count(count) }} →</RouterLink>
  </div>
</template>
