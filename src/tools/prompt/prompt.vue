<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { useMessages } from '@/i18n';
import { lines } from '@/lib/format';
import { DEFAULT_MODEL } from '@/lib/models';

const t = useMessages({
  es: {
    role: 'Rol (va al system prompt)',
    ctx: 'Contexto (por qué y para quién)',
    docs: 'Documentos (separá con una línea ---)',
    docsPh: 'Texto del documento 1\n---\nTexto del documento 2',
    task: 'Tarea',
    ins: 'Instrucciones (una por línea)',
    ex: 'Ejemplos (separá con ---)',
    fmt: 'Formato de salida',
    think: 'Pedir razonamiento en <analysis> antes de la respuesta',
    variable: 'Insertar variable',
    variable2: 'para el dato de entrada',
    thinkText: 'Antes de responder, razona paso a paso dentro de <analysis></analysis>. Luego da solo la respuesta final dentro de <answer></answer>.',
    defaults: {
      role: 'Eres un analista senior de soporte al cliente',
      ctx: 'Las respuestas se usan para priorizar tickets en un equipo de 5 personas. Necesitan ser accionables.',
      task: 'Clasifica el ticket por urgencia y propone el próximo paso.',
      ins: 'Usa solo información del ticket\nSi falta un dato clave, dilo explícitamente\nUrgencia: alta, media o baja',
      ex: 'Ticket: "No puedo entrar desde ayer, tengo una demo hoy"\nRespuesta: {"urgencia":"alta","proximo_paso":"Resetear credenciales y llamar al cliente"}',
      fmt: 'JSON con las claves "urgencia" y "proximo_paso"',
    },
  },
  en: {
    role: 'Role (goes in the system prompt)',
    ctx: 'Context (why and for whom)',
    docs: 'Documents (separate with a --- line)',
    docsPh: 'Text of document 1\n---\nText of document 2',
    task: 'Task',
    ins: 'Instructions (one per line)',
    ex: 'Examples (separate with ---)',
    fmt: 'Output format',
    think: 'Ask for reasoning in <analysis> before the answer',
    variable: 'Insert variable',
    variable2: 'for the input data',
    thinkText: 'Before answering, reason step by step inside <analysis></analysis>. Then give only the final answer inside <answer></answer>.',
    defaults: {
      role: 'You are a senior customer support analyst',
      ctx: 'The answers are used to prioritize tickets in a 5-person team. They need to be actionable.',
      task: 'Classify the ticket by urgency and propose the next step.',
      ins: 'Use only information from the ticket\nIf a key detail is missing, say so explicitly\nUrgency: high, medium or low',
      ex: 'Ticket: "I can\'t log in since yesterday and I have a demo today"\nAnswer: {"urgency":"high","next_step":"Reset credentials and call the customer"}',
      fmt: 'JSON with the keys "urgency" and "next_step"',
    },
  },
});

const s = reactive({ ...t.value.defaults, docs: '', think: true, variable: true });

const split = (x: string) => x.split(/\n-{3,}\n/).map((y) => y.trim()).filter(Boolean);
const system = computed(() => (s.role.trim() ? s.role.trim().replace(/\.?$/, '.') : ''));
const user = computed(() => {
  let u = '';
  const docs = split(s.docs), ins = lines(s.ins), ex = split(s.ex);
  if (docs.length) u += `<documents>\n${docs.map((d, i) => `  <document index="${i + 1}">\n    <document_content>\n${d}\n    </document_content>\n  </document>`).join('\n')}\n</documents>\n\n`;
  if (s.ctx.trim()) u += `<context>\n${s.ctx.trim()}\n</context>\n\n`;
  if (ins.length) u += `<instructions>\n${ins.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n</instructions>\n\n`;
  if (ex.length) u += `<examples>\n${ex.map((x) => `<example>\n${x}\n</example>`).join('\n')}\n</examples>\n\n`;
  if (s.fmt.trim()) u += `<output_format>\n${s.fmt.trim()}\n</output_format>\n\n`;
  if (s.variable) u += '<input>\n{{INPUT}}\n</input>\n\n';
  u += s.task.trim();
  if (s.think) u += '\n\n' + t.value.thinkText;
  return u;
});
const json = computed(() => JSON.stringify({ model: DEFAULT_MODEL, max_tokens: 1024, system: system.value, messages: [{ role: 'user', content: user.value }] }, null, 2));
</script>

<template>
  <div class="grid2">
    <div class="card">
      <label>{{ t.role }}<input v-model="s.role"></label>
      <label style="margin-top:10px">{{ t.ctx }}<textarea v-model="s.ctx" style="min-height:60px" /></label>
      <label style="margin-top:10px">{{ t.docs }}<textarea v-model="s.docs" style="min-height:70px" :placeholder="t.docsPh" /></label>
      <label style="margin-top:10px">{{ t.task }}<textarea v-model="s.task" style="min-height:50px" /></label>
      <label style="margin-top:10px">{{ t.ins }}<textarea v-model="s.ins" style="min-height:70px" /></label>
      <label style="margin-top:10px">{{ t.ex }}<textarea v-model="s.ex" style="min-height:70px" /></label>
      <label style="margin-top:10px">{{ t.fmt }}<input v-model="s.fmt"></label>
      <label class="chk" style="margin-top:10px"><input v-model="s.think" type="checkbox"> {{ t.think }}</label>
      <label class="chk"><input v-model="s.variable" type="checkbox"> {{ t.variable }} <code v-pre>{{INPUT}}</code> {{ t.variable2 }}</label>
    </div>
    <div>
      <CodeOutput :code="system" label="system" />
      <CodeOutput :code="user" label="user" />
      <CodeOutput :code="json" label="messages.create (JSON)" />
    </div>
  </div>
</template>
