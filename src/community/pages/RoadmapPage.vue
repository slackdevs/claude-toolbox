<script setup lang="ts">
import PageHead from '@/components/PageHead.vue';
import { ui } from '@/i18n';
</script>

<template>
  <div>
    <PageHead />
    <p class="empty">{{ ui.comingSoon(5) }}</p>
  </div>
</template>
