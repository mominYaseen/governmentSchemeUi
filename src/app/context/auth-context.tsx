import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MeDto, SavedSchemeEntry } from '../api/types';
import {
  beginGoogleLogin,
  fetchAuthStatus,
  fetchCurrentUser,
  fetchSavedSchemes,
  getLogoutUrl,
  hasApiOriginConfigured,
  demoLoginDtoToMe,
  loginDemo,
  logoutDemoSession,
  removeSavedScheme,
  saveSchemeToProfile,
  SessionNotEstablishedError,
  waitForAuthenticatedAfterLogin,
} from '../api/auth-api';
import { isGoogleAuthMode } from '../api/auth-mode';
import { ApiError } from '../api/client';
import { toast } from 'sonner';

export interface AuthContextValue {
  user: MeDto | null;
  savedEntries: SavedSchemeEntry[];
  loading: boolean;
  isSignedIn: boolean;
  /** Reload session from the API. Returns whether the user is signed in after refresh. */
  refresh: () => Promise<boolean>;
  /** Demo email/password (default auth). */
  loginWithDemo: (email: string, password: string) => Promise<void>;
  /** Full-page Google OAuth when `VITE_AUTH_MODE=oauth2`. */
  loginWithGoogle: () => void;
  /** Demo: POST `/api/auth/logout`. OAuth: navigate to Spring `/logout`. */
  logout: () => void;
  isSchemeSaved: (id: string) => boolean;
  saveScheme: (id: string) => Promise<void>;
  unsaveScheme: (id: string) => Promise<void>;
  /** Session + API reachable (see `hasApiOriginConfigured`). */
  apiConfigured: boolean;
  /** True when `VITE_AUTH_MODE=oauth2` (Google redirect instead of demo form). */
  authWithGoogle: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeDto | null>(null);
  const [savedEntries, setSavedEntries] = useState<SavedSchemeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const authWithGoogle = isGoogleAuthMode();
  const apiConfigured = hasApiOriginConfigured();

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { authenticated } = await fetchAuthStatus();
      if (!authenticated) {
        setUser(null);
        setSavedEntries([]);
        return false;
      }

      const me = await fetchCurrentUser();
      if (!me) {
        setUser(null);
        setSavedEntries([]);
        return false;
      }

      setUser(me);
      const list = await fetchSavedSchemes();
      setSavedEntries(list);
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginWithDemo = useCallback(async (email: string, password: string) => {
    const dto = await loginDemo(email, password);
    const sessionOk = await waitForAuthenticatedAfterLogin();
    if (!sessionOk) {
      throw new SessionNotEstablishedError('status');
    }

    setLoading(true);
    try {
      const { authenticated } = await fetchAuthStatus();
      if (!authenticated) {
        throw new SessionNotEstablishedError('status');
      }

      const me = (await fetchCurrentUser()) ?? demoLoginDtoToMe(dto);
      const list = await fetchSavedSchemes();
      setUser(me);
      setSavedEntries(list);
      toast.success('logged in successfully');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    beginGoogleLogin();
  }, []);

  const logout = useCallback(() => {
    if (authWithGoogle) {
      const u = getLogoutUrl();
      if (u) {
        setUser(null);
        setSavedEntries([]);
        window.location.assign(u);
      }
      return;
    }
    void (async () => {
      try {
        await logoutDemoSession();
      } catch {
        /* still clear local UI */
      }
      setUser(null);
      setSavedEntries([]);
    })();
  }, [authWithGoogle]);

  const savedIds = useMemo(
    () => new Set(savedEntries.map((e) => String(e.schemeId)).filter(Boolean)),
    [savedEntries]
  );

  const isSchemeSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const saveScheme = useCallback(
    async (id: string) => {
      await saveSchemeToProfile(id);
      await refresh();
    },
    [refresh]
  );

  const unsaveScheme = useCallback(
    async (id: string) => {
      await removeSavedScheme(id);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      savedEntries,
      loading,
      isSignedIn: user != null,
      refresh,
      loginWithDemo,
      loginWithGoogle,
      logout,
      isSchemeSaved,
      saveScheme,
      unsaveScheme,
      apiConfigured,
      authWithGoogle,
    }),
    [
      user,
      savedEntries,
      loading,
      refresh,
      loginWithDemo,
      loginWithGoogle,
      logout,
      isSchemeSaved,
      saveScheme,
      unsaveScheme,
      apiConfigured,
      authWithGoogle,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function isAuthUnauthorizedError(e: unknown): boolean {
  return e instanceof ApiError && e.status === 401;
}

export { isSessionNotEstablishedError } from '../api/auth-api';
