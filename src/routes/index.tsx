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
import ViewApplicationPage from '@/pages/application/view-careerApplication';
import CareerPage from '@/pages/career-application';
import CareerResumeUpload from '@/pages/career-application/uploadResume/index';
import CoursesPage from '@/pages/course';
import TermPage from '@/pages/term';
import CourseRegistration from '@/pages/course-register';
import JobPage from '@/pages/jobs';
import JobApplication from '@/pages/Job-registration';
import Guideline from '@/components/shared/Guideline';
import CareerGuideline from '@/pages/career-application/career-guideline';
import CourseApplicationPage from '@/pages/dashboard-application/course-application';
import JobApplicationPage from '@/pages/dashboard-application/job-application';
import StudentGuideline from '@/pages/studentApplication/student-guideline';
import ViewStudentApplicationPage from '@/pages/application/view-studentApplication';
import ViewCareerApplicationPage from '@/pages/application/view-careerApplication';
import VerifyPage from '@/pages/auth/verify';

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
          path: 'course-application/:id',
          element: <CourseApplicationPage />,
          index: true
        },
        {
          path: 'job-application/:id',
          element: <JobApplicationPage />,
          index: true
        },
        {
          path: 'student-application/:id',
          element: <ViewStudentApplicationPage />,
          index: true
        },
        {
          path: 'career-application/:id',
          element: <ViewCareerApplicationPage />,
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
        },
        {
          path: 'jobs',
          element: <JobPage />,
          index: true
        },
        {
          path: 'career-application',
          element: <CareerPage />,
          index: true
        },
        {
          path: 'career',
          element: <CareerResumeUpload />,
          index: true
        },
        {
          path: 'career-guideline',
          element: <CareerGuideline />,
          index: true
        },
        {
          path: 'student-guideline',
          element: <StudentGuideline />,
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
      path: '/verify',
      element: <VerifyPage />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
