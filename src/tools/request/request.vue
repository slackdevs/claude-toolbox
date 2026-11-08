<script setup lang="ts">
import { computed, reactive } from 'vue';
import ModelSelect from '@/components/ModelSelect.vue';
import TabbedCode from '@/components/TabbedCode.vue';
import { n, shq, toPy } from '@/lib/format';
import { DEFAULT_MODEL } from '@/lib/models';

const s = reactive({
  model: DEFAULT_MODEL, max: 1024, temp: '' as string | number, stop: '',
  sys: 'Eres un asistente experto en análisis de contratos. Responde en español.',
  user: 'Resume las cláusulas de rescisión del siguiente contrato.',
  cache: false, stream: false,
});

const body = computed(() => {
  const b: Record<string, unknown> = { model: s.model, max_tokens: n(s.max) || 1024 };
  const sys = s.sys.trim();
  if (sys) b.system = s.cache ? [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }] : sys;
  if (s.temp !== '') b.temperature = n(s.temp);
  const st = s.stop.split(',').map((x) => x.trim()).filter(Boolean);
  if (st.length) b.stop_sequences = st;
  b.messages = [{ role: 'user', content: s.user }];
  return b;
});

const tabs = computed(() => {
  const b = body.value;
  const withStream = s.stream ? { ...b, stream: true } : b;
  const kw = Object.entries(b).map(([k, v]) => `    ${k}=${toPy(v, 1)}`).join(',\n');
  const js = JSON.stringify(b, null, 2);
  const curl = `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  ${s.stream ? '--no-buffer \\\n  ' : ''}-d ${shq(JSON.stringify(withStream, null, 2))}`;
  const py = 'import anthropic\n\nclient = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY del entorno\n\n' + (s.stream
    ? `with client.messages.stream(\n${kw},\n) as stream:\n    for text in stream.text_stream:\n        print(text, end="", flush=True)\n\nfinal = stream.get_final_message()\nprint("\\n", final.usage)`
    : `message = client.messages.create(\n${kw},\n)\n\nprint(message.content[0].text)\nprint(message.stop_reason, message.usage)`);
  const ts = 'import Anthropic from "@anthropic-ai/sdk";\n\nconst client = new Anthropic(); // lee ANTHROPIC_API_KEY\n\n' + (s.stream
    ? `const stream = client.messages.stream(${js});\n\nstream.on("text", (t) => process.stdout.write(t));\nconst final = await stream.finalMessage();\nconsole.log("\\n", final.usage);`
    : `const message = await client.messages.create(${js});\n\nconsole.log(message.content);\nconsole.log(message.stop_reason, message.usage);`);
  return [
    { key: 'curl', label: 'cURL', code: curl },
    { key: 'py', label: 'Python', code: py },
    { key: 'ts', label: 'TypeScript', code: ts },
    { key: 'json', label: 'JSON', code: JSON.stringify(withStream, null, 2) },
  ];
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Modelo<ModelSelect v-model="s.model" /></label>
        <label>max_tokens<input v-model.number="s.max" type="number"></label>
        <label>temperature (vacío = default)<input v-model="s.temp" type="number" step="0.1" min="0" max="1" placeholder="default"></label>
      </div>
      <label>System prompt<textarea v-model="s.sys" /></label>
      <label style="margin-top:10px">Mensaje del usuario<textarea v-model="s.user" /></label>
      <div class="row" style="margin-top:10px"><label>stop_sequences (coma)<input v-model="s.stop" placeholder="ej: </answer>"></label></div>
      <label class="chk"><input v-model="s.cache" type="checkbox"> Cachear system prompt (cache_control ephemeral)</label>
      <label class="chk"><input v-model="s.stream" type="checkbox"> Streaming (SSE)</label>
    </div>
    <TabbedCode :tabs="tabs" title="código" />
  </div>
</template>
