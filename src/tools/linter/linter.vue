<script setup lang="ts">
import { computed, ref } from 'vue';
import LintList from '@/components/LintList.vue';
import { tr, useMessages } from '@/i18n';
import { LINTER_MESSAGES, lintPrompt } from './linter.service';

const t = useMessages({
  es: {
    prompt: 'Prompt',
    solid: 'Prompt sólido.',
    ok: 'Aceptable, con mejoras claras.',
    weak: 'Necesita trabajo antes de producción.',
    sample: 'IMPORTANTE: NUNCA uses markdown. NO inventes cosas. Analiza esto y dime algo bueno sobre el texto, etc.',
  },
  en: {
    prompt: 'Prompt',
    solid: 'Solid prompt.',
    ok: 'Acceptable, with clear improvements.',
    weak: 'Needs work before production.',
    sample: "IMPORTANT: NEVER use markdown. DON'T make stuff up. Analyze this and tell me something good about the text, etc.",
  },
});

const text = ref(t.value.sample);
const res = computed(() => lintPrompt(text.value, tr(LINTER_MESSAGES)));
const color = computed(() => (res.value.score >= 80 ? 'var(--ok)' : res.value.score >= 55 ? 'var(--warn)' : 'var(--bad)'));
const summary = computed(() => (res.value.score >= 80 ? t.value.solid : res.value.score >= 55 ? t.value.ok : t.value.weak));
</script>

<template>
  <div class="grid2">
    <div class="card"><label>{{ t.prompt }}<textarea v-model="text" style="min-height:300px" /></label></div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
        <div class="score" :style="{ color }">{{ res.score }}</div>
        <div class="note">{{ summary }}</div>
      </div>
      <LintList :items="res.items" />
    </div>
  </div>
</template>
