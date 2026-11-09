<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { certFilter } from '@/composables/useAppState';
import { useStorage } from '@/composables/useStorage';
import { tr, useMessages } from '@/i18n';
import { CERTS, type CertKey } from '@/lib/certs';
import { CERT_INFO, DOMAINS } from './certificaciones.data';

const t = useMessages({
  es: {
    badge: (name: string) => `Insignia ${name}`,
    for: 'Para:',
    related: 'Ver herramientas relacionadas →',
    checklist: 'Checklist CCAR-F por dominio',
    done: (p: number) => `${p}% completado`,
    weight: (w: number) => `${w}% del examen`,
    note: 'Formato, precios y ponderaciones de fuentes públicas (2026); confirmalos en la guía oficial del examen en Anthropic Academy antes de rendir. Tu progreso se guarda solo en este navegador.',
  },
  en: {
    badge: (name: string) => `${name} badge`,
    for: 'For:',
    related: 'See related tools →',
    checklist: 'CCAR-F checklist by domain',
    done: (p: number) => `${p}% complete`,
    weight: (w: number) => `${w}% of the exam`,
    note: 'Format, pricing and weightings from public sources (2026); confirm them in the official exam guide on Anthropic Academy before taking it. Your progress is saved only in this browser.',
  },
});

const router = useRouter();
const done = useStorage<Record<string, boolean>>('ct-study', {});
const domains = computed(() => tr(DOMAINS));
const total = computed(() => domains.value.reduce((a, d) => a + d.topics.length, 0));
const pct = computed(() => Math.round((Object.values(done.value).filter(Boolean).length / total.value) * 100));
const domainDone = (di: number) => domains.value[di]!.topics.filter((_, ti) => done.value[`${di}-${ti}`]).length;

function showTools(key: CertKey) {
  certFilter.value = key;
  router.push('/');
}
</script>

<template>
  <div>
    <div class="cards" style="margin-bottom:16px">
      <div v-for="c in tr(CERT_INFO)" :key="c.code" class="card cert-card">
        <div class="cert-top">
          <div class="badge-thumb"><img :src="CERTS[c.key].badge" :alt="t.badge(c.name)" loading="lazy"></div>
          <div>
            <div class="cert-code"><span class="dot" :class="CERTS[c.key].color" />{{ c.code }}</div>
            <h4>{{ c.name }}</h4>
          </div>
        </div>
        <p class="note" style="margin:0"><b>{{ t.for }}</b> {{ c.audience }}</p>
        <p style="margin:0;font-size:13px">{{ c.focus }}</p>
        <p class="note" style="margin:0 0 4px;font-family:var(--font-mono);font-size:11px">{{ c.format }}</p>
        <div style="margin-top:auto"><button class="btn ghost sm" @click="showTools(c.key)">{{ t.related }}</button></div>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <h3 style="margin:0">{{ t.checklist }}</h3>
        <span class="pill amber">{{ t.done(pct) }}</span>
      </div>
      <div class="progress" style="margin:10px 0 14px"><div :style="{ width: pct + '%' }" /></div>
      <details v-for="(d, di) in domains" :key="d.name" class="dom" :open="di === 0">
        <summary><span>{{ d.name }}</span><span class="note">{{ t.weight(d.weight) }} · {{ domainDone(di) }}/{{ d.topics.length }}</span></summary>
        <label v-for="(tp, ti) in d.topics" :key="tp" class="chk"><input v-model="done[`${di}-${ti}`]" type="checkbox"> {{ tp }}</label>
      </details>
      <p class="note">{{ t.note }}</p>
    </div>
  </div>
</template>
