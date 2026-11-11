<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { ui, useMessages } from '@/i18n';
import { fmt } from '@/lib/format';
import { api } from '../api';
import { donateDialog } from '../composables/useDonate';
import { COMMUNITY_CONFIG } from '../config';
import { errorText, fmtMinutes, fmtMoney, signed } from '../format';
import { TIER_LABELS } from '../labels';
import { isDemo } from '../mode';
import { bumpData } from '../state';
import { DONATION_TIERS, type Donation, type DonationReceipt } from '../types';
import CommunityDialog from './CommunityDialog.vue';

// Confirmación de la donación y pago. En modo demo el pago es simulado: nunca se usa el link real de PayPal.
const t = useMessages({
  es: {
    title: 'Confirmá tu donación', thanksTitle: '¡Gracias por el apoyo!', proposal: 'Propuesta', tier: 'Consumo', amount: 'Monto', adds: 'Suma al puntaje',
    eq: 'Equivale a', eqValue: (m: string) => `≈ ${m} de desarrollo (orientativo)`, tbd: 'a definir', points: (n: string) => `${n} pts`,
    terms: [
      'La donación confirmada suma puntos a esta propuesta en el ranking.',
      'No se reembolsa. Si la propuesta no avanza, lo aportado queda como crédito para contratar el desarrollo de forma privada con Sebastián.',
    ],
    name: 'Nombre público (opcional)', namePh: 'Anónimo', show: 'Mostrar mi apoyo públicamente en la propuesta', showHint: 'Necesita un nombre público.',
    pay: 'Pagar con PayPal', simulated: 'simulado', demo: 'Pago simulado: no se cobra nada ni se abre PayPal.', cancel: 'Cancelar',
    creating: 'Creando la orden…', pending: 'Orden pendiente: esperando la confirmación de PayPal…', retry: 'Reintentar el pago',
    failed: 'No se completó la donación: no se sumó nada al puntaje.', failedPending: 'La orden quedó pendiente y no sumó al puntaje. Podés reintentar la confirmación.',
    thanks: (tier: string, title: string) => `Tu donación de ${tier} para “${title}” quedó confirmada.`,
    newScore: (pts: string, score: string) => `Sumó ${pts} puntos. Puntaje actual: ${score}.`,
  },
  en: {
    title: 'Confirm your donation', thanksTitle: 'Thanks for the support!', proposal: 'Proposal', tier: 'Item', amount: 'Amount', adds: 'Adds to the score',
    eq: 'Equivalent to', eqValue: (m: string) => `≈ ${m} of development (approximate)`, tbd: 'to be defined', points: (n: string) => `${n} pts`,
    terms: [
      'A confirmed donation adds points to this proposal in the ranking.',
      'It is not refunded. If the proposal does not move forward, your contribution becomes credit towards hiring the development privately with Sebastián.',
    ],
    name: 'Public name (optional)', namePh: 'Anonymous', show: 'Show my support publicly on the proposal', showHint: 'Requires a public name.',
    pay: 'Pay with PayPal', simulated: 'simulated', demo: 'Simulated payment: nothing is charged and PayPal is not opened.', cancel: 'Cancel',
    creating: 'Creating the order…', pending: 'Order pending: waiting for PayPal confirmation…', retry: 'Retry payment',
    failed: 'The donation was not completed: nothing was added to the score.', failedPending: 'The order is still pending and did not add to the score. You can retry the confirmation.',
    thanks: (tier: string, title: string) => `Your donation of ${tier} for “${title}” is confirmed.`,
    newScore: (pts: string, score: string) => `It added ${pts} points. Current score: ${score}.`,
  },
});

const step = ref<'confirm' | 'creating' | 'pending' | 'thanks'>('confirm');
const name = ref('');
const show = ref(false);
const error = ref('');
/** Orden creada y todavía sin confirmar: si la confirmación falla, se reintenta sobre la misma orden. */
const order = shallowRef<Donation | null>(null);
const receipt = shallowRef<DonationReceipt | null>(null);

const tier = computed(() => COMMUNITY_CONFIG.tiers[donateDialog.tier]);
const busy = computed(() => step.value === 'creating' || step.value === 'pending');

watch(() => donateDialog.open, (open) => {
  if (!open) return;
  step.value = 'confirm';
  error.value = '';
  order.value = null;
  receipt.value = null;
});
watch(() => donateDialog.tier, () => (order.value = null));

