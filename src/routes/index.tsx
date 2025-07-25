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
import StudentApplication from '@/pages/homeStudentApplication';
import ResumeUpload from '@/pages/uploadResume';
import ApplicationListPage from '@/pages/application/applications-list';
import NewApplicationListPage from '@/pages/application/newApplications-list';
import CareerPage from '@/pages/career-application';
import CareerResumeUpload from '@/pages/career-application/uploadResume/index';
import CoursesPage from '@/pages/dashboard/components/course';
import TermPage from '@/pages/dashboard/components/term';
import CourseRegistration from '@/pages/course-register';
import JobPage from '@/pages/dashboard/components/jobs';
import JobApplication from '@/pages/Job-registration';
import CareerGuideline from '@/pages/guideline/career-guideline';
import CourseApplicationPage from '@/pages/dashboard-application/course-application';
import JobApplicationPage from '@/pages/dashboard-application/job-application';
import StudentGuideline from '@/pages/guideline/student-guideline';
import ViewStudentApplicationPage from '@/pages/application/view-studentApplication';
import ViewCareerApplicationPage from '@/pages/application/view-careerApplication';
import StudentApplicationsPage from '@/pages/dashboard/components/student-applications';
import CareerApplicationsPage from '@/pages/dashboard/components/jobs/job-applicant';

import HomeStudentApplication from '@/pages/homeStudentApplication';
import InternationalStudentApplication from '@/pages/internationalStudentApplication';

const SignInPage = lazy(() => import('@/pages/auth/signin/index'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------
export default function AppRouter() {
  const withRole = (element, roles) => (
    <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
  );
  const adminRoutes = [
  {
    path: '/dashboard',
    element: (
      <AdminLayout>
        <ProtectedRoute allowedRoles={['admin', 'student', 'applicant']}>
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
        path: 'eu/student-form',
        element: withRole(<HomeStudentApplication />, ['admin', 'student']),
        index: true
      },
      {
        path: 'international/student-form',
        element: withRole(<InternationalStudentApplication />, ['admin', 'student']),
        index: true
      },
      {
        path: 'applications',
        element: withRole(<ApplicationListPage />, ['admin']),
        index: true
      },
      {
        path: 'course-application/:id',
        element: withRole(<CourseApplicationPage />, ['admin', 'student'])
      },
      {
        path: 'job-application/:id',
        element: withRole(<JobApplicationPage />, ['admin', 'applicant'])
      },
      {
        path: 'student-application/:id',
        element: withRole(<ViewStudentApplicationPage />, ['admin','student'])
      },
      {
        path: 'career-application/:id/:userId',
        element: withRole(<ViewCareerApplicationPage />, ['admin','applicant'])
      },
      {
        path: 'courses',
        element: withRole(<CoursesPage />, ['admin','student']),
        index: true
      },
      {
        path: 'terms',
        element: withRole(<TermPage />, ['admin','student']),
        index: true
      },
      {
        path: 'jobs',
        element: withRole(<JobPage />, ['admin','applicant']),
        index: true
      },
      {
        path: 'jobs/:id',
        element: withRole(<CareerApplicationsPage />, ['admin','applicant']),
        index: true
      },
      {
        path: 'career-application',
        element: withRole(<CareerPage />, ['admin', 'applicant']),
        index: true
      },
      {
        path: 'career',
        element: withRole(<CareerResumeUpload />, ['applicant','admin']),
        index: true
      },
      {
        path: 'career-guideline',
        element: withRole(<CareerGuideline />, ['admin','applicant']),
        index: true
      },
      {
        path: 'student-guideline',
        element: withRole(<StudentGuideline />, ['student','admin']),
        index: true
      },
      {
        path: 'student-applications',
        element: withRole(<StudentApplicationsPage />, ['admin','student']),
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
      path: 'courses/apply/:id',
      element: <CourseRegistration />,
      index: true
    },
    {
      path: 'jobs/apply/:id',
      element: <JobApplication />,
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
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
