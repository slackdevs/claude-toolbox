// Backend simulado: misma interfaz que la API real, con datos en localStorage, latencia y errores aleatorios.
import type { CommunityApi } from '../api';
import { COMMUNITY_CONFIG } from '../config';
import { compareDonated, compareNewest, compareRanking, computeScore, donatedAmount, donatedMinutes, donationPoints, emptyTierCounts } from '../score';
import {
  CommunityError, DONATION_TIERS, PROPOSAL_STATUSES, PROPOSAL_TYPES,
  type Donation, type Proposal, type ProposalDetail, type ProposalSummary, type VoterSession,
} from '../types';
import { commit, load, reset, type StoreData } from './store';
import { EMAIL_RE, emailHash, fakeIp, fakeRegion, normalizeEmail, randomId } from './util';

const now = () => new Date().toISOString();

/** Simula la red: espera la latencia configurada y, según la tasa de error, falla antes de ejecutar. */
async function call<T>(fn: (db: StoreData) => T): Promise<T> {
  const { latencyMin, latencyMax, errorRate } = load().settings;
  const ms = latencyMin + Math.random() * Math.max(0, latencyMax - latencyMin);
  await new Promise((resolve) => setTimeout(resolve, ms));
  if (Math.random() < errorRate) throw new CommunityError('network');
  return fn(load());
}

function sessionOf(db: StoreData): VoterSession | null {
  if (!db.session) return null;
  const voter = db.voters.find((v) => v.email === db.session);
  return voter ? { email: voter.email, verified: voter.verified } : null;
}

function summarize(db: StoreData, p: Proposal): ProposalSummary {
  const session = sessionOf(db);
  const counts = emptyTierCounts();
  let upvotes = 0;
  let downvotes = 0;
  let myVote: ProposalSummary['myVote'] = 0;
  for (const v of db.votes) {
    if (v.proposalId !== p.id) continue;
    if (v.value === 1) upvotes++;
    else downvotes++;
    if (session?.verified && v.voterEmail === session.email) myVote = v.value;
  }
  for (const d of db.donations) if (d.proposalId === p.id && d.status === 'confirmed') counts[d.tier]++;
  return {
    ...p, upvotes, downvotes, donationsByTier: counts, myVote,
    donatedAmount: donatedAmount(counts), donatedMinutes: donatedMinutes(counts), donationPoints: donationPoints(counts),
    score: computeScore(upvotes, downvotes, counts),
  };
}

function find(db: StoreData, id: string): Proposal {
  const p = db.proposals.find((x) => x.id === id);
  if (!p) throw new CommunityError('not_found');
  return p;
}

const SORTS = { ranking: compareRanking, newest: compareNewest, donated: compareDonated };

