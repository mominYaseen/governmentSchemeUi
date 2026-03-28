/**
 * Base URL for API calls. In dev, leave unset to use Vite proxy (`/api` → localhost:8080).
 * For production or direct backend access: `VITE_API_BASE_URL=http://localhost:8080`
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv != null && fromEnv !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  return '';
}
