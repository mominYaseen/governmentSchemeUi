import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth, isAuthUnauthorizedError } from '../context/auth-context';
import { AuthLoginDialog } from './auth-login-dialog';
import { cn } from './ui/utils';

interface SaveSchemeButtonProps {
  schemeId: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
}

export function SaveSchemeButton({
  schemeId,
  className,
  size = 'icon',
  variant = 'ghost',
}: SaveSchemeButtonProps) {
  const { isSignedIn, isSchemeSaved, saveScheme, unsaveScheme, refresh } = useAuth();
  const [pending, setPending] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const saved = isSchemeSaved(schemeId);

  const handleClick = async () => {
    if (!isSignedIn) {
      setLoginModalOpen(true);
      return;
    }
    setPending(true);
    try {
      if (saved) {
        await unsaveScheme(schemeId);
      } else {
        await saveScheme(schemeId);
      }
    } catch (e) {
      if (isAuthUnauthorizedError(e)) {
        await refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => void handleClick()}
        disabled={pending}
        aria-label={saved ? 'Remove from my saved schemes' : 'Save to my list'}
        aria-pressed={saved}
      >
        <Heart
          className={cn(
            size === 'icon' ? 'h-5 w-5' : 'h-4 w-4 mr-2',
            saved && 'fill-primary text-primary'
          )}
        />
        {size !== 'icon' ? (saved ? 'Saved' : 'Save') : null}
      </Button>

      <AuthLoginDialog
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        title="Sign in to save schemes"
        onSuccess={() =>
          void saveScheme(schemeId).catch(() => {
            /* user can tap heart again */
          })
        }
      />
    </>
  );
}
