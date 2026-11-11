<script setup lang="ts">
import { locale, useMessages, type Locale } from '@/i18n';

// El contenido de los usuarios se muestra en su idioma original: se avisa cuando no coincide con el de la interfaz.
defineProps<{ lang: Locale }>();

const t = useMessages({
  es: { names: { es: 'Español', en: 'Inglés' }, title: (l: string) => `Escrita en ${l.toLowerCase()}: se muestra en su idioma original` },
  en: { names: { es: 'Spanish', en: 'English' }, title: (l: string) => `Written in ${l}: shown in its original language` },
});
</script>

<template>
  <span v-if="lang !== locale" class="tag" :title="t.title(t.names[lang])">{{ lang.toUpperCase() }} · {{ t.names[lang] }}</span>
</template>
