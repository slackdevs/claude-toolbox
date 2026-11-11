<script setup lang="ts">
import { ui } from '@/i18n';

defineProps<{ count?: number }>();
</script>

<template>
  <div role="status" :aria-label="ui.loading">
    <div v-for="n in count ?? 4" :key="n" class="card pcard skeleton" aria-hidden="true">
      <div class="pcard-side"><span class="sk sk-box" /></div>
      <div class="pcard-body"><span class="sk sk-line short" /><span class="sk sk-line" /><span class="sk sk-line mid" /></div>
    </div>
  </div>
</template>
