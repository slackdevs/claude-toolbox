<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownView, { scrollToId } from '@/components/MarkdownView';
import PageHead from '@/components/PageHead.vue';
import ToolCard from '@/components/ToolCard.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { locale, tr, ui, useMessages } from '@/i18n';
import { CERTS } from '@/lib/certs';
import { fmtDate } from '@/community/format';
import NotFound from '@/pages/NotFound.vue';
import { tools } from '@/tools';
import { CERT_INFO } from '@/tools/certificaciones/certificaciones.data';
import { findCheatsheet, loadCheatsheet, OFFICIAL_DOCS, OFFICIAL_GUIDE_URL, type CheatsheetDoc } from '..';

const t = useMessages({
  es: {
    all: '← Todos los cheatsheets', badge: (name: string) => `Insignia ${name}`, print: 'Imprimir', improve: 'Proponer mejora a este cheatsheet',
    reviewed: 'Última revisión', outdated: 'Puede estar desactualizado: los exámenes, productos y precios cambian. Confirmá siempre con la',
    guide: 'guía oficial', format: 'Formato del examen', audience: 'Para',
    toc: 'En este cheatsheet', docs: 'Documentación oficial', related: 'Herramientas relacionadas', noTools: 'Todavía no hay herramientas para esta credencial.',
    loadError: 'No se pudo cargar el contenido.', top: '↑ Volver arriba',
    independent: 'Material de estudio independiente de SlackDevs, no afiliado ni respaldado por Anthropic.',
  },
  en: {
    all: '← All cheatsheets', badge: (name: string) => `${name} badge`, print: 'Print', improve: 'Propose an improvement to this cheatsheet',
    reviewed: 'Last reviewed', outdated: 'It may be outdated: exams, products and prices change. Always confirm with the',
    guide: 'official guide', format: 'Exam format', audience: 'For',
    toc: 'In this cheatsheet', docs: 'Official documentation', related: 'Related tools', noTools: 'There are no tools for this credential yet.',
    loadError: 'The content could not be loaded.', top: '↑ Back to top',
    independent: 'Independent study material by SlackDevs, not affiliated with or endorsed by Anthropic.',
  },
});

// El contenido de los cheatsheets está sólo en español por ahora.
const SPANISH_ONLY = { title: 'This cheatsheet is in Spanish', text: 'The interface is translated, but the content is only available in Spanish for now.' };

const route = useRoute();
const sheet = computed(() => findCheatsheet(String(route.params.cert)));
const cert = computed(() => (sheet.value ? CERTS[sheet.value.cert] : null));
const info = computed(() => tr(CERT_INFO).find((c) => c.key === sheet.value?.cert));
const related = computed(() => tools.filter((tl) => sheet.value && tl.certs.includes(sheet.value.cert)));

usePageTitle(() => (cert.value ? `Cheatsheet ${cert.value.code} · ${cert.value.name}` : undefined));

const doc = shallowRef<CheatsheetDoc | null>(null);
const failed = ref(false);

async function load() {
  doc.value = null;
  failed.value = false;
  if (!sheet.value) return;
  try {
    doc.value = await loadCheatsheet(sheet.value);
  } catch {
    failed.value = true;
  }
}
watch(sheet, load, { immediate: true });

const print = () => window.print();
</script>

<template>
  <NotFound v-if="!sheet || !cert" />
  <div v-else class="cs-page">
    <p class="back-link"><RouterLink to="/cheatsheets">{{ t.all }}</RouterLink></p>

    <PageHead :title="`Cheatsheet ${cert.code}`" :description="tr(sheet.summary)">
      <template #actions>
        <button class="btn" type="button" @click="print">⎙ {{ t.print }}</button>
        <RouterLink class="btn ghost" :to="{ path: '/propuestas/nueva', query: { type: 'content', cert: sheet.cert } }">↑ {{ t.improve }}</RouterLink>
      </template>
    </PageHead>

    <div class="card cs-meta">
      <div class="badge-thumb"><img :src="cert.badge" :alt="t.badge(cert.name)"></div>
      <div class="cs-meta-text">
        <div class="cert-code"><span class="dot" :class="cert.color" />{{ cert.code }} · {{ info?.name ?? cert.name }}</div>
        <p v-if="info"><b>{{ t.audience }}:</b> {{ info.audience }} · <b>{{ t.format }}:</b> {{ info.format }}</p>
        <p><b>{{ t.reviewed }}:</b> <time :datetime="sheet.reviewedAt">{{ fmtDate(sheet.reviewedAt) }}</time></p>
        <p class="cs-warning">
          <span aria-hidden="true">⚠</span> {{ t.outdated }}
          <a :href="OFFICIAL_GUIDE_URL[sheet.cert]" target="_blank" rel="noopener">{{ t.guide }}</a>.
          {{ t.independent }}
        </p>
      </div>
    </div>

    <div v-if="locale !== 'es'" class="card notice" role="note" lang="en">
      <h3>{{ SPANISH_ONLY.title }}</h3>
      <p>{{ SPANISH_ONLY.text }}</p>
    </div>

    <div v-if="failed" class="empty" role="alert">
      <p>{{ t.loadError }}</p>
      <button class="btn ghost" type="button" @click="load">{{ ui.retry }}</button>
    </div>
    <div v-else-if="!doc" class="empty" role="status">{{ ui.loading }}</div>
    <div v-else class="cs-layout">
      <nav class="cs-toc" :aria-label="t.toc">
        <h2>{{ t.toc }}</h2>
        <ol>
          <li v-for="s in doc.sections" :key="s.id"><a :href="`#${s.id}`" @click.prevent="scrollToId(s.id)">{{ s.text }}</a></li>
          <li><a href="#cs-docs" @click.prevent="scrollToId('cs-docs')">{{ t.docs }}</a></li>
          <li><a href="#cs-related" @click.prevent="scrollToId('cs-related')">{{ t.related }}</a></li>
        </ol>
      </nav>
      <article class="cs-content" lang="es">
        <MarkdownView :blocks="doc.blocks" full />
      </article>
    </div>

    <section class="cs-extra">
      <h2 id="cs-docs" class="sec-title">{{ t.docs }}</h2>
      <ul class="cs-docs">
        <li v-for="d in OFFICIAL_DOCS" :key="d.url"><a :href="d.url" target="_blank" rel="noopener">{{ d.name }}</a> — {{ tr(d.about) }}</li>
        <li><a :href="OFFICIAL_GUIDE_URL[sheet.cert]" target="_blank" rel="noopener">Anthropic Academy</a> — {{ t.guide }}</li>
      </ul>

      <h2 id="cs-related" class="sec-title">{{ t.related }}</h2>
      <div v-if="related.length" class="cards"><ToolCard v-for="tl in related" :key="tl.path" :tool="tl" /></div>
      <p v-else class="empty">{{ t.noTools }}</p>
      <p class="back-link cs-top"><a href="#" @click.prevent="scrollToId('app')">{{ t.top }}</a></p>
    </section>
  </div>
</template>
