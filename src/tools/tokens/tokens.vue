<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import KpiCard from '@/components/KpiCard.vue';
import { locale, useMessages } from '@/i18n';
import { fmt, shq, usd } from '@/lib/format';
import { MODELS, priceFor } from '@/lib/models';

const t = useMessages({
  es: {
    text: 'Texto a analizar',
    placeholder: 'Pegá aquí tu prompt, documento o código…',
    kind: 'Tipo de contenido',
    en: 'Prosa en inglés (~4 caracteres/token)',
    es: 'Prosa en español (~3,5)',
    code: 'Código / JSON (~3)',
    chars: 'Caracteres',
    words: 'Palabras',
    est: 'Tokens estimados',
    range: 'Rango probable',
    win1m: '% de ventana 1M',
    win200k: '% de ventana 200K',
    model: 'Modelo',
    costIn: 'Costo de este texto como entrada',
    x10k: '× 10.000 requests',
    note: 'Es una heurística: el tokenizer real varía por modelo e idioma. Para el número exacto usá el endpoint',
    sample: 'Hola, Claude',
    response: '# Respuesta: {"input_tokens": N}',
  },
  en: {
    text: 'Text to analyze',
    placeholder: 'Paste your prompt, document or code here…',
    kind: 'Content type',
    en: 'English prose (~4 characters/token)',
    es: 'Spanish prose (~3.5)',
    code: 'Code / JSON (~3)',
    chars: 'Characters',
    words: 'Words',
    est: 'Estimated tokens',
    range: 'Likely range',
    win1m: '% of 1M window',
    win200k: '% of 200K window',
    model: 'Model',
    costIn: 'Cost of this text as input',
    x10k: '× 10,000 requests',
    note: 'This is a heuristic: the real tokenizer varies by model and language. For the exact number use the',
    sample: 'Hello, Claude',
    response: '# Response: {"input_tokens": N}',
  },
});

const text = ref('');
const cpt = ref(locale.value === 'es' ? 3.5 : 4);

const chars = computed(() => text.value.length);
const words = computed(() => (text.value.match(/\S+/g) ?? []).length);
const est = computed(() => Math.ceil(chars.value / cpt.value));
const lo = computed(() => Math.ceil(chars.value / (cpt.value + 0.6)));
const hi = computed(() => Math.ceil(chars.value / Math.max(cpt.value - 0.6, 1.5)));
const costs = computed(() => MODELS.map((m) => ({ m, v: (est.value * priceFor(m, est.value).pin) / 1e6 })));
const curl = computed(() => {
  const tx = text.value;
  const content = (tx.slice(0, 200) + (tx.length > 200 ? '…' : '')) || t.value.sample;
  const body = JSON.stringify({ model: 'claude-sonnet-5-5', messages: [{ role: 'user', content }] }, null, 2);
  return `curl https://api.anthropic.com/v1/messages/count_tokens \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d ${shq(body)}

${t.value.response}`;
});
</script>

<template>
  <div>
    <div class="card">
      <label>{{ t.text }}<textarea v-model="text" style="min-height:200px" :placeholder="t.placeholder" /></label>
      <div class="row" style="margin-top:10px">
        <label>{{ t.kind }}
          <select v-model.number="cpt">
            <option :value="4">{{ t.en }}</option>
            <option :value="3.5">{{ t.es }}</option>
            <option :value="3">{{ t.code }}</option>
          </select>
        </label>
      </div>
    </div>
    <div class="card">
      <div class="kpis">
        <KpiCard :label="t.chars" :value="fmt(chars)" />
        <KpiCard :label="t.words" :value="fmt(words)" />
        <KpiCard :label="t.est" :value="'≈ ' + fmt(est)" />
        <KpiCard :label="t.range" :value="`${fmt(lo)} – ${fmt(hi)}`" small />
        <KpiCard :label="t.win1m" :value="fmt((est / 1e6) * 100, 3) + '%'" />
        <KpiCard :label="t.win200k" :value="fmt((est / 2e5) * 100, 2) + '%'" />
      </div>
      <table>
        <tr><th>{{ t.model }}</th><th class="num">{{ t.costIn }}</th><th class="num">{{ t.x10k }}</th></tr>
        <tr v-for="c in costs" :key="c.m.id"><td>{{ c.m.name }}</td><td class="num">{{ usd(c.v) }}</td><td class="num">{{ usd(c.v * 1e4) }}</td></tr>
      </table>
      <p class="note">{{ t.note }} <code>count_tokens</code>:</p>
    </div>
    <CodeOutput :code="curl" label="POST /v1/messages/count_tokens" />
  </div>
</template>
