import { Link, useLocation } from 'react-router';
import { Shield, Home, BookOpen, Sparkles, MessageSquareText } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/catalog', label: 'Catalog', icon: BookOpen },
  { to: '/recommend', label: 'My details', icon: Sparkles },
  { to: '/match', label: 'Describe', icon: MessageSquareText },
] as const;

export function Navbar() {
  const location = useLocation();

  return (
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
          </div>
        </div>
      </div>
    </nav>
  );
}
