import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/auth-context';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" richColors closeButton />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
