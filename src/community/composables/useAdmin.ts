import { useStorage } from '@/composables/useStorage';

/** "Modo Sebastián (demo)": habilita la revisión simulada en /admin/. Es sólo una preferencia de UI de este navegador. */
export const adminMode = useStorage('ct-admin-mode', false);
