// Persistencia del backend simulado: un único documento versionado en localStorage.
// Si cambia la versión (o el contenido no se puede leer) se vuelve a los datos de ejemplo.
import type { DemoSettings, Donation, Proposal, Vote, Voter } from '../types';
import { seed } from './seed';

export const STORE_KEY = 'ct-community-v1';
const VERSION = 2;

export interface StoreData {
  version: number;
  proposals: Proposal[];
  votes: Vote[];
  donations: Donation[];
  voters: Voter[];
  /** Email de la sesión de este navegador (equivale a la cookie de la API real). */
  session: string | null;
  /** token → email, para la verificación simulada. */
  verifications: Record<string, string>;
  settings: DemoSettings;
}

export const DEFAULT_SETTINGS: DemoSettings = { errorRate: 0, latencyMin: 200, latencyMax: 600 };

const fresh = (): StoreData => ({ version: VERSION, ...seed(), session: null, verifications: {}, settings: { ...DEFAULT_SETTINGS } });

let data: StoreData | undefined;

function read(): StoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreData;
      if (parsed?.version === VERSION && Array.isArray(parsed.proposals)) return parsed;
    }
  } catch {
    /* sin storage o contenido corrupto: se usan los datos de ejemplo */
  }
  return fresh();
}

/** Estado actual (en memoria; se carga una vez). Tras modificarlo hay que llamar a `commit()`. */
export function load(): StoreData {
  return (data ??= read());
}

export function commit(): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(load()));
  } catch {
    /* sin storage: los cambios viven sólo en memoria */
  }
}

/** Restablece los datos de ejemplo. Conserva los ajustes de la demo (latencia, errores). */
export function reset(): StoreData {
  const settings = load().settings;
  data = { ...fresh(), settings };
  commit();
  return data;
}
