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
import ApplicationListPage from '@/pages/application/applications-list';
import CareerPage from '@/pages/career-application';
import CareerResumeUpload from '@/pages/career-application/uploadResume/index';

import JobPage from '@/pages/dashboard/components/jobs';
import JobApplication from '@/pages/Job-registration';
import CareerGuideline from '@/pages/guideline/career-guideline';
import JobApplicationPage from '@/pages/dashboard-application/job-application';
import ViewCareerApplicationPage from '@/pages/application/applicantDetails/view-careerApplication';
import CareerApplicationsPage from '@/pages/dashboard/components/jobs/job-applicant';
import InterviewPage from '@/pages/interview';
import CharacterReferencePage from '@/pages/character-reference';
import EmploymentReferencePage from '@/pages/employment-reference';
import ProfessionalReferencePage from '@/pages/professional-reference';
import PersonalReferencePage from '@/pages/personal-reference';


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
        <ProtectedRoute allowedRoles={['admin', 'applicant']}>
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
        path: 'applications',
        element: withRole(<ApplicationListPage />, ['admin']),
        index: true
      },
      
      {
        path: 'job-application/:id',
        element: withRole(<JobApplicationPage />, ['admin', 'applicant'])
      },
      
      {
        path: 'career-application/:id/:userId',
        element: withRole(<ViewCareerApplicationPage />, ['admin','applicant'])
      },
      
      {
        path: 'career-application/:id/:userId/interview',
        element: withRole(<InterviewPage />, ['admin'])
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
      // {
      //   path: 'career',
      //   element: withRole(<CareerResumeUpload />, ['applicant','admin']),
      //   index: true
      // },
      {
        path: 'career-guideline',
        element: withRole(<CareerGuideline />, ['admin','applicant']),
        index: true
      },
      
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
      path: '/personal',
      element: <PersonalReferencePage />,
      index: true
    },
    {
      path: '/professional',
      element: <ProfessionalReferencePage />,
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
