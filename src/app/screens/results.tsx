import { Navigate, useLocation } from 'react-router';

/** Legacy `/results?q=` → `/match?q=` */
export function Results() {
  const location = useLocation();
  const search = location.search || '';
  return <Navigate to={{ pathname: '/match', search }} replace />;
}
