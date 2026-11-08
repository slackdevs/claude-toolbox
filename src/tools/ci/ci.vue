<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { n, shq } from '@/lib/format';
import type { Lint } from '@/lib/types';

const s = reactive({
  prompt: 'Revisa los cambios de este PR. Reporta solo problemas de seguridad y bugs probables, con archivo y línea.',
  format: 'json', maxTurns: 5 as number | string, model: 'sonnet',
  allowed: 'Read,Grep,Glob,Bash(git diff *)', disallowed: 'Edit,Write',
  permissionMode: '', appendSystem: '', trigger: 'pr' as 'pr' | 'mention' | 'cron',
});

const cli = computed(() => {
  const a = [`claude -p ${shq(s.prompt)}`, `--output-format ${s.format}`];
  if (n(s.maxTurns)) a.push(`--max-turns ${n(s.maxTurns)}`);
  if (s.model) a.push(`--model ${s.model}`);
  if (s.allowed) a.push(`--allowedTools ${shq(s.allowed)}`);
  if (s.disallowed) a.push(`--disallowedTools ${shq(s.disallowed)}`);
  if (s.permissionMode) a.push(`--permission-mode ${s.permissionMode}`);
  if (s.appendSystem) a.push(`--append-system-prompt ${shq(s.appendSystem)}`);
  let out = a.join(' \\\n  ');
  if (s.format === 'json') out += " \\\n  | jq -r '.result'";
  return out + '\n\n# Pipe de entrada:\ngit diff main...HEAD | claude -p "Resume estos cambios para el changelog"';
});

const workflow = computed(() => {
  const on = s.trigger === 'pr'
    ? 'on:\n  pull_request:\n    types: [opened, synchronize]'
    : s.trigger === 'mention'
      ? 'on:\n  issue_comment:\n    types: [created]\n  pull_request_review_comment:\n    types: [created]'
      : 'on:\n  schedule:\n    - cron: "0 9 * * 1-5"';
  const args = [n(s.maxTurns) ? `--max-turns ${n(s.maxTurns)}` : '', s.model ? `--model ${s.model}` : '', s.allowed ? `--allowedTools "${s.allowed}"` : ''].filter(Boolean).join(' ');
  return `name: Claude Code
${on}

jobs:
  claude:
${s.trigger === 'mention' ? "    if: contains(github.event.comment.body, '@claude')\n" : ''}    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
${s.trigger === 'mention' ? '' : `          prompt: ${JSON.stringify(s.prompt)}\n`}          claude_args: ${JSON.stringify(args)}

# Instalación guiada desde la terminal de Claude Code: /install-github-app`;
});

const TIPS: Lint[] = [
  ['ok', '<code>-p</code> (print) ejecuta sin interacción y sale: es el modo para CI. Con <code>--output-format json</code> obtenés resultado, costo y session_id parseables.'],
  ['ok', 'En CI limitá herramientas con --allowedTools y acotá con --max-turns; nunca expongas la API key en logs (usá secrets).'],
  ['warn', 'Pedí salida estructurada (JSON) para que el pipeline pueda decidir (comentar, fallar el job) sin parsear prosa.'],
];
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card">
        <label>Prompt<textarea v-model="s.prompt" style="min-height:70px" /></label>
        <div class="row" style="margin-top:10px">
          <label>--output-format<select v-model="s.format"><option>text</option><option>json</option><option>stream-json</option></select></label>
          <label>--max-turns<input v-model="s.maxTurns" type="number"></label>
          <label>--model<input v-model="s.model"></label>
        </div>
        <div class="row">
          <label>--allowedTools<input v-model="s.allowed"></label>
          <label>--disallowedTools<input v-model="s.disallowed"></label>
        </div>
        <div class="row">
          <label>--permission-mode<select v-model="s.permissionMode"><option value="">—</option><option>default</option><option>acceptEdits</option><option>plan</option></select></label>
          <label>--append-system-prompt<input v-model="s.appendSystem" placeholder="Responde en español."></label>
        </div>
        <div class="row">
          <label>Disparador en GitHub
            <select v-model="s.trigger"><option value="pr">Al abrir/actualizar un PR</option><option value="mention">Al mencionar @claude</option><option value="cron">Programado (diario)</option></select>
          </label>
        </div>
      </div>
      <div>
        <CodeOutput :code="cli" label="terminal / script" />
        <CodeOutput :code="workflow" label=".github/workflows/claude.yml" />
      </div>
    </div>
    <div class="card"><LintList :items="TIPS" /></div>
  </div>
</template>
