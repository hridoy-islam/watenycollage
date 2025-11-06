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
import CoursesPage from '@/pages/course';
import TermPage from '@/pages/term';
import CourseRegistration from '@/pages/course-register';
import JobPage from '@/pages/jobs';
import JobApplication from '@/pages/Job-registration';
import CareerGuideline from '@/pages/guideline/career-guideline';
import CourseApplicationPage from '@/pages/dashboard-application/course-application';
import JobApplicationPage from '@/pages/dashboard-application/job-application';
import StudentGuideline from '@/pages/guideline/student-guideline';
import ViewStudentApplicationPage from '@/pages/application/view-studentApplication';
import ViewCareerApplicationPage from '@/pages/application/view-careerApplication';
import StudentApplicationsPage from '@/pages/student-applications';
import CareerApplicationsPage from '@/pages/jobs/job-applicant';

import HomeStudentApplication from '@/pages/homeStudentApplication';
import InternationalStudentApplication from '@/pages/internationalStudentApplication';
import StudentMailPage from '@/pages/studentMail';
import TemplatePage from '@/pages/template';
import SignaturePage from '@/pages/signature';
import InternationalStudentProfile from '@/pages/application/editProfile/profile-internationalStudent';
import EuStudentProfile from '@/pages/application/editProfile/profile-euStudent';
import ApplicantEditProfile from '@/pages/application/editProfile/profile-applicant';
import AssignmentPage from '@/pages/assignment';
import CourseUnitPage from '@/pages/courseUnit';
import CourseModule from '@/pages/courseUnit/courseResource';
import CourseResource from '@/pages/courseUnit/courseResource';
import AssignmentDetailPage from '@/pages/assignment/assignmentDetails';
import { AssignmentFeedbackList } from '@/pages/pendingAssignmentFeedback';
import { StudentAssignmentFeedbackList } from '@/pages/pendingAssignmentFeedbackStudent';
import { StudentAssignmentsPage } from '@/pages/studentAssignmentList';
import CourseDocumentPage from '@/pages/courseDocument';
import TeachersPage from '@/pages/teacher';
import TeacherDetailsPage from '@/pages/teacher/teacher-course';
import { TeacherAssignmentFeedbackList } from '@/pages/pendingAssignmentFeedbackTeacher';
import TeacherStudentApplicationListPage from '@/pages/teacher/studentList';
import ReportPage from '@/pages/report';
import TeacherProfile from '@/pages/profile/profile-teacher';
import AttendancePage from '@/pages/staff-attendance';
import AssignmentReportsPage from '@/pages/assignmentReport';

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
          <ProtectedRoute
            allowedRoles={['admin', 'student', 'applicant', 'teacher']}
          >
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
          element: withRole(<InternationalStudentApplication />, [
            'admin',
            'student'
          ]),
          index: true
        },
        {
          path: 'assignments-feedback',
          element: withRole(<AssignmentFeedbackList />, ['admin', 'teacher']),
          index: true
        },
        {
          path: 'student-assignments-feedback',
          element: withRole(<StudentAssignmentFeedbackList />, [
            'admin',
            'student'
          ]),
          index: true
        },
        {
          path: 'student-assignments',
          element: withRole(<StudentAssignmentsPage />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'applications',
          element: withRole(<ApplicationListPage />, ['admin', 'teacher']),
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
          element: withRole(<ViewStudentApplicationPage />, [
            'admin',
            'student',
            'teacher'
          ])
        },
        {
          path: 'student-application/:id/edit/eu',
          element: withRole(<EuStudentProfile />, [
            'admin',
            'student',
            'teacher'
          ])
        },
        {
          path: 'student-application/:id/edit/international',
          element: withRole(<InternationalStudentProfile />, [
            'admin',
            'student',
            'teacher'
          ])
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
          element: withRole(<ApplicantEditProfile />, ['admin', 'applicant'])
        },
        {
          path: 'courses',
          element: withRole(<CoursesPage />, ['admin', 'student', 'teacher']),
          index: true
        },
        {
          path: 'courses/course-document/:id',
          element: withRole(<CourseDocumentPage />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'courses/:id/unit',
          element: withRole(<CourseUnitPage />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'courses/:id/unit/:unitId',
          element: withRole(<CourseResource />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'terms',
          element: withRole(<TermPage />, ['admin', 'student']),
          index: true
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
        {
          path: 'career',
          element: withRole(<CareerResumeUpload />, ['applicant', 'admin']),
          index: true
        },
        {
          path: 'career-guideline',
          element: withRole(<CareerGuideline />, ['admin', 'applicant']),
          index: true
        },
        {
          path: 'student-guideline',
          element: withRole(<StudentGuideline />, ['student', 'admin']),
          index: true
        },
        {
          path: 'student-applications',
          element: withRole(<StudentApplicationsPage />, ['admin', 'student']),
          index: true
        },
        {
          path: 'student-applications/:id/assignment/:studentId',
          element: withRole(<AssignmentPage />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'student-applications/:id/assignment/:studentId/unit-assignments/:unitId',
          element: withRole(<AssignmentDetailPage />, [
            'admin',
            'student',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'student-application/:id/:applicationId/mails',
          element: withRole(<StudentMailPage />, ['admin', , 'teacher']),
          index: true
        },
        {
          path: 'template',
          element: withRole(<TemplatePage />, ['admin']),
          index: true
        },
        {
          path: 'signature',
          element: withRole(<SignaturePage />, ['admin']),
          index: true
        },

        {
          path: 'teachers',
          element: withRole(<TeachersPage />, ['admin']),
          index: true
        },
         {
          path: 'teachers/:userId',
          element: withRole(<TeacherProfile />, ['admin', 'teacher'])
        },
        {
          path: 'teachers/courses/:id',
          element: withRole(<TeacherDetailsPage />, ['admin', 'teacher']),
          index: true
        },
        {
          path: 'teacher-assignments-feedback',
          element: withRole(<TeacherAssignmentFeedbackList />, [
            'admin',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'teacher/student-applications',
          element: withRole(<TeacherStudentApplicationListPage />, [
            'admin',
            'teacher'
          ]),
          index: true
        },
        {
          path: 'report',
          element: withRole(<ReportPage />, [
            'admin',
          ]),
          index: true
        },
         {
          path: 'attendance',
          element: withRole(<AttendancePage />, [
            'admin','teacher'
          ]),
          index: true
        },
         {
          path: 'assignment-report',
          element: withRole(<AssignmentReportsPage />, [
            'admin','teacher'
          ]),
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
