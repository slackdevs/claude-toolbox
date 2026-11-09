import { computed, type ComputedRef } from 'vue';
import { useStorage } from '@/composables/useStorage';
import { UI } from './ui';

export type Locale = 'es' | 'en';
export const LOCALES: Locale[] = ['es', 'en'];

/** Valor con una variante por idioma. */
export type Localized<T = string> = Record<Locale, T>;

const detect = (): Locale => {
  try {
    return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'es';
  }
};

const stored = useStorage<Locale>('ct-lang', detect());
if (!LOCALES.includes(stored.value)) stored.value = 'es';

/** Idioma actual (persistido en localStorage). */
export const locale = stored;

export const setLocale = (l: Locale) => (locale.value = l);
export const toggleLocale = () => setLocale(locale.value === 'es' ? 'en' : 'es');

/** Elige la variante del idioma actual. Reactivo si se usa dentro de computed/template. */
export const tr = <T>(v: Localized<T>): T => v[locale.value];

/**
 * Mensajes co-ubicados en un componente. `en` debe tener la misma forma que `es`.
 * Uso: const t = useMessages({ es: {...}, en: {...} }); → en template: {{ t.title }}
 */
export function useMessages<T>(m: { es: T; en: NoInfer<T> }): ComputedRef<T> {
  return computed(() => m[locale.value]);
}

/** Textos comunes de la interfaz (header, sidebar, home, etc.). */
export const ui = computed(() => UI[locale.value]);

/** Locale para Intl (números, fechas). */
export const intlLocale = () => (locale.value === 'es' ? 'es-AR' : 'en-US');
