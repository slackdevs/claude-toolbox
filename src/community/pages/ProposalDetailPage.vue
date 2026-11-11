<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CertTags from '@/components/CertTags.vue';
import MarkdownView from '@/components/MarkdownView';
import PageHead from '@/components/PageHead.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { copyText } from '@/composables/useToast';
import { tr, ui, useMessages } from '@/i18n';
import DonateButtons from '../components/DonateButtons.vue';
import LangTag from '../components/LangTag.vue';
import LifecycleTimeline from '../components/LifecycleTimeline.vue';
import ScoreBreakdown from '../components/ScoreBreakdown.vue';
import StatusBadge from '../components/StatusBadge.vue';
import VoteControl from '../components/VoteControl.vue';
import VoterBar from '../components/VoterBar.vue';
import { useProposal } from '../composables/useProposal';
import { COMMUNITY_CONFIG } from '../config';
import { fmtDate, fmtHours, fmtMinutes, fmtMoney, toolName } from '../format';
import { ERROR_LABELS, LOCKED_REASON, TIER_LABELS, TYPE_LABELS } from '../labels';

const t = useMessages({
  es: {
    back: '← Todas las propuestas', share: 'Compartir', description: 'Descripción', score: 'Puntaje', participate: 'Votar y donar',
    estimate: 'Tiempo estimado', estimateHint: 'Desarrollo e implementación, asignado por Sebastián en la revisión.', pending: 'Pendiente de revisión',
    details: 'Detalles', author: 'Autor', anonymous: 'Anónimo', created: 'Creada', updated: 'Actualizada', tool: 'Herramienta', type: 'Tipo', certs: 'Credenciales',
    reason: 'Motivo', duplicateOf: 'Propuesta original', published: 'Ya está publicada', publishedLink: 'Abrir lo publicado', issue: 'Issue', pr: 'Pull request',
    creditTitle: 'Tu aporte queda como crédito',
    credit: (amount: string) => `Esta propuesta recibió ${amount} en donaciones. No se reembolsan: quedan como crédito para contratar este desarrollo de forma privada con Sebastián, con descuento de lo aportado.`,
    privateDev: 'Consultar desarrollo privado', notFoundBack: 'Volver a las propuestas',
    donateNote: 'Cada consumo suma al puntaje. No se reembolsa: si la propuesta no avanza, queda como crédito para un desarrollo privado.',
    supporters: 'Apoyos públicos', funding: 'Donado frente al tiempo estimado',
    fundingText: (donated: string, estimate: string) => `Donado ≈ ${donated} de ${estimate} estimadas (orientativo).`,
  },
  en: {
    back: '← All proposals', share: 'Share', description: 'Description', score: 'Score', participate: 'Vote and donate',
    estimate: 'Estimated time', estimateHint: 'Development and implementation, assigned by Sebastián during review.', pending: 'Pending review',
    details: 'Details', author: 'Author', anonymous: 'Anonymous', created: 'Created', updated: 'Updated', tool: 'Tool', type: 'Type', certs: 'Credentials',
    reason: 'Reason', duplicateOf: 'Original proposal', published: 'It is already published', publishedLink: 'Open what was published', issue: 'Issue', pr: 'Pull request',
    creditTitle: 'Your contribution becomes credit',
    credit: (amount: string) => `This proposal received ${amount} in donations. They are not refunded: they become credit towards hiring this development privately with Sebastián, discounting what was contributed.`,
    privateDev: 'Ask about private development', notFoundBack: 'Back to proposals',
    donateNote: 'Each donation adds to the score. It is not refunded: if the proposal does not move forward, it becomes credit towards a private development.',
    supporters: 'Public supporters', funding: 'Donated versus estimated time',
    fundingText: (donated: string, estimate: string) => `Donated ≈ ${donated} of an estimated ${estimate} (approximate).`,
  },
});

const route = useRoute();
const { proposal: p, loading, error, reload, patch } = useProposal(() => String(route.params.id));

usePageTitle(() => p.value?.title);

const closed = computed(() => p.value?.status === 'discarded' || p.value?.status === 'duplicate');
const locked = computed(() => (p.value ? LOCKED_REASON[p.value.status] : null));

// Barra "donado vs. estimado" (detrás de COMMUNITY_CONFIG.showFundingProgress): usa el máximo del rango orientativo.
const fundedPct = computed(() => (p.value?.estimateHours ? Math.min(100, Math.round((p.value.donatedMinutes.max / (p.value.estimateHours * 60)) * 100)) : 0));

const share = () => copyText(location.href);
</script>

