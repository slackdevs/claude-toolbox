// Registro de cheatsheets: uno por credencial. El contenido se suma en la fase de cheatsheets.
import { CERT_KEYS, type CertKey } from '@/lib/certs';

export interface Cheatsheet {
  cert: CertKey;
  /** Segmento de la URL: /cheatsheets/<slug>/ */
  slug: string;
}

const SLUGS: Record<CertKey, string> = { A: 'ccao-f', D: 'ccdv-f', AF: 'ccar-f', AP: 'ccar-p', B: 'badge-cc' };

export const cheatsheets: Cheatsheet[] = CERT_KEYS.map((cert) => ({ cert, slug: SLUGS[cert] }));

export const findCheatsheet = (slug: string) => cheatsheets.find((c) => c.slug === slug);

export const cheatsheetPath = (cert: CertKey) => `/cheatsheets/${SLUGS[cert]}`;
