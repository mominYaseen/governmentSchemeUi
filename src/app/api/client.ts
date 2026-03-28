import { getApiBaseUrl } from './config';
import type { ApiResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly envelope?: ApiResponse<unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** In-memory CSRF from response headers (needed when API is on another origin than the SPA). */
let csrfTokenMemo: string | null = null;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!m) return null;
  const raw = m[1].trim();
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function getCsrfTokenForRequest(): string | null {
  return csrfTokenMemo || readCookie('XSRF-TOKEN');
}

export function captureCsrfFromResponse(res: Response): void {
  const fromHeader =
    res.headers.get('X-CSRF-TOKEN') ||
    res.headers.get('X-XSRF-TOKEN') ||
    res.headers.get('XSRF-TOKEN');
  if (fromHeader) {
    csrfTokenMemo = fromHeader.trim();
  }
}

function joinUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

function mutatingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

async function parseJsonBody(res: Response): Promise<ApiResponse<unknown>> {
  const text = await res.text();
  if (!text.trim()) {
    return {
      success: res.ok,
      data: null,
      error: res.ok ? null : res.statusText,
    };
  }
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    throw new ApiError('Invalid response from server', res.status);
  }
}

/**
 * JSON request to the Spring API with `credentials: 'include'` (JSESSIONID).
 * After a priming GET (e.g. `/api/auth/status`), POST/DELETE send `X-XSRF-TOKEN` from `XSRF-TOKEN`.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = joinUrl(base, path);
  const method = (init?.method ?? 'GET').toUpperCase();

  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (init?.body != null && init.body !== '' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (mutatingMethod(method)) {
    const token = getCsrfTokenForRequest();
    if (token) {
      headers.set('X-XSRF-TOKEN', token);
    }
  }

  const res = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: 'include',
  });

  captureCsrfFromResponse(res);

  const envelope = await parseJsonBody(res);

  if (!res.ok) {
    throw new ApiError(
      (typeof envelope?.error === 'string' && envelope.error) ||
        res.statusText ||
        'Request failed',
      res.status,
      envelope
    );
  }

  if (!envelope.success) {
    throw new ApiError(
      (typeof envelope?.error === 'string' && envelope.error) || 'Request failed',
      res.status,
      envelope
    );
  }

  return envelope.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}
