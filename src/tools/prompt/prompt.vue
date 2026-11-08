<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { lines } from '@/lib/format';
import { DEFAULT_MODEL } from '@/lib/models';

const s = reactive({
  role: 'Eres un analista senior de soporte al cliente',
  ctx: 'Las respuestas se usan para priorizar tickets en un equipo de 5 personas. Necesitan ser accionables.',
  docs: '',
  task: 'Clasifica el ticket por urgencia y propone el próximo paso.',
  ins: 'Usa solo información del ticket\nSi falta un dato clave, dilo explícitamente\nUrgencia: alta, media o baja',
  ex: 'Ticket: "No puedo entrar desde ayer, tengo una demo hoy"\nRespuesta: {"urgencia":"alta","proximo_paso":"Resetear credenciales y llamar al cliente"}',
  fmt: 'JSON con las claves "urgencia" y "proximo_paso"',
  think: true,
  variable: true,
});

const split = (t: string) => t.split(/\n-{3,}\n/).map((x) => x.trim()).filter(Boolean);
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
  if (s.think) u += '\n\nAntes de responder, razona paso a paso dentro de <analysis></analysis>. Luego da solo la respuesta final dentro de <answer></answer>.';
  return u;
});
const json = computed(() => JSON.stringify({ model: DEFAULT_MODEL, max_tokens: 1024, system: system.value, messages: [{ role: 'user', content: user.value }] }, null, 2));
</script>

<template>
  <div class="grid2">
    <div class="card">
      <label>Rol (va al system prompt)<input v-model="s.role"></label>
      <label style="margin-top:10px">Contexto (por qué y para quién)<textarea v-model="s.ctx" style="min-height:60px" /></label>
      <label style="margin-top:10px">Documentos (separá con una línea ---)<textarea v-model="s.docs" style="min-height:70px" placeholder="Texto del documento 1&#10;---&#10;Texto del documento 2" /></label>
      <label style="margin-top:10px">Tarea<textarea v-model="s.task" style="min-height:50px" /></label>
      <label style="margin-top:10px">Instrucciones (una por línea)<textarea v-model="s.ins" style="min-height:70px" /></label>
      <label style="margin-top:10px">Ejemplos (separá con ---)<textarea v-model="s.ex" style="min-height:70px" /></label>
      <label style="margin-top:10px">Formato de salida<input v-model="s.fmt"></label>
      <label class="chk" style="margin-top:10px"><input v-model="s.think" type="checkbox"> Pedir razonamiento en &lt;analysis&gt; antes de la respuesta</label>
      <label class="chk"><input v-model="s.variable" type="checkbox"> Insertar variable <code v-pre>{{INPUT}}</code> para el dato de entrada</label>
    </div>
    <div>
      <CodeOutput :code="system" label="system" />
      <CodeOutput :code="user" label="user" />
      <CodeOutput :code="json" label="messages.create (JSON)" />
    </div>
  </div>
</template>
