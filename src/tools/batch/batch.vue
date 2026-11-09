<script setup lang="ts">
import { computed, reactive } from 'vue';
import LintList from '@/components/LintList.vue';
import ModelSelect from '@/components/ModelSelect.vue';
import TabbedCode from '@/components/TabbedCode.vue';
import { useMessages } from '@/i18n';
import { lines, n, shq, toPy } from '@/lib/format';
import type { Lint } from '@/lib/types';

const t = useMessages({
  es: {
    model: 'Modelo',
    prefix: 'Prefijo custom_id',
    sys: 'System prompt (compartido)',
    list: 'Prompts (uno por línea)',
    okIds: (k: number) => `${k} requests con custom_id únicos.`,
    badId: 'custom_id solo admite letras, números, guiones y _ (máx. 64 caracteres).',
    few: 'Batch rinde con volumen: para 1 request usá la API síncrona.',
    longSys: 'System largo y repetido: sumá cache_control para combinar descuento de batch y caché.',
    later: '# Más tarde:',
    note1: 'Los resultados llegan de forma asíncrona (la mayoría en menos de 24 h) y pueden venir en cualquier orden: usá',
    note2: 'para reconciliarlos. Consultá el estado con',
    note3: 'y descargá',
    defSys: 'Clasifica el sentimiento como positivo, negativo o neutral. Responde solo con la etiqueta.',
    defList: 'Me encantó el servicio, volveré.\nEl pedido llegó roto y nadie responde.\nEl producto es correcto, nada especial.',
  },
  en: {
    model: 'Model',
    prefix: 'custom_id prefix',
    sys: 'System prompt (shared)',
    list: 'Prompts (one per line)',
    okIds: (k: number) => `${k} requests with unique custom_ids.`,
    badId: 'custom_id only allows letters, numbers, hyphens and _ (max. 64 characters).',
    few: 'Batching pays off with volume: for a single request use the synchronous API.',
    longSys: 'Long, repeated system prompt: add cache_control to combine the batch and caching discounts.',
    later: '# Later:',
    note1: 'Results arrive asynchronously (most in under 24 h) and may come in any order: use',
    note2: 'to reconcile them. Check the status with',
    note3: 'and download',
    defSys: 'Classify the sentiment as positive, negative or neutral. Reply with the label only.',
    defList: 'Loved the service, will come back.\nThe order arrived broken and nobody answers.\nThe product is fine, nothing special.',
  },
});

const s = reactive({
  model: 'claude-haiku-5-5', max: 512, pre: 'item',
  sys: t.value.defSys,
  list: t.value.defList,
});

const requests = computed(() => lines(s.list).map((p, i) => {
  const params: Record<string, unknown> = { model: s.model, max_tokens: n(s.max) || 512 };
  if (s.sys.trim()) params.system = s.sys.trim();
  params.messages = [{ role: 'user', content: p }];
  return { custom_id: `${s.pre || 'item'}-${i + 1}`, params };
}));

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const m = t.value;
  L.push(/^[a-zA-Z0-9_-]{1,58}$/.test(s.pre || 'item') ? ['ok', m.okIds(requests.value.length)] : ['bad', m.badId]);
  if (requests.value.length < 2) L.push(['warn', m.few]);
  if (s.sys.length > 4000) L.push(['ok', m.longSys]);
  return L;
});

const tabs = computed(() => {
  const body = { requests: requests.value };
  return [
    { key: 'json', label: 'JSON', code: JSON.stringify(body, null, 2) },
    { key: 'curl', label: 'cURL', code: `curl https://api.anthropic.com/v1/messages/batches \\\n  -H "x-api-key: $ANTHROPIC_API_KEY" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "content-type: application/json" \\\n  -d ${shq(JSON.stringify(body, null, 2))}` },
    { key: 'py', label: 'Python', code: `import anthropic\n\nclient = anthropic.Anthropic()\n\nbatch = client.messages.batches.create(\n    requests=${toPy(requests.value, 1)},\n)\nprint(batch.id, batch.processing_status)\n\n${t.value.later}\n# for result in client.messages.batches.results(batch.id):\n#     print(result.custom_id, result.result.type)` },
  ];
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>{{ t.model }}<ModelSelect v-model="s.model" /></label>
        <label>max_tokens<input v-model.number="s.max" type="number"></label>
        <label>{{ t.prefix }}<input v-model="s.pre"></label>
      </div>
      <label>{{ t.sys }}<textarea v-model="s.sys" style="min-height:60px" /></label>
      <label style="margin-top:10px">{{ t.list }}<textarea v-model="s.list" style="min-height:150px" /></label>
      <div style="margin-top:10px"><LintList :items="lint" /></div>
    </div>
    <div>
      <TabbedCode :tabs="tabs" title="POST /v1/messages/batches" />
      <p class="note">
        {{ t.note1 }} <code>custom_id</code> {{ t.note2 }}
        <code>GET /v1/messages/batches/{id}</code> {{ t.note3 }} <code>results_url</code> (JSONL).
      </p>
    </div>
  </div>
</template>
