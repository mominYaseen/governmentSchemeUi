import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bookmark, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import type { SavedSchemeEntry } from '../api/types';
import { fetchSchemeById } from '../api/schemes-api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AuthLoginDialog } from '../components/auth-login-dialog';

function textOrNull(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

function SavedSchemeRow({ entry }: { entry: SavedSchemeEntry }) {
  const { unsaveScheme } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);
  const [removing, setRemoving] = useState(false);
  const id = String(entry.schemeId);

  useEffect(() => {
    let cancelled = false;
    setLoadingName(true);
    fetchSchemeById(id)
      .then((d) => {
        if (!cancelled) setName(textOrNull(d.name));
      })
      .catch(() => {
        if (!cancelled) setName(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingName(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground line-clamp-2">
          {loadingName ? (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </span>
          ) : (
            name ?? `Scheme ${id}`
          )}
        </p>
        <p className="text-xs text-muted-foreground font-mono truncate mt-1">{id}</p>
        {entry.remindEnabled === true && (
          <span className="text-xs text-primary mt-2 inline-block">Reminders on</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/scheme/${encodeURIComponent(id)}`}>Open in app</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={removing}
          onClick={() => {
            setRemoving(true);
            void unsaveScheme(id).finally(() => setRemoving(false));
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
    </Card>
  );
}

export function SavedSchemes() {
  const { isSignedIn, savedEntries, loading, apiConfigured } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Alert>
          <AlertTitle>Sign in required</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Log in to view schemes you have saved.</p>
            <Button onClick={() => setLoginOpen(true)} disabled={!apiConfigured}>
              Sign in
            </Button>
            {!apiConfigured && (
              <p className="text-xs text-muted-foreground">
                {import.meta.env.DEV ? (
                  <>
                    Set <code className="bg-muted px-1 rounded">VITE_API_BASE_URL</code> to your Spring API origin
                    (e.g. http://localhost:8080).
                  </>
                ) : (
                  'Sign-in is not available right now. Please try again later.'
                )}
              </p>
            )}
          </AlertDescription>
        </Alert>
        <AuthLoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          title="Sign in to view saved schemes"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My saved schemes</h1>
          <p className="text-sm text-muted-foreground">Schemes you bookmarked while signed in.</p>
        </div>
      </div>

      {savedEntries.length === 0 ? (
        <Alert>
          <AlertTitle>No saved schemes yet</AlertTitle>
          <AlertDescription>
            Use the heart on a scheme card or detail page to save schemes here.{' '}
            <Link to="/catalog" className="text-primary underline">
              Browse the catalog
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {savedEntries.map((entry) => (
            <li key={String(entry.schemeId)}>
              <SavedSchemeRow entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
