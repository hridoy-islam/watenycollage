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
import PeoplePlannerLayout from '@/components/layout/people-planner-layout';
import ApplicationListPage from '@/pages/application/applications-list';
import CareerPage from '@/pages/career-application';
import { RecruitmentDashboard } from '@/pages/dashboard/rolewise-dashboard/recruitment-dashboard';

import JobPage from '@/pages/jobs';
import JobApplication from '@/pages/Job-registration';
import CareerGuideline from '@/pages/guideline/career-guideline';
import JobApplicationPage from '@/pages/dashboard-application/job-application';
import ViewCareerApplicationPage from '@/pages/application/applicantDetails/view-careerApplication';
import CareerApplicationsPage from '@/pages/jobs/job-applicant';
import InterviewPage from '@/pages/interview';
import ProfessionalReferencePage from '@/pages/professional-reference';
import PersonalReferencePage from '@/pages/personal-reference';
import ApplicantReferencePage from '@/pages/applicant-reference';
import ReferenceDetailsPage from '@/pages/applicant-reference/referenceDetails';
import TemplatePage from '@/pages/template';
import SignaturePage from '@/pages/signature';
import DesignationPage from '@/pages/designation';
import ContractTypeTemplatePage from '@/pages/contract-type-template';
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
import ProgressPage from '@/pages/jobs/job-applicant/progress';
import EditPostEmploymentMedicalForm from '@/pages/editPostMedicalForm';
import EditBankDetailsForm from '@/pages/editBankDetailsForm';
import EditTrainingCertificatesPage from '@/pages/editEcertFormPage';
import EditStarterChecklistForm from '@/pages/editStarterChecklistForm';
import EditDBSDetailsForm from '@/pages/editDBSForm';
import JobContractForm from '@/pages/jobcontractform';
import EditJobContractForm from '@/pages/editjobcontractform';
import ConfidentialityFormPage from '@/pages/confidentialityForm';
import EditConfidentialityForm from '@/pages/editConfidentialityForm';
import EmployeePage from '@/pages/Employee';
import EditEmployee from '@/pages/Employee/editEmployee';
import PeoplePlannerAdminDashboardPage from '@/pages/dashboard/people-planner/AdminDashboard';
import ServiceUserList from '@/pages/ServiceUser';
import CreateServiceUserPage from '@/pages/ServiceUser/create';
import ServiceuserDetailPage from '@/pages/ServiceUser/serviceUserDetail';
import ServiceUserPlannerPage from '@/pages/ServiceUser/planner';
import ServiceUserTask from '@/pages/ServiceUser/serviceuserSchedule';
import GeneralCharts from '@/pages/serviceUserModules/General-Charts';
import ChartDetailPage from '@/pages/serviceUserModules/General-Charts/components/ChartDetailPage';
import RiskAssessmentScorePage from '@/pages/serviceUserModules/RiskAssessmentScore';
import DocumentPage from '@/pages/serviceUserModules/Documents';
import SupportPlanDetailPage from '@/pages/serviceUserModules/SupportPlan/components/SupportPlanDetailPage';
import SupportPlanPage from '@/pages/serviceUserModules/SupportPlan';
import InitialAssessmentPage from '@/pages/serviceUserModules/InitialAssessment';
import InitialAssessmentDetailPage from '@/pages/serviceUserModules/InitialAssessment/components/InitialAssessmentDetailPage';
import CreateRiskAssessmentPage from '@/pages/serviceUserModules/RiskAssessment/createPage';
import RiskAssessmentPage from '@/pages/serviceUserModules/RiskAssessment';
import ConsentPage from '@/pages/serviceUserModules/Consent';
import AddCapacityFormPage from '@/pages/serviceUserModules/Consent/components/add-capacity-form';
import EditCapacityFormPage from '@/pages/serviceUserModules/Consent/components/edit-capacity-form';
import EditConsentFormPage from '@/pages/serviceUserModules/Consent/components/edit-consent-form';
import MarChartPage from '@/pages/serviceUserModules/MARChart';
import AddMedicationPage from '@/pages/serviceUserModules/MARChart/addMedicine';
import RiskAssessmentDetailPage from '@/pages/serviceUserModules/RiskAssessment/components/AssessmentDetailPage';
import StockPage from '@/pages/serviceUserModules/Stock';
import StockDetailPage from '@/pages/serviceUserModules/Stock/components/StockDetailPage';
import DailyLogs from '@/pages/serviceUserModules/DailyLogs';
import AddConsentFormPage from '@/pages/serviceUserModules/Consent/components/add-consent-form';
import NeedPage from '@/pages/NeedPage';
import ServiceUserNeedPage from '@/pages/serviceUserModules/ServiceUserNeed';
import ServiceUserEmergencyContractPage from '@/pages/serviceUserModules/ServiceUserEmergencyContract';
import CreateEmergencyContractPage from '@/pages/serviceUserModules/ServiceUserEmergencyContract/create';
import EditEmergencyContractPage from '@/pages/serviceUserModules/ServiceUserEmergencyContract/edit';

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
          path: 'career-application',
          element: withRole(<CareerPage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'career-guideline',
          element: withRole(<CareerGuideline />, ['admin', 'applicant']),
          index: true
        },
        // Recruitment routes
        {
          path: 'recruitment',
          element: <RecruitmentDashboard />
        },
        {
          path: 'recruitment/applications',
          element: withRole(<ApplicationListPage />, ['admin']),
          index: true
        },

        {
          path: 'recruitment/job-application/:id',
          element: withRole(<JobApplicationPage />, ['admin', 'applicant'])
        },

        {
          path: 'recruitment/career-application/:id/:userId',
          element: withRole(<ViewCareerApplicationPage />, [
            'admin',
            'applicant'
          ])
        },
        {
          path: 'recruitment/career-application/:id/:userId/edit',
          element: withRole(<EditApplicantProfile />, ['admin'])
        },
        {
          path: 'recruitment/career-application/:id/references/:userId',
          element: withRole(<ApplicantReferencePage />, ['admin', 'applicant'])
        },
        {
          path: 'recruitment/user/:id/reference/:refId/:refType',
          element: withRole(<ReferenceDetailsPage />, ['admin', 'applicant'])
        },

        {
          path: 'recruitment/career-application/:id/:userId/interview',
          element: withRole(<InterviewPage />, ['admin'])
        },
        {
          path: 'recruitment/career-application/:id/:userId/progress',
          element: withRole(<ProgressPage />, ['admin', 'applicant'])
        },

        {
          path: 'recruitment/career-application/:id/mail/:userId',
          element: withRole(<ApplicantMailPage />, ['admin'])
        },
        {
          path: 'recruitment/career-application/:id/logs/:userId',
          element: withRole(<ApplicantLogsPage />, ['admin'])
        },

        {
          path: 'recruitment/jobs',
          element: withRole(<JobPage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'recruitment/jobs/:id',
          element: withRole(<CareerApplicationsPage />, ['admin', 'applicant']),
          index: true
        },

        {
          path: 'recruitment/template',
          element: withRole(<TemplatePage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'recruitment/employee',
          element: withRole(<EmployeePage />, ['admin']),
          index: true
        },
        {
          path: 'recruitment/employee/:eid',
          element: withRole(<EditEmployee />, ['admin']),
          index: true
        },
        {
          path: 'recruitment/designation',
          element: withRole(<DesignationPage />, ['admin']),
          index: true
        },
        {
          path: 'recruitment/contract-type-template',
          element: withRole(<ContractTypeTemplatePage />, ['admin']),
          index: true
        },
        {
          path: 'recruitment/signature',
          element: withRole(<SignaturePage />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'recruitment/medical-form/:id',
          element: <PostEmploymentMedicalForm />,
          index: true
        },
        {
          path: 'recruitment/admin/medical-form/:id',
          element: <AdminMedicalForm />,
          index: true
        },
        {
          path: 'recruitment/admin/medical-form/:id/edit',
          element: <EditPostEmploymentMedicalForm />,
          index: true
        },
        {
          path: 'recruitment/bank-details/:id',
          element: <BankDetailsForm />,
          index: true
        },
        {
          path: 'recruitment/bank-details/:id/edit',
          element: <BankDetailsForm />,
          index: true
        },
        {
          path: 'recruitment/admin/bank-details/:id',
          element: <AdminBankDetails />,
          index: true
        },
        {
          path: 'recruitment/admin/bank-details/:id/edit',
          element: <EditBankDetailsForm />,
          index: true
        },
        {
          path: 'recruitment/dbs-form/:id',
          element: <DBSDetailsForm />,
          index: true
        },
        {
          path: 'recruitment/admin/dbs-form/:id',
          element: <AdminDBSDetails />,
          index: true
        },
        {
          path: 'recruitment/admin/dbs-form/:id/edit',
          element: <EditDBSDetailsForm />,
          index: true
        },
        {
          path: 'recruitment/starter-checklist-form/:id',
          element: <StarterChecklistForm />,
          index: true
        },
        {
          path: 'recruitment/admin/starter-checklist-form/:id',
          element: <AdminStarterChecklist />,
          index: true
        },
        {
          path: 'recruitment/admin/starter-checklist-form/:id/edit',
          element: <EditStarterChecklistForm />,
          index: true
        },
        {
          path: 'recruitment/ecert-form/:id',
          element: <TrainingCertificatesPage />,
          index: true
        },
        {
          path: 'recruitment/admin/ecert-form/:id',
          element: <AdminEcertsPage />,
          index: true
        },
        {
          path: 'recruitment/admin/ecert-form/:id/edit',
          element: <EditTrainingCertificatesPage />,
          index: true
        },
        {
          path: 'recruitment/ecerts',
          element: withRole(<EcertsPage />, ['admin']),
          index: true
        },
        {
          path: 'recruitment/job-contract/:id',
          element: <JobContractForm />,
          index: true
        },
        {
          path: 'recruitment/admin/job-contract/:id/edit',
          element: <EditJobContractForm />,
          index: true
        },
        {
          path: 'recruitment/confidentiality/:id',
          element: <ConfidentialityFormPage />,
          index: true
        },
        {
          path: 'recruitment/admin/confidentiality/:id/edit',
          element: <EditConfidentialityForm />,
          index: true
        }
      ]
    }
  ];

  const peoplePlannerAdminRoutes = [
    // People Planner routes
    {
      path: '/dashboard/people-planner',
      element: (
        <PeoplePlannerLayout>
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </PeoplePlannerLayout>
      ),
      children: [
        {
          element: <PeoplePlannerAdminDashboardPage />,
          index: true
        },
        {
          path: 'serviceuser',
          element: <ServiceUserList />,
          index: true
        },
        {
          path: 'need',
          element: <NeedPage />,
          index: true
        },
        {
          path: 'create-serviceuser',
          element: <CreateServiceUserPage />,
          index: true
        },

        {
          path: 'serviceuser/:sid',
          element: <ServiceuserDetailPage />,
          index: true
        },
        {
          path: 'serviceuser/:sid/planner',
          element: <ServiceUserPlannerPage />,
          index: true
        },
        {
          path: 'serviceuser/:sid/schedule',
          element: <ServiceUserTask />,
          index: true
        },
        {
          path: 'serviceuser/:sid/daily-logs',
          element: <DailyLogs />
        },
        {
          path: 'serviceuser/:sid/charts/general-charts',
          element: <GeneralCharts />
        },
        {
          path: 'serviceuser/:sid/charts/general-charts/:id',
          element: <ChartDetailPage />
        },
        {
          path: 'serviceuser/:sid/charts/risk-assessment-scores',
          element: <RiskAssessmentScorePage />
        },
        {
          path: 'serviceuser/:sid/documents',
          element: <DocumentPage />
        },
        {
          path: 'serviceuser/:sid/support-plans',
          element: <SupportPlanPage />
        },
        {
          path: 'serviceuser/:sid/support-plans/:id',
          element: <SupportPlanDetailPage />
        },
        {
          path: 'serviceuser/:sid/initial-assessment',
          element: <InitialAssessmentPage />
        },
        {
          path: 'serviceuser/:sid/initial-assessment/:id',
          element: <InitialAssessmentDetailPage />
        },
        {
          path: 'serviceuser/:sid/risk-assessments',
          element: <RiskAssessmentPage />
        },
        {
          path: 'serviceuser/:sid/risk-assessments/create',
          element: <CreateRiskAssessmentPage />
        },
        {
          path: 'serviceuser/:sid/risk-assessments/:id',
          element: <RiskAssessmentDetailPage />
        },
        {
          path: 'serviceuser/:sid/mar-chart',
          element: <MarChartPage />
        },
        {
          path: 'serviceuser/:sid/mar-chart/add-medication',
          element: <AddMedicationPage />
        },
        {
          path: 'serviceuser/:sid/stock',
          element: <StockPage />
        },
        {
          path: 'serviceuser/:sid/stock/:id',
          element: <StockDetailPage />
        },
        {
          path: 'serviceuser/:sid/consents',
          element: <ConsentPage />
        },
        {
          path: 'serviceuser/:sid/consents/add-capacity-form',
          element: <AddCapacityFormPage />
        },
        {
          path: 'serviceuser/:sid/consents/capacity-form/:capacityId',
          element: <EditCapacityFormPage />
        },
        {
          path: 'serviceuser/:sid/consents/add-consent-form',
          element: <AddConsentFormPage />
        },
        {
          path: 'serviceuser/:sid/consents/consent-form/:consentId',
          element: <EditConsentFormPage />
        },
        {
          path: 'serviceuser/:sid/needs',
          element: <ServiceUserNeedPage />
        },
        {
          path: 'serviceuser/:sid/emergency-contracts',
          element: <ServiceUserEmergencyContractPage />
        },
        {
          path: 'serviceuser/:sid/emergency-contracts/create',
          element: <CreateEmergencyContractPage />
        },
        {
          path: 'serviceuser/:sid/emergency-contracts/:id/edit',
          element: <EditEmergencyContractPage />
        }
      ]
    }
  ];

  const publicRoutes = [
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

  const routes = useRoutes([
    ...publicRoutes,
    ...adminRoutes,
    ...peoplePlannerAdminRoutes
  ]);

  return routes;
}
