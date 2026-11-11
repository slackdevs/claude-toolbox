<script setup lang="ts">
import { computed, ref } from 'vue';
import PageHead from '@/components/PageHead.vue';
import { toast } from '@/composables/useToast';
import { tr, ui, useMessages } from '@/i18n';
import { api } from '../api';
import AdminProposalRow from '../components/AdminProposalRow.vue';
import ProposalSkeleton from '../components/ProposalSkeleton.vue';
import { adminMode } from '../composables/useAdmin';
import { useProposals } from '../composables/useProposals';
import { resetSession } from '../composables/useVoter';
import { ERROR_LABELS, STATUS_LABELS } from '../labels';
import { bumpData } from '../state';
import { PROPOSAL_STATUSES, type ProposalStatus } from '../types';

const t = useMessages({
  es: {
    mode: 'Modo Sebastián (demo)', modeHint: 'Simula la revisión de Sebastián. No hay login: cualquiera puede activarlo en su navegador y sólo cambia sus propios datos de ejemplo.',
    off: 'Activá el Modo Sebastián para ver la cola de revisión y gestionar las propuestas.',
    queue: 'Cola de revisión', queueEmpty: 'No hay propuestas esperando revisión.', queueHint: 'Asignale un tiempo estimado y abrila, o cerrala con un motivo público.',
    manage: 'Gestión', filter: 'Filtrar por estado', all: 'Todos', manageEmpty: 'No hay propuestas con ese estado.',
    tools: 'Herramientas de demo', reset: 'Restablecer datos de ejemplo', resetConfirm: '¿Borrar todo lo que cargaste y volver a los datos de ejemplo?', yes: 'Sí, restablecer', no: 'Cancelar', resetDone: 'Datos de ejemplo restablecidos.',
    errorRate: 'Errores aleatorios', errorHint: 'Probabilidad de que falle cada llamada al backend simulado.', latencyMin: 'Latencia mínima (ms)', latencyMax: 'Latencia máxima (ms)',
    noDemo: 'Estas herramientas sólo existen con el backend simulado.',
  },
  en: {
    mode: 'Sebastián mode (demo)', modeHint: 'Simulates Sebastián’s review. There is no login: anyone can turn it on in their browser and it only changes their own sample data.',
    off: 'Turn on Sebastián mode to see the review queue and manage proposals.',
    queue: 'Review queue', queueEmpty: 'No proposals waiting for review.', queueHint: 'Assign an estimated time and open it, or close it with a public reason.',
    manage: 'Management', filter: 'Filter by status', all: 'All', manageEmpty: 'No proposals with that status.',
    tools: 'Demo tools', reset: 'Reset sample data', resetConfirm: 'Delete everything you added and go back to the sample data?', yes: 'Yes, reset', no: 'Cancel', resetDone: 'Sample data restored.',
    errorRate: 'Random errors', errorHint: 'Probability that each call to the simulated backend fails.', latencyMin: 'Minimum latency (ms)', latencyMax: 'Maximum latency (ms)',
    noDemo: 'These tools only exist with the simulated backend.',
  },
});

const { items, loading, error, reload } = useProposals(() => ({ sort: 'newest' }));
const queue = computed(() => items.value.filter((p) => p.status === 'received').reverse()); // la más antigua primero
const statusFilter = ref<ProposalStatus | ''>('');
const managed = computed(() => items.value.filter((p) => p.status !== 'received' && (!statusFilter.value || p.status === statusFilter.value)));
const MANAGED_STATUSES = PROPOSAL_STATUSES.filter((s) => s !== 'received');

// Controles del backend simulado (no existen en la API real).
const demo = api.demo;
const settings = ref(demo?.getSettings() ?? { errorRate: 0, latencyMin: 0, latencyMax: 0 });
const confirming = ref(false);

function setSettings(patch: Partial<typeof settings.value>) {
  if (demo) settings.value = demo.setSettings(patch);
}
const num = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;

function reset() {
  demo?.reset();
  confirming.value = false;
  resetSession();
  bumpData();
  toast(t.value.resetDone, 3000);
}
</script>

<template>
  <div>
    <PageHead />

    <div class="card">
      <label class="chk switch">
        <input v-model="adminMode" type="checkbox" role="switch">
        <span><b>{{ t.mode }}</b></span>
      </label>
      <p class="note">{{ t.modeHint }}</p>
    </div>

    <p v-if="!adminMode" class="empty">{{ t.off }}</p>

    <template v-else>
      <h2 class="sec-title">{{ t.queue }} ({{ queue.length }})</h2>
      <ProposalSkeleton v-if="loading" :count="2" />
      <div v-else-if="error" class="empty" role="alert">
        <p>{{ tr(ERROR_LABELS[error]) }}</p>
        <button class="btn ghost" type="button" @click="reload()">{{ ui.retry }}</button>
      </div>
      <template v-else>
        <p v-if="!queue.length" class="empty">{{ t.queueEmpty }}</p>
        <template v-else>
          <p class="note section-note">{{ t.queueHint }}</p>
          <AdminProposalRow v-for="p in queue" :key="p.id" :proposal="p" :all="items" />
        </template>

        <h2 class="sec-title">{{ t.manage }} ({{ managed.length }})</h2>
        <label class="admin-filter">{{ t.filter }}
          <select v-model="statusFilter">
            <option value="">{{ t.all }}</option>
            <option v-for="s in MANAGED_STATUSES" :key="s" :value="s">{{ tr(STATUS_LABELS[s].name) }}</option>
          </select>
        </label>
        <p v-if="!managed.length" class="empty">{{ t.manageEmpty }}</p>
        <!-- La key incluye la fecha de actualización: al guardar, la fila se rearma con los valores nuevos. -->
        <AdminProposalRow v-for="p in managed" :key="`${p.id}:${p.updatedAt}`" :proposal="p" :all="items" />
      </template>

      <h2 class="sec-title">{{ t.tools }}</h2>
      <div v-if="demo" class="card">
        <div class="row">
          <label>{{ t.errorRate }}: {{ Math.round(settings.errorRate * 100) }}%
            <input type="range" min="0" max="100" step="5" :value="Math.round(settings.errorRate * 100)" aria-describedby="error-hint" @input="setSettings({ errorRate: num($event) / 100 })">
          </label>
          <label>{{ t.latencyMin }}
            <input type="number" min="0" max="5000" step="50" :value="settings.latencyMin" @change="setSettings({ latencyMin: num($event) })">
          </label>
          <label>{{ t.latencyMax }}
            <input type="number" min="0" max="5000" step="50" :value="settings.latencyMax" @change="setSettings({ latencyMax: num($event) })">
          </label>
        </div>
        <p id="error-hint" class="note">{{ t.errorHint }}</p>
        <div class="btns">
          <template v-if="confirming">
            <span role="alert">{{ t.resetConfirm }}</span>
            <button class="btn" type="button" @click="reset">{{ t.yes }}</button>
            <button class="btn ghost" type="button" @click="confirming = false">{{ t.no }}</button>
          </template>
          <button v-else class="btn ghost" type="button" @click="confirming = true">↺ {{ t.reset }}</button>
        </div>
      </div>
      <p v-else class="empty">{{ t.noDemo }}</p>
    </template>
  </div>
</template>
