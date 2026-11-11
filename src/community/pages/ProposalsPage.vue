<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHead from '@/components/PageHead.vue';
import { tr, ui, useMessages } from '@/i18n';
import { CERT_KEYS, CERTS } from '@/lib/certs';
import { findTool, tools } from '@/tools';
import ProposalCard from '../components/ProposalCard.vue';
import ProposalSkeleton from '../components/ProposalSkeleton.vue';
import RankingInfoDialog from '../components/RankingInfoDialog.vue';
import VoterBar from '../components/VoterBar.vue';
import { useProposals } from '../composables/useProposals';
import { toolName } from '../format';
import { ERROR_LABELS, STATUS_LABELS, TYPE_LABELS } from '../labels';
import { PROPOSAL_STATUSES, PROPOSAL_TYPES, type ProposalFilters, type ProposalSort } from '../types';

const t = useMessages({
  es: {
    propose: 'Proponé una herramienta', how: '¿Cómo funciona el ranking?',
    search: 'Buscar', searchPh: 'Buscar en propuestas…', type: 'Tipo', status: 'Estado', cert: 'Credencial', tool: 'Herramienta', sort: 'Orden',
    any: 'Todos', anyF: 'Todas', sorts: { ranking: 'Ranking', newest: 'Más nuevas', donated: 'Más donadas' },
    clear: 'Limpiar filtros', count: (n: number) => (n === 1 ? '1 propuesta' : `${n} propuestas`),
    empty: 'No hay propuestas con esos filtros.', emptyFor: (what: string) => `No hay propuestas para ${what}.`, first: '¿Proponés la primera?',
  },
  en: {
    propose: 'Propose a tool', how: 'How does the ranking work?',
    search: 'Search', searchPh: 'Search proposals…', type: 'Type', status: 'Status', cert: 'Credential', tool: 'Tool', sort: 'Sort',
    any: 'All', anyF: 'All', sorts: { ranking: 'Ranking', newest: 'Newest', donated: 'Most funded' },
    clear: 'Clear filters', count: (n: number) => (n === 1 ? '1 proposal' : `${n} proposals`),
    empty: 'No proposals match those filters.', emptyFor: (what: string) => `There are no proposals for ${what}.`, first: 'Want to propose the first one?',
  },
});

const SORTS: ProposalSort[] = ['ranking', 'newest', 'donated'];
const route = useRoute();
const router = useRouter();

// Los filtros viven en la query string: se pueden compartir y sobreviven a recargar.
const param = (key: string): string => {
  const v = route.query[key];
  return String((Array.isArray(v) ? v[0] : v) ?? '');
};
const pick = <T extends string>(value: string, allowed: readonly T[]): T | undefined => allowed.find((a) => a === value);

const filters = computed<ProposalFilters>(() => ({
  type: pick(param('type'), PROPOSAL_TYPES),
  status: pick(param('status'), PROPOSAL_STATUSES),
  cert: pick(param('cert'), CERT_KEYS),
  toolPath: findTool(param('tool'))?.path,
  q: param('q').trim() || undefined,
  sort: pick(param('sort'), SORTS) ?? 'ranking',
}));

function set(key: string, value: string) {
  const query = { ...route.query };
  if (value && !(key === 'sort' && value === 'ranking')) query[key] = value;
  else delete query[key];
  router.replace({ query });
}
const val = (e: Event) => (e.target as HTMLSelectElement).value;

const search = ref(filters.value.q ?? '');
let timer: ReturnType<typeof setTimeout> | undefined;
function onSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => set('q', search.value.trim()), 250);
}
watch(() => filters.value.q, (q) => {
  if ((q ?? '') !== search.value.trim()) search.value = q ?? '';
});
onBeforeUnmount(() => clearTimeout(timer));

const hasFilters = computed(() => !!(filters.value.type || filters.value.status || filters.value.cert || filters.value.toolPath || filters.value.q));
function clear() {
  search.value = '';
  router.replace({ query: {} });
}

