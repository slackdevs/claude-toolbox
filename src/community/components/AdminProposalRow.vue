<script setup lang="ts">
import { computed, reactive, ref, shallowRef, useId } from 'vue';
import CertTags from '@/components/CertTags.vue';
import MarkdownView from '@/components/MarkdownView';
import { toast } from '@/composables/useToast';
import { tr, useMessages } from '@/i18n';
import { api } from '../api';
import { errorText, fmtDateTime, fmtMoney, toolName } from '../format';
import { STATUS_LABELS, TIER_LABELS, TYPE_LABELS } from '../labels';
import { bumpData } from '../state';
import { CommunityError, PROPOSAL_STATUSES, type AdminProposalPatch, type ProposalActivity, type ProposalStatus, type ProposalSummary } from '../types';
import StatusBadge from './StatusBadge.vue';

// Una propuesta en /admin/. En la cola de revisión (`received`) ofrece Aprobar / Descartar / Duplicada;
// en la gestión, cambiar estado, tiempo estimado y links, y ver la actividad (votos y donaciones).
const props = defineProps<{ proposal: ProposalSummary; all: ProposalSummary[] }>();

const t = useMessages({
  es: {
    hours: 'Tiempo estimado (horas)', status: 'Estado', reason: 'Motivo público', original: 'Propuesta original', pick: 'Elegí la original…',
    approve: 'Aprobar y abrir a votación', discard: 'Descartar', duplicate: 'Marcar duplicada', confirm: 'Confirmar', cancel: 'Cancelar', save: 'Guardar cambios', saving: 'Guardando…',
    saved: (title: string, status: string) => `“${title}” → ${status}`,
    description: 'Ver descripción', links: 'Links', issue: 'Issue (URL)', pr: 'Pull request (URL)', published: 'Ruta publicada (p. ej. /costos)',
    activity: 'Actividad', votes: 'Votos', donations: 'Donaciones', noVotes: 'Sin votos.', noDonations: 'Sin donaciones.',
    email: 'Email', vote: 'Voto', ip: 'IP', region: 'Región', date: 'Fecha', tier: 'Consumo', amount: 'Monto', state: 'Estado', donor: 'Nombre público', simulated: 'IP y región simuladas.',
    donationStatus: { pending: 'Pendiente', confirmed: 'Confirmada' },
    errors: { estimateHours: 'Asigná un tiempo estimado mayor a 0 antes de abrirla o avanzarla.', statusReason: 'El motivo es obligatorio y se publica.', duplicateOf: 'Elegí la propuesta original.' },
  },
  en: {
    hours: 'Estimated time (hours)', status: 'Status', reason: 'Public reason', original: 'Original proposal', pick: 'Pick the original…',
    approve: 'Approve and open to voting', discard: 'Discard', duplicate: 'Mark as duplicate', confirm: 'Confirm', cancel: 'Cancel', save: 'Save changes', saving: 'Saving…',
    saved: (title: string, status: string) => `“${title}” → ${status}`,
    description: 'Show description', links: 'Links', issue: 'Issue (URL)', pr: 'Pull request (URL)', published: 'Published path (e.g. /costos)',
    activity: 'Activity', votes: 'Votes', donations: 'Donations', noVotes: 'No votes.', noDonations: 'No donations.',
    email: 'Email', vote: 'Vote', ip: 'IP', region: 'Region', date: 'Date', tier: 'Item', amount: 'Amount', state: 'Status', donor: 'Public name', simulated: 'Simulated IP and region.',
    donationStatus: { pending: 'Pending', confirmed: 'Confirmed' },
    errors: { estimateHours: 'Assign an estimated time greater than 0 before opening or advancing it.', statusReason: 'The reason is required and is published.', duplicateOf: 'Pick the original proposal.' },
  },
});

const uid = useId();
const review = computed(() => props.proposal.status === 'received');
const draft = reactive({
  status: props.proposal.status as ProposalStatus,
  hours: props.proposal.estimateHours ?? ('' as number | ''),
  reason: props.proposal.statusReason ?? '',
  duplicateOf: props.proposal.duplicateOf ?? '',
  issue: props.proposal.links?.issue ?? '',
  pr: props.proposal.links?.pr ?? '',
  publishedPath: props.proposal.links?.publishedPath ?? '',
});
/** En la cola: cierre elegido (descartar o duplicada) a la espera del motivo. */
const closing = ref<'discarded' | 'duplicate' | null>(null);
const busy = ref(false);
const error = ref<{ field?: string; text: string } | null>(null);

