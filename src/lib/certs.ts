export type CertKey = 'A' | 'D' | 'AF' | 'AP' | 'B';

export const CERTS: Record<CertKey, { code: string; name: string }> = {
  A: { code: 'CCAO-F', name: 'Associate – Foundations' },
  D: { code: 'CCDV-F', name: 'Developer – Foundations' },
  AF: { code: 'CCAR-F', name: 'Architect – Foundations' },
  AP: { code: 'CCAR-P', name: 'Architect – Professional' },
  B: { code: 'Badge CC', name: 'Partner Badge – Claude Code' },
};

export const CERT_KEYS = Object.keys(CERTS) as CertKey[];
