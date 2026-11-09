<script setup lang="ts">
import { ui } from '@/i18n';
</script>

<template>
  <div class="empty">
    <h2>404</h2>
    <p>{{ ui.notFound }} <RouterLink to="/">{{ ui.backHome }}</RouterLink></p>
  </div>
</template>
