<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import KpiCard from '@/components/KpiCard.vue';
import ModelSelect from '@/components/ModelSelect.vue';
import { fmt, n, usd } from '@/lib/format';
import { DEFAULT_MODEL, findModel, MODELS, priceFor } from '@/lib/models';

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
  ['Entrada', n(s.inp) * n(s.pin)],
  ['Escritura caché', n(s.cw) * n(s.pin) * s.ttl],
  ['Lectura caché', n(s.cr) * n(s.pcr)],
  ['Salida', n(s.out) * n(s.pout)],
].map(([k, v]) => ({ k: k as string, v: ((v as number) / 1e6) * factor.value })));
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
        <div class="row"><label>Modelo<ModelSelect v-model="s.model" /></label></div>
        <div class="row">
          <label>Tokens de entrada sin caché / req<input v-model.number="s.inp" type="number" min="0"></label>
          <label>Tokens de salida / req<input v-model.number="s.out" type="number" min="0"></label>
          <label>Requests por día<input v-model.number="s.rpd" type="number" min="0"></label>
        </div>
        <div class="row">
          <label>Tokens leídos de caché / req<input v-model.number="s.cr" type="number" min="0"></label>
          <label>Tokens escritos en caché / req<input v-model.number="s.cw" type="number" min="0"></label>
          <label>TTL de caché
            <select v-model.number="s.ttl"><option :value="1.25">5 minutos (1,25× entrada)</option><option :value="2">1 hora (2× entrada)</option></select>
          </label>
        </div>
        <div class="row">
          <label>Días por mes<input v-model.number="s.days" type="number" min="1"></label>
          <label class="chk"><input v-model="s.batch" type="checkbox"> Batch API (−50%)</label>
        </div>
        <details>
          <summary class="note" style="cursor:pointer">Precios USD / millón de tokens (editables)</summary>
          <div class="row" style="margin-top:8px">
            <label>Entrada<input v-model.number="s.pin" type="number" step="0.01"></label>
            <label>Salida<input v-model.number="s.pout" type="number" step="0.01"></label>
            <label>Lectura de caché<input v-model.number="s.pcr" type="number" step="0.001"></label>
          </div>
          <p class="note">
            <template v-if="model.note">Nota: {{ model.note }}. </template>
            <template v-if="model.tier">Haiku cambia de tarifa cuando el prompt supera {{ fmt(model.tier.limit) }} tokens{{ tier.t2 ? ' (tarifa alta aplicada)' : '' }}.</template>
          </p>
        </details>
      </div>
      <div class="card">
        <h3>Resultado</h3>
        <div class="kpis">
          <KpiCard label="Por request" :value="usd(per)" />
          <KpiCard label="Por día" :value="usd(per * n(s.rpd))" />
          <KpiCard label="Por mes" :value="usd(monthly(per))" />
          <KpiCard label="Ahorro por caché" :value="s.cr || s.cw ? fmt(saving, 1) + '%' : '—'" />
        </div>
        <table>
          <tr><th>Componente</th><th class="num">USD / request</th><th class="num">% del costo</th></tr>
          <tr v-for="p in parts" :key="p.k"><td>{{ p.k }}</td><td class="num">{{ usd(p.v) }}</td><td class="num">{{ per ? fmt((p.v / per) * 100, 1) : 0 }}%</td></tr>
        </table>
        <p class="note">
          Prompt total: {{ fmt(prompt) }} tokens ({{ fmt((prompt / model.ctx) * 100, 2) }}% de la ventana de {{ fmt(model.ctx) }}).
          <template v-if="s.cr && !s.cw">Recordá que la primera llamada paga la escritura de caché.</template>
        </p>
      </div>
    </div>
    <div class="card">
      <h3>Mismo volumen en todos los modelos</h3>
      <table>
        <tr><th>Modelo</th><th class="num">Entrada</th><th class="num">Salida</th><th class="num">Por request</th><th class="num">Por mes</th></tr>
        <tr v-for="c in compare" :key="c.m.id" :style="c.m.id === s.model ? 'color:var(--acc);font-weight:600' : ''">
          <td>{{ c.m.name }}</td><td class="num">${{ fmt(c.p.pin, 2) }}</td><td class="num">${{ fmt(c.p.pout, 2) }}</td>
          <td class="num">{{ usd(c.v) }}</td><td class="num">{{ usd(monthly(c.v)) }}</td>
        </tr>
      </table>
      <p class="note">Precios de lista de fuentes públicas (oct–nov 2026). Verificalos en la página oficial antes de presupuestar. El descuento de Batch se aplica aquí a todo el request como aproximación.</p>
    </div>
  </div>
</template>
