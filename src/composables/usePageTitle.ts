import { onBeforeUnmount, watchEffect } from 'vue';
import { pageTitle } from './useAppState';

/** Título dinámico de la página (p. ej. el de una propuesta): App.vue lo usa para <title> en lugar del de la ruta. */
export function usePageTitle(title: () => string | undefined) {
  watchEffect(() => (pageTitle.value = title() ?? ''));
  onBeforeUnmount(() => (pageTitle.value = ''));
}
