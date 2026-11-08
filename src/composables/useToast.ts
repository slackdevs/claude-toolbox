import { ref } from 'vue';

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
    toast('¡Copiado!');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('¡Copiado!');
    } catch {
      toast('Seleccioná y copiá manualmente');
    }
    ta.remove();
  }
}
