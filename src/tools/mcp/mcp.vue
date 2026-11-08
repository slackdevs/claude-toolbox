<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { esc, kvLines, shq } from '@/lib/format';
import type { Lint } from '@/lib/types';

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
  cli += `\n\n# Verificar\nclaude mcp list\nclaude mcp get ${name}\n# Dentro de Claude Code: /mcp`;
  const json = JSON.stringify({ mcpServers: { [name]: cfg } }, null, 2);
  const desktop = s.transport === 'stdio'
    ? json
    : '// Claude Desktop agrega servidores remotos como conectores desde\n// Configuración → Conectores, no desde este archivo.';
  return { cli, json, desktop, name, secrets: Object.values({ ...env, ...hdr }) };
});

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const literal = out.value.secrets.some((v) => v && !/\$\{\w+\}/.test(v) && v.length > 12);
  if (literal && s.scope === 'project') L.push(['bad', 'Parece haber un secreto literal en un archivo que se commitea. Usá expansión de variables <code>${VAR}</code> en .mcp.json.']);
  else L.push(['ok', 'Secretos referenciados con <code>${VAR}</code> (expansión de entorno).']);
  if (s.scope === 'project') L.push(['ok', '.mcp.json va en la raíz del repo y se versiona; cada compañero aprueba el servidor la primera vez.']);
  if (s.transport === 'sse') L.push(['warn', 'SSE está en desuso: preferí HTTP (streamable) si el servidor lo soporta.']);
  L.push(['ok', `Las tools MCP aparecen como <code>mcp__${esc(out.value.name)}__&lt;tool&gt;</code>: usá ese nombre en permisos y matchers de hooks.`]);
  return L;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Nombre del servidor<input v-model="s.name"></label>
        <label>Transporte
          <select v-model="s.transport"><option value="stdio">stdio (proceso local)</option><option value="http">http (remoto, recomendado)</option><option value="sse">sse (legado)</option></select>
        </label>
        <label>Alcance
          <select v-model="s.scope"><option value="local">local (solo vos, este proyecto)</option><option value="project">project (.mcp.json, compartido)</option><option value="user">user (todos tus proyectos)</option></select>
        </label>
      </div>
      <template v-if="s.transport === 'stdio'">
        <div class="row">
          <label>Comando<input v-model="s.command"></label>
          <label>Argumentos (espacios)<input v-model="s.args"></label>
        </div>
        <label>Variables de entorno (KEY=valor por línea)<textarea v-model="s.env" style="min-height:60px" /></label>
      </template>
      <template v-else>
        <label>URL<input v-model="s.url"></label>
        <label style="margin-top:10px">Headers (Nombre: valor por línea)<textarea v-model="s.headers" style="min-height:60px" /></label>
      </template>
      <div style="margin-top:10px"><LintList :items="lint" /></div>
    </div>
    <div>
      <CodeOutput :code="out.cli" label="CLI de Claude Code" />
      <CodeOutput :code="out.json" label=".mcp.json" />
      <CodeOutput :code="out.desktop" label="claude_desktop_config.json" />
    </div>
  </div>
</template>