const status = computed<ProposalStatus>(() => (review.value ? closing.value ?? 'received' : draft.status));
const needsReason = computed(() => status.value === 'discarded' || status.value === 'duplicate');
const others = computed(() => props.all.filter((x) => x.id !== props.proposal.id && x.status !== 'duplicate'));

async function save(next: ProposalStatus) {
  error.value = null;
  const patch: AdminProposalPatch = { status: next };
  if (draft.hours !== '') patch.estimateHours = Number(draft.hours);
  if (next === 'discarded' || next === 'duplicate') patch.statusReason = draft.reason;
  if (next === 'duplicate') patch.duplicateOf = draft.duplicateOf;
  if (!review.value) patch.links = { issue: draft.issue.trim() || undefined, pr: draft.pr.trim() || undefined, publishedPath: draft.publishedPath.trim() || undefined };
  busy.value = true;
  try {
    const saved = await api.adminUpdateProposal(props.proposal.id, patch);
    toast(t.value.saved(saved.title, tr(STATUS_LABELS[saved.status].name)), 3000);
    closing.value = null;
    bumpData();
  } catch (e) {
    const field = e instanceof CommunityError ? e.field : undefined;
    const known = field && field in t.value.errors ? t.value.errors[field as keyof typeof t.value.errors] : undefined;
    error.value = { field, text: known ?? errorText(e) };
    if (field) document.getElementById(`${uid}-${field}`)?.focus();
  } finally {
    busy.value = false;
  }
}

// Actividad: se carga al abrir el desplegable.
const activity = shallowRef<ProposalActivity | null>(null);
const activityError = ref('');
async function loadActivity(e: Event) {
  if (!(e.target as HTMLDetailsElement).open) return;
  activityError.value = '';
  try {
    activity.value = await api.adminGetActivity(props.proposal.id);
  } catch (err) {
    activityError.value = errorText(err);
  }
}
</script>