async function pay() {
  const proposal = donateDialog.proposal;
  if (!proposal) return;
  error.value = '';
  try {
    if (!order.value) {
      step.value = 'creating';
      order.value = await api.createDonation(proposal.id, donateDialog.tier, { donorDisplayName: name.value, showPublicly: show.value && !!name.value.trim() });
    }
    step.value = 'pending';
    receipt.value = await api.confirmDonation(order.value.id);
    order.value = null;
    step.value = 'thanks';
    bumpData(); // puntaje, desglose y apoyos públicos se actualizan donde estén a la vista
  } catch (e) {
    error.value = `${order.value ? t.value.failedPending : t.value.failed} ${errorText(e)}`;
    step.value = 'confirm';
  }
}
</script>

<template>
  <CommunityDialog v-model="donateDialog.open" :title="step === 'thanks' ? t.thanksTitle : t.title">
    <template v-if="donateDialog.proposal">
      <div v-if="step === 'thanks' && receipt" role="status">
        <p class="thanks-ico" aria-hidden="true">{{ TIER_LABELS[receipt.donation.tier].icon }}</p>
        <p>{{ t.thanks(TIER_LABELS[receipt.donation.tier].button, receipt.proposal.title) }}</p>
        <p><strong>{{ t.newScore(signed(COMMUNITY_CONFIG.tiers[receipt.donation.tier].points), fmt(receipt.proposal.score)) }}</strong></p>
        <div class="about-foot"><button class="btn" type="button" autofocus @click="donateDialog.open = false">{{ ui.close }}</button></div>
      </div>

      <form v-else @submit.prevent="pay">
        <fieldset class="field" :disabled="busy">
          <legend>{{ t.tier }}</legend>
          <div class="seg-group">
            <label v-for="k in DONATION_TIERS" :key="k" class="seg-radio">
              <input v-model="donateDialog.tier" type="radio" name="donate-tier" :value="k">
              <span><span aria-hidden="true">{{ TIER_LABELS[k].icon }}</span> {{ TIER_LABELS[k].button }}</span>
            </label>
          </div>
        </fieldset>

        <dl class="meta-list summary">
          <dt>{{ t.proposal }}</dt><dd>{{ donateDialog.proposal.title }}</dd>
          <dt>{{ t.amount }}</dt><dd><b>{{ fmtMoney(tier.amount) }}</b> <span v-if="COMMUNITY_CONFIG.provisional" class="pill amber">{{ ui.provisional }}</span></dd>
          <dt>{{ t.adds }}</dt><dd>{{ t.points(signed(tier.points)) }} <span v-if="COMMUNITY_CONFIG.provisional" class="pill amber">{{ ui.provisional }}</span></dd>
          <dt>{{ t.eq }}</dt><dd>{{ tier.minutes ? t.eqValue(fmtMinutes(tier.minutes[0], tier.minutes[1])) : t.tbd }}</dd>
        </dl>

        <ul class="terms"><li v-for="line in t.terms" :key="line">{{ line }}</li></ul>

        <div class="field">
          <label for="donor-name">{{ t.name }}</label>
          <input id="donor-name" v-model="name" type="text" maxlength="40" autocomplete="nickname" :placeholder="t.namePh" :disabled="busy">
        </div>
        <label class="chk consent">
          <input v-model="show" type="checkbox" :disabled="busy || !name.trim()" aria-describedby="donor-show-hint">
          <span>{{ t.show }} <small id="donor-show-hint" class="field-hint">{{ t.showHint }}</small></span>
        </label>

        <p v-if="isDemo" class="demo-banner" role="note"><span class="pill amber">{{ ui.demoTag }}</span><span>{{ t.demo }}</span></p>
        <p v-if="busy" class="pay-status" role="status"><span class="spinner" aria-hidden="true" /> {{ step === 'creating' ? t.creating : t.pending }}</p>
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>

        <div class="about-foot">
          <button class="btn ghost" type="button" :disabled="busy" @click="donateDialog.open = false">{{ t.cancel }}</button>
          <button class="btn paypal" type="submit" :disabled="busy">{{ error && order ? t.retry : t.pay }}<template v-if="isDemo"> — {{ t.simulated }}</template></button>
        </div>
      </form>
    </template>
  </CommunityDialog>
</template>
