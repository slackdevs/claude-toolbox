<script setup lang="ts">
import { computed, ref } from 'vue';
import LintList from '@/components/LintList.vue';
import { toast } from '@/composables/useToast';
import { tr, useMessages } from '@/i18n';
import { esc } from '@/lib/format';
import type { Lint } from '@/lib/types';
import { extractJson, inferSchema, validate, VALIDATION_MESSAGES, type Schema } from './json-schema.service';

const t = useMessages({
  es: {
    value: 'JSON a validar (salida del modelo)',
    generate: 'Generar schema desde este JSON',
    invalidRight: 'El JSON de la derecha no es válido',
    badSchema: 'El schema no es JSON válido: ',
    badValue: 'El valor no es JSON válido: ',
    badValueHint: '. Si el modelo devuelve texto alrededor, usá tool use / structured outputs o extraé de &lt;result&gt;.',
    valid: 'Válido: el JSON cumple el schema.',
    retry1: 'Patrón recomendado: devolvé estos errores al modelo en un reintento (validation-retry loop) indicando exactamente qué campo falló. Los reintentos no arreglan datos ausentes en la fuente: permití',
    retry2: 'en campos opcionales para no forzar invenciones.',
    extracted: 'Se extrajo el JSON de un bloque <result> o ```json.',
    sampleDesc: 'Consultoría',
    sampleNotes: 'pagar a 30 días',
  },
  en: {
    value: 'JSON to validate (model output)',
    generate: 'Generate schema from this JSON',
    invalidRight: 'The JSON on the right is not valid',
    badSchema: 'The schema is not valid JSON: ',
    badValue: 'The value is not valid JSON: ',
    badValueHint: '. If the model returns surrounding text, use tool use / structured outputs or extract from &lt;result&gt;.',
    valid: 'Valid: the JSON matches the schema.',
    retry1: 'Recommended pattern: send these errors back to the model in a retry (validation-retry loop), stating exactly which field failed. Retries do not fix data missing from the source: allow',
    retry2: 'in optional fields so the model is not forced to make things up.',
    extracted: 'The JSON was extracted from a <result> or ```json block.',
    sampleDesc: 'Consulting',
    sampleNotes: 'net 30 payment terms',
  },
});

const schemaText = ref(`{
  "type": "object",
  "properties": {
    "invoice_number": {"type": "string", "pattern": "^INV-\\\\d+$"},
    "total": {"type": "number", "minimum": 0},
    "currency": {"type": "string", "enum": ["USD", "EUR", "ARS"]},
    "items": {"type": "array", "minItems": 1, "items": {"type": "object", "properties": {"desc": {"type": "string"}, "qty": {"type": "integer"}}, "required": ["desc", "qty"]}}
  },
  "required": ["invoice_number", "total", "currency", "items"],
  "additionalProperties": false
}`);
const valueText = ref(`{
  "invoice_number": "INV-2041",
  "total": "1500.00",
  "currency": "USD",
  "items": [{"desc": "${t.value.sampleDesc}", "qty": 2}],
  "notes": "${t.value.sampleNotes}"
}`);

function generate() {
  try {
    schemaText.value = JSON.stringify(inferSchema(JSON.parse(valueText.value)), null, 2);
  } catch {
    toast(t.value.invalidRight);
  }
}

const result = computed<{ items: Lint[]; extracted: boolean; retryHint: boolean }>(() => {
  const m = t.value;
  let schema: Schema;
  try {
    schema = JSON.parse(schemaText.value);
  } catch (e) {
    return { items: [['bad', m.badSchema + esc((e as Error).message)]], extracted: false, retryHint: false };
  }
  const { text, extracted } = extractJson(valueText.value);
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { items: [['bad', m.badValue + esc((e as Error).message) + m.badValueHint]], extracted, retryHint: false };
  }
  const errs = validate(schema, value, '$', [], tr(VALIDATION_MESSAGES));
  return errs.length
    ? { items: errs.map((e) => ['bad', esc(e)] as Lint), extracted, retryHint: true }
    : { items: [['ok', m.valid]], extracted, retryHint: false };
});
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card"><label>JSON Schema<textarea v-model="schemaText" style="min-height:260px" /></label></div>
      <div class="card">
        <label>{{ t.value }}<textarea v-model="valueText" style="min-height:260px" /></label>
        <div class="btns"><button class="btn ghost sm" @click="generate">{{ t.generate }}</button></div>
      </div>
    </div>
    <div class="card">
      <LintList :items="result.items" />
      <p v-if="result.retryHint" class="note">{{ t.retry1 }} <code>null</code> {{ t.retry2 }}</p>
      <p v-if="result.extracted" class="note">{{ t.extracted }}</p>
    </div>
  </div>
</template>
