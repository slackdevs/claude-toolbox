// Tipos del dominio comunitario. Sin dependencias de Vue ni del navegador: se van a compartir con la API Fastify.
import type { Locale } from '@/i18n';
import type { CertKey } from '@/lib/certs';

export type ProposalType = 'tool' | 'improvement' | 'content';
export type ProposalStatus = 'received' | 'open' | 'planned' | 'in_progress' | 'published' | 'discarded' | 'duplicate';
export type DonationTier = 'coffee' | 'beer' | 'pizza';
export type DonationStatus = 'pending' | 'confirmed';
export type VoteValue = 1 | -1;

export const PROPOSAL_TYPES: ProposalType[] = ['tool', 'improvement', 'content'];
export const PROPOSAL_STATUSES: ProposalStatus[] = ['received', 'open', 'planned', 'in_progress', 'published', 'discarded', 'duplicate'];
/** Camino feliz del ciclo de vida, en orden. */
export const LIFECYCLE: ProposalStatus[] = ['received', 'open', 'planned', 'in_progress', 'published'];
export const DONATION_TIERS: DonationTier[] = ['coffee', 'beer', 'pizza'];

export interface ProposalAuthor {
  displayName?: string;
  /** Nunca se expone el email del autor: sólo su hash. */
  emailHash: string;
}

export interface ProposalLinks {
  issue?: string;
  pr?: string;
  /** Ruta dentro del Toolbox donde quedó publicado (p. ej. "/costos"). */
  publishedPath?: string;
}

export interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  /** Markdown simple (negrita, cursiva, listas, links, código en línea). */
  description: string;
  /** Idioma en que se escribió. */
  lang: Locale;
  certs: CertKey[];
  /** Herramienta vinculada cuando `type` es `improvement` (p. ej. "/costos"). */
  toolPath?: string;
  status: ProposalStatus;
  /** Tiempo estimado de desarrollo e implementación, en horas. Lo asigna la revisión. */
  estimateHours?: number;
  /** Motivo público, obligatorio para `discarded` y `duplicate`. */
  statusReason?: string;
  /** Propuesta original cuando `status` es `duplicate`. */
  duplicateOf?: string;
  createdAt: string;
  updatedAt: string;
  author: ProposalAuthor;
  links?: ProposalLinks;
}

export interface Vote {
  proposalId: string;
  voterEmail: string;
  value: VoteValue;
  ip: string;
  region: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  proposalId: string;
  tier: DonationTier;
  amount: number;
  status: DonationStatus;
  donorDisplayName?: string;
  showPublicly: boolean;
  createdAt: string;
}

export interface Voter {
  email: string;
  verified: boolean;
  consentAt: string;
}

export type TierCounts = Record<DonationTier, number>;

/** Rango orientativo de minutos de desarrollo. `undefinedTiers`: consumos donados cuya equivalencia está a definir. */
export interface MinutesRange {
  min: number;
  max: number;
  undefinedTiers: DonationTier[];
}

/** Lo que devuelve el listado: la propuesta más sus agregados. */
export interface ProposalSummary extends Proposal {
  upvotes: number;
  downvotes: number;
  /** Sólo donaciones confirmadas. */
  donationsByTier: TierCounts;
  donatedAmount: number;
  donatedMinutes: MinutesRange;
  donationPoints: number;
  score: number;
  /** Voto de la sesión actual (0 = sin voto). */
  myVote: VoteValue | 0;
}

export interface Supporter {
  displayName: string;
  tier: DonationTier;
  createdAt: string;
}

export interface ProposalDetail extends ProposalSummary {
  /** Donantes que eligieron mostrarse públicamente. */
  supporters: Supporter[];
  /** Título de la propuesta original, si es un duplicado. */
  duplicateOfTitle?: string;
}

export type ProposalSort = 'ranking' | 'newest' | 'donated';

export interface ProposalFilters {
  type?: ProposalType;
  status?: ProposalStatus;
  cert?: CertKey;
  toolPath?: string;
  q?: string;
  sort?: ProposalSort;
}

export interface CreateProposalInput {
  type: ProposalType;
  title: string;
  description: string;
  lang: Locale;
  certs: CertKey[];
  toolPath?: string;
  email: string;
  displayName?: string;
}

export interface VoterSession {
  email: string;
  verified: boolean;
}

export interface VerificationRequest {
  email: string;
  /** Sólo en el mock: token para simular el clic en el enlace del email. La API real lo envía por correo. */
  demoToken?: string;
}

export interface DonationOptions {
  donorDisplayName?: string;
  showPublicly?: boolean;
}

export interface DonationReceipt {
  donation: Donation;
  proposal: ProposalSummary;
}

export interface AdminProposalPatch {
  status?: ProposalStatus;
  estimateHours?: number;
  statusReason?: string;
  duplicateOf?: string;
  links?: ProposalLinks;
}

export interface ProposalActivity {
  votes: Vote[];
  donations: Donation[];
}

/** Ajustes del backend simulado (sólo existen en el mock). */
export interface DemoSettings {
  /** Probabilidad de error por llamada, de 0 a 1. */
  errorRate: number;
  latencyMin: number;
  latencyMax: number;
}

export type CommunityErrorCode = 'network' | 'not_found' | 'invalid' | 'forbidden' | 'unverified' | 'not_implemented';

export class CommunityError extends Error {
  code: CommunityErrorCode;
  /** Campo que falló la validación, cuando `code` es `invalid`. */
  field?: string;

  constructor(code: CommunityErrorCode, field?: string) {
    super(field ? `${code}:${field}` : code);
    this.name = 'CommunityError';
    this.code = code;
    this.field = field;
  }
}
