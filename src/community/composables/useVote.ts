import { ref } from 'vue';
import { toast } from '@/composables/useToast';
import { locale } from '@/i18n';
import { api } from '../api';
import { errorText } from '../format';
import { applyVote } from '../score';
import type { ProposalSummary, VoteValue } from '../types';
import { requireVoter } from './useVoter';

const ROLLBACK = { es: 'No se guardó tu voto.', en: 'Your vote was not saved.' };

/**
 * Voto optimista: el número cambia al instante; si el servidor falla, se revierte y se avisa.
 * `get` devuelve la propuesta actual y `apply` la reemplaza en quien la tenga (listado o detalle).
 */
export function useVote(get: () => ProposalSummary, apply: (next: ProposalSummary) => void) {
  const busy = ref(false);

  async function send(value: VoteValue | 0) {
    const before = get();
    apply(applyVote(before, value));
    busy.value = true;
    try {
      apply(await api.vote(before.id, value));
    } catch (e) {
      apply(before);
      toast(`${ROLLBACK[locale.value]} ${errorText(e)}`, 4500);
    } finally {
      busy.value = false;
    }
  }

  /** Tocar el mismo voto lo retira; tocar el otro lo cambia. Sin email verificado, primero se pide identificarse. */
  function cast(dir: VoteValue) {
    if (busy.value) return;
    const value = get().myVote === dir ? 0 : dir;
    void requireVoter(() => send(value));
  }

  return { busy, cast };
}
