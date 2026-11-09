<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import KpiCard from '@/components/KpiCard.vue';
import ModelSelect from '@/components/ModelSelect.vue';
import { tr, useMessages } from '@/i18n';
import { fmt, n, usd } from '@/lib/format';
import { DEFAULT_MODEL, findModel, MODELS, priceFor } from '@/lib/models';

const t = useMessages({
  es: {
    model: 'Modelo',
    inp: 'Tokens de entrada sin caché / req',
    out: 'Tokens de salida / req',
    rpd: 'Requests por día',
    cr: 'Tokens leídos de caché / req',
    cw: 'Tokens escritos en caché / req',
    ttl: 'TTL de caché',
    ttl5: '5 minutos (1,25× entrada)',
    ttl60: '1 hora (2× entrada)',
    days: 'Días por mes',
    batch: 'Batch API (−50%)',
    prices: 'Precios USD / millón de tokens (editables)',
    pin: 'Entrada',
    pout: 'Salida',
    pcr: 'Lectura de caché',
    notePrefix: 'Nota',
    haikuTier: (limit: string, high: boolean) => `Haiku cambia de tarifa cuando el prompt supera ${limit} tokens${high ? ' (tarifa alta aplicada)' : ''}.`,
    result: 'Resultado',
    perReq: 'Por request',
    perDay: 'Por día',
    perMonth: 'Por mes',
    saving: 'Ahorro por caché',
    component: 'Componente',
    usdReq: 'USD / request',
    pctCost: '% del costo',
    parts: ['Entrada', 'Escritura caché', 'Lectura caché', 'Salida'],
    promptTotal: (tok: string, pct: string, ctx: string) => `Prompt total: ${tok} tokens (${pct}% de la ventana de ${ctx}).`,
    firstCall: 'Recordá que la primera llamada paga la escritura de caché.',
    compare: 'Mismo volumen en todos los modelos',
    footer: 'Precios de lista de fuentes públicas (oct–nov 2026). Verificalos en la página oficial antes de presupuestar. El descuento de Batch se aplica aquí a todo el request como aproximación.',
  },
  en: {
    model: 'Model',
    inp: 'Uncached input tokens / req',
    out: 'Output tokens / req',
    rpd: 'Requests per day',
    cr: 'Cache read tokens / req',
    cw: 'Cache write tokens / req',
    ttl: 'Cache TTL',
    ttl5: '5 minutes (1.25× input)',
    ttl60: '1 hour (2× input)',
    days: 'Days per month',
    batch: 'Batch API (−50%)',
    prices: 'Prices USD / million tokens (editable)',
    pin: 'Input',
    pout: 'Output',
    pcr: 'Cache read',
    notePrefix: 'Note',
    haikuTier: (limit: string, high: boolean) => `Haiku switches pricing tier when the prompt exceeds ${limit} tokens${high ? ' (higher tier applied)' : ''}.`,
    result: 'Result',
    perReq: 'Per request',
    perDay: 'Per day',
    perMonth: 'Per month',
    saving: 'Caching savings',
    component: 'Component',
    usdReq: 'USD / request',
    pctCost: '% of cost',
    parts: ['Input', 'Cache write', 'Cache read', 'Output'],
    promptTotal: (tok: string, pct: string, ctx: string) => `Total prompt: ${tok} tokens (${pct}% of the ${ctx} window).`,
    firstCall: 'Remember that the first call pays for the cache write.',
    compare: 'Same volume across all models',
    footer: 'List prices from public sources (Oct–Nov 2026). Check them on the official pricing page before budgeting. The Batch discount is applied here to the whole request as an approximation.',
  },
});

const s = reactive({ model: DEFAULT_MODEL, inp: 3000, out: 800, rpd: 1000, cr: 0, cw: 0, ttl: 1.25, days: 30, batch: false, pin: 0, pout: 0, pcr: 0 });

const model = computed(() => findModel(s.model));
const prompt = computed(() => n(s.inp) + n(s.cr) + n(s.cw));
const tier = computed(() => priceFor(model.value, prompt.value));

// Repone precios de lista al cambiar de modelo o de tramo (Haiku > 100K).
watch(() => [s.model, tier.value.t2], () => {
  s.pin = tier.value.pin;
  s.pout = tier.value.pout;
  s.pcr = tier.value.pcr;
}, { immediate: true });

const factor = computed(() => (s.batch ? 0.5 : 1));
const cost = (pin: number, pout: number, pcr: number) =>
  ((n(s.inp) * pin + n(s.cw) * pin * s.ttl + n(s.cr) * pcr + n(s.out) * pout) / 1e6) * factor.value;

