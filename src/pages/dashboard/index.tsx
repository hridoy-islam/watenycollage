import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicantDashboard } from './rolewise-dashboard/applicant-dashboard';
import { StudentDashboard } from './rolewise-dashboard/student-applicant';
import { AdminDashboard } from './rolewise-dashboard/admin-dashboard';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VerifyPage from '../auth/verify';
import { TeacherDashboard } from './rolewise-dashboard/teacher-dashboard';
import axiosInstance from '@/lib/axios';

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isTeacherDesignation, setIsTeacherDesignation] = useState(false);
  const [designationChecked, setDesignationChecked] = useState(false);
  const navigate = useNavigate();

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
            // backend may label this field either `title` or `name`
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


  console.log('User data in DashboardPage:', user);
  useEffect(() => {
    if (user && user.isValided) {
      if (!user.authorized) {
        if (user.role === 'student') {
          navigate('/dashboard/student-guideline');
        } else if (user.role === 'applicant') {
          navigate('/dashboard/career-guideline');
        }
      } else {
        if (!user.isCompleted) {
          if (user.role === 'student') {
            if (user.studentType == 'eu') {
              navigate('/dashboard/eu/student-form');
            } else {
              navigate('/dashboard/international/student-form');
            }
          }
          if (user.role === 'applicant') {
            navigate('/dashboard/career');
          }
        }
      }
    }
  }, [user, navigate]);

  const showSkeleton =
    loading || (user?.role === 'employee' && !designationChecked);

  if (showSkeleton) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center ">
              Please log in to access the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.isValided) {
    return <VerifyPage user={user} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'applicant':
        return <ApplicantDashboard user={user} />;
      case 'student':
        return <StudentDashboard user={user} />;
      case 'teacher':
        return <TeacherDashboard user={user} />;
      case 'employee':
        if (isTeacherDesignation) {
          return <TeacherDashboard user={user} />;
        }
        return (
          <div className="flex flex-1 items-center justify-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center ">Invalid user role.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="flex flex-1 items-center justify-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center ">Invalid user role.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderDashboard();
}