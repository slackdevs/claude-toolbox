<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { tr } from '@/i18n';

// Cabecera de página con el mismo aspecto que la de las herramientas. Por defecto toma los textos de route.meta.
const props = defineProps<{ title?: string; description?: string; icon?: string }>();

const route = useRoute();
const heading = computed(() => props.title ?? (route.meta.title ? tr(route.meta.title) : ''));
const text = computed(() => props.description ?? (route.meta.description ? tr(route.meta.description) : ''));
</script>

<template>
  <div class="tool-head page-head">
    <div class="ico" aria-hidden="true">{{ icon ?? route.meta.icon ?? '◇' }}</div>
    <div class="page-head-text">
      <h1>{{ heading }}</h1>
      <p v-if="text">{{ text }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="page-head-actions"><slot name="actions" /></div>
  </div>
</template>
