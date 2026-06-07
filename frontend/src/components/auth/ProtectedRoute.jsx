import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Loading from '../common/Loading';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuthStore();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
