export const HOOK_EVENTS: Record<string, string> = {
  PreToolUse: 'nombre de tool (Bash, Edit|Write, mcp__.*)',
  PostToolUse: 'nombre de tool',
  PostToolUseFailure: 'nombre de tool',
  PermissionRequest: 'nombre de tool',
  UserPromptSubmit: '— (sin matcher)',
  Stop: '— (sin matcher)',
  SubagentStart: 'tipo de agente',
  SubagentStop: 'tipo de agente',
  SessionStart: 'startup | resume | clear | compact',
  SessionEnd: 'clear | logout | other…',
  Notification: 'permission_prompt | idle_prompt…',
  PreCompact: 'manual | auto',
  PostCompact: 'manual | auto',
};

export const supportsMatcher = (ev: string) => !/sin matcher/.test(HOOK_EVENTS[ev] ?? '');

export interface HookEntry { event: string; matcher: string; command: string; timeout?: number }

export const HOOK_TEMPLATES: (HookEntry & { label: string })[] = [
  { label: 'Formatear tras editar', event: 'PostToolUse', matcher: 'Edit|Write', command: "jq -r '.tool_input.file_path' | xargs npx prettier --write" },
  { label: 'Bloquear comandos peligrosos', event: 'PreToolUse', matcher: 'Bash', command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous.sh' },
  { label: 'Proteger .env', event: 'PreToolUse', matcher: 'Read|Edit|Write', command: "jq -r '.tool_input.file_path // empty' | grep -qE '(^|/)\\.env' && { echo 'Acceso a .env bloqueado por política' >&2; exit 2; } || exit 0" },
  { label: 'Contexto al iniciar', event: 'SessionStart', matcher: 'startup', command: 'git status --short; cat TODO.md 2>/dev/null' },
  { label: 'Exigir tests al terminar', event: 'Stop', matcher: '', command: "npm test --silent >/dev/null 2>&1 || { echo 'Los tests fallan: corrígelos antes de terminar' >&2; exit 2; }" },
  { label: 'Notificación de escritorio', event: 'Notification', matcher: 'permission_prompt', command: "notify-send 'Claude Code' 'Necesita tu aprobación'" },
];

export const BLOCK_SCRIPT = `#!/usr/bin/env bash
# PreToolUse (matcher: Bash). Recibe el JSON del evento por stdin.
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$CMD" | grep -qE 'rm -rf (/|~|\\$HOME)|git push (-f|--force)|DROP TABLE'; then
  echo "Bloqueado por política: '$CMD'. Proponé una alternativa segura." >&2
  exit 2   # bloquea; stderr vuelve a Claude
fi
exit 0     # sin objeción: sigue el flujo de permisos normal

# chmod +x .claude/hooks/block-dangerous.sh`;

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
