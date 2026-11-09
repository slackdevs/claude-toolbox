<script setup lang="ts">
import { computed, reactive } from 'vue';
import { tr, useMessages } from '@/i18n';
import { PATTERNS, QUESTIONS, recommend } from './patrones.data';

const t = useMessages({
  es: {
    case: 'Tu caso',
    yes: 'Sí',
    no: 'No',
    principle: 'Principio rector: usá la solución más simple que funcione y sumá complejidad agéntica solo cuando mejore resultados medibles.',
    patterns: 'Patrones',
    answer: 'Respondé las preguntas para resaltar recomendaciones.',
    recommended: 'recomendado',
    when: 'Cuándo:',
    risk: 'Riesgo:',
  },
  en: {
    case: 'Your case',
    yes: 'Yes',
    no: 'No',
    principle: 'Guiding principle: use the simplest solution that works and add agentic complexity only when it improves measurable outcomes.',
    patterns: 'Patterns',
    answer: 'Answer the questions to highlight recommendations.',
    recommended: 'recommended',
    when: 'When:',
    risk: 'Risk:',
  },
});

const answers = reactive<Record<string, boolean>>({});
const rec = computed(() => recommend(answers));
const sorted = computed(() => [...tr(PATTERNS)].sort((a, b) => Number(rec.value.has(b.key)) - Number(rec.value.has(a.key))));
</script>

<template>
  <div class="grid2">
    <div class="card">
      <h3>{{ t.case }}</h3>
      <div v-for="[id, q] in tr(QUESTIONS)" :key="id" class="q">
        <span>{{ q }}</span>
        <div>
          <button class="seg" :class="{ on: answers[id] === true }" @click="answers[id] = true">{{ t.yes }}</button>
          <button class="seg" :class="{ on: answers[id] === false }" @click="answers[id] = false">{{ t.no }}</button>
        </div>
      </div>
      <p class="note">{{ t.principle }}</p>
    </div>
    <div class="card">
      <h3>{{ t.patterns }}</h3>
      <p v-if="!Object.keys(answers).length" class="note">{{ t.answer }}</p>
      <div v-for="p in sorted" :key="p.key" class="pat" :class="{ rec: rec.has(p.key) }">
        <h4>{{ p.name }} <span v-if="rec.has(p.key)" class="pill">{{ t.recommended }}</span></h4>
        <p>{{ p.what }}</p>
        <p><b>{{ t.when }}</b> {{ p.when }}</p>
        <p><b>{{ t.risk }}</b> {{ p.risk }}</p>
      </div>
    </div>
  </div>
</template>
