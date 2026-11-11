<script setup lang="ts">
import { computed, onMounted, useId } from 'vue';
import { tr, useMessages } from '@/i18n';
import { useVote } from '../composables/useVote';
import { loadSession } from '../composables/useVoter';
import { LOCKED_REASON } from '../labels';
import type { ProposalSummary } from '../types';
import ScoreBreakdown from './ScoreBreakdown.vue';

const props = defineProps<{ proposal: ProposalSummary; row?: boolean }>();
const emit = defineEmits<{ update: [proposal: ProposalSummary] }>();

const t = useMessages({
  es: { group: (title: string) => `Votar: ${title}`, up: 'Votar a favor', down: 'Votar en contra', upOn: 'Votaste a favor. Tocá para retirar el voto', downOn: 'Votaste en contra. Tocá para retirar el voto' },
  en: { group: (title: string) => `Vote: ${title}`, up: 'Upvote', down: 'Downvote', upOn: 'You upvoted. Press to withdraw your vote', downOn: 'You downvoted. Press to withdraw your vote' },
});

const { cast } = useVote(() => props.proposal, (next) => emit('update', next));
const locked = computed(() => LOCKED_REASON[props.proposal.status]);
const reasonId = useId();

onMounted(loadSession);
</script>

<template>
  <div class="vote" :class="{ row, locked: !!locked }" role="group" :aria-label="t.group(proposal.title)">
    <button type="button" class="vote-btn up" :class="{ on: proposal.myVote === 1 }" :aria-pressed="proposal.myVote === 1" :disabled="!!locked"
      :aria-label="proposal.myVote === 1 ? t.upOn : t.up" :title="locked ? tr(locked) : t.up" :aria-describedby="locked ? reasonId : undefined" @click="cast(1)">
      <span aria-hidden="true">▲</span>
    </button>
    <ScoreBreakdown :proposal="proposal" />
    <button type="button" class="vote-btn down" :class="{ on: proposal.myVote === -1 }" :aria-pressed="proposal.myVote === -1" :disabled="!!locked"
      :aria-label="proposal.myVote === -1 ? t.downOn : t.down" :title="locked ? tr(locked) : t.down" :aria-describedby="locked ? reasonId : undefined" @click="cast(-1)">
      <span aria-hidden="true">▼</span>
    </button>
    <span v-if="locked" :id="reasonId" class="sr-only">{{ tr(locked) }}</span>
  </div>
</template>
