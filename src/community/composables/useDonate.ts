// Estado del diálogo de donación (una sola instancia, en CommunityHost).
import { reactive } from 'vue';
import type { DonationTier, ProposalSummary } from '../types';

export const donateDialog = reactive<{ open: boolean; proposal: ProposalSummary | null; tier: DonationTier }>({
  open: false,
  proposal: null,
  tier: 'coffee',
});

export function openDonate(proposal: ProposalSummary, tier: DonationTier = 'coffee') {
  donateDialog.proposal = proposal;
  donateDialog.tier = tier;
  donateDialog.open = true;
}
