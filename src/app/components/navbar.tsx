import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Shield,
  Home,
  BookOpen,
  Sparkles,
  MessageSquareText,
  Bookmark,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useAuth } from '../context/auth-context';
import { AuthLoginDialog } from './auth-login-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/catalog', label: 'Catalog', icon: BookOpen },
  { to: '/recommend', label: 'My details', icon: Sparkles },
  { to: '/match', label: 'Describe', icon: MessageSquareText },
] as const;

export function Navbar() {
  const location = useLocation();
  const { user, isSignedIn, loading, logout, apiConfigured } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const displayName =
    (user?.name as string | undefined)?.trim() ||
    (user?.displayName as string | undefined)?.trim() ||
    user?.email ||
    'Account';
  const initial = displayName.charAt(0).toUpperCase();
  const picture = typeof user?.picture === 'string' ? user.picture : undefined;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-lg text-primary leading-none truncate">
                  Scheme Navigator
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">Government schemes</span>
              </div>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
              {nav.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Button
                    key={to}
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn('min-h-10', active && 'pointer-events-none')}
                    asChild
                  >
                    <Link to={to} className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline">{label}</span>
                    </Link>
                  </Button>
                );
              })}

              {!loading && isSignedIn && (
                <Button variant="ghost" size="sm" className="min-h-10" asChild>
                  <Link to="/me/saved" className="flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">Saved</span>
                  </Link>
                </Button>
              )}

              {!loading && !isSignedIn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  onClick={() => setLoginOpen(true)}
                  disabled={!apiConfigured}
                  title={
                    !apiConfigured
                      ? import.meta.env.DEV
                        ? 'Set VITE_API_BASE_URL to your API origin (e.g. http://localhost:8080).'
                        : 'Sign-in is temporarily unavailable.'
                      : undefined
                  }
                >
                  <LogIn className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              )}

              {!loading && isSignedIn && (
                <div className="flex items-center gap-2 pl-1 border-l border-border/60 ml-1">
                  <div className="hidden sm:flex items-center gap-2 max-w-[10rem]">
                    <Avatar className="h-8 w-8">
                      {picture ? <AvatarImage src={picture} alt="" /> : null}
                      <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate" title={String(user?.email ?? '')}>
                      {user?.email ?? displayName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-10"
                    type="button"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">Sign out</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
