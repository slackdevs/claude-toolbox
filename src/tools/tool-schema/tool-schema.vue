<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { ui, useMessages } from '@/i18n';
import { esc } from '@/lib/format';
import type { Lint } from '@/lib/types';

type PType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
interface Param { name: string; type: PType; required: boolean; enumText: string; description: string }

const t = useMessages({
  es: {
    name: 'Nombre de la tool',
    auto: 'auto (Claude decide)',
    any: 'any (debe usar alguna)',
    tool: 'tool (forzar esta)',
    desc: 'Descripción (qué hace, cuándo usarla, qué devuelve, límites)',
    params: 'Parámetros',
    cols: ['nombre', 'tipo', 'requerido', 'enum (coma)', 'descripción'],
    yes: 'sí',
    remove: 'Quitar',
    addParam: '+ Parámetro',
    strict: 'strict: true (validación estricta del schema)',
    choiceNote: '\n\n// Con "any"/"tool" Claude debe llamar una tool:\n// útil para forzar salida estructurada (extracción).',
    l: {
      nameOk: 'Nombre válido.',
      nameBad: 'El nombre debe cumplir <code>^[a-zA-Z0-9_-]{1,64}$</code>.',
      descShort: 'Descripción muy corta. Es el factor #1 en la correcta selección de tools: explicá qué hace, cuándo usarla (y cuándo no), qué devuelve y sus límites.',
      descMid: 'Apuntá a 3–4 oraciones de descripción para diferenciarla de tools parecidas.',
      descOk: 'Descripción detallada.',
      when: 'Indicá explícitamente cuándo usarla para evitar confusión con otras tools.',
      paramDesc: (p: string) => `El parámetro <code>${p}</code> no tiene descripción: incluí formato y ejemplo.`,
      noParams: 'Sin parámetros.',
      noRequired: 'Ningún parámetro requerido: verificá que la tool funcione con input vacío.',
      errors: 'En el tool_result devolvé errores con <code>is_error: true</code> y mensajes accionables (causa, si es reintentable).',
    },
    defaults: {
      description: 'Busca pedidos de un cliente por email o número de pedido. Úsala cuando el usuario pregunte por el estado, la fecha de entrega o el contenido de un pedido. Devuelve hasta 10 pedidos ordenados por fecha descendente. No sirve para crear ni modificar pedidos.',
      email: 'Email del cliente, ej: ana@ejemplo.com',
      order: 'Número de pedido con formato ORD-123456',
      status: 'Filtra por estado',
    },
  },
  en: {
    name: 'Tool name',
    auto: 'auto (Claude decides)',
    any: 'any (must use one)',
    tool: 'tool (force this one)',
    desc: 'Description (what it does, when to use it, what it returns, limits)',
    params: 'Parameters',
    cols: ['name', 'type', 'required', 'enum (comma)', 'description'],
    yes: 'yes',
    remove: 'Remove',
    addParam: '+ Parameter',
    strict: 'strict: true (strict schema validation)',
    choiceNote: '\n\n// With "any"/"tool" Claude must call a tool:\n// useful to force structured output (extraction).',
    l: {
      nameOk: 'Valid name.',
      nameBad: 'The name must match <code>^[a-zA-Z0-9_-]{1,64}$</code>.',
      descShort: 'Description too short. It is the #1 factor in correct tool selection: explain what it does, when to use it (and when not), what it returns and its limits.',
      descMid: 'Aim for 3–4 sentences of description to tell it apart from similar tools.',
      descOk: 'Detailed description.',
      when: 'State explicitly when to use it to avoid confusion with other tools.',
      paramDesc: (p: string) => `Parameter <code>${p}</code> has no description: include the format and an example.`,
      noParams: 'No parameters.',
      noRequired: 'No required parameters: make sure the tool works with empty input.',
      errors: 'In the tool_result return errors with <code>is_error: true</code> and actionable messages (cause, whether it is retryable).',
    },
    defaults: {
      description: 'Searches a customer\'s orders by email or order number. Use it when the user asks about the status, delivery date or contents of an order. Returns up to 10 orders sorted by date, newest first. It cannot create or modify orders.',
      email: 'Customer email, e.g. ana@example.com',
      order: 'Order number in the format ORD-123456',
      status: 'Filter by status',
    },
  },
});

