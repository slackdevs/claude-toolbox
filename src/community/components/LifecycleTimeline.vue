<script setup lang="ts">
import { computed } from 'vue';
import { tr, useMessages } from '@/i18n';
import { STATUS_LABELS } from '../labels';
import { LIFECYCLE, type ProposalStatus } from '../types';

const props = defineProps<{ status: ProposalStatus }>();

const t = useMessages({
  es: { label: 'Ciclo de vida de la propuesta', done: 'completado', current: 'paso actual', todo: 'pendiente' },
  en: { label: 'Proposal lifecycle', done: 'done', current: 'current step', todo: 'upcoming' },
});

// Las propuestas cerradas (descartada, duplicada) salen del camino feliz después de la revisión.
const steps = computed(() => {
  const closed = props.status === 'discarded' || props.status === 'duplicate';
  const path: ProposalStatus[] = closed ? ['received', props.status] : LIFECYCLE;
  const at = path.indexOf(props.status);
  return path.map((s, i) => ({ status: s, state: i < at ? ('done' as const) : i === at ? ('current' as const) : ('todo' as const) }));
});
</script>

<template>
  <ol class="timeline" :aria-label="t.label">
    <li v-for="s in steps" :key="s.status" :class="[s.state, STATUS_LABELS[s.status].color]" :aria-current="s.state === 'current' ? 'step' : undefined">
      <span class="timeline-dot" aria-hidden="true">{{ s.state === 'done' ? '✓' : STATUS_LABELS[s.status].icon }}</span>
      <span class="timeline-name">{{ tr(STATUS_LABELS[s.status].name) }} <span class="sr-only">({{ t[s.state] }})</span></span>
      <span v-if="s.state === 'current'" class="timeline-hint">{{ tr(STATUS_LABELS[s.status].hint) }}</span>
    </li>
  </ol>
</template>
