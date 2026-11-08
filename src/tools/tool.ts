import type { Component } from 'vue';
import type { CertKey } from '@/lib/certs';

export type CategoryKey = 'api' | 'prompt' | 'tools' | 'code' | 'arch';

export interface Tool {
  /** Nombre visible. */
  name: string;
  /** Ruta, p. ej. "/costos". Debe ser única. */
  path: string;
  description: string;
  /** Palabras extra para el buscador. */
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
