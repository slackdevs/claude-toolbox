<script setup lang="ts">
import { computed, ref } from 'vue';
import LintList from '@/components/LintList.vue';
import { lintPrompt } from './linter.service';

const text = ref('IMPORTANTE: NUNCA uses markdown. NO inventes cosas. Analiza esto y dime algo bueno sobre el texto, etc.');
const res = computed(() => lintPrompt(text.value));
const color = computed(() => (res.value.score >= 80 ? 'var(--ok)' : res.value.score >= 55 ? 'var(--warn)' : 'var(--bad)'));
const summary = computed(() => (res.value.score >= 80 ? 'Prompt sólido.' : res.value.score >= 55 ? 'Aceptable, con mejoras claras.' : 'Necesita trabajo antes de producción.'));
</script>

<template>
  <div class="grid2">
    <div class="card"><label>Prompt<textarea v-model="text" style="min-height:300px" /></label></div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
        <div class="score" :style="{ color }">{{ res.score }}</div>
        <div class="note">{{ summary }}</div>
      </div>
      <LintList :items="res.items" />
    </div>
  </div>
</template>
