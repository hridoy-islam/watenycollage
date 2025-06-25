import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const location = useLocation();

  // Not logged in: redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but not allowed (based on role)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
