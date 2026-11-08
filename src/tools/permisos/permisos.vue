<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { kvLines, lines } from '@/lib/format';
import type { Lint } from '@/lib/types';

type Kind = 'allow' | 'ask' | 'deny';
const KINDS: Kind[] = ['allow', 'ask', 'deny'];
const PRESETS: Record<Kind, string[]> = {
  allow: ['Bash(npm run *)', 'Bash(pnpm test *)', 'Bash(git status)', 'Bash(git diff *)', 'Bash(git log *)', 'WebFetch(domain:code.claude.com)'],
  ask: ['Bash(git push *)', 'Bash(git commit *)', 'Bash(npm install *)'],
  deny: ['Read(./.env)', 'Read(./.env.*)', 'Read(./secrets/**)', 'Bash(curl *)', 'Bash(rm -rf *)'],
};

const s = reactive({
  picked: { allow: [...PRESETS.allow], ask: [PRESETS.ask[0]!], deny: [...PRESETS.deny] } as Record<Kind, string[]>,
  extra: { allow: '', ask: '', deny: '' } as Record<Kind, string>,
  mode: '',
  file: '.claude/settings.json',
  env: '',
});

const rules = computed(() => Object.fromEntries(KINDS.map((k) => [k, [...s.picked[k], ...lines(s.extra[k])]])) as Record<Kind, string[]>);
const env = computed(() => kvLines(s.env, '='));

const json = computed(() => {
  const permissions: Record<string, unknown> = {};
  KINDS.forEach((k) => { if (rules.value[k].length) permissions[k] = rules.value[k]; });
  if (s.mode) permissions.defaultMode = s.mode;
  const o: Record<string, unknown> = { $schema: 'https://json.schemastore.org/claude-code-settings.json', permissions };
  if (Object.keys(env.value).length) o.env = env.value;
  return JSON.stringify(o, null, 2);
});

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const allow = rules.value.allow;
  if (allow.includes('Bash') || allow.includes('Bash(*)')) L.push(['bad', '<code>Bash</code> sin especificador en allow aprueba cualquier comando.']);
  if (s.mode === 'bypassPermissions') L.push(['bad', 'bypassPermissions omite todas las confirmaciones: solo en contenedores aislados o CI efímeros.']);
  L.push(rules.value.deny.some((x) => /\.env/.test(x)) ? ['ok', 'Secretos protegidos por deny.'] : ['warn', 'Considerá denegar lectura de <code>.env</code> y secretos.']);
  if (allow.some((x) => /^Bash\((curl|wget)/.test(x))) L.push(['warn', 'Permitir curl/wget habilita exfiltración de datos; preferí WebFetch(domain:…).']);
  if (!s.file.includes('local') && Object.values(env.value).some((v) => v.length > 16)) L.push(['bad', 'Posible secreto en env de un archivo compartido.']);
  L.push(['ok', 'Los patrones Bash son por prefijo y pueden eludirse con encadenamientos; para garantías fuertes combiná con hooks PreToolUse o sandbox.']);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <template v-for="k in KINDS" :key="k">
        <h3 style="margin-top:6px">{{ k }}</h3>
        <div class="btns">
          <label v-for="p in PRESETS[k]" :key="p" class="chk"><input v-model="s.picked[k]" type="checkbox" :value="p"><code>{{ p }}</code></label>
        </div>
        <label>Reglas extra (una por línea)<textarea v-model="s.extra[k]" style="min-height:44px" /></label>
      </template>
      <div class="row" style="margin-top:10px">
        <label>defaultMode
          <select v-model="s.mode"><option value="">(sin definir)</option><option>default</option><option>acceptEdits</option><option>plan</option><option>bypassPermissions</option></select>
        </label>
        <label>Archivo destino
          <select v-model="s.file">
            <option value=".claude/settings.json">.claude/settings.json (equipo)</option>
            <option value=".claude/settings.local.json">.claude/settings.local.json (personal)</option>
            <option value="~/.claude/settings.json">~/.claude/settings.json (usuario)</option>
          </select>
        </label>
      </div>
      <label>env (KEY=valor)<textarea v-model="s.env" style="min-height:44px" /></label>
    </div>
    <div>
      <CodeOutput :code="json" :label="s.file" />
      <div class="card">
        <h3>Revisión</h3>
        <LintList :items="lint" />
        <p class="note">Orden de evaluación: <b>deny → ask → allow</b>; la primera coincidencia decide. Precedencia de archivos: política gestionada &gt; argumentos CLI &gt; local &gt; proyecto &gt; usuario.</p>
      </div>
    </div>
  </div>
</template>