<template>
  <article class="card admin-row">
    <div class="pcard-tags">
      <span class="tag">{{ tr(TYPE_LABELS[proposal.type].name) }}</span>
      <StatusBadge :status="proposal.status" />
      <span v-if="proposal.toolPath" class="tag">{{ toolName(proposal.toolPath) }}</span>
      <span class="tag">{{ proposal.score }} pts · ▲{{ proposal.upvotes }} ▼{{ proposal.downvotes }} · {{ fmtMoney(proposal.donatedAmount) }}</span>
    </div>
    <h3 class="pcard-title"><RouterLink :to="`/propuestas/${proposal.id}`">{{ proposal.title }}</RouterLink></h3>
    <CertTags :certs="proposal.certs" />
    <details class="admin-details">
      <summary>{{ t.description }}</summary>
      <MarkdownView :source="proposal.description" />
    </details>

    <form class="admin-form" novalidate @submit.prevent="save(status)">
      <div class="row">
        <div class="field">
          <label :for="`${uid}-estimateHours`">{{ t.hours }}</label>
          <input :id="`${uid}-estimateHours`" v-model="draft.hours" type="number" min="0.5" step="0.5" inputmode="decimal" :aria-invalid="error?.field === 'estimateHours'"
            :aria-describedby="error ? `${uid}-error` : undefined">
        </div>
        <div v-if="!review" class="field">
          <label :for="`${uid}-status`">{{ t.status }}</label>
          <select :id="`${uid}-status`" v-model="draft.status">
            <option v-for="s in PROPOSAL_STATUSES" :key="s" :value="s">{{ STATUS_LABELS[s].icon }} {{ tr(STATUS_LABELS[s].name) }}</option>
          </select>
        </div>
      </div>

      <template v-if="needsReason">
        <div class="field">
          <label :for="`${uid}-statusReason`">{{ t.reason }}</label>
          <textarea :id="`${uid}-statusReason`" v-model="draft.reason" rows="2" :aria-invalid="error?.field === 'statusReason'" :aria-describedby="error ? `${uid}-error` : undefined" />
        </div>
        <div v-if="status === 'duplicate'" class="field">
          <label :for="`${uid}-duplicateOf`">{{ t.original }}</label>
          <select :id="`${uid}-duplicateOf`" v-model="draft.duplicateOf" :aria-invalid="error?.field === 'duplicateOf'" :aria-describedby="error ? `${uid}-error` : undefined">
            <option value="">{{ t.pick }}</option>
            <option v-for="o in others" :key="o.id" :value="o.id">{{ o.title }}</option>
          </select>
        </div>
      </template>

      <details v-if="!review" class="admin-details">
        <summary>{{ t.links }}</summary>
        <div class="row">
          <label>{{ t.issue }}<input v-model="draft.issue" type="url"></label>
          <label>{{ t.pr }}<input v-model="draft.pr" type="url"></label>
          <label>{{ t.published }}<input v-model="draft.publishedPath" type="text"></label>
        </div>
      </details>

      <p v-if="error" :id="`${uid}-error`" class="field-error" role="alert">{{ error.text }}</p>

      <div class="btns">
        <template v-if="review && !closing">
          <button class="btn" type="button" :disabled="busy" @click="save('open')">✓ {{ t.approve }}</button>
          <button class="btn ghost" type="button" :disabled="busy" @click="closing = 'discarded'">✕ {{ t.discard }}</button>
          <button class="btn ghost" type="button" :disabled="busy" @click="closing = 'duplicate'">⧉ {{ t.duplicate }}</button>
        </template>
        <template v-else-if="review">
          <button class="btn" type="submit" :disabled="busy">{{ t.confirm }}: {{ tr(STATUS_LABELS[status].name) }}</button>
          <button class="btn ghost" type="button" :disabled="busy" @click="closing = null; error = null">{{ t.cancel }}</button>
        </template>
        <button v-else class="btn" type="submit" :disabled="busy">{{ busy ? t.saving : t.save }}</button>
      </div>
    </form>

    <details class="admin-details" @toggle="loadActivity">
      <summary>{{ t.activity }}</summary>
      <p v-if="activityError" class="field-error" role="alert">{{ activityError }}</p>
      <template v-else-if="activity">
        <h4>{{ t.votes }} ({{ activity.votes.length }})</h4>
        <p v-if="!activity.votes.length" class="note">{{ t.noVotes }}</p>
        <div v-else class="md-table" tabindex="0">
          <table>
            <thead><tr><th>{{ t.email }}</th><th>{{ t.vote }}</th><th>{{ t.ip }}</th><th>{{ t.region }}</th><th>{{ t.date }}</th></tr></thead>
            <tbody>
              <tr v-for="v in activity.votes" :key="v.voterEmail">
                <td>{{ v.voterEmail }}</td><td>{{ v.value === 1 ? '▲ +1' : '▼ −1' }}</td><td>{{ v.ip }}</td><td>{{ v.region }}</td><td>{{ fmtDateTime(v.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="activity.votes.length" class="note">{{ t.simulated }}</p>
        <h4>{{ t.donations }} ({{ activity.donations.length }})</h4>
        <p v-if="!activity.donations.length" class="note">{{ t.noDonations }}</p>
        <div v-else class="md-table" tabindex="0">
          <table>
            <thead><tr><th>{{ t.tier }}</th><th>{{ t.amount }}</th><th>{{ t.state }}</th><th>{{ t.donor }}</th><th>{{ t.date }}</th></tr></thead>
            <tbody>
              <tr v-for="d in activity.donations" :key="d.id">
                <td>{{ TIER_LABELS[d.tier].icon }} {{ TIER_LABELS[d.tier].button }}</td><td>{{ fmtMoney(d.amount) }}</td><td>{{ t.donationStatus[d.status] }}</td>
                <td>{{ d.donorDisplayName ?? '—' }}{{ d.donorDisplayName && !d.showPublicly ? ' 🔒' : '' }}</td><td>{{ fmtDateTime(d.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <p v-else class="note" role="status">…</p>
    </details>
  </article>
</template>
