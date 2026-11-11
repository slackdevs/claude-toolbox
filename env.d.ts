/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  /** Implementación de la capa comunitaria: `mock` (por defecto, localStorage) o `http` (API real, todavía sin implementar). */
  readonly VITE_COMMUNITY_API?: 'mock' | 'http';
}
