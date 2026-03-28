import { getApiBaseUrl } from './config';
import { apiDelete, apiPost, captureCsrfFromResponse } from './client';
import type { ApiResponse, AuthStatusData, DemoLoginUserDto, MeDto, SavedSchemeEntry } from './types';

const AUTH_RETURN_KEY = 'scheme-navigator:auth-return';

export type SessionNotEstablishedPhase = 'status';

/** Thrown when login succeeds but `GET /api/auth/status` never reports `authenticated: true`. */
export class SessionNotEstablishedError extends Error {
  readonly code = 'SESSION_NOT_ESTABLISHED' as const;
  readonly phase: SessionNotEstablishedPhase;
  constructor(phase: SessionNotEstablishedPhase = 'status') {
    super('Login succeeded, but the server did not see an authenticated session.');
    this.name = 'SessionNotEstablishedError';
    this.phase = phase;
  }
}

/** Map demo login payload to `MeDto` when `GET /api/me` is unavailable but the session is valid. */
export function demoLoginDtoToMe(dto: DemoLoginUserDto): MeDto {
  return {
    email: dto.email,
    name: dto.displayName,
    displayName: dto.displayName,
    sub: dto.id,
  };
}

const authFetchHeaders: HeadersInit = {
  Accept: 'application/json',
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
};

