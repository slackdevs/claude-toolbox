<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { lines } from '@/lib/format';

const RULES = [
  'Correr tests y typecheck antes de dar una tarea por terminada',
  'Commits con Conventional Commits',
  'Preguntar antes de agregar dependencias',
  'Para cambios grandes, proponer un plan antes de editar',
  'No editar archivos generados (ej. prisma/client)',
];

const s = reactive({
  name: 'Portal de clientes',
  stack: 'Next.js 15, TypeScript, Prisma, PostgreSQL',
  desc: 'App web donde clientes B2B ven facturas y abren tickets.',
  cmds: 'Dev: pnpm dev\nTests: pnpm test\nUn solo test: pnpm test -- path/al/archivo.test.ts\nLint + types: pnpm lint && pnpm typecheck',
  arch: 'app/ contiene rutas (App Router)\nlib/db.ts es el único punto de acceso a Prisma\nLos jobs asíncronos viven en workers/',
  style: 'Componentes funcionales y hooks\nNombres de archivos en kebab-case\nErrores con Result<T, E>, sin throw en lib/',
  rules: [RULES[0], RULES[1], RULES[2], RULES[4]] as string[],
  imports: '@docs/arquitectura.md',
});

const md = computed(() => {
  const cmds = lines(s.cmds).map((l) => {
    const i = l.indexOf(':');
    return i > 0 ? `- ${l.slice(0, i).trim()}: \`${l.slice(i + 1).trim()}\`` : `- \`${l}\``;
  });
  let out = `# ${s.name}\n\n${s.desc}\n\n**Stack:** ${s.stack}\n\n## Comandos\n${cmds.join('\n')}\n`;
  const sec = (title: string, items: string[]) => (items.length ? `\n## ${title}\n${items.map((x) => '- ' + x).join('\n')}\n` : '');
  out += sec('Arquitectura', lines(s.arch));
  out += sec('Estilo de código', lines(s.style));
  out += sec('Flujo de trabajo', RULES.filter((r) => s.rules.includes(r)));
  out += sec('Referencias', lines(s.imports).map((x) => (x.startsWith('@') ? x : '@' + x)));
  return out;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>Proyecto<input v-model="s.name"></label>
        <label>Stack<input v-model="s.stack"></label>
      </div>
      <label>Descripción breve<textarea v-model="s.desc" style="min-height:50px" /></label>
      <label style="margin-top:10px">Comandos (nombre: comando)<textarea v-model="s.cmds" style="min-height:80px" /></label>
      <label style="margin-top:10px">Arquitectura (una idea por línea)<textarea v-model="s.arch" style="min-height:70px" /></label>
      <label style="margin-top:10px">Estilo de código<textarea v-model="s.style" style="min-height:60px" /></label>
      <div style="margin-top:10px">
        <label v-for="r in RULES" :key="r" class="chk"><input v-model="s.rules" type="checkbox" :value="r"> {{ r }}</label>
      </div>
      <label style="margin-top:10px">Imports (@ruta, uno por línea)<textarea v-model="s.imports" style="min-height:40px" /></label>
    </div>
    <div>
      <CodeOutput :code="md" label="./CLAUDE.md" />
      <div class="card">
        <h3>Dónde vive cada memoria</h3>
        <table>
          <tr><td><code>~/.claude/CLAUDE.md</code></td><td>Personal, todos los proyectos</td></tr>
          <tr><td><code>./CLAUDE.md</code></td><td>Proyecto, se versiona (equipo)</td></tr>
          <tr><td><code>./CLAUDE.local.md</code></td><td>Personal del proyecto, no se versiona</td></tr>
          <tr><td><code>sub/CLAUDE.md</code></td><td>Se carga al trabajar en ese subdirectorio</td></tr>
          <tr><td><code>.claude/rules/*.md</code></td><td>Reglas modulares; con <code>paths:</code> en el frontmatter aplican solo a archivos que coinciden</td></tr>
        </table>
        <p class="note">Mantenelo corto y específico: todo lo que está aquí consume contexto en cada sesión. Los procedimientos largos van mejor en una skill.</p>
      </div>
    </div>
  </div>
</template>
