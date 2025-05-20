import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
import ProfilePage from '@/pages/profile';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/new-password';
import AdminLayout from '@/components/layout/admin-layout';
import StudentApplication from '@/pages/studentApplication';
import ResumeUpload from '@/pages/uploadResume';
import ApplicationListPage from '@/pages/application/applications-list';
import NewApplicationListPage from '@/pages/application/newApplications-list';
import ViewApplicationPage from '@/pages/application/view-application';
import CareerPage from '@/pages/career';
import CareerResumeUpload from '@/pages/career/uploadResume/index';
import CoursesPage from '@/pages/course';
import TermPage from '@/pages/term';
import CourseRegistration from '@/pages/course-register';
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const adminRoutes = [
    {
      path: '/dashboard',
      element: (
        <AdminLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </AdminLayout>
      ),
      children: [
        {
          element: <DashboardPage />,
          index: true
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        },
        {
          path: 'student-form',
          element: <StudentApplication />,
          index: true
        },
        {
          path: 'resume-upload',
          element: <ResumeUpload />,
          index: true
        },
        {
          path: 'applications',
          element: <ApplicationListPage />,
          index: true
        },
        {
          path: 'new-applications',
          element: <NewApplicationListPage />,
          index: true
        },
        {
          path: 'applications/:id',
          element: <ViewApplicationPage />,
          index: true
        },
        {
          path: 'courses',
          element: <CoursesPage />,
          index: true
        },
        {
          path: 'terms',
          element: <TermPage />,
          index: true
        }
      ]
    }
  ];

  const publicRoutes = [
    // {
    //   path: '/',
    //   element: <StudentApplication />,
    //   index: true
    // },
    {
      path: 'courses/course-registration/:id',
      element: <CourseRegistration />,
      index: true
    },
    {
      path: '/',
      element: <SignInPage />,
      index: true
    },
    {
      path: '/signup',
      element: <SignUpPage />,
      index: true
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
      index: true
    },
    {
      path: '/otp',
      element: <Otp />,
      index: true
    },
    {
      path: '/new-password',
      element: <NewPassword />,
      index: true
    },
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    },
    {
      path: '/career-application',
      element: <CareerPage />,
      index: true
    },
    {
      path: '/career',
      element: <CareerResumeUpload />,
      index: true
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
