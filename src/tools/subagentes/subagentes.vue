<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { ui, useMessages } from '@/i18n';
import { n, yamlStr } from '@/lib/format';
import type { Lint } from '@/lib/types';

const ALL_TOOLS = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'WebFetch', 'WebSearch'];
type Template = { description: string; tools: string[]; model: string; body: string };

const t = useMessages({
  es: {
    scope: 'Alcance',
    project: 'Proyecto',
    user: 'Usuario',
    desc: 'description (cuándo delegar)',
    permissionMode: 'permissionMode (opcional)',
    maxTurns: 'maxTurns (opcional)',
    sys: 'System prompt',
    fallbackName: 'agente',
    l: {
      nameReq: 'name es obligatorio.',
      nameColon: 'name no puede contener “:” (reservado para plugins).',
      descShort: 'description es lo que usa Claude para decidir cuándo delegar: sé específico.',
      descWhen: 'Agregá cuándo usarlo (“Úsalo cuando…”, “de forma proactiva tras…”).',
      descOk: 'description indica cuándo delegar.',
      noTools: 'Sin tools: hereda todas. Aplicá mínimo privilegio.',
      readOnly: 'Parece un agente de solo lectura pero tiene Edit/Write.',
      context: 'El subagente corre con contexto propio: el body es su único prompt (además del entorno). Pedile que devuelva un resumen compacto.',
    },
    templates: {
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
    } as Record<string, Template>,
  },
  en: {
    scope: 'Scope',
    project: 'Project',
    user: 'User',
    desc: 'description (when to delegate)',
    permissionMode: 'permissionMode (optional)',
    maxTurns: 'maxTurns (optional)',
    sys: 'System prompt',
    fallbackName: 'agent',
    l: {
      nameReq: 'name is required.',
      nameColon: 'name cannot contain “:” (reserved for plugins).',
      descShort: 'description is what Claude uses to decide when to delegate: be specific.',
      descWhen: 'Add when to use it (“Use it when…”, “proactively after…”).',
      descOk: 'description says when to delegate.',
      noTools: 'No tools: it inherits all of them. Apply least privilege.',
      readOnly: 'Looks like a read-only agent but it has Edit/Write.',
      context: 'The subagent runs with its own context: the body is its only prompt (besides the environment). Ask it to return a compact summary.',
    },
    templates: {
      'code-reviewer': {
        description: 'Reviews code changes for bugs, security and maintainability. Use it proactively after modifying code.',
        tools: ['Read', 'Grep', 'Glob', 'Bash'], model: 'sonnet',
        body: 'You are a senior code reviewer.\n\nWhen invoked:\n1. Run git diff to see recent changes\n2. Review only the modified files\n3. Report findings by priority: critical, warning, suggestion\n\nFor each finding include file:line, the problem and a concrete fix. Do not edit files.',
      },
      'test-runner': {
        description: 'Runs the test suite and diagnoses failures. Use it when code changes or tests fail.',
        tools: ['Read', 'Grep', 'Glob', 'Bash', 'Edit'], model: 'sonnet',
        body: 'You are a testing specialist.\n\n1. Run the relevant tests\n2. If they fail, analyze the root cause\n3. Fix it while preserving the original intent of the test\n4. Return a short summary: what failed, why and what you changed.',
      },
      researcher: {
        description: 'Explores the codebase to answer architecture questions without polluting the main context. Use it for broad searches.',
        tools: ['Read', 'Grep', 'Glob'], model: 'haiku',
        body: 'You are a read-only code explorer.\n\nSearch broadly, read excerpts and return only conclusions: key files with paths, how they connect and direct answers. 300 words max.',
      },
    } as Record<string, Template>,
  },
});

const TEMPLATES = t.value.templates;
const s = reactive({ name: '', description: '', tools: [] as string[], model: 'inherit', scope: '.claude/agents', permissionMode: '', maxTurns: '' as string | number, body: '' });
function load(key: string) {
  const tp = TEMPLATES[key]!;
  Object.assign(s, { name: key, description: tp.description, tools: [...tp.tools], model: tp.model, body: tp.body });
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
  const m = t.value.l;
  if (!s.name) L.push(['bad', m.nameReq]);
  else if (s.name.includes(':')) L.push(['bad', m.nameColon]);
  if (s.description.length < 40) L.push(['bad', m.descShort]);
  else if (!/(úsalo|cuando|use (it )?when|proactiv)/i.test(s.description)) L.push(['warn', m.descWhen]);
  else L.push(['ok', m.descOk]);
  if (!s.tools.length) L.push(['warn', m.noTools]);
  if (/(revis|review|solo lectura|read-only|no edites|do not edit)/i.test(s.body + s.description) && s.tools.some((x) => x === 'Edit' || x === 'Write'))
    L.push(['warn', m.readOnly]);
  L.push(['ok', m.context]);
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
        <label>{{ t.scope }}<select v-model="s.scope"><option value=".claude/agents">{{ t.project }}</option><option value="~/.claude/agents">{{ t.user }}</option></select></label>
      </div>
      <label>{{ t.desc }}<textarea v-model="s.description" style="min-height:60px" /></label>
      <h3 style="margin-top:12px">tools</h3>
      <div class="btns"><label v-for="tl in ALL_TOOLS" :key="tl" class="chk"><input v-model="s.tools" type="checkbox" :value="tl"> {{ tl }}</label></div>
      <div class="row">
        <label>{{ t.permissionMode }}<select v-model="s.permissionMode"><option value="">—</option><option>default</option><option>acceptEdits</option><option>plan</option></select></label>
        <label>{{ t.maxTurns }}<input v-model="s.maxTurns" type="number"></label>
      </div>
      <label>{{ t.sys }}<textarea v-model="s.body" style="min-height:140px" /></label>
    </div>
    <div>
      <CodeOutput :code="file" :label="`${s.scope}/${s.name || t.fallbackName}.md`" />
      <div class="card"><h3>{{ ui.review }}</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
