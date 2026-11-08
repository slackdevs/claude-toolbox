export interface RefRow { kind: string; value: string; meaning: string; action: string }

export const REFERENCE: RefRow[] = [
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
].map(([kind, value, meaning, action]) => ({ kind: kind!, value: value!, meaning: meaning!, action: action! }));
