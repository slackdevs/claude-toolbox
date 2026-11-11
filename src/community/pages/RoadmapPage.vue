<script setup lang="ts">
import { computed } from 'vue';
import PageHead from '@/components/PageHead.vue';
import { tr, ui, useMessages } from '@/i18n';
import ProposalCard from '../components/ProposalCard.vue';
import ProposalSkeleton from '../components/ProposalSkeleton.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { useProposals } from '../composables/useProposals';
import { ERROR_LABELS, STATUS_LABELS } from '../labels';
import type { ProposalStatus } from '../types';

const t = useMessages({
  es: {
    intro: 'El roadmap sale del ranking de propuestas, con revisión de Sebastián. Si se saltea una propuesta, se publica el motivo. Lo publicado es open source y se mantiene actualizado.',
    vote: 'Ver propuestas abiertas a votación', empty: 'Nada por ahora.', count: (n: number) => (n === 1 ? '1 propuesta' : `${n} propuestas`),
  },
  en: {
    intro: 'The roadmap comes from the proposal ranking, reviewed by Sebastián. If a proposal is skipped, the reason is published. What gets published is open source and kept up to date.',
    vote: 'See proposals open for voting', empty: 'Nothing here yet.', count: (n: number) => (n === 1 ? '1 proposal' : `${n} proposals`),
  },
});

const COLUMNS: ProposalStatus[] = ['planned', 'in_progress', 'published'];

// Un solo pedido, ya ordenado por ranking; se reparte por estado.
const { items, loading, error, reload } = useProposals();
const columns = computed(() => COLUMNS.map((status) => ({ status, items: items.value.filter((p) => p.status === status) })));
</script>

<template>
  <div>
    <PageHead>
      <template #actions><RouterLink class="btn ghost" to="/propuestas?status=open">▲ {{ t.vote }}</RouterLink></template>
    </PageHead>
    <p class="roadmap-intro">{{ t.intro }}</p>

    <ProposalSkeleton v-if="loading" :count="3" />
    <div v-else-if="error" class="empty" role="alert">
      <p>{{ tr(ERROR_LABELS[error]) }}</p>
      <button class="btn ghost" type="button" @click="reload()">{{ ui.retry }}</button>
    </div>
    <div v-else class="roadmap">
      <section v-for="c in columns" :key="c.status" class="roadmap-col" :aria-labelledby="`col-${c.status}`">
        <h2 :id="`col-${c.status}`" class="roadmap-head">
          <StatusBadge :status="c.status" />
          <span class="sr-only">{{ tr(STATUS_LABELS[c.status].name) }}: </span><small>{{ t.count(c.items.length) }}</small>
        </h2>
        <p class="note">{{ tr(STATUS_LABELS[c.status].hint) }}</p>
        <p v-if="!c.items.length" class="empty">{{ t.empty }}</p>
        <ProposalCard v-for="p in c.items" :key="p.id" :proposal="p" compact readonly />
      </section>
    </div>
  </div>
</template>
