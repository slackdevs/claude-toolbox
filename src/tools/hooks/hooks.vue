<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { toast } from '@/composables/useToast';
import { tr, useMessages } from '@/i18n';
import { n } from '@/lib/format';
import { BLOCK_SCRIPT, buildHooksConfig, HOOK_EVENTS, HOOK_TEMPLATES, type HookEntry } from './hooks.data';

const t = useMessages({
  es: {
    templates: 'Plantillas',
    event: 'Evento',
    noMatcher: '— (sin matcher)',
    timeout: 'Timeout (s, opcional)',
    command: 'Comando',
    commandPh: 'script o comando de shell (recibe JSON por stdin)',
    add: 'Agregar hook',
    clear: 'Vaciar',
    needCommand: 'Escribí un comando',
    empty: '// Agregá hooks con las plantillas o el formulario',
    other: 'otro',
    exit0: 'Sin objeción. En PreToolUse <b>no</b> aprueba: sigue el flujo de permisos normal. En UserPromptSubmit/SessionStart, stdout se agrega al contexto.',
    exit2: 'Bloquea (en eventos bloqueables): stderr vuelve a Claude como feedback. En Stop, impide que termine y lo obliga a seguir.',
    exitOther: 'Error no bloqueante: se muestra y la ejecución continúa.',
    note1: 'Hooks = garantías deterministas (siempre se ejecutan). Instrucciones en CLAUDE.md = guía probabilística. Para reglas que “nunca” deben romperse, usá hooks. En Stop, revisá',
    note2: 'para evitar loops infinitos.',
  },
  en: {
    templates: 'Templates',
    event: 'Event',
    noMatcher: '— (no matcher)',
    timeout: 'Timeout (s, optional)',
    command: 'Command',
    commandPh: 'script or shell command (receives JSON on stdin)',
    add: 'Add hook',
    clear: 'Clear',
    needCommand: 'Enter a command',
    empty: '// Add hooks with the templates or the form',
    other: 'other',
    exit0: 'No objection. In PreToolUse it does <b>not</b> approve: the normal permission flow continues. In UserPromptSubmit/SessionStart, stdout is added to the context.',
    exit2: 'Blocks (on blockable events): stderr goes back to Claude as feedback. In Stop, it prevents finishing and forces Claude to keep going.',
    exitOther: 'Non-blocking error: it is shown and execution continues.',
    note1: 'Hooks = deterministic guarantees (they always run). Instructions in CLAUDE.md = probabilistic guidance. For rules that must “never” be broken, use hooks. In Stop, check',
    note2: 'to avoid infinite loops.',
  },
});

const entries = ref<HookEntry[]>([]);
const form = reactive({ event: 'PreToolUse', matcher: 'Bash', command: '', timeout: '' as string | number });
const matcherHint = computed(() => {
  const h = HOOK_EVENTS[form.event];
  return h ? tr(h) : t.value.noMatcher;
});

function add() {
  if (!form.command.trim()) return toast(t.value.needCommand);
  entries.value.push({ event: form.event, matcher: form.matcher, command: form.command.trim(), timeout: n(form.timeout) || undefined });
}
const addTemplate = (h: HookEntry) => entries.value.push({ event: h.event, matcher: h.matcher, command: h.command });

const json = computed(() => (entries.value.length ? JSON.stringify(buildHooksConfig(entries.value), null, 2) : t.value.empty));
</script>

<template>
  <div>
    <div class="card">
      <h3>{{ t.templates }}</h3>
      <div class="btns"><button v-for="h in tr(HOOK_TEMPLATES)" :key="h.label" class="btn ghost sm" @click="addTemplate(h)">{{ h.label }}</button></div>
      <div class="row">
        <label>{{ t.event }}<select v-model="form.event"><option v-for="(_, e) in HOOK_EVENTS" :key="e">{{ e }}</option></select></label>
        <label>Matcher · <span class="note">{{ matcherHint }}</span><input v-model="form.matcher"></label>
        <label>{{ t.timeout }}<input v-model="form.timeout" type="number"></label>
      </div>
      <label>{{ t.command }}<input v-model="form.command" :placeholder="t.commandPh"></label>
      <div class="btns">
        <button class="btn sm" @click="add">{{ t.add }}</button>
        <button class="btn ghost sm" @click="entries = []">{{ t.clear }}</button>
      </div>
      <table v-if="entries.length">
        <tr><th>{{ t.event }}</th><th>Matcher</th><th>{{ t.command }}</th><th /></tr>
        <tr v-for="(h, i) in entries" :key="i">
          <td>{{ h.event }}</td><td><code>{{ h.matcher || '—' }}</code></td><td><code>{{ h.command }}</code></td>
          <td><button class="btn ghost sm" @click="entries.splice(i, 1)">✕</button></td>
        </tr>
      </table>
    </div>
    <div class="grid2">
      <div>
        <CodeOutput :code="json" label=".claude/settings.json → hooks" />
        <CodeOutput :code="tr(BLOCK_SCRIPT)" label=".claude/hooks/block-dangerous.sh" />
      </div>
      <div class="card">
        <h3>Exit codes</h3>
        <table>
          <tr><td><code>0</code></td><td v-html="t.exit0" /></tr>
          <tr><td><code>2</code></td><td>{{ t.exit2 }}</td></tr>
          <tr><td>{{ t.other }}</td><td>{{ t.exitOther }}</td></tr>
        </table>
        <p class="note">{{ t.note1 }} <code>stop_hook_active</code> {{ t.note2 }}</p>
      </div>
    </div>
  </div>
</template>
