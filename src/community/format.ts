// Formato de valores del dominio comunitario, según el idioma actual.
import { intlLocale, tr } from '@/i18n';
import { fmt } from '@/lib/format';
import { findTool } from '@/tools';
import { COMMUNITY_CONFIG } from './config';
import { ERROR_LABELS } from './labels';
import { CommunityError, type CommunityErrorCode } from './types';

/** Una fecha sin hora ("2026-11-09") se toma como día local, no como medianoche UTC (que en América cae el día anterior). */
const toDate = (iso: string): Date => new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);

export const fmtDate = (iso: string): string => new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'medium' }).format(toDate(iso));

export const fmtDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));

export const fmtHours = (hours: number): string => `${fmt(hours, Number.isInteger(hours) ? 0 : 1)} h`;

export const fmtMoney = (amount: number): string =>
  new Intl.NumberFormat(intlLocale(), { style: 'currency', currency: COMMUNITY_CONFIG.currency, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);

export const fmtMinutes = (min: number, max: number): string => (min === max ? `${fmt(min)} min` : `${fmt(min)}–${fmt(max)} min`);

/** Puntaje con signo explícito para los aportes ("+3", "−2"). */
export const signed = (n: number): string => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : '0');

export const errorCode = (e: unknown): CommunityErrorCode => (e instanceof CommunityError ? e.code : 'network');

export const errorText = (e: unknown): string => tr(ERROR_LABELS[errorCode(e)]);

/** Nombre visible de una herramienta del registro; si ya no existe, su ruta. */
export const toolName = (path: string): string => {
  const tool = findTool(path);
  return tool ? tr(tool.name) : path;
};
