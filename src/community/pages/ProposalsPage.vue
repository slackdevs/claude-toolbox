<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHead from '@/components/PageHead.vue';
import { tr, ui } from '@/i18n';
import { api } from '../api';
import { ERROR_LABELS, STATUS_LABELS } from '../labels';
import { CommunityError, type ProposalSummary } from '../types';

// Fase 1: listado mínimo para comprobar el backend simulado (semillas, latencia, errores). El listado completo llega en la fase 2.
const proposals = ref<ProposalSummary[]>([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    proposals.value = await api.listProposals();
  } catch (e) {
    error.value = tr(ERROR_LABELS[e instanceof CommunityError ? e.code : 'network']);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHead />
    <p class="note">{{ ui.comingSoon(2) }}</p>
    <p v-if="loading" class="empty" role="status">{{ ui.loading }}</p>
    <div v-else-if="error" class="empty" role="alert">
      <p>{{ error }}</p>
      <button class="btn ghost" type="button" @click="load">{{ ui.retry }}</button>
    </div>
    <ol v-else class="plain-list">
      <li v-for="p in proposals" :key="p.id">
        <RouterLink :to="`/propuestas/${p.id}`">{{ p.title }}</RouterLink>
        <span class="tag">{{ STATUS_LABELS[p.status].icon }} {{ tr(STATUS_LABELS[p.status].name) }}</span>
        <span class="tag">{{ p.score }} pts</span>
      </li>
    </ol>
  </div>
</template>
