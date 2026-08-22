import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard, getRoleOnboarding } from '../utils/constants';
import LoadingState from '../components/LoadingState';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, role, user, loading } = useAuth();

  if (loading) return <LoadingState message="Checking authentication..." />;

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleDashboard(role)} replace />;
  }

  if (user && user.profileComplete === false && !window.location.pathname.includes('onboarding') && !window.location.pathname.includes('role-selection')) {
    return <Navigate to={getRoleOnboarding(role)} replace />;
  }

  return children;
}
