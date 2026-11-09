<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { ui, useMessages } from '@/i18n';
import { kvLines, lines } from '@/lib/format';
import type { Lint } from '@/lib/types';

type Kind = 'allow' | 'ask' | 'deny';
const KINDS: Kind[] = ['allow', 'ask', 'deny'];
const PRESETS: Record<Kind, string[]> = {
  allow: ['Bash(npm run *)', 'Bash(pnpm test *)', 'Bash(git status)', 'Bash(git diff *)', 'Bash(git log *)', 'WebFetch(domain:code.claude.com)'],
  ask: ['Bash(git push *)', 'Bash(git commit *)', 'Bash(npm install *)'],
  deny: ['Read(./.env)', 'Read(./.env.*)', 'Read(./secrets/**)', 'Bash(curl *)', 'Bash(rm -rf *)'],
};

const t = useMessages({
  es: {
    extra: 'Reglas extra (una por línea)',
    unset: '(sin definir)',
    file: 'Archivo destino',
    team: 'equipo',
    personal: 'personal',
    user: 'usuario',
    env: 'env (KEY=valor)',
    order1: 'Orden de evaluación:',
    order2: '; la primera coincidencia decide. Precedencia de archivos: política gestionada > argumentos CLI > local > proyecto > usuario.',
    l: {
      bashAll: '<code>Bash</code> sin especificador en allow aprueba cualquier comando.',
      bypass: 'bypassPermissions omite todas las confirmaciones: solo en contenedores aislados o CI efímeros.',
      envOk: 'Secretos protegidos por deny.',
      envWarn: 'Considerá denegar lectura de <code>.env</code> y secretos.',
      curl: 'Permitir curl/wget habilita exfiltración de datos; preferí WebFetch(domain:…).',
      secret: 'Posible secreto en env de un archivo compartido.',
      prefix: 'Los patrones Bash son por prefijo y pueden eludirse con encadenamientos; para garantías fuertes combiná con hooks PreToolUse o sandbox.',
    },
  },
  en: {
    extra: 'Extra rules (one per line)',
    unset: '(not set)',
    file: 'Target file',
    team: 'team',
    personal: 'personal',
    user: 'user',
    env: 'env (KEY=value)',
    order1: 'Evaluation order:',
    order2: '; the first match wins. File precedence: managed policy > CLI arguments > local > project > user.',
    l: {
      bashAll: '<code>Bash</code> without a specifier in allow approves any command.',
      bypass: 'bypassPermissions skips all confirmations: only use it in isolated containers or ephemeral CI.',
      envOk: 'Secrets protected by deny.',
      envWarn: 'Consider denying reads of <code>.env</code> and secrets.',
      curl: 'Allowing curl/wget enables data exfiltration; prefer WebFetch(domain:…).',
      secret: 'Possible secret in env of a shared file.',
      prefix: 'Bash patterns match by prefix and can be bypassed with command chaining; for strong guarantees combine them with PreToolUse hooks or a sandbox.',
    },
  },
});

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
  const m = t.value.l;
  const allow = rules.value.allow;
  if (allow.includes('Bash') || allow.includes('Bash(*)')) L.push(['bad', m.bashAll]);
  if (s.mode === 'bypassPermissions') L.push(['bad', m.bypass]);
  L.push(rules.value.deny.some((x) => /\.env/.test(x)) ? ['ok', m.envOk] : ['warn', m.envWarn]);
  if (allow.some((x) => /^Bash\((curl|wget)/.test(x))) L.push(['warn', m.curl]);
  if (!s.file.includes('local') && Object.values(env.value).some((v) => v.length > 16)) L.push(['bad', m.secret]);
  L.push(['ok', m.prefix]);
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
        <label>{{ t.extra }}<textarea v-model="s.extra[k]" style="min-height:44px" /></label>
      </template>
      <div class="row" style="margin-top:10px">
        <label>defaultMode
          <select v-model="s.mode"><option value="">{{ t.unset }}</option><option>default</option><option>acceptEdits</option><option>plan</option><option>bypassPermissions</option></select>
        </label>
        <label>{{ t.file }}
          <select v-model="s.file">
            <option value=".claude/settings.json">.claude/settings.json ({{ t.team }})</option>
            <option value=".claude/settings.local.json">.claude/settings.local.json ({{ t.personal }})</option>
            <option value="~/.claude/settings.json">~/.claude/settings.json ({{ t.user }})</option>
          </select>
        </label>
      </div>
      <label>{{ t.env }}<textarea v-model="s.env" style="min-height:44px" /></label>
    </div>
    <div>
      <CodeOutput :code="json" :label="s.file" />
      <div class="card">
        <h3>{{ ui.review }}</h3>
        <LintList :items="lint" />
        <p class="note">{{ t.order1 }} <b>deny → ask → allow</b>{{ t.order2 }}</p>
      </div>
    </div>
  </div>
</template>
