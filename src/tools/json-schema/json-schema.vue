<script setup lang="ts">
import { computed, ref } from 'vue';
import LintList from '@/components/LintList.vue';
import { toast } from '@/composables/useToast';
import { esc } from '@/lib/format';
import type { Lint } from '@/lib/types';
import { extractJson, inferSchema, validate, type Schema } from './json-schema.service';

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
  "items": [{"desc": "Consultoría", "qty": 2}],
  "notes": "pagar a 30 días"
}`);

function generate() {
  try {
    schemaText.value = JSON.stringify(inferSchema(JSON.parse(valueText.value)), null, 2);
  } catch {
    toast('El JSON de la derecha no es válido');
  }
}

const result = computed<{ items: Lint[]; extracted: boolean; retryHint: boolean }>(() => {
  let schema: Schema;
  try {
    schema = JSON.parse(schemaText.value);
  } catch (e) {
    return { items: [['bad', 'El schema no es JSON válido: ' + esc((e as Error).message)]], extracted: false, retryHint: false };
  }
  const { text, extracted } = extractJson(valueText.value);
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { items: [['bad', 'El valor no es JSON válido: ' + esc((e as Error).message) + '. Si el modelo devuelve texto alrededor, usá tool use / structured outputs o extraé de &lt;result&gt;.']], extracted, retryHint: false };
  }
  const errs = validate(schema, value);
  return errs.length
    ? { items: errs.map((e) => ['bad', esc(e)] as Lint), extracted, retryHint: true }
    : { items: [['ok', 'Válido: el JSON cumple el schema.']], extracted, retryHint: false };
});
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card"><label>JSON Schema<textarea v-model="schemaText" style="min-height:260px" /></label></div>
      <div class="card">
        <label>JSON a validar (salida del modelo)<textarea v-model="valueText" style="min-height:260px" /></label>
        <div class="btns"><button class="btn ghost sm" @click="generate">Generar schema desde este JSON</button></div>
      </div>
    </div>
    <div class="card">
      <LintList :items="result.items" />
      <p v-if="result.retryHint" class="note">
        Patrón recomendado: devolvé estos errores al modelo en un reintento (validation-retry loop) indicando exactamente qué campo falló.
        Los reintentos no arreglan datos ausentes en la fuente: permití <code>null</code> en campos opcionales para no forzar invenciones.
      </p>
      <p v-if="result.extracted" class="note">Se extrajo el JSON de un bloque &lt;result&gt; o ```json.</p>
    </div>
  </div>
</template>