const TYPES: PType[] = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
const d = t.value.defaults;
const s = reactive({
  name: 'search_orders',
  choice: 'auto',
  strict: false,
  description: d.description,
  params: [
    { name: 'email', type: 'string', required: false, enumText: '', description: d.email },
    { name: 'order_id', type: 'string', required: false, enumText: '', description: d.order },
    { name: 'status', type: 'string', required: false, enumText: 'pending, shipped, delivered, cancelled', description: d.status },
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
  const tl: Record<string, unknown> = { name: s.name, description: s.description, input_schema: schema };
  if (s.strict) tl.strict = true;
  return { t: tl, props, required };
});

const toolJson = computed(() => JSON.stringify([tool.value.t], null, 2));
const choiceJson = computed(() =>
  JSON.stringify(s.choice === 'tool' ? { type: 'tool', name: s.name } : { type: s.choice }, null, 2) +
  (s.choice === 'tool' || s.choice === 'any' ? t.value.choiceNote : ''));

const lint = computed<Lint[]>(() => {
  const L: Lint[] = [];
  const m = t.value.l;
  L.push(/^[a-zA-Z0-9_-]{1,64}$/.test(s.name) ? ['ok', m.nameOk] : ['bad', m.nameBad]);
  const desc = s.description;
  const sentences = desc.split(/[.!?]\s/).filter((x) => x.trim().length > 3).length;
  if (desc.length < 60) L.push(['bad', m.descShort]);
  else if (sentences < 3) L.push(['warn', m.descMid]);
  else L.push(['ok', m.descOk]);
  if (!/(cuándo|cuando|use (it )?when|úsala)/i.test(desc)) L.push(['warn', m.when]);
  s.params.filter((p) => p.name.trim() && !p.description.trim()).forEach((p) => L.push(['warn', m.paramDesc(esc(p.name))]));
  const count = Object.keys(tool.value.props).length;
  if (!count) L.push(['warn', m.noParams]);
  else if (!tool.value.required.length) L.push(['warn', m.noRequired]);
  L.push(['ok', m.errors]);
  return L;
});
</script>

<template>
  <div>
    <div class="card">
      <div class="row">
        <label>{{ t.name }}<input v-model="s.name"></label>
        <label>tool_choice
          <select v-model="s.choice">
            <option value="auto">{{ t.auto }}</option><option value="any">{{ t.any }}</option>
            <option value="tool">{{ t.tool }}</option><option value="none">none</option>
          </select>
        </label>
      </div>
      <label>{{ t.desc }}<textarea v-model="s.description" style="min-height:70px" /></label>
      <h3 style="margin-top:14px">{{ t.params }}</h3>
      <div class="prow note"><span v-for="c in t.cols" :key="c">{{ c }}</span><span /></div>
      <div v-for="(p, i) in s.params" :key="i" class="prow">
        <input v-model="p.name" :placeholder="t.cols[0]">
        <select v-model="p.type"><option v-for="ty in TYPES" :key="ty">{{ ty }}</option></select>
        <label class="chk"><input v-model="p.required" type="checkbox"> {{ t.yes }}</label>
        <input v-model="p.enumText" placeholder="a, b, c">
        <input v-model="p.description" :placeholder="t.cols[4]">
        <button class="btn ghost sm" :title="t.remove" @click="s.params.splice(i, 1)">✕</button>
      </div>
      <div class="btns"><button class="btn ghost sm" @click="addParam">{{ t.addParam }}</button></div>
      <label class="chk"><input v-model="s.strict" type="checkbox"> {{ t.strict }}</label>
    </div>
    <div class="grid2">
      <div>
        <CodeOutput :code="toolJson" label="tools[]" />
        <CodeOutput :code="choiceJson" label="tool_choice" />
      </div>
      <div class="card"><h3>{{ ui.review }}</h3><LintList :items="lint" /></div>
    </div>
  </div>
</template>
