// Funciones puras del ranking. La fórmula es pública: score = upvotes − downvotes + donationPoints.
import { COMMUNITY_CONFIG, type TierConfig } from './config';
import { DONATION_TIERS, type DonationTier, type MinutesRange, type TierCounts } from './types';

type Tiers = Record<DonationTier, TierConfig>;

export const emptyTierCounts = (): TierCounts => ({ coffee: 0, beer: 0, pizza: 0 });

/** Puntos que aportan las donaciones confirmadas. TODO: la fórmula definitiva está a definir (ver config.ts). */
export function donationPoints(counts: TierCounts, tiers: Tiers = COMMUNITY_CONFIG.tiers): number {
  return DONATION_TIERS.reduce((sum, t) => sum + counts[t] * tiers[t].points, 0);
}

export function donatedAmount(counts: TierCounts, tiers: Tiers = COMMUNITY_CONFIG.tiers): number {
  return DONATION_TIERS.reduce((sum, t) => sum + counts[t] * tiers[t].amount, 0);
}

/** Tiempo de desarrollo orientativo. Los consumos sin equivalencia definida no suman y se informan aparte. */
export function donatedMinutes(counts: TierCounts, tiers: Tiers = COMMUNITY_CONFIG.tiers): MinutesRange {
  const range: MinutesRange = { min: 0, max: 0, undefinedTiers: [] };
  for (const t of DONATION_TIERS) {
    if (!counts[t]) continue;
    const minutes = tiers[t].minutes;
    if (!minutes) range.undefinedTiers.push(t);
    else {
      range.min += counts[t] * minutes[0];
      range.max += counts[t] * minutes[1];
    }
  }
  return range;
}

export function computeScore(upvotes: number, downvotes: number, counts: TierCounts, tiers: Tiers = COMMUNITY_CONFIG.tiers): number {
  return upvotes - downvotes + donationPoints(counts, tiers);
}

export interface ScoreBreakdown {
  upvotes: number;
  downvotes: number;
  votesNet: number;
  donationPoints: number;
  score: number;
}

export function scoreBreakdown(p: { upvotes: number; downvotes: number; donationPoints: number }): ScoreBreakdown {
  const votesNet = p.upvotes - p.downvotes;
  return { upvotes: p.upvotes, downvotes: p.downvotes, votesNet, donationPoints: p.donationPoints, score: votesNet + p.donationPoints };
}

type Rankable = { score: number; createdAt: string };

/** Orden del ranking: mayor puntaje primero; ante empate, la propuesta más antigua primero. */
export const compareRanking = (a: Rankable, b: Rankable): number => b.score - a.score || a.createdAt.localeCompare(b.createdAt);

export const compareNewest = (a: { createdAt: string }, b: { createdAt: string }): number => b.createdAt.localeCompare(a.createdAt);

export const compareDonated = (a: Rankable & { donatedAmount: number }, b: Rankable & { donatedAmount: number }): number =>
  b.donatedAmount - a.donatedAmount || compareRanking(a, b);
