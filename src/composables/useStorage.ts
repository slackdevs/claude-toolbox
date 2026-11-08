import { ref, watch, type Ref } from 'vue';

/** ref sincronizado con localStorage; tolera que el storage no exista o falle. */
export function useStorage<T>(key: string, initial: T): Ref<T> {
  let value = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    /* sin storage */
  }
  const r = ref(value) as Ref<T>;
  watch(r, (v) => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* sin storage */
    }
  }, { deep: true });
  return r;
}
