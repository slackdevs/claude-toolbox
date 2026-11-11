import { ref, shallowRef, watch } from 'vue';
import { api } from '../api';
import { errorCode } from '../format';
import { dataVersion } from '../state';
import type { CommunityErrorCode, ProposalFilters, ProposalSummary } from '../types';

/** Listado de propuestas: se recarga cuando cambian los filtros o los datos compartidos. */
export function useProposals(filters: () => ProposalFilters = () => ({})) {
  const items = shallowRef<ProposalSummary[]>([]);
  const loading = ref(true);
  const error = ref<CommunityErrorCode | ''>('');
  let seq = 0;

  /** `silent`: refresca sin volver a mostrar los skeletons (ni tapar lo que ya se ve si falla). */
  async function reload(silent = false) {
    const n = ++seq;
    if (!silent) loading.value = true;
    try {
      const result = await api.listProposals(filters());
      if (n !== seq) return;
      items.value = result;
      error.value = '';
    } catch (e) {
      if (n === seq && !silent) error.value = errorCode(e);
    } finally {
      if (n === seq) loading.value = false;
    }
  }

  /** Reemplaza una propuesta del listado (voto optimista, respuesta del servidor). */
  function patch(next: ProposalSummary) {
    items.value = items.value.map((p) => (p.id === next.id ? { ...p, ...next } : p));
  }

  watch(() => JSON.stringify(filters()), () => reload(), { immediate: true });
  watch(dataVersion, () => reload(true));

  return { items, loading, error, reload, patch };
}