const { items, loading, error, reload, patch } = useProposals(() => filters.value);
const rankingOpen = ref(false);

// CTA del estado vacío, con lo que ya eligió precargado en el formulario.
const newQuery = computed(() => {
  const f = filters.value;
  const q: Record<string, string> = {};
  if (f.toolPath) Object.assign(q, { type: 'improvement', tool: f.toolPath });
  else if (f.type) q.type = f.type;
  if (f.cert) q.cert = f.cert;
  return q;
});
const emptyText = computed(() => {
  const f = filters.value;
  if (f.q || f.status || (f.type && (f.cert || f.toolPath))) return t.value.empty;
  if (f.toolPath) return t.value.emptyFor(toolName(f.toolPath));
  if (f.cert) return t.value.emptyFor(CERTS[f.cert].code);
  return t.value.empty;
});
</script>

<template>
  <div>
    <PageHead>
      <template #actions>
        <RouterLink class="btn" to="/propuestas/nueva">＋ {{ t.propose }}</RouterLink>
        <button class="btn ghost" type="button" @click="rankingOpen = true">{{ t.how }}</button>
      </template>
    </PageHead>

    <form class="filters" role="search" @submit.prevent>
      <label class="filters-search">{{ t.search }}
        <input v-model="search" type="search" :placeholder="t.searchPh" autocomplete="off" @input="onSearch">
      </label>
      <label>{{ t.type }}
        <select :value="filters.type ?? ''" @change="set('type', val($event))">
          <option value="">{{ t.any }}</option>
          <option v-for="k in PROPOSAL_TYPES" :key="k" :value="k">{{ tr(TYPE_LABELS[k].name) }}</option>
        </select>
      </label>
      <label>{{ t.status }}
        <select :value="filters.status ?? ''" @change="set('status', val($event))">
          <option value="">{{ t.any }}</option>
          <option v-for="k in PROPOSAL_STATUSES" :key="k" :value="k">{{ tr(STATUS_LABELS[k].name) }}</option>
        </select>
      </label>
      <label>{{ t.cert }}
        <select :value="filters.cert ?? ''" @change="set('cert', val($event))">
          <option value="">{{ t.anyF }}</option>
          <option v-for="k in CERT_KEYS" :key="k" :value="k">{{ CERTS[k].code }}</option>
        </select>
      </label>
      <label>{{ t.tool }}
        <select :value="filters.toolPath ?? ''" @change="set('tool', val($event))">
          <option value="">{{ t.anyF }}</option>
          <option v-for="tl in tools" :key="tl.path" :value="tl.path">{{ tr(tl.name) }}</option>
        </select>
      </label>
      <label>{{ t.sort }}
        <select :value="filters.sort" @change="set('sort', val($event))">
          <option v-for="k in SORTS" :key="k" :value="k">{{ t.sorts[k] }}</option>
        </select>
      </label>
    </form>

    <VoterBar />

    <div class="list-bar">
      <span aria-live="polite">{{ loading || error ? '' : t.count(items.length) }}</span>
      <button v-if="hasFilters" class="btn ghost sm" type="button" @click="clear">{{ t.clear }}</button>
    </div>

    <ProposalSkeleton v-if="loading" />
    <div v-else-if="error" class="empty" role="alert">
      <p>{{ tr(ERROR_LABELS[error]) }}</p>
      <button class="btn ghost" type="button" @click="reload()">{{ ui.retry }}</button>
    </div>
    <div v-else-if="!items.length" class="empty">
      <p>{{ emptyText }} <RouterLink :to="{ path: '/propuestas/nueva', query: newQuery }">{{ t.first }}</RouterLink></p>
      <button v-if="hasFilters" class="btn ghost" type="button" @click="clear">{{ t.clear }}</button>
    </div>
    <div v-else class="plist">
      <ProposalCard v-for="p in items" :key="p.id" :proposal="p" @update="patch" />
    </div>

    <RankingInfoDialog v-model="rankingOpen" />
  </div>
</template>
