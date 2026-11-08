<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { yamlStr } from '@/lib/format';
import type { Lint } from '@/lib/types';

const s = reactive({
  type: 'skill' as 'skill' | 'cmd',
  name: 'release-notes',
  description: 'Redacta notas de versión a partir de los commits desde el último tag. Úsala cuando el usuario pida notas de versión, changelog o resumen de un release.',
  argHint: '[tag-desde]',
  allowedTools: 'Bash(git log *), Bash(git tag *), Read',
  model: '',
  manualOnly: false,
  body: '1. Obtén los commits: !`git log $ARGUMENTS..HEAD --oneline`\n2. Agrúpalos en: Novedades, Correcciones, Cambios incompatibles\n3. Redacta en lenguaje orientado al usuario, no al código\n4. Sigue el formato de ejemplo en [templates/notas.md](templates/notas.md)',
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
const tree = computed(() => (s.type === 'skill'
  ? `.claude/skills/${s.name}/
├── SKILL.md            ← instrucciones principales (corto)
├── templates/          ← se lee solo si hace falta
│   └── notas.md
├── reference.md        ← detalle extenso (divulgación progresiva)
└── scripts/            ← código que Claude ejecuta sin cargarlo al contexto
    └── helper.py

Invocación: automática por description, o manual con /${s.name}`
  : `.claude/commands/${s.name}.md

Invocación: /${s.name} ${s.argHint}
$ARGUMENTS = todo el texto tras el comando; $1, $2… = argumentos posicionales`));

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  L.push(/^[a-z0-9-]{1,64}$/.test(s.name) ? ['ok', 'name válido.'] : ['bad', 'name: solo minúsculas, números y guiones (máx. 64).']);
  if (s.description.length > 1024) L.push(['bad', `description supera 1024 caracteres (${s.description.length}).`]);
  L.push(/(úsala|úsalo|cuando|use (it )?when)/i.test(s.description)
    ? ['ok', 'description incluye disparadores.']
    : ['warn', 'La description debe decir cuándo activarla: Claude ve solo name + description hasta cargarla.']);
  if (s.body.split('\n').length > 500) L.push(['warn', 'SKILL.md largo: mové el detalle a archivos de referencia enlazados.']);
  if (/\$ARGUMENTS|\$\d/.test(s.body) && !s.argHint) L.push(['warn', 'Usás argumentos: agregá argument-hint para el autocompletado.']);
  if (s.type === 'cmd') L.push(['ok', 'Comandos y skills comparten frontmatter; una skill además puede empaquetar archivos y activarse sola.']);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Tipo
          <select v-model="s.type"><option value="skill">Skill (.claude/skills/&lt;name&gt;/SKILL.md)</option><option value="cmd">Comando slash (.claude/commands/&lt;name&gt;.md)</option></select>
        </label>
        <label>name<input v-model="s.name"></label>
      </div>
      <label>description (qué hace + cuándo usarla)<textarea v-model="s.description" style="min-height:60px" /></label>
      <div class="row" style="margin-top:10px">
        <label>argument-hint<input v-model="s.argHint"></label>
        <label>allowed-tools<input v-model="s.allowedTools"></label>
        <label>model (opcional)<input v-model="s.model" placeholder="sonnet"></label>
      </div>
      <label class="chk"><input v-model="s.manualOnly" type="checkbox"> disable-model-invocation (solo se invoca manualmente con /name)</label>
      <label style="margin-top:10px">Instrucciones<textarea v-model="s.body" style="min-height:150px" /></label>
    </div>
    <div>
      <CodeOutput :code="file" :label="path" />
      <CodeOutput :code="tree" label="estructura" />
      <div class="card"><h3>Revisión</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
