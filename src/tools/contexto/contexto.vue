<script setup lang="ts">
import { computed, reactive } from 'vue';
import KpiCard from '@/components/KpiCard.vue';
import LintList from '@/components/LintList.vue';
import { useMessages } from '@/i18n';
import { fmt, n } from '@/lib/format';
import type { Lint } from '@/lib/types';

const t = useMessages({
  es: {
    win: 'Ventana de contexto',
    w1m: '1.000.000 tokens',
    w200k: '200.000 tokens',
    sys: 'System prompt',
    nt: 'Nº de tools',
    tt: 'Tokens promedio por tool',
    doc: 'Documentos / RAG',
    turns: 'Turnos de historial',
    tpt: 'Tokens por turno (incl. tool results)',
    out: 'Reserva de salida (max_tokens)',
    th: 'Umbral de compactación %',
    dist: 'Distribución',
    total: 'Total ocupado',
    free: 'Libre',
    use: 'Uso',
    parts: ['System', 'Tools', 'Documentos', 'Historial', 'Salida'],
    over: (x: string) => `Excedés la ventana por ${x} tokens: el request fallará o se cortará.`,
    aboveTh: (pct: string, th: number) => `Uso ${pct}% supera el umbral de ${th}%: compactá o resumí el historial ahora.`,
    okUse: (pct: string, left: string | number) => `Uso ${pct}%. Quedan ≈ ${left} turnos antes del umbral de compactación.`,
    history: 'El historial es más de la mitad del contexto: resumí turnos viejos, limpiá tool results antiguos o delegá exploración a subagentes con contexto aislado.',
    manyTools: 'Más de 20 tools cargadas: la selección se degrada. Repartí tools por agente/subagente o cargalas bajo demanda.',
    longDocs: 'Con documentos largos: ponelos al principio del prompt (dentro de &lt;documents&gt;) y la pregunta al final; pedí citas textuales antes de responder.',
    prefix: (x: string) => `System + tools (${x} tokens) es un prefijo estable: candidato ideal a prompt caching.`,
  },
  en: {
    win: 'Context window',
    w1m: '1,000,000 tokens',
    w200k: '200,000 tokens',
    sys: 'System prompt',
    nt: 'No. of tools',
    tt: 'Average tokens per tool',
    doc: 'Documents / RAG',
    turns: 'History turns',
    tpt: 'Tokens per turn (incl. tool results)',
    out: 'Output reserve (max_tokens)',
    th: 'Compaction threshold %',
    dist: 'Breakdown',
    total: 'Total used',
    free: 'Free',
    use: 'Usage',
    parts: ['System', 'Tools', 'Documents', 'History', 'Output'],
    over: (x: string) => `You exceed the window by ${x} tokens: the request will fail or be truncated.`,
    aboveTh: (pct: string, th: number) => `Usage ${pct}% is above the ${th}% threshold: compact or summarize the history now.`,
    okUse: (pct: string, left: string | number) => `Usage ${pct}%. About ${left} turns left before the compaction threshold.`,
    history: 'History is more than half of the context: summarize old turns, clear stale tool results or delegate exploration to subagents with isolated context.',
    manyTools: 'More than 20 tools loaded: selection quality degrades. Split tools across agents/subagents or load them on demand.',
    longDocs: 'With long documents: put them at the start of the prompt (inside &lt;documents&gt;) and the question at the end; ask for verbatim quotes before answering.',
    prefix: (x: string) => `System + tools (${x} tokens) is a stable prefix: an ideal candidate for prompt caching.`,
  },
});

const s = reactive({ win: 1_000_000, sys: 2500, nt: 12, tt: 350, doc: 40000, turns: 30, tpt: 3000, out: 16000, th: 80 });
const COLORS = ['#e8875b', '#7aa2f7', '#4cc38a', '#c792ea', '#e5b443'];

const parts = computed(() => [
  n(s.sys), n(s.nt) * n(s.tt), n(s.doc), n(s.turns) * n(s.tpt), n(s.out),
].map((v, i) => ({ k: t.value.parts[i]!, v, c: COLORS[i]! })));
const total = computed(() => parts.value.reduce((a, b) => a + b.v, 0));
const pct = computed(() => (total.value / s.win) * 100);

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const m = t.value;
  const perTurn = n(s.tpt);
  const left = perTurn > 0 ? Math.max(0, Math.floor(((s.win * n(s.th)) / 100 - total.value) / perTurn)) : '∞';
  if (pct.value > 100) L.push(['bad', m.over(fmt(total.value - s.win))]);
  else if (pct.value > n(s.th)) L.push(['warn', m.aboveTh(fmt(pct.value, 1), n(s.th))]);
  else L.push(['ok', m.okUse(fmt(pct.value, 1), left)]);
  if (parts.value[3]!.v > total.value * 0.5) L.push(['warn', m.history]);
  if (n(s.nt) > 20) L.push(['warn', m.manyTools]);
  if (n(s.doc) > 20000) L.push(['ok', m.longDocs]);
  const prefix = parts.value[0]!.v + parts.value[1]!.v;
  if (prefix > 1024) L.push(['ok', m.prefix(fmt(prefix))]);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>{{ t.win }}
          <select v-model.number="s.win"><option :value="1000000">{{ t.w1m }}</option><option :value="200000">{{ t.w200k }}</option></select>
        </label>
      </div>
      <div class="row">
        <label>{{ t.sys }}<input v-model.number="s.sys" type="number"></label>
        <label>{{ t.nt }}<input v-model.number="s.nt" type="number"></label>
        <label>{{ t.tt }}<input v-model.number="s.tt" type="number"></label>
      </div>
      <div class="row">
        <label>{{ t.doc }}<input v-model.number="s.doc" type="number"></label>
        <label>{{ t.turns }}<input v-model.number="s.turns" type="number"></label>
        <label>{{ t.tpt }}<input v-model.number="s.tpt" type="number"></label>
      </div>
      <div class="row">
        <label>{{ t.out }}<input v-model.number="s.out" type="number"></label>
        <label>{{ t.th }}<input v-model.number="s.th" type="number"></label>
      </div>
    </div>
    <div class="card">
      <h3>{{ t.dist }}</h3>
      <div class="kpis">
        <KpiCard :label="t.total" :value="fmt(total)" />
        <KpiCard :label="t.free" :value="fmt(s.win - total)" />
        <KpiCard :label="t.use" :value="fmt(pct, 1) + '%'" />
      </div>
      <div class="bar">
        <div v-for="p in parts" :key="p.k" :title="`${p.k}: ${fmt(p.v)}`" :style="{ width: Math.min((p.v / s.win) * 100, 100) + '%', background: p.c }" />
      </div>
      <div class="legend"><span v-for="p in parts" :key="p.k"><i :style="{ background: p.c }" />{{ p.k }} {{ fmt(p.v) }}</span></div>
      <div style="margin-top:12px"><LintList :items="lint" /></div>
    </div>
  </div>
</template>
