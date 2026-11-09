<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import { useMessages } from '@/i18n';
import { lines } from '@/lib/format';

const t = useMessages({
  es: {
    project: 'Proyecto',
    desc: 'Descripción breve',
    cmds: 'Comandos (nombre: comando)',
    arch: 'Arquitectura (una idea por línea)',
    style: 'Estilo de código',
    imports: 'Imports (@ruta, uno por línea)',
    sec: { cmds: 'Comandos', arch: 'Arquitectura', style: 'Estilo de código', flow: 'Flujo de trabajo', refs: 'Referencias' },
    whereTitle: 'Dónde vive cada memoria',
    where: [
      ['~/.claude/CLAUDE.md', 'Personal, todos los proyectos'],
      ['./CLAUDE.md', 'Proyecto, se versiona (equipo)'],
      ['./CLAUDE.local.md', 'Personal del proyecto, no se versiona'],
      ['sub/CLAUDE.md', 'Se carga al trabajar en ese subdirectorio'],
    ],
    rulesRow1: 'Reglas modulares; con',
    rulesRow2: 'en el frontmatter aplican solo a archivos que coinciden',
    note: 'Mantenelo corto y específico: todo lo que está aquí consume contexto en cada sesión. Los procedimientos largos van mejor en una skill.',
    rules: [
      'Correr tests y typecheck antes de dar una tarea por terminada',
      'Commits con Conventional Commits',
      'Preguntar antes de agregar dependencias',
      'Para cambios grandes, proponer un plan antes de editar',
      'No editar archivos generados (ej. prisma/client)',
    ],
    defaults: {
      name: 'Portal de clientes',
      stack: 'Next.js 15, TypeScript, Prisma, PostgreSQL',
      desc: 'App web donde clientes B2B ven facturas y abren tickets.',
      cmds: 'Dev: pnpm dev\nTests: pnpm test\nUn solo test: pnpm test -- path/al/archivo.test.ts\nLint + types: pnpm lint && pnpm typecheck',
      arch: 'app/ contiene rutas (App Router)\nlib/db.ts es el único punto de acceso a Prisma\nLos jobs asíncronos viven en workers/',
      style: 'Componentes funcionales y hooks\nNombres de archivos en kebab-case\nErrores con Result<T, E>, sin throw en lib/',
      imports: '@docs/arquitectura.md',
    },
  },
  en: {
    project: 'Project',
    desc: 'Short description',
    cmds: 'Commands (name: command)',
    arch: 'Architecture (one idea per line)',
    style: 'Code style',
    imports: 'Imports (@path, one per line)',
    sec: { cmds: 'Commands', arch: 'Architecture', style: 'Code style', flow: 'Workflow', refs: 'References' },
    whereTitle: 'Where each memory lives',
    where: [
      ['~/.claude/CLAUDE.md', 'Personal, all projects'],
      ['./CLAUDE.md', 'Project, version-controlled (team)'],
      ['./CLAUDE.local.md', 'Personal for the project, not version-controlled'],
      ['sub/CLAUDE.md', 'Loaded when working in that subdirectory'],
    ],
    rulesRow1: 'Modular rules; with',
    rulesRow2: 'in the frontmatter they apply only to matching files',
    note: 'Keep it short and specific: everything here consumes context in every session. Long procedures are better off in a skill.',
    rules: [
      'Run tests and typecheck before considering a task done',
      'Commits follow Conventional Commits',
      'Ask before adding dependencies',
      'For large changes, propose a plan before editing',
      'Do not edit generated files (e.g. prisma/client)',
    ],
    defaults: {
      name: 'Customer portal',
      stack: 'Next.js 15, TypeScript, Prisma, PostgreSQL',
      desc: 'Web app where B2B customers view invoices and open tickets.',
      cmds: 'Dev: pnpm dev\nTests: pnpm test\nSingle test: pnpm test -- path/to/file.test.ts\nLint + types: pnpm lint && pnpm typecheck',
      arch: 'app/ holds the routes (App Router)\nlib/db.ts is the only access point to Prisma\nAsync jobs live in workers/',
      style: 'Functional components and hooks\nkebab-case file names\nErrors with Result<T, E>, no throw in lib/',
      imports: '@docs/architecture.md',
    },
  },
});

const RULES = t.value.rules;
const s = reactive({
  ...t.value.defaults,
  rules: [RULES[0], RULES[1], RULES[2], RULES[4]] as string[],
});

const md = computed(() => {
  const sec = t.value.sec;
  const cmds = lines(s.cmds).map((l) => {
    const i = l.indexOf(':');
    return i > 0 ? `- ${l.slice(0, i).trim()}: \`${l.slice(i + 1).trim()}\`` : `- \`${l}\``;
  });
  let out = `# ${s.name}\n\n${s.desc}\n\n**Stack:** ${s.stack}\n\n## ${sec.cmds}\n${cmds.join('\n')}\n`;
  const section = (title: string, items: string[]) => (items.length ? `\n## ${title}\n${items.map((x) => '- ' + x).join('\n')}\n` : '');
  out += section(sec.arch, lines(s.arch));
  out += section(sec.style, lines(s.style));
  out += section(sec.flow, RULES.filter((r) => s.rules.includes(r)));
  out += section(sec.refs, lines(s.imports).map((x) => (x.startsWith('@') ? x : '@' + x)));
  return out;
});
</script>

<template>
  <div class="grid2">
    <div class="card">
      <div class="row">
        <label>{{ t.project }}<input v-model="s.name"></label>
        <label>Stack<input v-model="s.stack"></label>
      </div>
      <label>{{ t.desc }}<textarea v-model="s.desc" style="min-height:50px" /></label>
      <label style="margin-top:10px">{{ t.cmds }}<textarea v-model="s.cmds" style="min-height:80px" /></label>
      <label style="margin-top:10px">{{ t.arch }}<textarea v-model="s.arch" style="min-height:70px" /></label>
      <label style="margin-top:10px">{{ t.style }}<textarea v-model="s.style" style="min-height:60px" /></label>
      <div style="margin-top:10px">
        <label v-for="r in RULES" :key="r" class="chk"><input v-model="s.rules" type="checkbox" :value="r"> {{ r }}</label>
      </div>
      <label style="margin-top:10px">{{ t.imports }}<textarea v-model="s.imports" style="min-height:40px" /></label>
    </div>
    <div>
      <CodeOutput :code="md" label="./CLAUDE.md" />
      <div class="card">
        <h3>{{ t.whereTitle }}</h3>
        <table>
          <tr v-for="[file, what] in t.where" :key="file"><td><code>{{ file }}</code></td><td>{{ what }}</td></tr>
          <tr><td><code>.claude/rules/*.md</code></td><td>{{ t.rulesRow1 }} <code>paths:</code> {{ t.rulesRow2 }}</td></tr>
        </table>
        <p class="note">{{ t.note }}</p>
      </div>
    </div>
  </div>
</template>
