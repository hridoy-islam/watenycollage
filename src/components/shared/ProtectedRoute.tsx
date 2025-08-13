import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
  children: ReactNode;       // 👈 type children properly
  allowedRoles?: string[];   // optional array of roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = []
}) => {
  const user = useSelector((state: any) => state.auth.user);
  const location = useLocation();

  // Not logged in: redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>; // 👈 wrap children in fragment
};

export default ProtectedRoute;