<template>
  <div>
    <p class="back-link"><RouterLink to="/propuestas">{{ t.back }}</RouterLink></p>

    <div v-if="loading" class="empty" role="status">{{ ui.loading }}</div>
    <div v-else-if="error || !p" class="empty" role="alert">
      <p>{{ tr(ERROR_LABELS[error || 'not_found']) }}</p>
      <button v-if="error !== 'not_found'" class="btn ghost" type="button" @click="reload()">{{ ui.retry }}</button>
      <RouterLink v-else class="btn ghost" to="/propuestas">{{ t.notFoundBack }}</RouterLink>
    </div>

    <template v-else>
      <PageHead :title="p.title" description="" :icon="TYPE_LABELS[p.type].icon">
        <div class="pcard-tags head-tags">
          <span class="tag">{{ tr(TYPE_LABELS[p.type].name) }}</span>
          <StatusBadge :status="p.status" />
          <LangTag :lang="p.lang" />
          <span v-if="p.sample" class="tag sample-tag">{{ ui.sampleData }}</span>
        </div>
        <template #actions>
          <button class="btn ghost" type="button" @click="share">↗ {{ t.share }}</button>
        </template>
      </PageHead>

      <LifecycleTimeline :status="p.status" />

      <div class="detail-grid">
        <div class="detail-main">
          <div v-if="closed" class="card notice">
            <h3>{{ t.reason }}</h3>
            <p>{{ p.statusReason }}</p>
            <p v-if="p.duplicateOf">{{ t.duplicateOf }}: <RouterLink :to="`/propuestas/${p.duplicateOf}`">{{ p.duplicateOfTitle ?? p.duplicateOf }}</RouterLink></p>
            <template v-if="p.donatedAmount > 0">
              <h3>{{ t.creditTitle }}</h3>
              <p>{{ t.credit(fmtMoney(p.donatedAmount)) }}</p>
              <a class="btn ghost" :href="COMMUNITY_CONFIG.privateDevUrl" target="_blank" rel="noopener">{{ t.privateDev }}</a>
            </template>
          </div>

          <div v-if="p.status === 'published'" class="card notice ok">
            <h3>✓ {{ t.published }}</h3>
            <div class="btns">
              <RouterLink v-if="p.links?.publishedPath" class="btn" :to="p.links.publishedPath">{{ t.publishedLink }}</RouterLink>
              <a v-if="p.links?.pr" class="btn ghost" :href="p.links.pr" target="_blank" rel="noopener">{{ t.pr }}</a>
              <a v-if="p.links?.issue" class="btn ghost" :href="p.links.issue" target="_blank" rel="noopener">{{ t.issue }}</a>
            </div>
          </div>

          <section class="card">
            <h3>{{ t.description }}</h3>
            <MarkdownView :source="p.description" :lang="p.lang" />
          </section>

          <section class="card">
            <h3>{{ t.details }}</h3>
            <dl class="meta-list">
              <dt>{{ t.type }}</dt><dd>{{ tr(TYPE_LABELS[p.type].name) }}</dd>
              <template v-if="p.toolPath"><dt>{{ t.tool }}</dt><dd><RouterLink :to="p.toolPath">{{ toolName(p.toolPath) }}</RouterLink></dd></template>
              <dt>{{ t.certs }}</dt><dd><CertTags :certs="p.certs" /></dd>
              <dt>{{ t.author }}</dt><dd>{{ p.author.displayName ?? t.anonymous }}</dd>
              <dt>{{ t.created }}</dt><dd><time :datetime="p.createdAt">{{ fmtDate(p.createdAt) }}</time></dd>
              <template v-if="p.updatedAt !== p.createdAt"><dt>{{ t.updated }}</dt><dd><time :datetime="p.updatedAt">{{ fmtDate(p.updatedAt) }}</time></dd></template>
              <template v-if="p.status !== 'published' && (p.links?.issue || p.links?.pr)">
                <dt>Links</dt>
                <dd>
                  <a v-if="p.links?.issue" :href="p.links.issue" target="_blank" rel="noopener">{{ t.issue }}</a>
                  <template v-if="p.links?.issue && p.links?.pr"> · </template>
                  <a v-if="p.links?.pr" :href="p.links.pr" target="_blank" rel="noopener">{{ t.pr }}</a>
                </dd>
              </template>
            </dl>
          </section>
        </div>

        <div class="detail-side">
          <section class="card">
            <h3>{{ t.estimate }}</h3>
            <p class="big-value" :class="{ faint: !p.estimateHours }">{{ p.estimateHours ? fmtHours(p.estimateHours) : t.pending }}</p>
            <p class="note">{{ t.estimateHint }}</p>
          </section>

          <section class="card">
            <h3>{{ t.score }}</h3>
            <ScoreBreakdown :proposal="p" expanded />
          </section>

          <section class="card">
            <h3>{{ t.participate }}</h3>
            <p v-if="locked" class="locked-note">{{ tr(locked) }}</p>
            <template v-else>
              <VoteControl :proposal="p" row @update="patch" />
              <VoterBar />
              <DonateButtons :proposal="p" />
              <p class="note">{{ t.donateNote }}</p>
              <div v-if="COMMUNITY_CONFIG.showFundingProgress && p.estimateHours" class="funding">
                <div class="progress" role="progressbar" :aria-label="t.funding" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="fundedPct">
                  <div :style="{ width: fundedPct + '%' }" />
                </div>
                <p class="note">{{ t.fundingText(fmtMinutes(p.donatedMinutes.min, p.donatedMinutes.max), fmtHours(p.estimateHours)) }}</p>
              </div>
            </template>
            <a class="btn ghost sm private-dev" :href="COMMUNITY_CONFIG.privateDevUrl" target="_blank" rel="noopener">{{ t.privateDev }}</a>
          </section>

          <section v-if="p.supporters.length" class="card">
            <h3>{{ t.supporters }}</h3>
            <ul class="supporters">
              <li v-for="(s, i) in p.supporters" :key="i">
                <span aria-hidden="true">{{ TIER_LABELS[s.tier].icon }}</span> <b>{{ s.displayName }}</b>
                <span class="sr-only">{{ TIER_LABELS[s.tier].button }}</span>
                <time :datetime="s.createdAt">{{ fmtDate(s.createdAt) }}</time>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
