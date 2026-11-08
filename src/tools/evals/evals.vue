<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { lines } from '@/lib/format';
import type { Lint } from '@/lib/types';

const s = reactive({
  task: 'Respuestas de soporte al cliente',
  crit: 'exactitud | La información es correcta y consistente con la política\ncompletitud | Responde todas las preguntas del cliente\ntono | Empático, profesional y sin jerga\naccionable | Indica un próximo paso concreto',
  scale: '5',
  ref: true,
});

const criteria = computed(() => lines(s.crit).map((l) => {
  const [name, ...d] = l.split('|');
  return { n: name!.trim().replace(/\s+/g, '_'), d: d.join('|').trim() };
}));

const prompt = computed(() => {
  const pf = s.scale === 'pf';
  const scaleTxt = pf ? 'Para cada criterio asigna "pass" o "fail".' : `Para cada criterio asigna un puntaje entero de 1 a ${s.scale}, donde 1 es inaceptable y ${s.scale} es excelente.`;
  return `Vas a evaluar la calidad de: ${s.task}.

<criteria>
${criteria.value.map((c) => `<criterion name="${c.n}">${c.d}</criterion>`).join('\n')}
</criteria>

<input>
{{INPUT}}
</input>

<response>
{{RESPONSE}}
</response>
${s.ref ? '\n<reference_answer>\n{{REFERENCE}}\n</reference_answer>\n' : ''}
${scaleTxt}
Evalúa cada criterio de forma independiente${s.ref ? ' y usa la respuesta de referencia como guía, no como única respuesta válida' : ''}.
Primero razona brevemente dentro de <analysis></analysis>. Después devuelve solo un objeto JSON dentro de <result></result> con este formato:
{
${criteria.value.map((c) => `  "${c.n}": {"score": ${pf ? '"pass"' : '0'}, "reason": "..."}`).join(',\n')}
}`;
});

const schema = computed(() => {
  const item = s.scale === 'pf' ? { type: 'string', enum: ['pass', 'fail'] } : { type: 'integer', minimum: 1, maximum: Number(s.scale) };
  const props: Record<string, unknown> = {};
  criteria.value.forEach((c) => (props[c.n] = { type: 'object', properties: { score: item, reason: { type: 'string' } }, required: ['score', 'reason'], additionalProperties: false }));
  return JSON.stringify({ type: 'object', properties: props, required: criteria.value.map((c) => c.n), additionalProperties: false }, null, 2);
});

const TIPS: Lint[] = [
  ['ok', 'Preferí evaluación por código (match exacto, regex, validación de schema) cuando sea posible; usá LLM-juez para criterios subjetivos.'],
  ['ok', 'Calibrá el juez contra 20–50 ejemplos etiquetados por humanos y medí el acuerdo antes de confiar en él.'],
  ['ok', 'Pedí razonamiento antes del puntaje y criterios con descripciones concretas; evitá escalas amplias sin anclas.'],
  ['warn', 'Cuidado con sesgos: posición (en comparaciones A/B alterná el orden), longitud y auto-preferencia.'],
  ['ok', 'Armá el set de pruebas con casos reales, bordes y adversariales; versionalo junto al prompt.'],
];
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card">
        <label>Tarea evaluada<input v-model="s.task"></label>
        <label style="margin-top:10px">Criterios (nombre | descripción, uno por línea)<textarea v-model="s.crit" style="min-height:120px" /></label>
        <div class="row" style="margin-top:10px">
          <label>Escala<select v-model="s.scale"><option value="5">1 a 5</option><option value="pf">Pasa / No pasa</option><option value="3">1 a 3</option></select></label>
        </div>
        <label class="chk"><input v-model="s.ref" type="checkbox"> Incluir respuesta de referencia <code v-pre>{{REFERENCE}}</code></label>
      </div>
      <div>
        <CodeOutput :code="prompt" label="prompt del juez" />
        <CodeOutput :code="schema" label="schema de salida esperada" />
      </div>
    </div>
    <div class="card"><h3>Buenas prácticas de evaluación</h3><LintList :items="TIPS" /></div>
  </div>
</template>
