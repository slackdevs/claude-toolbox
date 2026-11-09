<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { useMessages } from '@/i18n';
import { esc, kvLines, shq } from '@/lib/format';
import type { Lint } from '@/lib/types';

const t = useMessages({
  es: {
    name: 'Nombre del servidor',
    transport: 'Transporte',
    stdio: 'stdio (proceso local)',
    http: 'http (remoto, recomendado)',
    sse: 'sse (legado)',
    scope: 'Alcance',
    local: 'local (solo vos, este proyecto)',
    project: 'project (.mcp.json, compartido)',
    user: 'user (todos tus proyectos)',
    command: 'Comando',
    args: 'Argumentos (espacios)',
    env: 'Variables de entorno (KEY=valor por línea)',
    headers: 'Headers (Nombre: valor por línea)',
    cli: 'CLI de Claude Code',
    verify: '# Verificar',
    inside: '# Dentro de Claude Code: /mcp',
    desktopRemote: '// Claude Desktop agrega servidores remotos como conectores desde\n// Configuración → Conectores, no desde este archivo.',
    l: {
      literal: 'Parece haber un secreto literal en un archivo que se commitea. Usá expansión de variables <code>${VAR}</code> en .mcp.json.',
      vars: 'Secretos referenciados con <code>${VAR}</code> (expansión de entorno).',
      project: '.mcp.json va en la raíz del repo y se versiona; cada compañero aprueba el servidor la primera vez.',
      sse: 'SSE está en desuso: preferí HTTP (streamable) si el servidor lo soporta.',
      naming: (n: string) => `Las tools MCP aparecen como <code>mcp__${n}__&lt;tool&gt;</code>: usá ese nombre en permisos y matchers de hooks.`,
    },
  },
  en: {
    name: 'Server name',
    transport: 'Transport',
    stdio: 'stdio (local process)',
    http: 'http (remote, recommended)',
    sse: 'sse (legacy)',
    scope: 'Scope',
    local: 'local (only you, this project)',
    project: 'project (.mcp.json, shared)',
    user: 'user (all your projects)',
    command: 'Command',
    args: 'Arguments (space-separated)',
    env: 'Environment variables (KEY=value per line)',
    headers: 'Headers (Name: value per line)',
    cli: 'Claude Code CLI',
    verify: '# Verify',
    inside: '# Inside Claude Code: /mcp',
    desktopRemote: '// Claude Desktop adds remote servers as connectors from\n// Settings → Connectors, not from this file.',
    l: {
      literal: 'There seems to be a literal secret in a committed file. Use variable expansion <code>${VAR}</code> in .mcp.json.',
      vars: 'Secrets referenced with <code>${VAR}</code> (environment expansion).',
      project: '.mcp.json lives at the repo root and is version-controlled; each teammate approves the server the first time.',
      sse: 'SSE is deprecated: prefer HTTP (streamable) if the server supports it.',
      naming: (n: string) => `MCP tools show up as <code>mcp__${n}__&lt;tool&gt;</code>: use that name in permissions and hook matchers.`,
    },
  },
});

const s = reactive({
  name: 'github',
  transport: 'http' as 'stdio' | 'http' | 'sse',
  scope: 'project' as 'local' | 'project' | 'user',
  command: 'npx',
  args: '-y @modelcontextprotocol/server-filesystem ./docs',
  env: 'API_TOKEN=${API_TOKEN}',
  url: 'https://api.githubcopilot.com/mcp/',
  headers: 'Authorization: Bearer ${GITHUB_TOKEN}',
});

const out = computed(() => {
  const name = s.name.trim() || 'server';
  const env = kvLines(s.env, '=');
  const hdr = kvLines(s.headers, ':');
  const args = s.args.split(/\s+/).filter(Boolean);
  let cli: string;
  let cfg: Record<string, unknown>;
  if (s.transport === 'stdio') {
    cli = `claude mcp add --transport stdio --scope ${s.scope} ${Object.entries(env).map(([k, v]) => `--env ${k}=${shq(v)} `).join('')}${name} -- ${s.command} ${args.join(' ')}`;
    cfg = { command: s.command, args };
    if (Object.keys(env).length) cfg.env = env;
  } else {
    cli = `claude mcp add --transport ${s.transport} --scope ${s.scope} ${Object.entries(hdr).map(([k, v]) => `--header ${shq(k + ': ' + v)} `).join('')}${name} ${s.url}`;
    cfg = { type: s.transport, url: s.url };
    if (Object.keys(hdr).length) cfg.headers = hdr;
  }
  cli += `\n\n${t.value.verify}\nclaude mcp list\nclaude mcp get ${name}\n${t.value.inside}`;
  const json = JSON.stringify({ mcpServers: { [name]: cfg } }, null, 2);
  const desktop = s.transport === 'stdio' ? json : t.value.desktopRemote;
  return { cli, json, desktop, name, secrets: Object.values({ ...env, ...hdr }) };
});

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const m = t.value.l;
  const literal = out.value.secrets.some((v) => v && !/\$\{\w+\}/.test(v) && v.length > 12);
  if (literal && s.scope === 'project') L.push(['bad', m.literal]);
  else L.push(['ok', m.vars]);
  if (s.scope === 'project') L.push(['ok', m.project]);
  if (s.transport === 'sse') L.push(['warn', m.sse]);
  L.push(['ok', m.naming(esc(out.value.name))]);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>{{ t.name }}<input v-model="s.name"></label>
        <label>{{ t.transport }}
          <select v-model="s.transport"><option value="stdio">{{ t.stdio }}</option><option value="http">{{ t.http }}</option><option value="sse">{{ t.sse }}</option></select>
        </label>
        <label>{{ t.scope }}
          <select v-model="s.scope"><option value="local">{{ t.local }}</option><option value="project">{{ t.project }}</option><option value="user">{{ t.user }}</option></select>
        </label>
      </div>
      <template v-if="s.transport === 'stdio'">
        <div class="row">
          <label>{{ t.command }}<input v-model="s.command"></label>
          <label>{{ t.args }}<input v-model="s.args"></label>
        </div>
        <label>{{ t.env }}<textarea v-model="s.env" style="min-height:60px" /></label>
      </template>
      <template v-else>
        <label>URL<input v-model="s.url"></label>
        <label style="margin-top:10px">{{ t.headers }}<textarea v-model="s.headers" style="min-height:60px" /></label>
      </template>
      <div style="margin-top:10px"><LintList :items="lint" /></div>
    </div>
    <div>
      <CodeOutput :code="out.cli" :label="t.cli" />
      <CodeOutput :code="out.json" label=".mcp.json" />
      <CodeOutput :code="out.desktop" label="claude_desktop_config.json" />
    </div>
  </div>
</template>
