import { ref } from 'vue';
import { ui } from '@/i18n';

export const toastMessage = ref('');
export const toastVisible = ref(false);
let handle: ReturnType<typeof setTimeout> | undefined;

export function toast(message: string) {
  toastMessage.value = message;
  toastVisible.value = true;
  clearTimeout(handle);
  handle = setTimeout(() => (toastVisible.value = false), 1400);
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
