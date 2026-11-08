<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import KpiCard from '@/components/KpiCard.vue';
import { fmt, shq, usd } from '@/lib/format';
import { MODELS, priceFor } from '@/lib/models';

const text = ref('');
const cpt = ref(3.5);

const chars = computed(() => text.value.length);
const words = computed(() => (text.value.match(/\S+/g) ?? []).length);
const est = computed(() => Math.ceil(chars.value / cpt.value));
const lo = computed(() => Math.ceil(chars.value / (cpt.value + 0.6)));
const hi = computed(() => Math.ceil(chars.value / Math.max(cpt.value - 0.6, 1.5)));
const costs = computed(() => MODELS.map((m) => ({ m, v: (est.value * priceFor(m, est.value).pin) / 1e6 })));
const curl = computed(() => {
  const t = text.value;
  const content = (t.slice(0, 200) + (t.length > 200 ? '…' : '')) || 'Hola, Claude';
  const body = JSON.stringify({ model: 'claude-sonnet-5-5', messages: [{ role: 'user', content }] }, null, 2);
  return `curl https://api.anthropic.com/v1/messages/count_tokens \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d ${shq(body)}

# Respuesta: {"input_tokens": N}`;
});
</script>

<template>
  <div>
    <div class="card">
      <label>Texto a analizar<textarea v-model="text" style="min-height:200px" placeholder="Pegá aquí tu prompt, documento o código…" /></label>
      <div class="row" style="margin-top:10px">
        <label>Tipo de contenido
          <select v-model.number="cpt">
            <option :value="4">Prosa en inglés (~4 caracteres/token)</option>
            <option :value="3.5">Prosa en español (~3,5)</option>
            <option :value="3">Código / JSON (~3)</option>
          </select>
        </label>
      </div>
    </div>
    <div class="card">
      <div class="kpis">
        <KpiCard label="Caracteres" :value="fmt(chars)" />
        <KpiCard label="Palabras" :value="fmt(words)" />
        <KpiCard label="Tokens estimados" :value="'≈ ' + fmt(est)" />
        <KpiCard label="Rango probable" :value="`${fmt(lo)} – ${fmt(hi)}`" small />
        <KpiCard label="% de ventana 1M" :value="fmt((est / 1e6) * 100, 3) + '%'" />
        <KpiCard label="% de ventana 200K" :value="fmt((est / 2e5) * 100, 2) + '%'" />
      </div>
      <table>
        <tr><th>Modelo</th><th class="num">Costo de este texto como entrada</th><th class="num">× 10.000 requests</th></tr>
        <tr v-for="c in costs" :key="c.m.id"><td>{{ c.m.name }}</td><td class="num">{{ usd(c.v) }}</td><td class="num">{{ usd(c.v * 1e4) }}</td></tr>
      </table>
      <p class="note">Es una heurística: el tokenizer real varía por modelo e idioma. Para el número exacto usá el endpoint <code>count_tokens</code>:</p>
    </div>
    <CodeOutput :code="curl" label="POST /v1/messages/count_tokens" />
  </div>
</template>
