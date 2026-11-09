<script setup lang="ts">
import { tr } from '@/i18n';
import type { Tool } from '@/tools/tool';
import CertTags from './CertTags.vue';
import FavoriteButton from './FavoriteButton.vue';

defineProps<{ tool: Tool }>();
</script>

<template>
  <RouterLink :to="tool.path" class="tcard">
    <FavoriteButton :path="tool.path" />
    <div class="ico">{{ tool.icon }}</div>
    <h3>{{ tr(tool.name) }}</h3>
    <p>{{ tr(tool.description) }}</p>
    <CertTags :certs="tool.certs" />
  </RouterLink>
</template>
