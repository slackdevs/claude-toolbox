export type LintLevel = 'ok' | 'warn' | 'bad';
/** Mensaje de revisión. El texto admite HTML propio; escapá siempre el input del usuario con esc(). */
export type Lint = [LintLevel, string];
