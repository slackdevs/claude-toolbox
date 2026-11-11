// Stub de la implementación HTTP (VITE_COMMUNITY_API=http). Se completa cuando exista la API Fastify.
import type { CommunityApi } from '../api';
import { CommunityError } from '../types';

const notImplemented = (): Promise<never> => Promise.reject(new CommunityError('not_implemented'));

export const httpApi: CommunityApi = {
  listProposals: notImplemented,
  getProposal: notImplemented,
  createProposal: notImplemented,
  vote: notImplemented,
  getSession: notImplemented,
  requestVerification: notImplemented,
  confirmVerification: notImplemented,
  signOut: notImplemented,
  forgetMe: notImplemented,
  createDonation: notImplemented,
  confirmDonation: notImplemented,
  adminUpdateProposal: notImplemented,
  adminGetActivity: notImplemented,
};
