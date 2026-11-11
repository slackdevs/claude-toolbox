// Etiquetas compartidas del dominio. El estado siempre se comunica con texto e ícono, nunca sólo con color.
import type { Localized } from '@/i18n';
import type { BrandColor } from '@/lib/certs';
import type { CommunityErrorCode, DonationTier, ProposalStatus, ProposalType } from './types';

export const STATUS_LABELS: Record<ProposalStatus, { name: Localized; hint: Localized; icon: string; color: BrandColor | 'muted' }> = {
  received: {
    name: { es: 'Recibida', en: 'Received' },
    hint: { es: 'Sebastián la revisa y le asigna un tiempo estimado antes de abrirla a votación.', en: 'Sebastián reviews it and assigns an estimated time before opening it to voting.' },
    icon: '◌', color: 'muted',
  },
  open: {
    name: { es: 'Abierta a votación', en: 'Open for voting' },
    hint: { es: 'Pasó la revisión: suma votos y donaciones.', en: 'It passed review: it collects votes and donations.' },
    icon: '▲', color: 'cyan',
  },
  planned: {
    name: { es: 'Planificada', en: 'Planned' },
    hint: { es: 'Entró en el roadmap del próximo ciclo.', en: 'It made the roadmap for the next cycle.' },
    icon: '◆', color: 'purple',
  },
  in_progress: {
    name: { es: 'En desarrollo', en: 'In progress' },
    hint: { es: 'Se está construyendo en el repo público.', en: 'It is being built in the public repo.' },
    icon: '◐', color: 'amber',
  },
  published: {
    name: { es: 'Publicada', en: 'Published' },
    hint: { es: 'Disponible en el sitio y en el repo.', en: 'Available on the site and in the repo.' },
    icon: '✓', color: 'cyan',
  },
  discarded: {
    name: { es: 'Descartada', en: 'Discarded' },
    hint: { es: 'Cerrada con motivo público.', en: 'Closed with a public reason.' },
    icon: '✕', color: 'muted',
  },
  duplicate: {
    name: { es: 'Duplicada', en: 'Duplicate' },
    hint: { es: 'Ya existe otra propuesta que la cubre.', en: 'Another proposal already covers it.' },
    icon: '⧉', color: 'muted',
  },
};

export const TYPE_LABELS: Record<ProposalType, { name: Localized; icon: string }> = {
  tool: { name: { es: 'Herramienta nueva', en: 'New tool' }, icon: '＋' },
  improvement: { name: { es: 'Mejora', en: 'Improvement' }, icon: '↑' },
  content: { name: { es: 'Contenido', en: 'Content' }, icon: '¶' },
};

// Los nombres de los botones de consumo son marca del producto: no se traducen.
export const TIER_LABELS: Record<DonationTier, { button: string; name: Localized; icon: string }> = {
  coffee: { button: 'Buy Me a Coffee', name: { es: 'un café', en: 'a coffee' }, icon: '☕' },
  beer: { button: 'A Beer', name: { es: 'una cerveza', en: 'a beer' }, icon: '🍺' },
  pizza: { button: 'A Pizza', name: { es: 'una pizza', en: 'a pizza' }, icon: '🍕' },
};

export const ERROR_LABELS: Record<CommunityErrorCode, Localized> = {
  network: { es: 'No se pudo conectar con el servidor. Probá de nuevo.', en: 'Could not reach the server. Try again.' },
  not_found: { es: 'Esa propuesta no existe.', en: 'That proposal does not exist.' },
  invalid: { es: 'Revisá los datos ingresados.', en: 'Check the data you entered.' },
  forbidden: { es: 'Esa acción no está disponible para esta propuesta.', en: 'That action is not available for this proposal.' },
  unverified: { es: 'Verificá tu email para continuar.', en: 'Verify your email to continue.' },
  not_implemented: { es: 'La API real todavía no está implementada.', en: 'The real API is not implemented yet.' },
};
