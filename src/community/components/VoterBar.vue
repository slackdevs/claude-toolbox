<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { toast } from '@/composables/useToast';
import { useMessages } from '@/i18n';
import { forgetMe, loadSession, openVoterDialog, session, signOut } from '../composables/useVoter';
import { errorText } from '../format';

const t = useMessages({
  es: {
    as: 'Votás como', change: 'Cambiar email', forget: 'Olvidar mis datos', anon: 'Para votar verificás tu email una sola vez, sin crear una cuenta.', identify: 'Identificarme',
    confirm: '¿Borrar tu email y todos tus votos de este sitio?', yes: 'Sí, borrar', no: 'Cancelar', forgotten: 'Listo: borramos tu email y tus votos.',
  },
  en: {
    as: 'Voting as', change: 'Change email', forget: 'Forget my data', anon: 'To vote you verify your email once, no account needed.', identify: 'Identify me',
    confirm: 'Delete your email and all your votes from this site?', yes: 'Yes, delete', no: 'Cancel', forgotten: 'Done: your email and votes were deleted.',
  },
});

const confirming = ref(false);
const busy = ref(false);

async function run(action: () => Promise<void>, done?: () => void) {
  busy.value = true;
  try {
    await action();
    done?.();
  } catch (e) {
    toast(errorText(e), 4000);
  } finally {
    busy.value = false;
    confirming.value = false;
  }
}

const change = () => run(signOut, openVoterDialog);
const forget = () => run(forgetMe, () => toast(t.value.forgotten, 3000));

onMounted(loadSession);
</script>

<template>
  <div class="voter-bar">
    <template v-if="session?.verified">
      <template v-if="confirming">
        <span role="alert">{{ t.confirm }}</span>
        <button class="btn ghost sm" type="button" :disabled="busy" @click="forget">{{ t.yes }}</button>
        <button class="btn ghost sm" type="button" :disabled="busy" @click="confirming = false">{{ t.no }}</button>
      </template>
      <template v-else>
        <span>{{ t.as }} <b>{{ session.email }}</b></span>
        <button class="btn ghost sm" type="button" :disabled="busy" @click="change">{{ t.change }}</button>
        <button class="btn ghost sm" type="button" :disabled="busy" @click="confirming = true">{{ t.forget }}</button>
      </template>
    </template>
    <template v-else>
      <span>{{ t.anon }}</span>
      <button class="btn ghost sm" type="button" @click="openVoterDialog">{{ t.identify }}</button>
    </template>
  </div>
</template>
