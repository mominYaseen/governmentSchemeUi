import { useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../context/auth-context';
import { isSessionNotEstablishedError } from '../api/auth-api';
import { ApiError } from '../api/client';

const DEMO_EMAIL_HINT = 'johnDoe@example.com';
const DEMO_PASSWORD_HINT = 'doeJohn';

interface AuthLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful login (e.g. save the scheme that triggered the modal). */
  onSuccess?: () => void | Promise<void>;
  title?: string;
  description?: string;
}

export function AuthLoginDialog({
  open,
  onOpenChange,
  onSuccess,
  title = 'Sign in',
  description,
}: AuthLoginDialogProps) {
  const { loginWithDemo, loginWithGoogle, authWithGoogle, apiConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSessionError(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleDemoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const em = email.trim();
    if (!em || !password) {
      setError('Enter email and password.');
      return;
    }
    setSubmitting(true);
    setSessionError(false);
    try {
      await loginWithDemo(em, password);
      await onSuccess?.();
      resetForm();
      onOpenChange(false);
    } catch (err) {
      if (isSessionNotEstablishedError(err)) {
        setSessionError(true);
        setError(
          [
            err.message,
            '',
            import.meta.env.DEV
              ? 'Most often in dev: remove VITE_API_BASE_URL from .env and restart Vite so requests go to /api on this origin (Vite proxies to Spring). Cookies then stay on localhost:5173 and are sent on every request.'
              : 'Ensure the API sets a session cookie and that your hosting uses same-origin /api or correct CORS with credentials.',
            '',
            'If you keep VITE_API_BASE_URL=http://localhost:8080: CORS must allow your exact frontend origin (not *) with Access-Control-Allow-Credentials: true, and the session cookie must be valid for cross-origin credentialed requests.',
          ].join('\n')
        );
      } else {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Sign-in failed.';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const defaultDescription = authWithGoogle
    ? 'Use Google to bookmark schemes and open them later from My saved schemes.'
    : 'Log in to bookmark schemes and open them later from My saved schemes.';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? defaultDescription}</DialogDescription>
        </DialogHeader>

        {!apiConfigured && (
          <p className="text-xs text-muted-foreground">
            {import.meta.env.DEV ? (
              <>
                Set <code className="bg-muted px-1 rounded">VITE_API_BASE_URL</code> to your Spring origin (e.g.{' '}
                http://localhost:8080) so the session and CSRF cookies are set on the API host.
              </>
            ) : (
              'Sign-in is not available right now. Please try again later.'
            )}
          </p>
        )}

        {authWithGoogle ? (
          <>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Not now
              </Button>
              <Button type="button" onClick={() => loginWithGoogle()} disabled={!apiConfigured}>
                Sign in with Google
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={(e) => void handleDemoSubmit(e)} className="space-y-4">
            {error ? (
              <Alert variant={sessionError ? 'default' : 'destructive'}>
                <AlertDescription className="whitespace-pre-line text-sm">{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="auth-login-email">Email</Label>
              <Input
                id="auth-login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={submitting || !apiConfigured}
                placeholder={DEMO_EMAIL_HINT}
                aria-invalid={!!error && !sessionError}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-login-password">Password</Label>
              <Input
                id="auth-login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={submitting || !apiConfigured}
                placeholder="••••••••"
                aria-invalid={!!error && !sessionError}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Default demo account (unless the server overrides env):{' '}
              <span className="font-mono">{DEMO_EMAIL_HINT}</span> /{' '}
              <span className="font-mono">{DEMO_PASSWORD_HINT}</span>. For local development only.
            </p>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Not now
              </Button>
              <Button type="submit" disabled={submitting || !apiConfigured}>
                {submitting ? 'Signing in…' : 'Log in'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
