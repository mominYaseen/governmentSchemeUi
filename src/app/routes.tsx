import { createBrowserRouter } from 'react-router';
import { Home } from './screens/home';
import { Results } from './screens/results';
import { SchemeDetails } from './screens/scheme-details';
import { Profile } from './screens/profile';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

// Root layout component
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// 404 Not Found Page
function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-semibold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
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
    element: <RootLayout><Home /></RootLayout>,
  },
  {
    path: '/results',
    element: <RootLayout><Results /></RootLayout>,
  },
  {
    path: '/scheme/:id',
    element: <RootLayout><SchemeDetails /></RootLayout>,
  },
  {
    path: '/profile',
    element: <RootLayout><Profile /></RootLayout>,
  },
  {
    path: '*',
    element: <RootLayout><NotFound /></RootLayout>,
  },
]);
