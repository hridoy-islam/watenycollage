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
import StudentsPage from '@/pages/students';
import NewStudentPage from '@/pages/students/new';
import { StudentQuiz } from '@/pages/students/quiz';
import InstitutionsPage from '@/pages/institutions';
import CoursesPage from '@/pages/courses';
import TermsPage from '@/pages/terms';
import AcademicYearPage from '@/pages/academic-year';
import StaffPage from '@/pages/staff';
import AgentsPage from '@/pages/agent';
import CourseRelationPage from '@/pages/course-relation';
import StudentViewPage from '@/pages/students/view';
import EmailConfigPage from '@/pages/emails';
import { DraftsManager } from '@/pages/emails/drafts';
import CourseDetails from '@/pages/courseDetails';

const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const adminRoutes = [
    {
      path: '/admin',
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
          path: 'students',
          element: <StudentsPage />
        },
        {
          path: 'students/:id',
          element: <StudentViewPage />
        },
        {
          path: 'students/:id/course/:courseid',
          element: <CourseDetails />
        },
        {
          path: 'students/new',
          element: <NewStudentPage />
        },
        {
          path: 'students/quiz',
          element: <StudentQuiz />
        },
        {
          path: 'institution',
          element: <InstitutionsPage />
        },
        {
          path: 'courses',
          element: <CoursesPage />
        },
        {
          path: 'terms',
          element: <TermsPage />
        },
        {
          path: 'academic-year',
          element: <AcademicYearPage />
        },
        {
          path: 'staff',
          element: <StaffPage />
        },
        {
          path: 'agents',
          element: <AgentsPage />
        },
        {
          path: 'course-fee',
          element: <CourseRelationPage />
        },
        {
          path: 'emails',
          element: <EmailConfigPage />
        },
        {
          path: 'drafts',
          element: <DraftsManager />
        }
      ]
    }
  ];

  const publicRoutes = [
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
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
