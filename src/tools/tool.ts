import type { Component } from 'vue';
import type { Localized } from '@/i18n';
import type { CertKey } from '@/lib/certs';

export type CategoryKey = 'api' | 'prompt' | 'tools' | 'code' | 'arch';

export interface Tool {
  /** Nombre visible (es / en). */
  name: Localized;
  /** Ruta, p. ej. "/costos". Debe ser única. */
  path: string;
  /** Descripción en una oración (es / en). */
  description: Localized;
  /** Palabras extra para el buscador (en cualquier idioma). */
  keywords: string[];
  /** Glifo corto que se muestra como ícono. */
  icon: string;
  category: CategoryKey;
  /** Certificaciones cuyo temario practica la herramienta. */
  certs: CertKey[];
  /** Orden dentro de su categoría (menor = primero). */
  order?: number;
  /** Componente cargado de forma diferida. */
  component: () => Promise<Component>;
}

export const defineTool = (tool: Tool): Tool => tool;
