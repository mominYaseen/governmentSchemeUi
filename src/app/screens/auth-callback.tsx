import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { consumeAuthReturnPath } from '../api/auth-api';
import { useAuth } from '../context/auth-context';

export function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [message, setMessage] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await refresh();
        if (cancelled) return;
        if (ok) {
          toast.success('logged in successfully');
        }
        const dest = consumeAuthReturnPath();
        navigate(dest, { replace: true });
      } catch {
        if (!cancelled) {
          setMessage('Could not complete sign-in. Redirecting home…');
          setTimeout(() => navigate('/', { replace: true }), 1800);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refresh]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-center text-muted-foreground">{message}</p>
    </div>
  );
}
