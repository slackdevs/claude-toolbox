<script setup lang="ts">
import { computed } from 'vue';
import CertTags from '@/components/CertTags.vue';
import { tr, ui, useMessages } from '@/i18n';
import { parseMarkdown, plainText } from '@/lib/markdown';
import { fmtDate, fmtHours, toolName } from '../format';
import { TYPE_LABELS } from '../labels';
import type { ProposalSummary } from '../types';
import DonateButtons from './DonateButtons.vue';
import LangTag from './LangTag.vue';
import ScoreBreakdown from './ScoreBreakdown.vue';
import StatusBadge from './StatusBadge.vue';
import VoteControl from './VoteControl.vue';

// `readonly`: sólo muestra el puntaje (roadmap, home); si no, incluye el control de voto.
const props = defineProps<{ proposal: ProposalSummary; compact?: boolean; readonly?: boolean }>();
const emit = defineEmits<{ update: [proposal: ProposalSummary] }>();

const t = useMessages({
  es: { estimate: 'Tiempo estimado', pending: 'Estimación pendiente de revisión', improves: 'Mejora de' },
  en: { estimate: 'Estimated time', pending: 'Estimate pending review', improves: 'Improves' },
});

const excerpt = computed(() => plainText(parseMarkdown(props.proposal.description)));
</script>

<template>
  <article class="card pcard" :class="{ compact }">
    <div class="pcard-side">
      <ScoreBreakdown v-if="readonly" :proposal="proposal" />
      <VoteControl v-else :proposal="proposal" @update="emit('update', $event)" />
    </div>
    <div class="pcard-body">
      <div class="pcard-tags">
        <span class="tag"><span aria-hidden="true">{{ TYPE_LABELS[proposal.type].icon }}</span> {{ tr(TYPE_LABELS[proposal.type].name) }}</span>
        <StatusBadge :status="proposal.status" />
        <LangTag :lang="proposal.lang" />
        <span v-if="proposal.sample" class="tag sample-tag">{{ ui.sampleData }}</span>
      </div>
      <h3 class="pcard-title"><RouterLink :to="`/propuestas/${proposal.id}`">{{ proposal.title }}</RouterLink></h3>
      <p v-if="!compact" class="pcard-excerpt" :lang="proposal.lang">{{ excerpt }}</p>
      <div class="pcard-meta">
        <CertTags :certs="proposal.certs" />
        <RouterLink v-if="proposal.toolPath" :to="proposal.toolPath">{{ t.improves }}: {{ toolName(proposal.toolPath) }}</RouterLink>
        <span v-if="proposal.estimateHours" :title="t.estimate">
          <span aria-hidden="true">⏱</span> <span class="sr-only">{{ t.estimate }}: </span>{{ fmtHours(proposal.estimateHours) }}
        </span>
        <span v-else-if="proposal.status === 'received'">{{ t.pending }}</span>
        <time v-if="!compact" :datetime="proposal.createdAt">{{ fmtDate(proposal.createdAt) }}</time>
      </div>
      <div v-if="!readonly && proposal.status === 'open'"><DonateButtons :proposal="proposal" compact /></div>
    </div>
  </article>
</template>
