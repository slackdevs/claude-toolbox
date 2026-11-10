import { ref } from 'vue';
import type { CertKey } from '@/lib/certs';
import { useStorage } from './useStorage';

export const favorites = useStorage<string[]>('ct-favs', []);
export const certFilter = ref<CertKey | ''>('');
export const query = ref('');
export const sidebarOpen = ref(false);
/** Modal "Acerca de / beta": visible ahora, y si el visitante pidió no verlo más al entrar. */
export const aboutOpen = ref(false);
export const aboutHidden = useStorage('ct-about-hidden', false);

export function toggleFavorite(path: string) {
  favorites.value = favorites.value.includes(path)
    ? favorites.value.filter((p) => p !== path)
    : [...favorites.value, path];
}
