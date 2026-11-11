<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue';
import { ui } from '@/i18n';

// Modal base sobre <dialog>.showModal(): el navegador atrapa el foco, cierra con Esc y, al cerrar,
// devuelve el foco al elemento que lo abrió. Mismo patrón que AboutModal.
const open = defineModel<boolean>({ required: true });
defineProps<{ title: string }>();

const dialog = ref<HTMLDialogElement>();
const titleId = useId();

function sync() {
  const el = dialog.value;
  if (!el) return;
  if (open.value && !el.open) el.showModal();
  else if (!open.value && el.open) el.close();
}

watch(open, sync, { flush: 'post' });
onMounted(sync);
</script>

<template>
  <dialog ref="dialog" class="about-modal" :aria-labelledby="titleId" @close="open = false" @click.self="open = false">
    <div v-if="open" class="about-body">
      <button class="about-x" type="button" :aria-label="ui.close" :title="ui.close" @click="open = false">✕</button>
      <h2 :id="titleId" class="dialog-title">{{ title }}</h2>
      <slot />
      <div v-if="$slots.foot" class="about-foot"><slot name="foot" /></div>
    </div>
  </dialog>
</template>
