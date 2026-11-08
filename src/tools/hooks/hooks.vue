<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { toast } from '@/composables/useToast';
import { n } from '@/lib/format';
import { BLOCK_SCRIPT, buildHooksConfig, HOOK_EVENTS, HOOK_TEMPLATES, type HookEntry } from './hooks.data';

const entries = ref<HookEntry[]>([]);
const form = reactive({ event: 'PreToolUse', matcher: 'Bash', command: '', timeout: '' as string | number });

function add() {
  if (!form.command.trim()) return toast('Escribí un comando');
  entries.value.push({ event: form.event, matcher: form.matcher, command: form.command.trim(), timeout: n(form.timeout) || undefined });
}
const addTemplate = (t: HookEntry) => entries.value.push({ event: t.event, matcher: t.matcher, command: t.command });

const json = computed(() => (entries.value.length ? JSON.stringify(buildHooksConfig(entries.value), null, 2) : '// Agregá hooks con las plantillas o el formulario'));
</script>

<template>
  <div>
    <div class="card">
      <h3>Plantillas</h3>
      <div class="btns"><button v-for="t in HOOK_TEMPLATES" :key="t.label" class="btn ghost sm" @click="addTemplate(t)">{{ t.label }}</button></div>
      <div class="row">
        <label>Evento<select v-model="form.event"><option v-for="(_, e) in HOOK_EVENTS" :key="e">{{ e }}</option></select></label>
        <label>Matcher · <span class="note">{{ HOOK_EVENTS[form.event] }}</span><input v-model="form.matcher"></label>
        <label>Timeout (s, opcional)<input v-model="form.timeout" type="number"></label>
      </div>
      <label>Comando<input v-model="form.command" placeholder="script o comando de shell (recibe JSON por stdin)"></label>
      <div class="btns">
        <button class="btn sm" @click="add">Agregar hook</button>
        <button class="btn ghost sm" @click="entries = []">Vaciar</button>
      </div>
      <table v-if="entries.length">
        <tr><th>Evento</th><th>Matcher</th><th>Comando</th><th /></tr>
        <tr v-for="(h, i) in entries" :key="i">
          <td>{{ h.event }}</td><td><code>{{ h.matcher || '—' }}</code></td><td><code>{{ h.command }}</code></td>
          <td><button class="btn ghost sm" @click="entries.splice(i, 1)">✕</button></td>
        </tr>
      </table>
    </div>
    <div class="grid2">
      <div>
        <CodeOutput :code="json" label=".claude/settings.json → hooks" />
        <CodeOutput :code="BLOCK_SCRIPT" label=".claude/hooks/block-dangerous.sh" />
      </div>
      <div class="card">
        <h3>Exit codes</h3>
        <table>
          <tr><td><code>0</code></td><td>Sin objeción. En PreToolUse <b>no</b> aprueba: sigue el flujo de permisos normal. En UserPromptSubmit/SessionStart, stdout se agrega al contexto.</td></tr>
          <tr><td><code>2</code></td><td>Bloquea (en eventos bloqueables): stderr vuelve a Claude como feedback. En Stop, impide que termine y lo obliga a seguir.</td></tr>
          <tr><td>otro</td><td>Error no bloqueante: se muestra y la ejecución continúa.</td></tr>
        </table>
        <p class="note">
          Hooks = garantías deterministas (siempre se ejecutan). Instrucciones en CLAUDE.md = guía probabilística.
          Para reglas que “nunca” deben romperse, usá hooks. En Stop, revisá <code>stop_hook_active</code> para evitar loops infinitos.
        </p>
      </div>
    </div>
  </div>
</template>
