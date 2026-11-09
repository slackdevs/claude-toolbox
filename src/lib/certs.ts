import badgeA from '@/assets/badges/CCAO-F.png';
import badgeAF from '@/assets/badges/CCAR-F.png';
import badgeAP from '@/assets/badges/CCAR-P.png';
import badgeD from '@/assets/badges/CCDV-F.png';
import badgeB from '@/assets/badges/claude-code.png';

export type CertKey = 'A' | 'D' | 'AF' | 'AP' | 'B';
export type BrandColor = 'amber' | 'purple' | 'cyan';

// Colores alineados con las tarjetas de credenciales de slackdevs.com.
export const CERTS: Record<CertKey, { code: string; name: string; color: BrandColor; badge: string }> = {
  A: { code: 'CCAO-F', name: 'Associate – Foundations', color: 'amber', badge: badgeA },
  D: { code: 'CCDV-F', name: 'Developer – Foundations', color: 'purple', badge: badgeD },
  AF: { code: 'CCAR-F', name: 'Architect – Foundations', color: 'amber', badge: badgeAF },
  AP: { code: 'CCAR-P', name: 'Architect – Professional', color: 'cyan', badge: badgeAP },
  B: { code: 'Badge CC', name: 'Partner Badge – Claude Code', color: 'cyan', badge: badgeB },
};

export const CERT_KEYS = Object.keys(CERTS) as CertKey[];
