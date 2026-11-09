<script setup lang="ts">
import { computed, reactive } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import LintList from '@/components/LintList.vue';
import { useMessages } from '@/i18n';
import { lines } from '@/lib/format';
import type { Lint } from '@/lib/types';

const t = useMessages({
  es: {
    task: 'Tarea evaluada',
    crit: 'Criterios (nombre | descripción, uno por línea)',
    scale: 'Escala',
    s5: '1 a 5',
    spf: 'Pasa / No pasa',
    s3: '1 a 3',
    ref: 'Incluir respuesta de referencia',
    judge: 'prompt del juez',
    schema: 'schema de salida esperada',
    tipsTitle: 'Buenas prácticas de evaluación',
    p: {
      intro: (task: string) => `Vas a evaluar la calidad de: ${task}.`,
      pf: 'Para cada criterio asigna "pass" o "fail".',
      num: (n: string) => `Para cada criterio asigna un puntaje entero de 1 a ${n}, donde 1 es inaceptable y ${n} es excelente.`,
      indep: 'Evalúa cada criterio de forma independiente',
      useRef: ' y usa la respuesta de referencia como guía, no como única respuesta válida',
      out: 'Primero razona brevemente dentro de <analysis></analysis>. Después devuelve solo un objeto JSON dentro de <result></result> con este formato:',
    },
    tips: [
      ['ok', 'Preferí evaluación por código (match exacto, regex, validación de schema) cuando sea posible; usá LLM-juez para criterios subjetivos.'],
      ['ok', 'Calibrá el juez contra 20–50 ejemplos etiquetados por humanos y medí el acuerdo antes de confiar en él.'],
      ['ok', 'Pedí razonamiento antes del puntaje y criterios con descripciones concretas; evitá escalas amplias sin anclas.'],
      ['warn', 'Cuidado con sesgos: posición (en comparaciones A/B alterná el orden), longitud y auto-preferencia.'],
      ['ok', 'Armá el set de pruebas con casos reales, bordes y adversariales; versionalo junto al prompt.'],
    ] as Lint[],
    defaults: {
      task: 'Respuestas de soporte al cliente',
      crit: 'exactitud | La información es correcta y consistente con la política\ncompletitud | Responde todas las preguntas del cliente\ntono | Empático, profesional y sin jerga\naccionable | Indica un próximo paso concreto',
    },
  },
  en: {
    task: 'Task being evaluated',
    crit: 'Criteria (name | description, one per line)',
    scale: 'Scale',
    s5: '1 to 5',
    spf: 'Pass / Fail',
    s3: '1 to 3',
    ref: 'Include reference answer',
    judge: 'judge prompt',
    schema: 'expected output schema',
    tipsTitle: 'Evaluation best practices',
    p: {
      intro: (task: string) => `You will evaluate the quality of: ${task}.`,
      pf: 'For each criterion assign "pass" or "fail".',
      num: (n: string) => `For each criterion assign an integer score from 1 to ${n}, where 1 is unacceptable and ${n} is excellent.`,
      indep: 'Evaluate each criterion independently',
      useRef: ' and use the reference answer as a guide, not as the only valid answer',
      out: 'First reason briefly inside <analysis></analysis>. Then return only a JSON object inside <result></result> with this format:',
    },
    tips: [
      ['ok', 'Prefer code-based grading (exact match, regex, schema validation) when possible; use an LLM judge for subjective criteria.'],
      ['ok', 'Calibrate the judge against 20–50 human-labeled examples and measure agreement before trusting it.'],
      ['ok', 'Ask for reasoning before the score and use criteria with concrete descriptions; avoid wide scales without anchors.'],
      ['warn', 'Watch out for biases: position (alternate the order in A/B comparisons), length and self-preference.'],
      ['ok', 'Build the test set from real, edge and adversarial cases; version it alongside the prompt.'],
    ] as Lint[],
    defaults: {
      task: 'Customer support replies',
      crit: 'accuracy | The information is correct and consistent with the policy\ncompleteness | Answers all of the customer\'s questions\ntone | Empathetic, professional and jargon-free\nactionable | States a concrete next step',
    },
  },
});

const s = reactive({ ...t.value.defaults, scale: '5', ref: true });

const criteria = computed(() => lines(s.crit).map((l) => {
  const [name, ...d] = l.split('|');
  return { n: name!.trim().replace(/\s+/g, '_'), d: d.join('|').trim() };
}));

const prompt = computed(() => {
  const p = t.value.p;
  const pf = s.scale === 'pf';
  const scaleTxt = pf ? p.pf : p.num(s.scale);
  return `${p.intro(s.task)}

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
${p.indep}${s.ref ? p.useRef : ''}.
${p.out}
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
</script>

<template>
  <div>
    <div class="grid2">
      <div class="card">
        <label>{{ t.task }}<input v-model="s.task"></label>
        <label style="margin-top:10px">{{ t.crit }}<textarea v-model="s.crit" style="min-height:120px" /></label>
        <div class="row" style="margin-top:10px">
          <label>{{ t.scale }}<select v-model="s.scale"><option value="5">{{ t.s5 }}</option><option value="pf">{{ t.spf }}</option><option value="3">{{ t.s3 }}</option></select></label>
        </div>
        <label class="chk"><input v-model="s.ref" type="checkbox"> {{ t.ref }} <code v-pre>{{REFERENCE}}</code></label>
      </div>
      <div>
        <CodeOutput :code="prompt" :label="t.judge" />
        <CodeOutput :code="schema" :label="t.schema" />
      </div>
    </div>
    <div class="card"><h3>{{ t.tipsTitle }}</h3><LintList :items="t.tips" /></div>
  </div>
</template>
