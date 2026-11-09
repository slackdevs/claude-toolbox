import type { Localized } from '@/i18n';

export interface RefRow { kind: string; value: string; meaning: string; action: string }

const rows = (r: string[][]): RefRow[] => r.map(([kind, value, meaning, action]) => ({ kind: kind!, value: value!, meaning: meaning!, action: action! }));

export const REFERENCE: Localized<RefRow[]> = {
  es: rows([
    ['HTTP 400', 'invalid_request_error', 'Formato o contenido del request inválido (campo faltante, roles mal alternados, tool_result sin tool_use previo).', 'No reintentar: corregir el request.'],
    ['HTTP 401', 'authentication_error', 'API key ausente o inválida.', 'Revisar header x-api-key / variable de entorno.'],
    ['HTTP 403', 'permission_error', 'La key no tiene permiso para ese recurso o modelo.', 'Revisar workspace y permisos en la consola.'],
    ['HTTP 404', 'not_found_error', 'Recurso o modelo inexistente (ID de modelo mal escrito).', 'Verificar el model ID.'],
    ['HTTP 413', 'request_too_large', 'El request supera el tamaño máximo permitido.', 'Reducir payload; usar Files API o dividir.'],
    ['HTTP 429', 'rate_limit_error', 'Se superó un límite de RPM, tokens de entrada o salida.', 'Reintento con backoff exponencial + jitter; respetar el header retry-after.'],
    ['HTTP 500', 'api_error', 'Error interno inesperado.', 'Reintentar con backoff.'],
    ['HTTP 529', 'overloaded_error', 'API temporalmente sobrecargada.', 'Reintentar con backoff; considerar fallback a otro modelo.'],
    ['stop_reason', 'end_turn', 'El modelo terminó su respuesta naturalmente.', 'Fin del loop agéntico (si no hay tool_use pendiente).'],
    ['stop_reason', 'max_tokens', 'Se alcanzó max_tokens: la respuesta está truncada.', 'Subir max_tokens o continuar la generación; validar JSON incompleto.'],
    ['stop_reason', 'stop_sequence', 'Apareció una de las stop_sequences.', 'Leer stop_sequence para saber cuál.'],
    ['stop_reason', 'tool_use', 'El modelo quiere ejecutar una o más herramientas.', 'Ejecutar tools, devolver tool_result y volver a llamar. Es la condición del loop agéntico.'],
    ['stop_reason', 'pause_turn', 'Un turno largo con server tools se pausó.', 'Reenviar la respuesta tal cual para que continúe.'],
    ['stop_reason', 'refusal', 'El modelo declinó responder por políticas de seguridad.', 'No reintentar igual; revisar el caso de uso o reformular.'],
    ['stop_reason', 'model_context_window_exceeded', 'Se agotó la ventana de contexto durante la generación.', 'Compactar contexto, resumir historial o dividir la tarea.'],
    ['Anti-patrón', 'parsear texto para terminar el loop', 'Detectar “terminé” en el texto en vez de usar stop_reason.', 'Controlar el loop con stop_reason, no con lenguaje natural.'],
    ['Anti-patrón', 'tool errors genéricos', 'Devolver “Error” sin contexto en tool_result.', 'Usar is_error: true con causa, si es reintentable y qué hacer.'],
  ]),
  en: rows([
    ['HTTP 400', 'invalid_request_error', 'Invalid request format or content (missing field, roles not alternating, tool_result without a preceding tool_use).', 'Do not retry: fix the request.'],
    ['HTTP 401', 'authentication_error', 'Missing or invalid API key.', 'Check the x-api-key header / environment variable.'],
    ['HTTP 403', 'permission_error', 'The key lacks permission for that resource or model.', 'Check the workspace and permissions in the console.'],
    ['HTTP 404', 'not_found_error', 'Resource or model does not exist (misspelled model ID).', 'Verify the model ID.'],
    ['HTTP 413', 'request_too_large', 'The request exceeds the maximum allowed size.', 'Shrink the payload; use the Files API or split it.'],
    ['HTTP 429', 'rate_limit_error', 'An RPM, input-token or output-token limit was exceeded.', 'Retry with exponential backoff + jitter; honor the retry-after header.'],
    ['HTTP 500', 'api_error', 'Unexpected internal error.', 'Retry with backoff.'],
    ['HTTP 529', 'overloaded_error', 'API temporarily overloaded.', 'Retry with backoff; consider falling back to another model.'],
    ['stop_reason', 'end_turn', 'The model finished its response naturally.', 'End of the agentic loop (if no tool_use is pending).'],
    ['stop_reason', 'max_tokens', 'max_tokens was reached: the response is truncated.', 'Raise max_tokens or continue generation; validate incomplete JSON.'],
    ['stop_reason', 'stop_sequence', 'One of the stop_sequences appeared.', 'Read stop_sequence to know which one.'],
    ['stop_reason', 'tool_use', 'The model wants to run one or more tools.', 'Run the tools, return tool_result and call again. This is the agentic loop condition.'],
    ['stop_reason', 'pause_turn', 'A long turn with server tools was paused.', 'Send the response back as-is so it continues.'],
    ['stop_reason', 'refusal', 'The model declined to respond due to safety policies.', 'Do not retry unchanged; review the use case or rephrase.'],
    ['stop_reason', 'model_context_window_exceeded', 'The context window ran out during generation.', 'Compact the context, summarize history or split the task.'],
    ['Anti-pattern', 'parsing text to end the loop', 'Detecting “I’m done” in the text instead of using stop_reason.', 'Drive the loop with stop_reason, not natural language.'],
    ['Anti-pattern', 'generic tool errors', 'Returning “Error” with no context in tool_result.', 'Use is_error: true with the cause, whether it is retryable and what to do.'],
  ]),
};
