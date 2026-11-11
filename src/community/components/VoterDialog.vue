<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { ui, useMessages } from '@/i18n';
import { BRAND } from '@/lib/brand';
import { api } from '../api';
import { cancelPending, onVerified, voterDialog } from '../composables/useVoter';
import { errorText } from '../format';
import { isDemo } from '../mode';
import { CommunityError } from '../types';
import CommunityDialog from './CommunityDialog.vue';

// Identificación sin login: email + consentimiento explícito, y verificación por enlace (simulada en modo demo).
const t = useMessages({
  es: {
    title: 'Identificate para votar', intro: 'No hace falta crear una cuenta: verificás tu email una sola vez en este navegador. Vale un voto por email y por propuesta.',
    email: 'Tu email', consent: 'Acepto que se guarden mi email, mi IP, mi región y mis votos para contar un voto por persona y prevenir abusos.',
    privacy: 'Política de privacidad', stored: 'Tu email no se publica. Podés cambiarlo o borrar tus datos cuando quieras.',
    continue: 'Continuar', sending: 'Enviando…', cancel: 'Cancelar',
    errEmail: 'Ingresá un email válido.', errConsent: 'Necesitamos tu consentimiento para registrar el voto.',
    sentTitle: 'Revisá tu email', sent: (email: string) => `Te enviamos un enlace a ${email}. Abrilo para confirmar que el email es tuyo.`,
    pendingVote: 'Tu voto se aplica solo apenas verifiques: no hace falta volver a tocarlo.',
    demo: 'En modo demo no se envía ningún email: simulá el clic en el enlace.', simulate: 'Simular verificación', verifying: 'Verificando…', other: 'Usar otro email',
  },
  en: {
    title: 'Identify yourself to vote', intro: 'No account needed: you verify your email once in this browser. One vote per email per proposal.',
    email: 'Your email', consent: 'I agree to my email, IP, region and votes being stored to count one vote per person and prevent abuse.',
    privacy: 'Privacy policy', stored: 'Your email is never published. You can change it or delete your data at any time.',
    continue: 'Continue', sending: 'Sending…', cancel: 'Cancel',
    errEmail: 'Enter a valid email.', errConsent: 'We need your consent to record the vote.',
    sentTitle: 'Check your email', sent: (email: string) => `We sent a link to ${email}. Open it to confirm the email is yours.`,
    pendingVote: 'Your vote is applied automatically as soon as you verify: no need to press it again.',
    demo: 'In demo mode no email is sent: simulate clicking the link.', simulate: 'Simulate verification', verifying: 'Verifying…', other: 'Use another email',
  },
});

const step = ref<'form' | 'sent'>('form');
const email = ref('');
const consent = ref(false);
const error = ref<{ field?: 'email' | 'consent'; text: string } | null>(null);
const busy = ref(false);
const token = ref('');
const simulateBtn = ref<HTMLButtonElement>();

watch(() => voterDialog.open, (open) => {
  if (open) {
    step.value = 'form';
    consent.value = false;
    error.value = null;
    token.value = '';
  } else cancelPending();
});

async function request() {
  error.value = null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    error.value = { field: 'email', text: t.value.errEmail };
    document.getElementById('voter-email')?.focus();
    return;
  }
  if (!consent.value) {
    error.value = { field: 'consent', text: t.value.errConsent };
    document.getElementById('voter-consent')?.focus();
    return;
  }
  busy.value = true;
  try {
    const res = await api.requestVerification(email.value, consent.value);
    email.value = res.email;
    token.value = res.demoToken ?? '';
    step.value = 'sent';
    busy.value = false; // un botón deshabilitado no puede recibir el foco
    await nextTick();
    simulateBtn.value?.focus();
  } catch (e) {
    const field = e instanceof CommunityError && (e.field === 'email' || e.field === 'consent') ? e.field : undefined;
    error.value = { field, text: field === 'email' ? t.value.errEmail : field === 'consent' ? t.value.errConsent : errorText(e) };
  } finally {
    busy.value = false;
  }
}

async function confirm() {
  error.value = null;
  busy.value = true;
  try {
    await onVerified(await api.confirmVerification(token.value));
  } catch (e) {
    error.value = { text: errorText(e) };
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <CommunityDialog v-model="voterDialog.open" :title="step === 'form' ? t.title : t.sentTitle">
    <form v-if="step === 'form'" novalidate @submit.prevent="request">
      <p>{{ t.intro }}</p>
      <div class="field">
        <label for="voter-email">{{ t.email }}</label>
        <input id="voter-email" v-model="email" type="email" autocomplete="email" autofocus :aria-invalid="error?.field === 'email'"
          :aria-describedby="error?.field === 'email' ? 'voter-error' : undefined">
      </div>
      <label class="chk consent">
        <input id="voter-consent" v-model="consent" type="checkbox" :aria-invalid="error?.field === 'consent'" :aria-describedby="error?.field === 'consent' ? 'voter-error' : undefined">
        <span>{{ t.consent }} <a :href="BRAND.legal.privacy" target="_blank" rel="noopener">{{ t.privacy }}</a>.</span>
      </label>
      <p class="note">{{ t.stored }}</p>
      <p v-if="error" id="voter-error" class="field-error" role="alert">{{ error.text }}</p>
      <div class="about-foot">
        <button class="btn ghost" type="button" @click="voterDialog.open = false">{{ t.cancel }}</button>
        <button class="btn" type="submit" :disabled="busy">{{ busy ? t.sending : t.continue }}</button>
      </div>
    </form>

    <div v-else>
      <p>{{ t.sent(email) }}</p>
      <p class="note">{{ t.pendingVote }}</p>
      <p v-if="isDemo" class="demo-banner" role="note"><span class="pill amber">{{ ui.demoTag }}</span><span>{{ t.demo }}</span></p>
      <p v-if="error" class="field-error" role="alert">{{ error.text }}</p>
      <div class="about-foot">
        <button class="btn ghost" type="button" :disabled="busy" @click="step = 'form'">{{ t.other }}</button>
        <button v-if="isDemo && token" ref="simulateBtn" class="btn" type="button" :disabled="busy" @click="confirm">{{ busy ? t.verifying : t.simulate }}</button>
      </div>
    </div>
  </CommunityDialog>
</template>
