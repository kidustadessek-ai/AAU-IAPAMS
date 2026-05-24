import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.tokens) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && auth.user && auth.user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;