export function isSessionNotEstablishedError(e: unknown): e is SessionNotEstablishedError {
  return e instanceof SessionNotEstablishedError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * After login, the browser applies `Set-Cookie` asynchronously; Spring may also rotate the session.
 * Brief initial delay, then poll `GET /api/auth/status` until `data.authenticated === true`.
 */
export async function waitForAuthenticatedAfterLogin(options?: {
  maxAttempts?: number;
  delayMs?: number;
  /** Wait before the first status check so JSESSIONID is stored (default 120ms). */
  initialDelayMs?: number;
}): Promise<boolean> {
  const maxAttempts = options?.maxAttempts ?? 20;
  const delayMs = options?.delayMs ?? 120;
  const initialDelayMs = options?.initialDelayMs ?? 120;
  await sleep(initialDelayMs);
  for (let i = 0; i < maxAttempts; i++) {
    const { authenticated } = await fetchAuthStatus();
    if (authenticated) return true;
    if (i < maxAttempts - 1) await sleep(delayMs);
  }
  return false;
}

/** Absolute API URL or same-origin path (e.g. `/api/...` when using Vite proxy). */
export function resolveApiPath(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export function getApiOriginOrEmpty(): string {
  return getApiBaseUrl().replace(/\/$/, '');
}

/** Full browser navigation — requires API origin (not empty). */
export function getGoogleOAuthUrl(): string | null {
  const o = getApiOriginOrEmpty();
  return o ? `${o}/oauth2/authorization/google` : null;
}

export function getLogoutUrl(): string | null {
  const o = getApiOriginOrEmpty();
  return o ? `${o}/logout` : null;
}

export function storeAuthReturnPath(pathWithSearch: string): void {
  try {
    sessionStorage.setItem(AUTH_RETURN_KEY, pathWithSearch || '/');
  } catch {
    /* ignore */
  }
}

export function consumeAuthReturnPath(): string {
  try {
    const v = sessionStorage.getItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    return v && v.startsWith('/') ? v : '/';
  } catch {
    return '/';
  }
}

export function beginGoogleLogin(): void {
  const url = getGoogleOAuthUrl();
  if (!url) {
    return;
  }
  storeAuthReturnPath(`${window.location.pathname}${window.location.search}`);
  window.location.assign(url);
}

/**
 * Prefer `VITE_API_BASE_URL` for session cookies on the API host.
 * In dev, allow the Vite `/api` proxy (empty base) so sign-in still works locally.
 */
export function hasApiOriginConfigured(): boolean {
  if (getApiOriginOrEmpty().length > 0) return true;
  return import.meta.env.DEV;
}

/**
 * Session probe: always 200, `data.authenticated`. Primes `XSRF-TOKEN` for mutating requests.
 */
export async function fetchAuthStatus(): Promise<{ authenticated: boolean }> {
  const url = resolveApiPath('/api/auth/status');
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: authFetchHeaders,
    });
    captureCsrfFromResponse(res);
    const text = await res.text();
    if (!text.trim() || !res.ok) {
      return { authenticated: false };
    }
    let envelope: ApiResponse<AuthStatusData>;
    try {
      envelope = JSON.parse(text) as ApiResponse<AuthStatusData>;
    } catch {
      return { authenticated: false };
    }
    if (envelope.success === false && envelope.data == null) {
      return { authenticated: false };
    }
    const data = envelope.data;
    if (data != null && typeof data.authenticated === 'boolean') {
      return { authenticated: data.authenticated };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

/** Before POST/DELETE: same as `fetchAuthStatus` (one GET issues CSRF cookie). */
export async function primeCsrfCookie(): Promise<void> {
  await fetchAuthStatus();
}

/**
 * Demo session login. Primes CSRF via auth status, then POST JSON body.
 * Errors come from this response only (handled by caller).
 */
export async function loginDemo(email: string, password: string): Promise<DemoLoginUserDto> {
  await fetchAuthStatus();
  return apiPost<DemoLoginUserDto>('/api/auth/login', { email: email.trim(), password });
}

/** End demo session. */
export async function logoutDemoSession(): Promise<void> {
  await fetchAuthStatus();
  await apiPost<unknown>('/api/auth/logout', {});
}

/**
 * Profile when session is known to be authenticated (do not use alone to detect “logged out”).
 */
export async function fetchCurrentUser(): Promise<MeDto | null> {
  const res = await fetch(resolveApiPath('/api/me'), {
    method: 'GET',
    credentials: 'include',
    headers: authFetchHeaders,
  });
  captureCsrfFromResponse(res);

  if (res.status === 401) {
    return null;
  }

  const text = await res.text();
  if (!text.trim()) {
    return null;
  }

  let envelope: { success?: boolean; data?: MeDto | null; error?: string | null };
  try {
    envelope = JSON.parse(text) as typeof envelope;
  } catch {
    return null;
  }

  if (!res.ok || !envelope.success) {
    return null;
  }

  return (envelope.data ?? null) as MeDto | null;
}

/**
 * Saved schemes when authenticated. 401 → empty list (not a “login failure”).
 */
export async function fetchSavedSchemes(): Promise<SavedSchemeEntry[]> {
  const res = await fetch(resolveApiPath('/api/me/saved-schemes'), {
    method: 'GET',
    credentials: 'include',
    headers: authFetchHeaders,
  });
  captureCsrfFromResponse(res);

  if (res.status === 401) {
    return [];
  }

  const text = await res.text();
  if (!text.trim()) {
    return [];
  }

  let envelope: { success?: boolean; data?: SavedSchemeEntry[] | null; error?: string | null };
  try {
    envelope = JSON.parse(text) as typeof envelope;
  } catch {
    return [];
  }

  if (!res.ok || !envelope.success) {
    return [];
  }

  const data = envelope.data;
  if (!data) return [];
  return Array.isArray(data) ? data : [];
}

export async function saveSchemeToProfile(schemeId: string): Promise<void> {
  await fetchAuthStatus();
  await apiPost<unknown>('/api/me/saved-schemes', { schemeId });
}

export async function removeSavedScheme(schemeId: string): Promise<void> {
  await fetchAuthStatus();
  const id = encodeURIComponent(schemeId);
  await apiDelete(`/api/me/saved-schemes/${id}`);
}

export async function refreshSessionBootstrap(): Promise<void> {
  const { authenticated } = await fetchAuthStatus();
  if (authenticated) {
    await fetchCurrentUser();
  }
}
