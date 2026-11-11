<script setup lang="ts">
import { computed } from 'vue';
import { cheatsheets } from '@/cheatsheets';
import { ui, useMessages } from '@/i18n';
import { CERTS } from '@/lib/certs';
import { useProposals } from '../composables/useProposals';
import { isDemo } from '../mode';
import ProposalCard from './ProposalCard.vue';
import ProposalSkeleton from './ProposalSkeleton.vue';

// Bloque compacto de la home: CTA, las 3 propuestas abiertas mejor rankeadas y los cheatsheets.
const t = useMessages({
  es: {
    title: 'Comunidad', lead: '¿Qué herramienta te falta?', text: 'Proponé herramientas, mejoras o contenido. La comunidad vota y el ranking define el roadmap.',
    propose: 'Proponé una herramienta', all: 'Ver todas las propuestas', top: 'Más votadas', cheatsheets: 'Cheatsheets por credencial', badge: (name: string) => `Insignia ${name}`,
  },
  en: {
    title: 'Community', lead: 'Which tool are you missing?', text: 'Propose tools, improvements or content. The community votes and the ranking drives the roadmap.',
    propose: 'Propose a tool', all: 'See all proposals', top: 'Top voted', cheatsheets: 'Cheatsheets by credential', badge: (name: string) => `${name} badge`,
  },
});

const { items, loading, error } = useProposals(() => ({ status: 'open', sort: 'ranking' }));
const top = computed(() => items.value.slice(0, 3));
</script>

<template>
  <section class="home-community" :aria-label="t.title">
    <div class="sec-title">{{ t.title }}</div>
    <div class="home-cta card">
      <div>
        <h2>{{ t.lead }}</h2>
        <p>{{ t.text }}</p>
      </div>
      <div class="btns">
        <RouterLink class="btn" to="/propuestas/nueva">＋ {{ t.propose }}</RouterLink>
        <RouterLink class="btn ghost" to="/propuestas">{{ t.all }}</RouterLink>
      </div>
    </div>

    <template v-if="!error">
      <h3 class="home-sub">{{ t.top }} <span v-if="isDemo" class="tag sample-tag">{{ ui.sampleData }}</span></h3>
      <ProposalSkeleton v-if="loading" :count="1" />
      <div v-else class="home-top">
        <ProposalCard v-for="p in top" :key="p.id" :proposal="p" compact readonly />
      </div>
    </template>

    <h3 class="home-sub">{{ t.cheatsheets }}</h3>
    <div class="home-sheets">
      <RouterLink v-for="c in cheatsheets" :key="c.cert" :to="`/cheatsheets/${c.slug}`" class="tcard home-sheet">
        <img :src="CERTS[c.cert].badge" :alt="t.badge(CERTS[c.cert].name)" loading="lazy" width="40" height="40">
        <span>
          <b><span class="dot" :class="CERTS[c.cert].color" /> {{ CERTS[c.cert].code }}</b>
          <small>{{ CERTS[c.cert].name }}</small>
        </span>
      </RouterLink>
    </div>
  </section>
</template>
