import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { fetchHealth } from '../api/schemes-api';

/**
 * Dev-only strip showing backend connectivity (GET /api/health).
 * Hidden in production builds.
 */
export function DevHealthBanner() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;
    fetchHealth()
      .then((data) => {
        if (cancelled) return;
        const s = data && typeof data.status === 'string' ? data.status : 'UP';
        setStatus('ok');
        setDetail(s);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus('err');
        setDetail(e instanceof ApiError ? e.message : 'Unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div
      className={`text-center text-xs py-1.5 px-2 border-b ${
        status === 'ok'
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : status === 'err'
            ? 'bg-amber-50 text-amber-950 border-amber-200'
            : 'bg-muted/50 text-muted-foreground border-border'
      }`}
      role="status"
    >
      {status === 'idle' && <span>Checking API (/api/health)…</span>}
      {status === 'ok' && (
        <span>
          API: <strong className="font-medium">{detail}</strong> (dev)
        </span>
      )}
      {status === 'err' && (
        <span>
          API offline or error: {detail}. Start backend or set <code className="text-[11px]">VITE_API_BASE_URL</code>.
        </span>
      )}
    </div>
  );
}