const per = computed(() => cost(n(s.pin), n(s.pout), n(s.pcr)));
const noCache = computed(() => ((prompt.value * n(s.pin) + n(s.out) * n(s.pout)) / 1e6) * factor.value);
const saving = computed(() => (noCache.value > 0 ? (1 - per.value / noCache.value) * 100 : 0));
const parts = computed(() => [
  n(s.inp) * n(s.pin),
  n(s.cw) * n(s.pin) * s.ttl,
  n(s.cr) * n(s.pcr),
  n(s.out) * n(s.pout),
].map((v, i) => ({ k: t.value.parts[i]!, v: (v / 1e6) * factor.value })));
const compare = computed(() => MODELS.map((m) => {
  const p = priceFor(m, prompt.value);
  return { m, p, v: cost(p.pin, p.pout, p.pcr) };
}));
const monthly = (v: number) => v * n(s.rpd) * n(s.days);
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card">
        <div class="row"><label>{{ t.model }}<ModelSelect v-model="s.model" /></label></div>
        <div class="row">
          <label>{{ t.inp }}<input v-model.number="s.inp" type="number" min="0"></label>
          <label>{{ t.out }}<input v-model.number="s.out" type="number" min="0"></label>
          <label>{{ t.rpd }}<input v-model.number="s.rpd" type="number" min="0"></label>
        </div>
        <div class="row">
          <label>{{ t.cr }}<input v-model.number="s.cr" type="number" min="0"></label>
          <label>{{ t.cw }}<input v-model.number="s.cw" type="number" min="0"></label>
          <label>{{ t.ttl }}
            <select v-model.number="s.ttl"><option :value="1.25">{{ t.ttl5 }}</option><option :value="2">{{ t.ttl60 }}</option></select>
          </label>
        </div>
        <div class="row">
          <label>{{ t.days }}<input v-model.number="s.days" type="number" min="1"></label>
          <label class="chk"><input v-model="s.batch" type="checkbox"> {{ t.batch }}</label>
        </div>
        <details>
          <summary class="note" style="cursor:pointer">{{ t.prices }}</summary>
          <div class="row" style="margin-top:8px">
            <label>{{ t.pin }}<input v-model.number="s.pin" type="number" step="0.01"></label>
            <label>{{ t.pout }}<input v-model.number="s.pout" type="number" step="0.01"></label>
            <label>{{ t.pcr }}<input v-model.number="s.pcr" type="number" step="0.001"></label>
          </div>
          <p class="note">
            <template v-if="model.note">{{ t.notePrefix }}: {{ model.note ? tr(model.note) : '' }}. </template>
            <template v-if="model.tier">{{ t.haikuTier(fmt(model.tier.limit), tier.t2) }}</template>
          </p>
        </details>
      </div>
      <div class="card">
        <h3>{{ t.result }}</h3>
        <div class="kpis">
          <KpiCard :label="t.perReq" :value="usd(per)" />
          <KpiCard :label="t.perDay" :value="usd(per * n(s.rpd))" />
          <KpiCard :label="t.perMonth" :value="usd(monthly(per))" />
          <KpiCard :label="t.saving" :value="s.cr || s.cw ? fmt(saving, 1) + '%' : '—'" />
        </div>
        <table>
          <tr><th>{{ t.component }}</th><th class="num">{{ t.usdReq }}</th><th class="num">{{ t.pctCost }}</th></tr>
          <tr v-for="p in parts" :key="p.k"><td>{{ p.k }}</td><td class="num">{{ usd(p.v) }}</td><td class="num">{{ per ? fmt((p.v / per) * 100, 1) : 0 }}%</td></tr>
        </table>
        <p class="note">
          {{ t.promptTotal(fmt(prompt), fmt((prompt / model.ctx) * 100, 2), fmt(model.ctx)) }}
          <template v-if="s.cr && !s.cw">{{ t.firstCall }}</template>
        </p>
      </div>
    </div>
    <div class="card">
      <h3>{{ t.compare }}</h3>
      <table>
        <tr><th>{{ t.model }}</th><th class="num">{{ t.pin }}</th><th class="num">{{ t.pout }}</th><th class="num">{{ t.perReq }}</th><th class="num">{{ t.perMonth }}</th></tr>
        <tr v-for="c in compare" :key="c.m.id" :style="c.m.id === s.model ? 'color:var(--acc);font-weight:600' : ''">
          <td>{{ c.m.name }}</td><td class="num">${{ fmt(c.p.pin, 2) }}</td><td class="num">${{ fmt(c.p.pout, 2) }}</td>
          <td class="num">{{ usd(c.v) }}</td><td class="num">{{ usd(monthly(c.v)) }}</td>
        </tr>
      </table>
      <p class="note">{{ t.footer }}</p>
    </div>
  </div>
</template>
