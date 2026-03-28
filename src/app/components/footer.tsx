import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-primary leading-none">
                Government Scheme Assistant
              </span>
              <span className="text-xs text-muted-foreground">Powered by AI</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              © 2026 Government Scheme Assistant. All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> This platform provides information about government schemes
            for reference purposes only. Please verify all details on official government websites
            before applying. Eligibility indicators are approximate and actual eligibility may vary.
            We do not guarantee scheme approval or benefits.
          </p>
        </div>
      </div>
    </footer>
  );
}
