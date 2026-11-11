// Único lugar para los valores de negocio que todavía no están definidos.
// Todo lo marcado TODO es PROVISORIO: la UI lo muestra como "provisorio" mientras `provisional` sea true.
import { BRAND } from '@/lib/brand';
import type { DonationTier } from './types';

export interface TierConfig {
  /** Precio del consumo en `currency`. */
  amount: number;
  /** Equivalencia orientativa en minutos de desarrollo [mín, máx]; null = a definir. */
  minutes: [number, number] | null;
  /** Puntos que suma al puntaje cada donación confirmada. */
  points: number;
}

export const COMMUNITY_CONFIG = {
  /** Mientras sea true, precios, equivalencias y pesos se muestran como "provisorio". */
  provisional: true,
  currency: 'USD',
  tiers: {
    // TODO(Sebastián): precio definitivo. La equivalencia 10–20 min sale del documento de producto.
    coffee: { amount: 3, minutes: [10, 20], points: 1 },
    // TODO(Sebastián): precio, equivalencia en tiempo y puntos de la cerveza.
    beer: { amount: 5, minutes: null, points: 2 },
    // TODO(Sebastián): precio, equivalencia en tiempo y puntos de la pizza.
    pizza: { amount: 10, minutes: null, points: 4 },
  } satisfies Record<DonationTier, TierConfig> as Record<DonationTier, TierConfig>,
  // TODO(Sebastián): plazo (en días) para considerar que una propuesta no avanza. null = sin definir.
  stalledAfterDays: null as number | null,
  /** A confirmar: barra "donado vs. tiempo estimado" en minutos orientativos. Apagada por defecto. */
  showFundingProgress: false,
  limits: { title: 80, description: 2000 },
  // TODO(Sebastián): link al formulario de contacto de slackdevs.com o un mailto para "Consultar desarrollo privado".
  privateDevUrl: BRAND.site,
};
