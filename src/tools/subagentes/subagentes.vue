<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { n, yamlStr } from '@/lib/format';
import type { Lint } from '@/lib/types';

const ALL_TOOLS = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'WebFetch', 'WebSearch'];
const TEMPLATES: Record<string, { description: string; tools: string[]; model: string; body: string }> = {
  'code-reviewer': {
    description: 'Revisa cambios de código buscando bugs, seguridad y mantenibilidad. Úsalo de forma proactiva después de modificar código.',
    tools: ['Read', 'Grep', 'Glob', 'Bash'], model: 'sonnet',
    body: 'Eres un revisor de código senior.\n\nCuando te invoquen:\n1. Ejecuta git diff para ver los cambios recientes\n2. Revisa solo los archivos modificados\n3. Reporta hallazgos por prioridad: crítico, advertencia, sugerencia\n\nPara cada hallazgo incluye archivo:línea, el problema y una corrección concreta. No edites archivos.',
  },
  'test-runner': {
    description: 'Ejecuta la suite de tests y diagnostica fallas. Úsalo cuando se cambie código o fallen tests.',
    tools: ['Read', 'Grep', 'Glob', 'Bash', 'Edit'], model: 'sonnet',
    body: 'Eres un especialista en tests.\n\n1. Corre los tests relevantes\n2. Si fallan, analiza la causa raíz\n3. Corrige preservando la intención original del test\n4. Devuelve un resumen breve: qué falló, por qué y qué cambiaste.',
  },
  researcher: {
    description: 'Explora el codebase para responder preguntas de arquitectura sin contaminar el contexto principal. Úsalo para búsquedas amplias.',
    tools: ['Read', 'Grep', 'Glob'], model: 'haiku',
    body: 'Eres un explorador de código de solo lectura.\n\nBusca de forma amplia, lee extractos y devuelve solo conclusiones: archivos clave con rutas, cómo se conectan y respuestas directas. Máximo 300 palabras.',
  },
};

const s = reactive({ name: '', description: '', tools: [] as string[], model: 'inherit', scope: '.claude/agents', permissionMode: '', maxTurns: '' as string | number, body: '' });
function load(key: string) {
  const t = TEMPLATES[key]!;
  Object.assign(s, { name: key, description: t.description, tools: [...t.tools], model: t.model, body: t.body });
}
load('code-reviewer');

const file = computed(() => {
  let fm = `---\nname: ${s.name}\ndescription: ${yamlStr(s.description)}\n`;
  if (s.tools.length) fm += `tools: ${s.tools.join(', ')}\n`;
  fm += `model: ${s.model}\n`;
  if (s.permissionMode) fm += `permissionMode: ${s.permissionMode}\n`;
  if (n(s.maxTurns)) fm += `maxTurns: ${n(s.maxTurns)}\n`;
  return `${fm}---\n\n${s.body}`;
});

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  if (!s.name) L.push(['bad', 'name es obligatorio.']);
  else if (s.name.includes(':')) L.push(['bad', 'name no puede contener “:” (reservado para plugins).']);
  if (s.description.length < 40) L.push(['bad', 'description es lo que usa Claude para decidir cuándo delegar: sé específico.']);
  else if (!/(úsalo|cuando|use (it )?when|proactiv)/i.test(s.description)) L.push(['warn', 'Agregá cuándo usarlo (“Úsalo cuando…”, “de forma proactiva tras…”).']);
  else L.push(['ok', 'description indica cuándo delegar.']);
  if (!s.tools.length) L.push(['warn', 'Sin tools: hereda todas. Aplicá mínimo privilegio.']);
  if (/(revis|review|solo lectura|read-only|no edites)/i.test(s.body + s.description) && s.tools.some((t) => t === 'Edit' || t === 'Write'))
    L.push(['warn', 'Parece un agente de solo lectura pero tiene Edit/Write.']);
  L.push(['ok', 'El subagente corre con contexto propio: el body es su único prompt (además del entorno). Pedile que devuelva un resumen compacto.']);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="btns"><button v-for="(_, k) in TEMPLATES" :key="k" class="btn ghost sm" @click="load(k)">{{ k }}</button></div>
      <div class="row">
        <label>name<input v-model="s.name"></label>
        <label>model<select v-model="s.model"><option>inherit</option><option>sonnet</option><option>opus</option><option>haiku</option><option>fable</option></select></label>
        <label>Alcance<select v-model="s.scope"><option value=".claude/agents">Proyecto</option><option value="~/.claude/agents">Usuario</option></select></label>
      </div>
      <label>description (cuándo delegar)<textarea v-model="s.description" style="min-height:60px" /></label>
      <h3 style="margin-top:12px">tools</h3>
      <div class="btns"><label v-for="t in ALL_TOOLS" :key="t" class="chk"><input v-model="s.tools" type="checkbox" :value="t"> {{ t }}</label></div>
      <div class="row">
        <label>permissionMode (opcional)<select v-model="s.permissionMode"><option value="">—</option><option>default</option><option>acceptEdits</option><option>plan</option></select></label>
        <label>maxTurns (opcional)<input v-model="s.maxTurns" type="number"></label>
      </div>
      <label>System prompt<textarea v-model="s.body" style="min-height:140px" /></label>
    </div>
    <div>
      <CodeOutput :code="file" :label="`${s.scope}/${s.name || 'agente'}.md`" />
      <div class="card"><h3>Revisión</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
