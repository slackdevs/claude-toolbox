<script setup lang="ts">
import { copyText } from '@/composables/useToast';
import { ui } from '@/i18n';

defineProps<{ code: string; label?: string }>();
</script>

<template>
  <div class="out">
    <div class="out-h">
      <span>{{ label }}</span>
      <button class="btn sm ghost" @click="copyText(code)">{{ ui.copy }}</button>
    </div>
    <pre>{{ code }}</pre>
  </div>
</template>
