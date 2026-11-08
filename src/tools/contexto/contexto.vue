<script setup lang="ts">
import { computed, reactive } from 'vue';
import KpiCard from '@/components/KpiCard.vue';
import LintList from '@/components/LintList.vue';
import { fmt, n } from '@/lib/format';
import type { Lint } from '@/lib/types';

const s = reactive({ win: 1_000_000, sys: 2500, nt: 12, tt: 350, doc: 40000, turns: 30, tpt: 3000, out: 16000, th: 80 });
const COLORS = ['#e8875b', '#7aa2f7', '#4cc38a', '#c792ea', '#e5b443'];

const parts = computed(() => [
  ['System', n(s.sys)], ['Tools', n(s.nt) * n(s.tt)], ['Documentos', n(s.doc)], ['Historial', n(s.turns) * n(s.tpt)], ['Salida', n(s.out)],
].map(([k, v], i) => ({ k: k as string, v: v as number, c: COLORS[i]! })));
const total = computed(() => parts.value.reduce((a, b) => a + b.v, 0));
const pct = computed(() => (total.value / s.win) * 100);

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const perTurn = n(s.tpt);
  const left = perTurn > 0 ? Math.max(0, Math.floor(((s.win * n(s.th)) / 100 - total.value) / perTurn)) : '∞';
  if (pct.value > 100) L.push(['bad', `Excedés la ventana por ${fmt(total.value - s.win)} tokens: el request fallará o se cortará.`]);
  else if (pct.value > n(s.th)) L.push(['warn', `Uso ${fmt(pct.value, 1)}% supera el umbral de ${n(s.th)}%: compactá o resumí el historial ahora.`]);
  else L.push(['ok', `Uso ${fmt(pct.value, 1)}%. Quedan ≈ ${left} turnos antes del umbral de compactación.`]);
  if (parts.value[3]!.v > total.value * 0.5) L.push(['warn', 'El historial es más de la mitad del contexto: resumí turnos viejos, limpiá tool results antiguos o delegá exploración a subagentes con contexto aislado.']);
  if (n(s.nt) > 20) L.push(['warn', 'Más de 20 tools cargadas: la selección se degrada. Repartí tools por agente/subagente o cargalas bajo demanda.']);
  if (n(s.doc) > 20000) L.push(['ok', 'Con documentos largos: ponelos al principio del prompt (dentro de &lt;documents&gt;) y la pregunta al final; pedí citas textuales antes de responder.']);
  const prefix = parts.value[0]!.v + parts.value[1]!.v;
  if (prefix > 1024) L.push(['ok', `System + tools (${fmt(prefix)} tokens) es un prefijo estable: candidato ideal a prompt caching.`]);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Ventana de contexto
          <select v-model.number="s.win"><option :value="1000000">1.000.000 tokens</option><option :value="200000">200.000 tokens</option></select>
        </label>
      </div>
      <div class="row">
        <label>System prompt<input v-model.number="s.sys" type="number"></label>
        <label>Nº de tools<input v-model.number="s.nt" type="number"></label>
        <label>Tokens promedio por tool<input v-model.number="s.tt" type="number"></label>
      </div>
      <div class="row">
        <label>Documentos / RAG<input v-model.number="s.doc" type="number"></label>
        <label>Turnos de historial<input v-model.number="s.turns" type="number"></label>
        <label>Tokens por turno (incl. tool results)<input v-model.number="s.tpt" type="number"></label>
      </div>
      <div class="row">
        <label>Reserva de salida (max_tokens)<input v-model.number="s.out" type="number"></label>
        <label>Umbral de compactación %<input v-model.number="s.th" type="number"></label>
      </div>
    </div>
    <div class="card">
      <h3>Distribución</h3>
      <div class="kpis">
        <KpiCard label="Total ocupado" :value="fmt(total)" />
        <KpiCard label="Libre" :value="fmt(s.win - total)" />
        <KpiCard label="Uso" :value="fmt(pct, 1) + '%'" />
      </div>
      <div class="bar">
        <div v-for="p in parts" :key="p.k" :title="`${p.k}: ${fmt(p.v)}`" :style="{ width: Math.min((p.v / s.win) * 100, 100) + '%', background: p.c }" />
      </div>
      <div class="legend"><span v-for="p in parts" :key="p.k"><i :style="{ background: p.c }" />{{ p.k }} {{ fmt(p.v) }}</span></div>
      <div style="margin-top:12px"><LintList :items="lint" /></div>
    </div>
  </div>
</template>
