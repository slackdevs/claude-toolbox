<script setup lang="ts">
import { ui } from '@/i18n';
import { isDemo } from '../mode';
</script>

<template>
  <p v-if="isDemo" class="demo-banner" role="note">
    <span class="pill amber">{{ ui.demoTag }}</span>
    <span>{{ ui.demoBanner }}</span>
  </p>
</template>
