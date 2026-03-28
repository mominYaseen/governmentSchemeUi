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

function joinUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

/**
 * JSON request; unwraps `ApiResponse<T>` and returns `data`.
 * On HTTP or logical failure (`success === false`), throws ApiError.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = joinUrl(base, path);

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const res = await fetch(url, { ...init, headers });

  let envelope: ApiResponse<unknown>;
  try {
    envelope = (await res.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError('Invalid response from server', res.status);
  }

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
