<script setup lang="ts">
import { computed, reactive } from 'vue';
import LintList from '@/components/LintList.vue';
import ModelSelect from '@/components/ModelSelect.vue';
import TabbedCode from '@/components/TabbedCode.vue';
import { lines, n, shq, toPy } from '@/lib/format';
import type { Lint } from '@/lib/types';

const s = reactive({
  model: 'claude-haiku-5-5', max: 512, pre: 'item',
  sys: 'Clasifica el sentimiento como positivo, negativo o neutral. Responde solo con la etiqueta.',
  list: 'Me encantó el servicio, volveré.\nEl pedido llegó roto y nadie responde.\nEl producto es correcto, nada especial.',
});

const requests = computed(() => lines(s.list).map((p, i) => {
  const params: Record<string, unknown> = { model: s.model, max_tokens: n(s.max) || 512 };
  if (s.sys.trim()) params.system = s.sys.trim();
  params.messages = [{ role: 'user', content: p }];
  return { custom_id: `${s.pre || 'item'}-${i + 1}`, params };
}));

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  L.push(/^[a-zA-Z0-9_-]{1,58}$/.test(s.pre || 'item')
    ? ['ok', `${requests.value.length} requests con custom_id únicos.`]
    : ['bad', 'custom_id solo admite letras, números, guiones y _ (máx. 64 caracteres).']);
  if (requests.value.length < 2) L.push(['warn', 'Batch rinde con volumen: para 1 request usá la API síncrona.']);
  if (s.sys.length > 4000) L.push(['ok', 'System largo y repetido: sumá cache_control para combinar descuento de batch y caché.']);
  return L;
});

const tabs = computed(() => {
  const body = { requests: requests.value };
  return [
    { key: 'json', label: 'JSON', code: JSON.stringify(body, null, 2) },
    { key: 'curl', label: 'cURL', code: `curl https://api.anthropic.com/v1/messages/batches \\\n  -H "x-api-key: $ANTHROPIC_API_KEY" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "content-type: application/json" \\\n  -d ${shq(JSON.stringify(body, null, 2))}` },
    { key: 'py', label: 'Python', code: `import anthropic\n\nclient = anthropic.Anthropic()\n\nbatch = client.messages.batches.create(\n    requests=${toPy(requests.value, 1)},\n)\nprint(batch.id, batch.processing_status)\n\n# Más tarde:\n# for result in client.messages.batches.results(batch.id):\n#     print(result.custom_id, result.result.type)` },
  ];
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Modelo<ModelSelect v-model="s.model" /></label>
        <label>max_tokens<input v-model.number="s.max" type="number"></label>
        <label>Prefijo custom_id<input v-model="s.pre"></label>
      </div>
      <label>System prompt (compartido)<textarea v-model="s.sys" style="min-height:60px" /></label>
      <label style="margin-top:10px">Prompts (uno por línea)<textarea v-model="s.list" style="min-height:150px" /></label>
      <div style="margin-top:10px"><LintList :items="lint" /></div>
    </div>
    <div>
      <TabbedCode :tabs="tabs" title="POST /v1/messages/batches" />
      <p class="note">
        Los resultados llegan de forma asíncrona (la mayoría en menos de 24 h) y pueden venir en cualquier orden: usá <code>custom_id</code> para reconciliarlos.
        Consultá el estado con <code>GET /v1/messages/batches/{id}</code> y descargá <code>results_url</code> (JSONL).
      </p>
    </div>
  </div>
</template>
