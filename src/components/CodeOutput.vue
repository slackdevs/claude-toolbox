<script setup lang="ts">
import { copyText } from '@/composables/useToast';

defineProps<{ code: string; label?: string }>();
</script>

<template>
  <div class="out">
    <div class="out-h">
      <span>{{ label }}</span>
      <button class="btn sm ghost" @click="copyText(code)">Copiar</button>
    </div>
    <pre>{{ code }}</pre>
  </div>
</template>
