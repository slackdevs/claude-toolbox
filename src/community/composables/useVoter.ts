// Identidad del votante en este navegador. Sin login: un email verificado una sola vez.
// Estado de módulo (compartido): un único diálogo de identificación para toda la app (ver CommunityHost).
import { reactive, ref } from 'vue';
import { api } from '../api';
import { bumpData } from '../state';
import type { VoterSession } from '../types';

export const session = ref<VoterSession | null>(null);
export const voterDialog = reactive({ open: false });

let loaded = false;
let loading: Promise<void> | null = null;
/** Acción que quedó esperando la verificación (p. ej. el voto que disparó el diálogo). */
let pending: (() => unknown) | null = null;

/** Carga la sesión una vez. Si falla, se reintenta en la próxima llamada. */
export function loadSession(): Promise<void> {
  if (loaded) return Promise.resolve();
  return (loading ??= api.getSession()
    .then((s) => {
      session.value = s;
      loaded = true;
    })
    .catch(() => undefined)
    .finally(() => (loading = null)));
}

/** Ejecuta `action` si hay un email verificado; si no, abre el diálogo y la ejecuta sola al verificar. */
export async function requireVoter(action: () => unknown): Promise<void> {
  await loadSession();
  if (session.value?.verified) {
    await action();
    return;
  }
  pending = action;
  voterDialog.open = true;
}

export function openVoterDialog() {
  pending = null;
  voterDialog.open = true;
}

/** El usuario cerró el diálogo sin verificar: la acción pendiente se descarta. */
export function cancelPending() {
  pending = null;
}

export async function onVerified(s: VoterSession) {
  const action = pending;
  pending = null;
  session.value = s;
  loaded = true;
  voterDialog.open = false;
  await action?.();
  bumpData(); // "mi voto" cambia en todas las propuestas a la vista
}

/** Tras restablecer los datos de la demo: la sesión guardada ya no existe. */
export function resetSession() {
  session.value = null;
  loaded = false;
}

/** "Cambiar email": cierra la sesión en este navegador; los votos quedan. */
export async function signOut() {
  await api.signOut();
  session.value = null;
  bumpData();
}

/** "Olvidar mis datos": borra el email y sus votos. */
export async function forgetMe() {
  await api.forgetMe();
  session.value = null;
  bumpData();
}
