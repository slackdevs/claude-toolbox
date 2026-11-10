<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { aboutHidden, aboutOpen } from '@/composables/useAppState';
import { useMessages } from '@/i18n';
import { BRAND } from '@/lib/brand';

const SESSION_KEY = 'ct-about-seen';

const dialog = ref<HTMLDialogElement>();
const dontShow = ref(aboutHidden.value);

const t = useMessages({
  es: {
    badge: 'Beta · en desarrollo activo',
    title: 'Acerca de Claude Toolbox',
    betaTitle: 'El sitio está en fase beta',
    beta: 'Claude Toolbox está en desarrollo activo: las herramientas, sus resultados y la organización del sitio pueden cambiar con frecuencia, y es posible que encuentres errores o datos desactualizados. Verificá siempre lo importante en la documentación oficial.',
    purposeTitle: 'Propósito del proyecto',
    purpose: 'Reunir en un solo lugar utilidades prácticas para quienes trabajan con Claude, la Claude API y Claude Code: diseñar prompts, estimar costos y configurar Claude Code, MCP y agentes. Están organizadas según lo que evalúan las certificaciones de Claude, para que también sirvan como apoyo de estudio.',
    points: [
      'Todo corre en tu navegador: nada de lo que escribís se envía a un servidor.',
      'Gratuito y sin registro.',
      'Proyecto independiente de SlackDevs, no afiliado ni respaldado por Anthropic.',
    ],
    feedback: '¿Encontraste un error o tenés una idea?',
    feedbackLink: 'Contalo en GitHub',
    dontShow: 'No volver a mostrar',
    ok: 'Entendido',
    close: 'Cerrar',
  },
  en: {
    badge: 'Beta · under active development',
    title: 'About Claude Toolbox',
    betaTitle: 'This site is in beta',
    beta: 'Claude Toolbox is under active development: the tools, their output and the layout of the site may change often, and you may run into bugs or outdated data. Always verify anything important in the official documentation.',
    purposeTitle: 'Purpose of the project',
    purpose: 'To gather in one place practical utilities for people working with Claude, the Claude API and Claude Code: designing prompts, estimating costs and configuring Claude Code, MCP and agents. They are organized around what the Claude certifications assess, so they also work as a study aid.',
    points: [
      'Everything runs in your browser: nothing you type is sent to a server.',
      'Free, no sign-up.',
      'Independent project by SlackDevs, not affiliated with or endorsed by Anthropic.',
    ],
    feedback: 'Found a bug or have an idea?',
    feedbackLink: 'Tell us on GitHub',
    dontShow: "Don't show again",
    ok: 'Got it',
    close: 'Close',
  },
});

const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

watch(aboutOpen, (open) => {
  const el = dialog.value;
  if (!el) return;
  if (open && !el.open) {
    dontShow.value = aboutHidden.value;
    el.showModal();
  } else if (!open && el.open) {
    el.close();
  }
});

// Cubre también el cierre con Esc, que dispara `close` sin pasar por los botones.
function onClose() {
  aboutHidden.value = dontShow.value;
  aboutOpen.value = false;
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* sin storage */
  }
}

onMounted(() => {
  if (!aboutHidden.value && !seenThisSession()) aboutOpen.value = true;
});
</script>

<template>
  <dialog
    ref="dialog" class="about-modal" aria-labelledby="about-title"
    @close="onClose" @click.self="aboutOpen = false"
  >
    <div class="about-body">
      <button class="about-x" type="button" :aria-label="t.close" :title="t.close" @click="aboutOpen = false">✕</button>
      <span class="pill amber">{{ t.badge }}</span>
      <h2 id="about-title">{{ t.title }}</h2>

      <h3>{{ t.betaTitle }}</h3>
      <p>{{ t.beta }}</p>

      <h3>{{ t.purposeTitle }}</h3>
      <p>{{ t.purpose }}</p>
      <ul>
        <li v-for="p in t.points" :key="p">{{ p }}</li>
      </ul>
      <p class="note">
        {{ t.feedback }}
        <a :href="BRAND.github" target="_blank" rel="noopener">{{ t.feedbackLink }}</a>.
      </p>

      <div class="about-foot">
        <label class="chk"><input v-model="dontShow" type="checkbox"> {{ t.dontShow }}</label>
        <button class="btn" type="button" autofocus @click="aboutOpen = false">{{ t.ok }}</button>
      </div>
    </div>
  </dialog>
</template>
