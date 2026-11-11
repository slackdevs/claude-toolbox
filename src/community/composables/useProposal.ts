import { ref, shallowRef, watch } from 'vue';
import { api } from '../api';
import { errorCode } from '../format';
import { dataVersion } from '../state';
import type { CommunityErrorCode, ProposalDetail, ProposalSummary } from '../types';

/** Detalle de una propuesta. */
export function useProposal(id: () => string) {
  const proposal = shallowRef<ProposalDetail | null>(null);
  const loading = ref(true);
  const error = ref<CommunityErrorCode | ''>('');
  let seq = 0;

  async function reload(silent = false) {
    const n = ++seq;
    if (!silent) loading.value = true;
    try {
      const result = await api.getProposal(id());
      if (n !== seq) return;
      proposal.value = result;
      error.value = '';
    } catch (e) {
      if (n === seq && !silent) error.value = errorCode(e);
    } finally {
      if (n === seq) loading.value = false;
    }
  }

  function patch(next: ProposalSummary) {
    if (proposal.value?.id === next.id) proposal.value = { ...proposal.value, ...next };
  }

  watch(id, () => reload(), { immediate: true });
  watch(dataVersion, () => reload(true));

  return { proposal, loading, error, reload, patch };
}
