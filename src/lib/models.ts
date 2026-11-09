// Precios USD por millón de tokens, de fuentes públicas (oct–nov 2026).
// Son editables en la calculadora: verificá siempre la página oficial de precios.
import type { Localized } from '@/i18n';
export interface ModelPrice { pin: number; pout: number; pcr: number }
export interface ModelInfo extends ModelPrice {
  id: string;
  name: string;
  ctx: number;
  note?: Localized;
  tier?: ModelPrice & { limit: number };
}

export const MODELS: ModelInfo[] = [
  { id: 'claude-fable-5-1', name: 'Fable 5.1', pin: 10, pout: 50, pcr: 1.0, ctx: 1_000_000, note: { es: 'lectura de caché estimada (10%)', en: 'estimated cache read price (10%)' } },
  { id: 'claude-opus-5-5', name: 'Opus 5.5', pin: 4, pout: 20, pcr: 0.2, ctx: 1_000_000 },
  { id: 'claude-sonnet-5-5', name: 'Sonnet 5.5', pin: 2, pout: 10, pcr: 0.2, ctx: 1_000_000 },
  { id: 'claude-haiku-5-5', name: 'Haiku 5.5', pin: 0.1, pout: 0.5, pcr: 0.01, ctx: 1_000_000, tier: { limit: 100_000, pin: 0.5, pout: 2.5, pcr: 0.05 } },
];

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

export function priceFor(m: ModelInfo, promptTokens: number): ModelPrice & { t2: boolean } {
  if (m.tier && promptTokens > m.tier.limit) return { pin: m.tier.pin, pout: m.tier.pout, pcr: m.tier.pcr, t2: true };
  return { pin: m.pin, pout: m.pout, pcr: m.pcr, t2: false };
}

export const findModel = (id: string): ModelInfo => MODELS.find((m) => m.id === id) ?? MODELS[2]!;
