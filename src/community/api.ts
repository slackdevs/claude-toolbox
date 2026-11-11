// Única puerta de entrada a la capa comunitaria. Los componentes nunca tocan localStorage ni fetch directo.
// Cada operación corresponde a un endpoint de la futura API Fastify.
import { httpApi } from './http/httpApi';
import { mockApi } from './mock/mockApi';
import { communityMode } from './mode';
import type {
  AdminProposalPatch, CreateProposalInput, DemoSettings, Donation, DonationOptions, DonationReceipt, DonationTier,
  ProposalActivity, ProposalDetail, ProposalFilters, ProposalSummary, VerificationRequest, VoteValue, VoterSession,
} from './types';

export interface CommunityApi {
  /** GET /proposals */
  listProposals(filters?: ProposalFilters): Promise<ProposalSummary[]>;
  /** GET /proposals/:id */
  getProposal(id: string): Promise<ProposalDetail>;
  /** POST /proposals */
  createProposal(input: CreateProposalInput): Promise<ProposalSummary>;
  /** POST /proposals/:id/vote — 0 retira el voto. El votante sale de la sesión, no del cuerpo. */
  vote(id: string, value: VoteValue | 0): Promise<ProposalSummary>;

  /** GET /voters/me */
  getSession(): Promise<VoterSession | null>;
  /** POST /voters/verify — exige consentimiento explícito. */
  requestVerification(email: string, consent: boolean): Promise<VerificationRequest>;
  /** POST /voters/confirm */
  confirmVerification(token: string): Promise<VoterSession>;
  /** DELETE /voters/session — cierra la sesión en este navegador ("Cambiar email"). */
  signOut(): Promise<void>;
  /** DELETE /voters/me — borra el votante y sus votos ("Olvidar mis datos"). */
  forgetMe(): Promise<void>;

  /** POST /donations — crea la orden en estado `pending`. */
  createDonation(id: string, tier: DonationTier, options?: DonationOptions): Promise<Donation>;
  /** Webhook de PayPal en la API real; en el mock lo dispara el botón de pago simulado. */
  confirmDonation(orderId: string): Promise<DonationReceipt>;

  /** PATCH /admin/proposals/:id */
  adminUpdateProposal(id: string, patch: AdminProposalPatch): Promise<ProposalSummary>;
  /** GET /admin/proposals/:id/activity — votos (email, IP, región) y donaciones. */
  adminGetActivity(id: string): Promise<ProposalActivity>;

  /** Controles del backend simulado. No existen en la API real. */
  demo?: DemoControls;
}

export interface DemoControls {
  getSettings(): DemoSettings;
  setSettings(patch: Partial<DemoSettings>): DemoSettings;
  /** Restablece los datos de ejemplo. */
  reset(): void;
}

/** Implementación activa: `VITE_COMMUNITY_API=mock` (por defecto) o `http`. */
export const api: CommunityApi = communityMode === 'http' ? httpApi : mockApi;
