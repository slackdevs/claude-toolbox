<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { ui, useMessages } from '@/i18n';
import { fmt } from '@/lib/format';
import { COMMUNITY_CONFIG } from '../config';
import { signed } from '../format';
import { TIER_LABELS } from '../labels';
import { scoreBreakdown } from '../score';
import { DONATION_TIERS, type ProposalSummary } from '../types';

// Puntaje con su desglose: votos y donaciones siempre por separado.
// Compacto: botón con el total y el desglose al pasar el mouse, enfocar o tocar. `expanded`: desglose siempre visible.
const props = defineProps<{ proposal: ProposalSummary; expanded?: boolean }>();

const t = useMessages({
  es: {
    up: 'Votos a favor', down: 'Votos en contra', donations: 'Donaciones', none: 'sin donaciones', score: 'Puntaje',
    pts: 'pts', aria: (n: string) => `Puntaje ${n}. Ver desglose`, formula: 'Puntaje = votos a favor − votos en contra + puntos por donaciones',
  },
  en: {
    up: 'Upvotes', down: 'Downvotes', donations: 'Donations', none: 'no donations', score: 'Score',
    pts: 'pts', aria: (n: string) => `Score ${n}. Show breakdown`, formula: 'Score = upvotes − downvotes + donation points',
  },
});

const open = ref(false);
const tipId = useId();
const b = computed(() => scoreBreakdown(props.proposal));
const tiers = computed(() =>
  DONATION_TIERS.filter((k) => props.proposal.donationsByTier[k]).map((k) => `${props.proposal.donationsByTier[k]} ${TIER_LABELS[k].icon}`).join(' · '));
const rows = computed(() => [
  { key: 'up', icon: '▲', label: t.value.up, value: signed(b.value.upvotes), detail: '', provisional: false },
  { key: 'down', icon: '▼', label: t.value.down, value: signed(-b.value.downvotes), detail: '', provisional: false },
  { key: 'don', icon: '☕', label: t.value.donations, value: signed(b.value.donationPoints), detail: tiers.value || t.value.none, provisional: COMMUNITY_CONFIG.provisional },
]);
</script>

<template>
  <div v-if="expanded" class="score-rows">
    <div v-for="r in rows" :key="r.key" class="score-row">
      <span aria-hidden="true">{{ r.icon }}</span>
      <span>{{ r.label }}<small v-if="r.detail"> · {{ r.detail }}</small><small v-if="r.provisional"> · {{ ui.provisional }}</small></span>
      <b>{{ r.value }}</b>
    </div>
    <div class="score-row total"><span aria-hidden="true">=</span><span>{{ t.score }}</span><b>{{ fmt(b.score) }}</b></div>
    <p class="note">{{ t.formula }}</p>
  </div>
  <span v-else class="score-wrap" :class="{ open }" @keydown.esc="open = false" @focusout="open = false">
    <button type="button" class="score-btn" :aria-expanded="open" :aria-describedby="tipId" :aria-label="t.aria(fmt(b.score))" @click="open = !open">
      <b>{{ fmt(b.score) }}</b><span>{{ t.pts }}</span>
    </button>
    <span :id="tipId" class="score-tip" role="tooltip">
      <span v-for="r in rows" :key="r.key" class="score-row">
        <span aria-hidden="true">{{ r.icon }}</span>
        <span>{{ r.label }}<small v-if="r.detail"> · {{ r.detail }}</small><small v-if="r.provisional"> · {{ ui.provisional }}</small></span>
        <b>{{ r.value }}</b>
      </span>
      <span class="score-row total"><span aria-hidden="true">=</span><span>{{ t.score }}</span><b>{{ fmt(b.score) }}</b></span>
    </span>
  </span>
</template>
