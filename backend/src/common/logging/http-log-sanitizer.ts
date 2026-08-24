export const LOG_REDACTION_MARKER = '[Redacted]';

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-admin-key',
]);

const SENSITIVE_QUERY_NAMES = new Set([
  'access_token',
  'client_secret',
  'code',
  'id_token',
  'password',
  'refresh_token',
  'session_state',
  'state',
  'token',
]);

type LogRecord = Record<string, unknown>;

function sanitizeEntries(
  value: unknown,
  sensitiveNames: ReadonlySet<string>,
): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as LogRecord).map(([key, entry]) => [
      key,
      sensitiveNames.has(key.toLowerCase()) ? LOG_REDACTION_MARKER : entry,
    ]),
  );
}

function sanitizeUrl(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  try {
    const url = new URL(value, 'http://logger.invalid');
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_QUERY_NAMES.has(key.toLowerCase())) {
        url.searchParams.set(key, LOG_REDACTION_MARKER);
      }
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}

export function sanitizeHttpRequestLog(request: LogRecord): LogRecord {
  return {
    ...request,
    url: sanitizeUrl(request.url),
    query: sanitizeEntries(request.query, SENSITIVE_QUERY_NAMES),
    headers: sanitizeEntries(request.headers, SENSITIVE_HEADER_NAMES),
  };
}

export function sanitizeHttpResponseLog(response: LogRecord): LogRecord {
  return {
    ...response,
    headers: sanitizeEntries(response.headers, SENSITIVE_HEADER_NAMES),
  };
}
