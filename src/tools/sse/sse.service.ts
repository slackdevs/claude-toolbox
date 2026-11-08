export interface SseBlock { type: string; name?: string; text: string; json: string; thinking: string }
export interface SseSummary {
  events: number;
  blocks: [string, SseBlock][];
  counts: Record<string, number>;
  errors: string[];
  stopReason: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

/** Parsea un stream SSE crudo de la Messages API y reconstruye el mensaje. */
export function parseSse(raw: string): SseSummary | null {
  const evs: { event?: string; data?: string }[] = [];
  let cur: { event?: string; data?: string } = {};
  for (const ln of raw.split(/\r?\n/)) {
    if (ln.startsWith('event:')) cur.event = ln.slice(6).trim();
    else if (ln.startsWith('data:')) cur.data = (cur.data ?? '') + ln.slice(5).trim();
    else if (!ln.trim() && (cur.event || cur.data)) {
      evs.push(cur);
      cur = {};
    }
  }
  if (cur.event || cur.data) evs.push(cur);
  if (!evs.length) return null;

  const blocks: Record<string, SseBlock> = {};
  const counts: Record<string, number> = {};
  const errors: string[] = [];
  let stopReason = '—', inputTokens = 0, outputTokens = 0, model = '';

  evs.forEach((e, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let d: any;
    try {
      d = JSON.parse(e.data || '{}');
    } catch {
      errors.push(`Evento ${i + 1}: JSON inválido`);
      return;
    }
    const type: string = d.type || e.event || '?';
    counts[type] = (counts[type] ?? 0) + 1;
    if (type === 'message_start') {
      inputTokens = d.message?.usage?.input_tokens ?? 0;
      model = d.message?.model ?? '';
    }
    if (type === 'content_block_start') {
      blocks[d.index] = { type: d.content_block?.type, name: d.content_block?.name, text: d.content_block?.text ?? '', json: '', thinking: '' };
    }
    if (type === 'content_block_delta') {
      const b = (blocks[d.index] ??= { type: '?', text: '', json: '', thinking: '' });
      const dl = d.delta ?? {};
      if (dl.type === 'text_delta') b.text += dl.text;
      if (dl.type === 'input_json_delta') b.json += dl.partial_json;
      if (dl.type === 'thinking_delta') b.thinking += dl.thinking;
    }
    if (type === 'message_delta') {
      stopReason = d.delta?.stop_reason ?? stopReason;
      outputTokens = d.usage?.output_tokens ?? outputTokens;
    }
    if (type === 'error') errors.push(`Error de API: ${d.error?.type} — ${d.error?.message}`);
  });

  return { events: evs.length, blocks: Object.entries(blocks), counts, errors, stopReason, inputTokens, outputTokens, model };
}

export function blockContent(b: SseBlock): string {
  if (b.type === 'tool_use') {
    try {
      return JSON.stringify(JSON.parse(b.json || '{}'), null, 2);
    } catch {
      return b.json + '\n⚠ JSON parcial/incompleto';
    }
  }
  return b.type === 'thinking' ? b.thinking : b.text;
}

export const SSE_SAMPLE = `event: message_start
data: {"type":"message_start","message":{"id":"msg_01","type":"message","role":"assistant","model":"claude-sonnet-5-5","content":[],"stop_reason":null,"usage":{"input_tokens":412,"output_tokens":1}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Voy a consultar "}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"el clima."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: content_block_start
data: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_01","name":"get_weather","input":{}}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"city\\": \\"Buen"}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"os Aires\\"}"}}

event: content_block_stop
data: {"type":"content_block_stop","index":1}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"tool_use","stop_sequence":null},"usage":{"output_tokens":58}}

event: message_stop
data: {"type":"message_stop"}`;
