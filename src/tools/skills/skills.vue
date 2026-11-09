<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { ui, useMessages } from '@/i18n';
import { yamlStr } from '@/lib/format';
import type { Lint } from '@/lib/types';

const t = useMessages({
  es: {
    type: 'Tipo',
    skill: 'Skill (.claude/skills/<name>/SKILL.md)',
    cmd: 'Comando slash (.claude/commands/<name>.md)',
    desc: 'description (qué hace + cuándo usarla)',
    model: 'model (opcional)',
    manual: 'disable-model-invocation (solo se invoca manualmente con /name)',
    body: 'Instrucciones',
    structure: 'estructura',
    tree: {
      main: '← instrucciones principales (corto)',
      tpl: '← se lee solo si hace falta',
      tplFile: 'notas.md',
      ref: '← detalle extenso (divulgación progresiva)',
      scripts: '← código que Claude ejecuta sin cargarlo al contexto',
      invokeSkill: (name: string) => `Invocación: automática por description, o manual con /${name}`,
      invokeCmd: (name: string, hint: string) => `Invocación: /${name} ${hint}`,
      args: '$ARGUMENTS = todo el texto tras el comando; $1, $2… = argumentos posicionales',
    },
    l: {
      nameOk: 'name válido.',
      nameBad: 'name: solo minúsculas, números y guiones (máx. 64).',
      descLong: (len: number) => `description supera 1024 caracteres (${len}).`,
      triggersOk: 'description incluye disparadores.',
      triggersWarn: 'La description debe decir cuándo activarla: Claude ve solo name + description hasta cargarla.',
      long: 'SKILL.md largo: mové el detalle a archivos de referencia enlazados.',
      argHint: 'Usás argumentos: agregá argument-hint para el autocompletado.',
      cmd: 'Comandos y skills comparten frontmatter; una skill además puede empaquetar archivos y activarse sola.',
    },
    defaults: {
      description: 'Redacta notas de versión a partir de los commits desde el último tag. Úsala cuando el usuario pida notas de versión, changelog o resumen de un release.',
      argHint: '[tag-desde]',
      body: '1. Obtén los commits: !`git log $ARGUMENTS..HEAD --oneline`\n2. Agrúpalos en: Novedades, Correcciones, Cambios incompatibles\n3. Redacta en lenguaje orientado al usuario, no al código\n4. Sigue el formato de ejemplo en [templates/notas.md](templates/notas.md)',
    },
  },
  en: {
    type: 'Type',
    skill: 'Skill (.claude/skills/<name>/SKILL.md)',
    cmd: 'Slash command (.claude/commands/<name>.md)',
    desc: 'description (what it does + when to use it)',
    model: 'model (optional)',
    manual: 'disable-model-invocation (only invoked manually with /name)',
    body: 'Instructions',
    structure: 'structure',
    tree: {
      main: '← main instructions (short)',
      tpl: '← read only when needed',
      tplFile: 'notes.md',
      ref: '← extended detail (progressive disclosure)',
      scripts: '← code Claude runs without loading it into context',
      invokeSkill: (name: string) => `Invocation: automatic via description, or manual with /${name}`,
      invokeCmd: (name: string, hint: string) => `Invocation: /${name} ${hint}`,
      args: '$ARGUMENTS = all the text after the command; $1, $2… = positional arguments',
    },
    l: {
      nameOk: 'Valid name.',
      nameBad: 'name: lowercase letters, numbers and hyphens only (max. 64).',
      descLong: (len: number) => `description exceeds 1024 characters (${len}).`,
      triggersOk: 'description includes triggers.',
      triggersWarn: 'The description must say when to activate it: Claude only sees name + description until it loads it.',
      long: 'Long SKILL.md: move the detail into linked reference files.',
      argHint: 'You use arguments: add argument-hint for autocompletion.',
      cmd: 'Commands and skills share frontmatter; a skill can also bundle files and activate on its own.',
    },
    defaults: {
      description: 'Writes release notes from the commits since the last tag. Use it when the user asks for release notes, a changelog or a release summary.',
      argHint: '[from-tag]',
      body: '1. Get the commits: !`git log $ARGUMENTS..HEAD --oneline`\n2. Group them into: New features, Fixes, Breaking changes\n3. Write in user-facing language, not code-facing\n4. Follow the example format in [templates/notes.md](templates/notes.md)',
    },
  },
});

const s = reactive({
  type: 'skill' as 'skill' | 'cmd',
  name: 'release-notes',
  ...t.value.defaults,
  allowedTools: 'Bash(git log *), Bash(git tag *), Read',
  model: '',
  manualOnly: false,
});

const path = computed(() => (s.type === 'skill' ? `.claude/skills/${s.name}/SKILL.md` : `.claude/commands/${s.name}.md`));
const file = computed(() => {
  let fm = '---\n';
  if (s.type === 'skill') fm += `name: ${s.name}\n`;
  fm += `description: ${yamlStr(s.description)}\n`;
  if (s.argHint) fm += `argument-hint: ${yamlStr(s.argHint)}\n`;
  if (s.allowedTools) fm += `allowed-tools: ${s.allowedTools}\n`;
  if (s.model) fm += `model: ${s.model}\n`;
  if (s.manualOnly) fm += 'disable-model-invocation: true\n';
  return `${fm}---\n\n# ${s.name}\n\n${s.body}`;
});
const tree = computed(() => {
  const tr = t.value.tree;
  return s.type === 'skill'
    ? `.claude/skills/${s.name}/
├── SKILL.md            ${tr.main}
├── templates/          ${tr.tpl}
│   └── ${tr.tplFile}
├── reference.md        ${tr.ref}
└── scripts/            ${tr.scripts}
    └── helper.py

${tr.invokeSkill(s.name)}`
    : `.claude/commands/${s.name}.md

${tr.invokeCmd(s.name, s.argHint)}
${tr.args}`;
});

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const m = t.value.l;
  L.push(/^[a-z0-9-]{1,64}$/.test(s.name) ? ['ok', m.nameOk] : ['bad', m.nameBad]);
  if (s.description.length > 1024) L.push(['bad', m.descLong(s.description.length)]);
  L.push(/(úsala|úsalo|cuando|use (it )?when)/i.test(s.description) ? ['ok', m.triggersOk] : ['warn', m.triggersWarn]);
  if (s.body.split('\n').length > 500) L.push(['warn', m.long]);
  if (/\$ARGUMENTS|\$\d/.test(s.body) && !s.argHint) L.push(['warn', m.argHint]);
  if (s.type === 'cmd') L.push(['ok', m.cmd]);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>{{ t.type }}
          <select v-model="s.type"><option value="skill">{{ t.skill }}</option><option value="cmd">{{ t.cmd }}</option></select>
        </label>
        <label>name<input v-model="s.name"></label>
      </div>
      <label>{{ t.desc }}<textarea v-model="s.description" style="min-height:60px" /></label>
      <div class="row" style="margin-top:10px">
        <label>argument-hint<input v-model="s.argHint"></label>
        <label>allowed-tools<input v-model="s.allowedTools"></label>
        <label>{{ t.model }}<input v-model="s.model" placeholder="sonnet"></label>
      </div>
      <label class="chk"><input v-model="s.manualOnly" type="checkbox"> {{ t.manual }}</label>
      <label style="margin-top:10px">{{ t.body }}<textarea v-model="s.body" style="min-height:150px" /></label>
    </div>
    <div>
      <CodeOutput :code="file" :label="path" />
      <CodeOutput :code="tree" :label="t.structure" />
      <div class="card"><h3>{{ ui.review }}</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
