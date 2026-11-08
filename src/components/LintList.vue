<script setup lang="ts">
import type { Lint } from '@/lib/types';

defineProps<{ items: Lint[] }>();
</script>

<template>
  <!-- Los mensajes son HTML propio; el input del usuario se escapa con esc() al construirlos. -->
  <ul class="lint">
    <li v-for="(it, i) in items" :key="i" :class="it[0]" v-html="it[1]" />
  </ul>
</template>
