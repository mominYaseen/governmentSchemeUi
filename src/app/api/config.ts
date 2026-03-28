/**
 * Spring API origin **without** a trailing slash, e.g. `http://localhost:8080`.
 * Use this for session cookies (`JSESSIONID`) and CSRF (`XSRF-TOKEN`) on the API host.
 * If unset, paths are relative (`/api/...`) and the Vite dev proxy can forward to :8080.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv != null && fromEnv !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  return '';
}
