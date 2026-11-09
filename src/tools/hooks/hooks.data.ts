import type { Localized } from '@/i18n';

/** Eventos de hook → qué acepta su matcher. `null` = el evento no usa matcher. */
export const HOOK_EVENTS: Record<string, Localized | null> = {
  PreToolUse: { es: 'nombre de tool (Bash, Edit|Write, mcp__.*)', en: 'tool name (Bash, Edit|Write, mcp__.*)' },
  PostToolUse: { es: 'nombre de tool', en: 'tool name' },
  PostToolUseFailure: { es: 'nombre de tool', en: 'tool name' },
  PermissionRequest: { es: 'nombre de tool', en: 'tool name' },
  UserPromptSubmit: null,
  Stop: null,
  SubagentStart: { es: 'tipo de agente', en: 'agent type' },
  SubagentStop: { es: 'tipo de agente', en: 'agent type' },
  SessionStart: { es: 'startup | resume | clear | compact', en: 'startup | resume | clear | compact' },
  SessionEnd: { es: 'clear | logout | other…', en: 'clear | logout | other…' },
  Notification: { es: 'permission_prompt | idle_prompt…', en: 'permission_prompt | idle_prompt…' },
  PreCompact: { es: 'manual | auto', en: 'manual | auto' },
  PostCompact: { es: 'manual | auto', en: 'manual | auto' },
};

export const supportsMatcher = (ev: string) => HOOK_EVENTS[ev] !== null;

export interface HookEntry { event: string; matcher: string; command: string; timeout?: number }

export const HOOK_TEMPLATES: Localized<(HookEntry & { label: string })[]> = {
  es: [
    { label: 'Formatear tras editar', event: 'PostToolUse', matcher: 'Edit|Write', command: "jq -r '.tool_input.file_path' | xargs npx prettier --write" },
    { label: 'Bloquear comandos peligrosos', event: 'PreToolUse', matcher: 'Bash', command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous.sh' },
    { label: 'Proteger .env', event: 'PreToolUse', matcher: 'Read|Edit|Write', command: "jq -r '.tool_input.file_path // empty' | grep -qE '(^|/)\\.env' && { echo 'Acceso a .env bloqueado por política' >&2; exit 2; } || exit 0" },
    { label: 'Contexto al iniciar', event: 'SessionStart', matcher: 'startup', command: 'git status --short; cat TODO.md 2>/dev/null' },
    { label: 'Exigir tests al terminar', event: 'Stop', matcher: '', command: "npm test --silent >/dev/null 2>&1 || { echo 'Los tests fallan: corrígelos antes de terminar' >&2; exit 2; }" },
    { label: 'Notificación de escritorio', event: 'Notification', matcher: 'permission_prompt', command: "notify-send 'Claude Code' 'Necesita tu aprobación'" },
  ],
  en: [
    { label: 'Format after editing', event: 'PostToolUse', matcher: 'Edit|Write', command: "jq -r '.tool_input.file_path' | xargs npx prettier --write" },
    { label: 'Block dangerous commands', event: 'PreToolUse', matcher: 'Bash', command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous.sh' },
    { label: 'Protect .env', event: 'PreToolUse', matcher: 'Read|Edit|Write', command: "jq -r '.tool_input.file_path // empty' | grep -qE '(^|/)\\.env' && { echo 'Access to .env blocked by policy' >&2; exit 2; } || exit 0" },
    { label: 'Context on startup', event: 'SessionStart', matcher: 'startup', command: 'git status --short; cat TODO.md 2>/dev/null' },
    { label: 'Require tests before finishing', event: 'Stop', matcher: '', command: "npm test --silent >/dev/null 2>&1 || { echo 'Tests are failing: fix them before finishing' >&2; exit 2; }" },
    { label: 'Desktop notification', event: 'Notification', matcher: 'permission_prompt', command: "notify-send 'Claude Code' 'Needs your approval'" },
  ],
};

const blockScript = (m: { header: string; blocked: string; blocks: string; noObjection: string }) => `#!/usr/bin/env bash
# ${m.header}
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$CMD" | grep -qE 'rm -rf (/|~|\\$HOME)|git push (-f|--force)|DROP TABLE'; then
  echo "${m.blocked}" >&2
  exit 2   # ${m.blocks}
fi
exit 0     # ${m.noObjection}

# chmod +x .claude/hooks/block-dangerous.sh`;

export const BLOCK_SCRIPT: Localized = {
  es: blockScript({
    header: 'PreToolUse (matcher: Bash). Recibe el JSON del evento por stdin.',
    blocked: "Bloqueado por política: '$CMD'. Proponé una alternativa segura.",
    blocks: 'bloquea; stderr vuelve a Claude',
    noObjection: 'sin objeción: sigue el flujo de permisos normal',
  }),
  en: blockScript({
    header: 'PreToolUse (matcher: Bash). Receives the event JSON on stdin.',
    blocked: "Blocked by policy: '$CMD'. Propose a safe alternative.",
    blocks: 'blocks; stderr goes back to Claude',
    noObjection: 'no objection: the normal permission flow continues',
  }),
};

/** Agrupa entradas en la estructura de settings.json → hooks. */
export function buildHooksConfig(entries: HookEntry[]) {
  const hooks: Record<string, { matcher?: string; hooks: { type: 'command'; command: string; timeout?: number }[] }[]> = {};
  for (const h of entries) {
    const arr = (hooks[h.event] ??= []);
    const matcher = supportsMatcher(h.event) ? h.matcher : '';
    let group = arr.find((g) => (g.matcher ?? '') === matcher);
    if (!group) {
      group = matcher ? { matcher, hooks: [] } : { hooks: [] };
      arr.push(group);
    }
    group.hooks.push(h.timeout ? { type: 'command', command: h.command, timeout: h.timeout } : { type: 'command', command: h.command });
  }
  return { hooks };
}
