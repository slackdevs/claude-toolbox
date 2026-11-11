<script setup lang="ts">
import { ui, useMessages } from '@/i18n';
import { fmt } from '@/lib/format';
import { COMMUNITY_CONFIG } from '../config';
import { fmtMinutes, fmtMoney } from '../format';
import { TIER_LABELS } from '../labels';
import { DONATION_TIERS, type DonationTier } from '../types';
import CommunityDialog from './CommunityDialog.vue';

// La transparencia es parte del producto: cómo se ordena el ranking, en un solo lugar.
const open = defineModel<boolean>({ required: true });

const t = useMessages({
  es: {
    title: '¿Cómo funciona el ranking?',
    formula: 'Puntaje = votos a favor − votos en contra + puntos por donaciones',
    intro: 'El orden de las propuestas es público y se calcula siempre igual. En cada propuesta podés ver el desglose: votos y donaciones por separado.',
    reviewT: '1. Revisión',
    review: 'Toda propuesta entra como Recibida. Sebastián la revisa, le asigna un tiempo estimado de desarrollo e implementación y recién ahí la abre a votación. Hasta entonces no se puede votar ni donar.',
    votesT: '2. Votos',
    votes: 'Un voto por email y por propuesta, a favor (+1) o en contra (−1). Podés cambiarlo o retirarlo cuando quieras. No hace falta crear una cuenta: alcanza con verificar tu email.',
    donationsT: '3. Donaciones por consumos',
    donations: 'Cada consumo confirmado suma puntos a la propuesta y equivale a un tiempo de desarrollo orientativo.',
    tier: (name: string, price: string, points: string, time: string) => `${name}: ${price} · suma ${points} · ${time}`,
    time: (m: string) => `≈ ${m} de desarrollo`, timeTbd: 'equivalencia en tiempo a definir', points: (n: string) => `${n} pts`,
    provisional: 'Precios, equivalencias y puntos son provisorios mientras el sitio esté en modo demo.',
    cyclesT: '4. Del ranking al roadmap',
    cycles: 'En cada ciclo, las propuestas mejor rankeadas pasan a Planificada, luego a En desarrollo y a Publicada. Si dos empatan, va primero la más antigua. Si Sebastián saltea una propuesta, se publica el motivo.',
    stalledT: 'Si una propuesta no avanza',
    stalled: 'Lo donado no se reembolsa: queda como crédito para contratar ese desarrollo de forma privada con Sebastián, con descuento de lo aportado.',
    openT: 'Lo publicado es open source',
    openText: 'Todo lo que se publica queda en el repositorio público y se mantiene actualizado.',
  },
  en: {
    title: 'How does the ranking work?',
    formula: 'Score = upvotes − downvotes + donation points',
    intro: 'The order of proposals is public and always computed the same way. Every proposal shows the breakdown: votes and donations separately.',
    reviewT: '1. Review',
    review: 'Every proposal starts as Received. Sebastián reviews it, assigns an estimated development and implementation time, and only then opens it to voting. Until then it cannot be voted on or funded.',
    votesT: '2. Votes',
    votes: 'One vote per email per proposal, up (+1) or down (−1). You can change or withdraw it at any time. No account needed: verifying your email is enough.',
    donationsT: '3. Donations',
    donations: 'Each confirmed donation adds points to the proposal and stands for an approximate amount of development time.',
    tier: (name: string, price: string, points: string, time: string) => `${name}: ${price} · adds ${points} · ${time}`,
    time: (m: string) => `≈ ${m} of development`, timeTbd: 'time equivalence to be defined', points: (n: string) => `${n} pts`,
    provisional: 'Prices, equivalences and points are provisional while the site is in demo mode.',
    cyclesT: '4. From ranking to roadmap',
    cycles: 'Each cycle, the top-ranked proposals move to Planned, then In progress and Published. On a tie, the oldest goes first. If Sebastián skips a proposal, the reason is published.',
    stalledT: 'If a proposal does not move forward',
    stalled: 'Donations are not refunded: they become credit towards hiring that development privately with Sebastián, discounting what you contributed.',
    openT: 'What gets published is open source',
    openText: 'Everything published lives in the public repository and is kept up to date.',
  },
});

const tierLine = (k: DonationTier) => {
  const c = COMMUNITY_CONFIG.tiers[k];
  return t.value.tier(TIER_LABELS[k].button, fmtMoney(c.amount), t.value.points(fmt(c.points)), c.minutes ? t.value.time(fmtMinutes(c.minutes[0], c.minutes[1])) : t.value.timeTbd);
};
</script>

<template>
  <CommunityDialog v-model="open" :title="t.title">
    <p class="formula">{{ t.formula }}</p>
    <p>{{ t.intro }}</p>
    <h3>{{ t.reviewT }}</h3>
    <p>{{ t.review }}</p>
    <h3>{{ t.votesT }}</h3>
    <p>{{ t.votes }}</p>
    <h3>{{ t.donationsT }}</h3>
    <p>{{ t.donations }}</p>
    <ul>
      <li v-for="k in DONATION_TIERS" :key="k"><span aria-hidden="true">{{ TIER_LABELS[k].icon }}</span> {{ tierLine(k) }}</li>
    </ul>
    <p v-if="COMMUNITY_CONFIG.provisional" class="note"><span class="pill amber">{{ ui.provisional }}</span> {{ t.provisional }}</p>
    <h3>{{ t.cyclesT }}</h3>
    <p>{{ t.cycles }}</p>
    <h3>{{ t.stalledT }}</h3>
    <p>{{ t.stalled }}</p>
    <h3>{{ t.openT }}</h3>
    <p>{{ t.openText }}</p>
    <template #foot><button class="btn" type="button" @click="open = false">{{ ui.close }}</button></template>
  </CommunityDialog>
</template>
