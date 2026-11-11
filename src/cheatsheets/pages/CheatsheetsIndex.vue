<script setup lang="ts">
import PageHead from '@/components/PageHead.vue';
import { tr, useMessages } from '@/i18n';
import { CERTS } from '@/lib/certs';
import { CERT_INFO } from '@/tools/certificaciones/certificaciones.data';
import { fmtDate } from '@/community/format';
import { cheatsheets } from '..';

const t = useMessages({
  es: { badge: (name: string) => `Insignia ${name}`, reviewed: 'Última revisión', open: 'Abrir cheatsheet →', spanish: 'Contenido en español' },
  en: { badge: (name: string) => `${name} badge`, reviewed: 'Last reviewed', open: 'Open cheatsheet →', spanish: 'Content in Spanish' },
});

const info = (key: string) => tr(CERT_INFO).find((c) => c.key === key);
</script>

<template>
  <div>
    <PageHead />
    <div class="cards cs-cards">
      <RouterLink v-for="c in cheatsheets" :key="c.cert" :to="`/cheatsheets/${c.slug}`" class="tcard cs-card">
        <div class="cert-top">
          <div class="badge-thumb"><img :src="CERTS[c.cert].badge" :alt="t.badge(CERTS[c.cert].name)" loading="lazy"></div>
          <div>
            <div class="cert-code"><span class="dot" :class="CERTS[c.cert].color" />{{ CERTS[c.cert].code }}</div>
            <h3>{{ info(c.cert)?.name ?? CERTS[c.cert].name }}</h3>
          </div>
        </div>
        <p>{{ tr(c.summary) }}</p>
        <div class="pcard-meta">
          <span>{{ t.reviewed }}: <time :datetime="c.reviewedAt">{{ fmtDate(c.reviewedAt) }}</time></span>
          <span class="tag">ES · {{ t.spanish }}</span>
        </div>
        <span class="cs-open">{{ t.open }}</span>
      </RouterLink>
    </div>
  </div>
</template>
