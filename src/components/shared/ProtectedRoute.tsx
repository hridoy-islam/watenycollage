import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const location = useLocation();

  const [isTeacherDesignation, setIsTeacherDesignation] = useState(false);
  const [designationChecked, setDesignationChecked] = useState(false);

  useEffect(() => {
    const hasDesignations =
      user?.designationId &&
      Array.isArray(user.designationId) &&
      user.designationId.length > 0;

    if (!hasDesignations) {
      setDesignationChecked(true);
      return;
    }

    let cancelled = false;

    const fetchDesignations = async () => {
      const results = await Promise.all(
        user.designationId.map(async (id: any) => {
          try {
            const idStr = (typeof id === 'string' ? id : id?._id || id).toString();
            if (!idStr) return null;
            const res = await axiosInstance.get(`/designation/${idStr}`);
            const data = res?.data?.data || res?.data || {};
            const label = (data?.title ?? data?.name ?? '').toString();
            return label.trim().toLowerCase();
          } catch (err) {
            console.error('Failed to fetch designation:', err);
            return null;
          }
        })
      );

      if (cancelled) return;

      if (results.some((t) => t === 'teacher')) {
        setIsTeacherDesignation(true);
      }
      setDesignationChecked(true);
    };

    fetchDesignations();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Not logged in: redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // While checking designations for employee, don't redirect yet
  const isChecking =
    user?.role === 'employee' &&
    user?.designationId &&
    Array.isArray(user.designationId) &&
    user.designationId.length > 0 &&
    !designationChecked;

  if (isChecking) {
    // Return nothing (or loader) while fetching to avoid false redirect
    return null;
  }

  const isEmployeeTeacher = user?.role === 'employee' && isTeacherDesignation;
  const effectiveRole = isEmployeeTeacher ? 'teacher' : user?.role;

  // Logged in but not allowed (based on role)
  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
