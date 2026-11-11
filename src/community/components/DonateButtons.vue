<script setup lang="ts">
import { computed } from 'vue';
import { tr, ui, useMessages } from '@/i18n';
import { openDonate } from '../composables/useDonate';
import { COMMUNITY_CONFIG } from '../config';
import { fmtMinutes, fmtMoney } from '../format';
import { LOCKED_REASON, TIER_LABELS } from '../labels';
import { DONATION_TIERS, type ProposalSummary } from '../types';

// `compact`: un solo botón "Donar" (tarjetas del listado); si no, los tres consumos con precio y equivalencia.
const props = defineProps<{ proposal: ProposalSummary; compact?: boolean }>();

const t = useMessages({
  es: { donate: 'Donar', eq: (m: string) => `≈ ${m} de desarrollo`, tbd: 'equivalencia a definir', group: 'Donar por consumos' },
  en: { donate: 'Donate', eq: (m: string) => `≈ ${m} of development`, tbd: 'equivalence to be defined', group: 'Donate' },
});

const locked = computed(() => LOCKED_REASON[props.proposal.status]);
const tiers = computed(() =>
  DONATION_TIERS.map((k) => {
    const c = COMMUNITY_CONFIG.tiers[k];
    return { key: k, ...TIER_LABELS[k], price: fmtMoney(c.amount), eq: c.minutes ? t.value.eq(fmtMinutes(c.minutes[0], c.minutes[1])) : t.value.tbd };
  }));
</script>

<template>
  <button v-if="compact" class="btn ghost sm donate-compact" type="button" :disabled="!!locked" :title="locked ? tr(locked) : undefined" @click="openDonate(proposal)">
    <span aria-hidden="true">☕</span> {{ t.donate }}
  </button>
  <div v-else class="donate" role="group" :aria-label="t.group">
    <button v-for="x in tiers" :key="x.key" class="donate-btn" type="button" :disabled="!!locked" @click="openDonate(proposal, x.key)">
      <span class="donate-ico" aria-hidden="true">{{ x.icon }}</span>
      <span class="donate-text">
        <b>{{ x.button }}</b>
        <span>{{ x.eq }}</span>
      </span>
      <span class="donate-price">{{ x.price }}<small v-if="COMMUNITY_CONFIG.provisional">{{ ui.provisional }}</small></span>
    </button>
  </div>
</template>
