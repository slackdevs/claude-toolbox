import { ref } from 'vue';
import { ui } from '@/i18n';

export const toastMessage = ref('');
export const toastVisible = ref(false);
let handle: ReturnType<typeof setTimeout> | undefined;

/** `ms`: cuánto queda visible. Los mensajes de error necesitan más tiempo que un "¡Copiado!". */
export function toast(message: string, ms = 1400) {
  toastMessage.value = message;
  toastVisible.value = true;
  clearTimeout(handle);
  handle = setTimeout(() => (toastVisible.value = false), ms);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(ui.value.copied);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast(ui.value.copied);
    } catch {
      toast(ui.value.copyManual);
    }
    ta.remove();
  }
}
