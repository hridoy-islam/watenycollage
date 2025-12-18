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
import ApplicantReferencePage from '@/pages/applicant-reference';
import ReferenceDetailsPage from '@/pages/applicant-reference/referenceDetails';
import TemplatePage from '@/pages/template';
import SignaturePage from '@/pages/signature';
import ApplicantMailPage from '@/pages/applicantMail';
import PostEmploymentMedicalForm from '@/pages/postMedicalForm';
import BankDetailsForm from '@/pages/bankDetailsForm';
import DBSDetailsForm from '@/pages/dbsForm';
import StarterChecklistForm from '@/pages/starterChecklistForm';
import TrainingCertificatesPage from '@/pages/EcertFormPage';
import EcertsPage from '@/pages/ecertPage';
import AdminDBSDetails from '@/pages/applicantModulesAdmin/dbsDetails';
import AdminStarterChecklist from '@/pages/applicantModulesAdmin/starterCheckList';
import AdminBankDetails from '@/pages/applicantModulesAdmin/BankDetails';
import AdminEcertsPage from '@/pages/applicantModulesAdmin/ecertDetails';
import AdminMedicalForm from '@/pages/applicantModulesAdmin/medicalQuestion';
import EditApplicantProfile from '@/pages/application/editApplicant';
import ApplicantLogsPage from '@/pages/logsPage';
import EditPostEmploymentMedicalForm from '@/pages/editPostMedicalForm';
import EditBankDetailsForm from '@/pages/editBankDetailsForm';
import EditTrainingCertificatesPage from '@/pages/editEcertFormPage';
import EditStarterChecklistForm from '@/pages/editStarterChecklistForm';
import EditDBSDetailsForm from '@/pages/editDBSForm';

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
          element: withRole(<ViewCareerApplicationPage />, [
            'admin',
            'applicant'
          ])
        },
        {
          path: 'career-application/:id/:userId/edit',
          element: withRole(<EditApplicantProfile />, [
            'admin',
           
          ])
        },
        {
          path: 'career-application/:id/references/:userId',
          element: withRole(<ApplicantReferencePage />, ['admin', 'applicant'])
        },
        {
          path: 'user/:id/reference/:refId/:refType',
          element: withRole(<ReferenceDetailsPage />, ['admin', 'applicant'])
        },

        {
          path: 'career-application/:id/:userId/interview',
          element: withRole(<InterviewPage />, ['admin'])
        },

        {
          path: 'career-application/:id/mail/:userId',
          element: withRole(<ApplicantMailPage />, ['admin'])
        },
        {
          path: 'career-application/:id/logs/:userId',
          element: withRole(<ApplicantLogsPage />, ['admin'])
        },

        {
          path: 'jobs',
          element: withRole(<JobPage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'jobs/:id',
          element: withRole(<CareerApplicationsPage />, ['admin', 'applicant']),
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
          element: withRole(<CareerGuideline />, ['admin', 'applicant']),
          index: true
        },

        {
          path: 'template',
          element: withRole(<TemplatePage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'signature',
          element: withRole(<SignaturePage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'medical-form/:id',
          element: <PostEmploymentMedicalForm />,
          index: true
        },
        {
          path: 'admin/medical-form/:id',
          element: <AdminMedicalForm />,
          index: true
        },
        {
          path: 'admin/medical-form/:id/edit',
          element: <EditPostEmploymentMedicalForm />,
          index: true
        },
        {
          path: 'bank-details/:id',
          element: <BankDetailsForm />,
          index: true
        },
        {
          path: 'bank-details/:id/edit',
          element: <BankDetailsForm />,
          index: true
        },
        {
          path: 'admin/bank-details/:id',
          element: <AdminBankDetails />,
          index: true
        },
        {
          path: 'admin/bank-details/:id/edit',
          element: <EditBankDetailsForm />,
          index: true
        },
        {
          path: 'dbs-form/:id',
          element: <DBSDetailsForm />,
          index: true
        },
        {
          path: 'admin/dbs-form/:id',
          element: <AdminDBSDetails />,
          index: true
        },
        {
          path: 'admin/dbs-form/:id/edit',
          element: <EditDBSDetailsForm />,
          index: true
        },
        {
          path: 'starter-checklist-form/:id',
          element: <StarterChecklistForm />,
          index: true
        },
        {
          path: 'admin/starter-checklist-form/:id',
          element: <AdminStarterChecklist />,
          index: true
        },
        {
          path: 'admin/starter-checklist-form/:id/edit',
          element: <EditStarterChecklistForm />,
          index: true
        },
        {
          path: 'ecert-form/:id',
          element: <TrainingCertificatesPage />,
          index: true
        },
        {
          path: 'admin/ecert-form/:id',
          element: <AdminEcertsPage />,
          index: true
        },
        {
          path: 'admin/ecert-form/:id/edit',
          element: <EditTrainingCertificatesPage />,
          index: true
        },
        {
          path: 'ecerts',
          element: withRole(<EcertsPage />, ['admin']),
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
