import {
  LOG_REDACTION_MARKER,
  sanitizeHttpRequestLog,
  sanitizeHttpResponseLog,
} from './http-log-sanitizer';

describe('HTTP log sanitizers', () => {
  it('redacts cookies, authorization, admin keys, and OAuth codes', () => {
    const request = {
      url: '/api/auth/google/callback?code=oauth-code&state=csrf-state&scope=email',
      query: { code: 'oauth-code', state: 'csrf-state', scope: 'email' },
      headers: {
        authorization: 'Bearer token',
        cookie: 'access_token=token',
        'x-admin-key': 'admin-secret',
        accept: 'application/json',
      },
    };

    const sanitized = sanitizeHttpRequestLog(request);
    const serialized = JSON.stringify(sanitized);

    expect(serialized).not.toContain('oauth-code');
    expect(serialized).not.toContain('csrf-state');
    expect(serialized).not.toContain('Bearer token');
    expect(serialized).not.toContain('access_token=token');
    expect(serialized).not.toContain('admin-secret');
    expect(sanitized).toEqual({
      url: `/api/auth/google/callback?code=${encodeURIComponent(LOG_REDACTION_MARKER)}&state=${encodeURIComponent(LOG_REDACTION_MARKER)}&scope=email`,
      query: {
        code: LOG_REDACTION_MARKER,
        state: LOG_REDACTION_MARKER,
        scope: 'email',
      },
      headers: {
        authorization: LOG_REDACTION_MARKER,
        cookie: LOG_REDACTION_MARKER,
        'x-admin-key': LOG_REDACTION_MARKER,
        accept: 'application/json',
      },
    });
    expect(request.query.code).toBe('oauth-code');
  });

  it('redacts response cookies without changing other headers', () => {
    expect(
      sanitizeHttpResponseLog({
        statusCode: 302,
        headers: {
          'set-cookie': ['access_token=token'],
          location: '/dashboard',
        },
      }),
    ).toEqual({
      statusCode: 302,
      headers: {
        'set-cookie': LOG_REDACTION_MARKER,
        location: '/dashboard',
      },
    });
  });
});