export const mockApi: CommunityApi = {
  listProposals: (filters = {}) =>
    call((db) => {
      const q = filters.q?.trim().toLowerCase();
      return db.proposals
        .filter((p) =>
          (!filters.type || p.type === filters.type) &&
          (!filters.status || p.status === filters.status) &&
          (!filters.cert || p.certs.includes(filters.cert)) &&
          (!filters.toolPath || p.toolPath === filters.toolPath) &&
          (!q || `${p.title} ${p.description}`.toLowerCase().includes(q)))
        .map((p) => summarize(db, p))
        .sort(SORTS[filters.sort ?? 'ranking']);
    }),

  getProposal: (id) =>
    call((db): ProposalDetail => {
      const p = find(db, id);
      return {
        ...summarize(db, p),
        supporters: db.donations
          .filter((d) => d.proposalId === id && d.status === 'confirmed' && d.showPublicly && d.donorDisplayName)
          .map((d) => ({ displayName: d.donorDisplayName!, tier: d.tier, createdAt: d.createdAt })),
        duplicateOfTitle: p.duplicateOf ? db.proposals.find((x) => x.id === p.duplicateOf)?.title : undefined,
      };
    }),

  createProposal: (input) =>
    call((db) => {
      const title = input.title.trim();
      const description = input.description.trim();
      const email = normalizeEmail(input.email);
      if (!PROPOSAL_TYPES.includes(input.type)) throw new CommunityError('invalid', 'type');
      if (!title || title.length > COMMUNITY_CONFIG.limits.title) throw new CommunityError('invalid', 'title');
      if (!description || description.length > COMMUNITY_CONFIG.limits.description) throw new CommunityError('invalid', 'description');
      if (!input.certs.length) throw new CommunityError('invalid', 'certs');
      if (input.type === 'improvement' && !input.toolPath) throw new CommunityError('invalid', 'toolPath');
      if (!EMAIL_RE.test(email)) throw new CommunityError('invalid', 'email');
      const at = now();
      const p: Proposal = {
        id: randomId('p'), type: input.type, title, description, lang: input.lang, certs: [...input.certs],
        toolPath: input.type === 'improvement' ? input.toolPath : undefined,
        status: 'received', createdAt: at, updatedAt: at,
        author: { displayName: input.displayName?.trim() || undefined, emailHash: emailHash(email) },
      };
      db.proposals.push(p);
      commit();
      return summarize(db, p);
    }),

  vote: (id, value) =>
    call((db) => {
      const p = find(db, id);
      const session = sessionOf(db);
      if (!session?.verified) throw new CommunityError('unverified');
      if (p.status !== 'open') throw new CommunityError('forbidden');
      // Un voto por email y propuesta: el nuevo reemplaza al anterior (o lo retira si value es 0).
      db.votes = db.votes.filter((v) => !(v.proposalId === id && v.voterEmail === session.email));
      if (value !== 0) {
        db.votes.push({ proposalId: id, voterEmail: session.email, value, ip: fakeIp(session.email), region: fakeRegion(session.email), createdAt: now() });
      }
      commit();
      return summarize(db, p);
    }),

  getSession: () => call(sessionOf),

  requestVerification: (email, consent) =>
    call((db) => {
      const e = normalizeEmail(email);
      if (!EMAIL_RE.test(e)) throw new CommunityError('invalid', 'email');
      if (!consent) throw new CommunityError('invalid', 'consent');
      const voter = db.voters.find((v) => v.email === e);
      if (voter) voter.consentAt = now();
      else db.voters.push({ email: e, verified: false, consentAt: now() });
      const token = randomId('t');
      db.verifications[token] = e;
      commit();
      return { email: e, demoToken: token };
    }),

  confirmVerification: (token) =>
    call((db) => {
      const email = db.verifications[token];
      const voter = email ? db.voters.find((v) => v.email === email) : undefined;
      if (!voter) throw new CommunityError('invalid', 'token');
      delete db.verifications[token];
      voter.verified = true;
      db.session = voter.email;
      commit();
      return { email: voter.email, verified: true };
    }),

  signOut: () =>
    call((db) => {
      db.session = null;
      commit();
    }),

  forgetMe: () =>
    call((db) => {
      const email = db.session;
      if (email) {
        db.votes = db.votes.filter((v) => v.voterEmail !== email);
        db.voters = db.voters.filter((v) => v.email !== email);
        for (const [token, e] of Object.entries(db.verifications)) if (e === email) delete db.verifications[token];
      }
      db.session = null;
      commit();
    }),

  createDonation: (id, tier, options = {}) =>
    call((db) => {
      const p = find(db, id);
      if (!DONATION_TIERS.includes(tier)) throw new CommunityError('invalid', 'tier');
      if (p.status !== 'open') throw new CommunityError('forbidden');
      const name = options.donorDisplayName?.trim();
      const donation: Donation = {
        id: randomId('d'), proposalId: id, tier, amount: COMMUNITY_CONFIG.tiers[tier].amount, status: 'pending',
        donorDisplayName: name || undefined, showPublicly: !!options.showPublicly && !!name, createdAt: now(),
      };
      db.donations.push(donation);
      commit();
      return { ...donation };
    }),

  confirmDonation: (orderId) =>
    call((db) => {
      const donation = db.donations.find((d) => d.id === orderId);
      if (!donation) throw new CommunityError('not_found');
      donation.status = 'confirmed';
      commit();
      return { donation: { ...donation }, proposal: summarize(db, find(db, donation.proposalId)) };
    }),

  adminUpdateProposal: (id, patch) =>
    call((db) => {
      const p = find(db, id);
      const status = patch.status ?? p.status;
      const estimateHours = patch.estimateHours ?? p.estimateHours;
      const reason = (patch.statusReason ?? p.statusReason)?.trim();
      const duplicateOf = patch.duplicateOf ?? p.duplicateOf;
      if (!PROPOSAL_STATUSES.includes(status)) throw new CommunityError('invalid', 'status');
      if (patch.estimateHours !== undefined && !(patch.estimateHours > 0)) throw new CommunityError('invalid', 'estimateHours');
      // Nada se abre a votación (ni avanza) sin un tiempo estimado asignado en la revisión.
      if (status !== 'received' && status !== 'discarded' && status !== 'duplicate' && !estimateHours) throw new CommunityError('invalid', 'estimateHours');
      if ((status === 'discarded' || status === 'duplicate') && !reason) throw new CommunityError('invalid', 'statusReason');
      if (status === 'duplicate' && (!duplicateOf || duplicateOf === id || !db.proposals.some((x) => x.id === duplicateOf))) {
        throw new CommunityError('invalid', 'duplicateOf');
      }
      const closed = status === 'discarded' || status === 'duplicate';
      Object.assign(p, {
        status, estimateHours,
        statusReason: closed ? reason : undefined,
        duplicateOf: status === 'duplicate' ? duplicateOf : undefined,
        links: patch.links ? { ...p.links, ...patch.links } : p.links,
        updatedAt: now(),
      });
      commit();
      return summarize(db, p);
    }),

  adminGetActivity: (id) =>
    call((db) => {
      find(db, id);
      return {
        votes: db.votes.filter((v) => v.proposalId === id).map((v) => ({ ...v })),
        donations: db.donations.filter((d) => d.proposalId === id).map((d) => ({ ...d })),
      };
    }),

  demo: {
    getSettings: () => ({ ...load().settings }),
    setSettings(patch) {
      const db = load();
      const next = { ...db.settings, ...patch };
      next.errorRate = Math.min(1, Math.max(0, next.errorRate));
      next.latencyMin = Math.max(0, next.latencyMin);
      next.latencyMax = Math.max(next.latencyMin, next.latencyMax);
      db.settings = next;
      commit();
      return { ...next };
    },
    reset: () => void reset(),
  },
};
