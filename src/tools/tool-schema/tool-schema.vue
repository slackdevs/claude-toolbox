<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { esc } from '@/lib/format';
import type { Lint } from '@/lib/types';

type PType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
interface Param { name: string; type: PType; required: boolean; enumText: string; description: string }

const TYPES: PType[] = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
const s = reactive({
  name: 'search_orders',
  choice: 'auto',
  strict: false,
  description: 'Busca pedidos de un cliente por email o número de pedido. Úsala cuando el usuario pregunte por el estado, la fecha de entrega o el contenido de un pedido. Devuelve hasta 10 pedidos ordenados por fecha descendente. No sirve para crear ni modificar pedidos.',
  params: [
    { name: 'email', type: 'string', required: false, enumText: '', description: 'Email del cliente, ej: ana@ejemplo.com' },
    { name: 'order_id', type: 'string', required: false, enumText: '', description: 'Número de pedido con formato ORD-123456' },
    { name: 'status', type: 'string', required: false, enumText: 'pending, shipped, delivered, cancelled', description: 'Filtra por estado' },
  ] as Param[],
});

const addParam = () => s.params.push({ name: '', type: 'string', required: false, enumText: '', description: '' });

const tool = computed(() => {
  const props: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];
  for (const p of s.params) {
    const name = p.name.trim();
    if (!name) continue;
    const o: Record<string, unknown> = { type: p.type };
    if (p.description.trim()) o.description = p.description.trim();
    const en = p.enumText.split(',').map((x) => x.trim()).filter(Boolean);
    if (en.length) o.enum = p.type === 'number' || p.type === 'integer' ? en.map(Number) : en;
    if (p.type === 'array') o.items = { type: 'string' };
    if (p.type === 'object') {
      o.properties = {};
      if (s.strict) o.additionalProperties = false;
    }
    props[name] = o;
    if (p.required) required.push(name);
  }
  const schema: Record<string, unknown> = { type: 'object', properties: props };
  if (required.length) schema.required = required;
  if (s.strict) schema.additionalProperties = false;
  const t: Record<string, unknown> = { name: s.name, description: s.description, input_schema: schema };
  if (s.strict) t.strict = true;
  return { t, props, required };
});

const toolJson = computed(() => JSON.stringify([tool.value.t], null, 2));
const choiceJson = computed(() =>
  JSON.stringify(s.choice === 'tool' ? { type: 'tool', name: s.name } : { type: s.choice }, null, 2) +
  (s.choice === 'tool' || s.choice === 'any' ? '\n\n// Con "any"/"tool" Claude debe llamar una tool:\n// útil para forzar salida estructurada (extracción).' : ''));

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  L.push(/^[a-zA-Z0-9_-]{1,64}$/.test(s.name) ? ['ok', 'Nombre válido.'] : ['bad', 'El nombre debe cumplir <code>^[a-zA-Z0-9_-]{1,64}$</code>.']);
  const d = s.description;
  const sentences = d.split(/[.!?]\s/).filter((x) => x.trim().length > 3).length;
  if (d.length < 60) L.push(['bad', 'Descripción muy corta. Es el factor #1 en la correcta selección de tools: explicá qué hace, cuándo usarla (y cuándo no), qué devuelve y sus límites.']);
  else if (sentences < 3) L.push(['warn', 'Apuntá a 3–4 oraciones de descripción para diferenciarla de tools parecidas.']);
  else L.push(['ok', 'Descripción detallada.']);
  if (!/(cuándo|cuando|use (it )?when|úsala)/i.test(d)) L.push(['warn', 'Indicá explícitamente cuándo usarla para evitar confusión con otras tools.']);
  s.params.filter((p) => p.name.trim() && !p.description.trim()).forEach((p) =>
    L.push(['warn', `El parámetro <code>${esc(p.name)}</code> no tiene descripción: incluí formato y ejemplo.`]));
  const count = Object.keys(tool.value.props).length;
  if (!count) L.push(['warn', 'Sin parámetros.']);
  else if (!tool.value.required.length) L.push(['warn', 'Ningún parámetro requerido: verificá que la tool funcione con input vacío.']);
  L.push(['ok', 'En el tool_result devolvé errores con <code>is_error: true</code> y mensajes accionables (causa, si es reintentable).']);
  return L;
});
</script>

<template>
  <div>
    <div class="card">
      <div class="row">
        <label>Nombre de la tool<input v-model="s.name"></label>
        <label>tool_choice
          <select v-model="s.choice">
            <option value="auto">auto (Claude decide)</option><option value="any">any (debe usar alguna)</option>
            <option value="tool">tool (forzar esta)</option><option value="none">none</option>
          </select>
        </label>
      </div>
      <label>Descripción (qué hace, cuándo usarla, qué devuelve, límites)<textarea v-model="s.description" style="min-height:70px" /></label>
      <h3 style="margin-top:14px">Parámetros</h3>
      <div class="prow note"><span>nombre</span><span>tipo</span><span>requerido</span><span>enum (coma)</span><span>descripción</span><span /></div>
      <div v-for="(p, i) in s.params" :key="i" class="prow">
        <input v-model="p.name" placeholder="nombre">
        <select v-model="p.type"><option v-for="t in TYPES" :key="t">{{ t }}</option></select>
        <label class="chk"><input v-model="p.required" type="checkbox"> sí</label>
        <input v-model="p.enumText" placeholder="a, b, c">
        <input v-model="p.description" placeholder="descripción">
        <button class="btn ghost sm" title="Quitar" @click="s.params.splice(i, 1)">✕</button>
      </div>
      <div class="btns"><button class="btn ghost sm" @click="addParam">+ Parámetro</button></div>
      <label class="chk"><input v-model="s.strict" type="checkbox"> strict: true (validación estricta del schema)</label>
    </div>
    <div class="grid2">
      <div>
        <CodeOutput :code="toolJson" label="tools[]" />
        <CodeOutput :code="choiceJson" label="tool_choice" />
      </div>
      <div class="card"><h3>Revisión</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
