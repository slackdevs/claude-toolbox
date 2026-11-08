#!/usr/bin/env node
// Uso: npm run script:create:tool -- mi-herramienta
// Crea src/tools/<nombre>/index.ts y <nombre>.vue. El registro es automático (import.meta.glob).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const name = process.argv[2];
if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Indicá un nombre en kebab-case. Ej: npm run script:create:tool -- prompt-diff');
  process.exit(1);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'tools', name);
if (existsSync(dir)) {
  console.error(`Ya existe src/tools/${name}`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const title = name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

writeFileSync(join(dir, 'index.ts'), `import { defineTool } from '../tool';

export const tool = defineTool({
  name: '${title}',
  path: '/${name}',
  description: 'TODO: qué hace esta herramienta, en una oración.',
  keywords: [],
  icon: '◇',
  category: 'api', // api | prompt | tools | code | arch
  certs: ['D'], // A | D | AF | AP | B
  component: () => import('./${name}.vue'),
});
`);

writeFileSync(join(dir, `${name}.vue`), `<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';

const input = ref('');
const output = computed(() => input.value);
</script>

<template>
  <div class="grid2">
    <div class="card">
      <label>Entrada<textarea v-model="input" /></label>
    </div>
    <CodeOutput :code="output" label="salida" />
  </div>
</template>
`);

console.log(`✔ Herramienta creada en src/tools/${name}/ (ruta /#/${name})`);
