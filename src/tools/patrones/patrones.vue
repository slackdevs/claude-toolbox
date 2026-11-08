<script setup lang="ts">
import { computed, reactive } from 'vue';
import { PATTERNS, QUESTIONS, recommend } from './patrones.data';

const answers = reactive<Record<string, boolean>>({});
const rec = computed(() => recommend(answers));
const sorted = computed(() => [...PATTERNS].sort((a, b) => Number(rec.value.has(b.key)) - Number(rec.value.has(a.key))));
</script>

<template>
  <div class="grid2">
    <div class="card">
      <h3>Tu caso</h3>
      <div v-for="[id, q] in QUESTIONS" :key="id" class="q">
        <span>{{ q }}</span>
        <div>
          <button class="seg" :class="{ on: answers[id] === true }" @click="answers[id] = true">Sí</button>
          <button class="seg" :class="{ on: answers[id] === false }" @click="answers[id] = false">No</button>
        </div>
      </div>
      <p class="note">Principio rector: usá la solución más simple que funcione y sumá complejidad agéntica solo cuando mejore resultados medibles.</p>
    </div>
    <div class="card">
      <h3>Patrones</h3>
      <p v-if="!Object.keys(answers).length" class="note">Respondé las preguntas para resaltar recomendaciones.</p>
      <div v-for="p in sorted" :key="p.key" class="pat" :class="{ rec: rec.has(p.key) }">
        <h4>{{ p.name }} <span v-if="rec.has(p.key)" class="pill">recomendado</span></h4>
        <p>{{ p.what }}</p>
        <p><b>Cuándo:</b> {{ p.when }}</p>
        <p><b>Riesgo:</b> {{ p.risk }}</p>
      </div>
    </div>
  </div>
</template>
