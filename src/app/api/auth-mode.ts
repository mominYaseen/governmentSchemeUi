/**
 * Default: demo email/password (`POST /api/auth/login`).
 * Set `VITE_AUTH_MODE=oauth2` for Google redirect (`/oauth2/authorization/google`).
 */
export function isGoogleAuthMode(): boolean {
  return import.meta.env.VITE_AUTH_MODE === 'oauth2';
}
