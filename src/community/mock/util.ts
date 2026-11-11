// Utilidades del mock. Nada de esto es criptográfico: la API real usará un hash con sal del lado del servidor.

/** FNV-1a de 32 bits. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const emailHash = (email: string): string => hash32(normalizeEmail(email)).toString(16).padStart(8, '0');

const REGIONS = ['AR-C', 'AR-B', 'AR-X', 'UY-MO', 'CL-RM', 'MX-CMX', 'CO-DC', 'ES-MD', 'US-CA'];

/** IP simulada, estable por email. 203.0.113.0/24 es un rango reservado para documentación (RFC 5737). */
export const fakeIp = (email: string): string => `203.0.113.${1 + (hash32(normalizeEmail(email)) % 254)}`;

/** Región simulada (ISO 3166-2), estable por email. */
export const fakeRegion = (email: string): string => REGIONS[hash32(`r:${normalizeEmail(email)}`) % REGIONS.length]!;

export const randomId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
