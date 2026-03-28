import { createBrowserRouter, Navigate } from 'react-router';
import { Home } from './screens/home';
import { Results } from './screens/results';
import { SchemeDetails } from './screens/scheme-details';
import { Recommend } from './screens/recommend';
import { Catalog } from './screens/catalog';
import { Match } from './screens/match';
import { AuthCallback } from './screens/auth-callback';
import { SavedSchemes } from './screens/saved-schemes';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { DevHealthBanner } from './components/dev-health-banner';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DevHealthBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-semibold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <Home />
      </RootLayout>
    ),
  },
  {
    path: '/catalog',
    element: (
      <RootLayout>
        <Catalog />
      </RootLayout>
    ),
  },
  {
    path: '/recommend',
    element: (
      <RootLayout>
        <Recommend />
      </RootLayout>
    ),
  },
  {
    path: '/match',
    element: (
      <RootLayout>
        <Match />
      </RootLayout>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <RootLayout>
        <AuthCallback />
      </RootLayout>
    ),
  },
  {
    path: '/me/saved',
    element: (
      <RootLayout>
        <SavedSchemes />
      </RootLayout>
    ),
  },
  {
    path: '/profile',
    element: <Navigate to="/recommend" replace />,
  },
  {
    path: '/results',
    element: <Results />,
  },
  {
    path: '/scheme/:id',
    element: (
      <RootLayout>
        <SchemeDetails />
      </RootLayout>
    ),
  },
  {
    path: '*',
    element: (
      <RootLayout>
        <NotFound />
      </RootLayout>
    ),
  },
]);
