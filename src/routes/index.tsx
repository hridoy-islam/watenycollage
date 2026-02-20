import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';

// --- Imports ---
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminLayout from '@/components/layout/admin-layout';
import StudentLayout from '@/components/layout/student-layout';

import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
import ProfilePage from '@/pages/profile';
import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/new-password';
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
import StudentVerificationPage from '@/pages/studentVerification';

const SignInPage = lazy(() => import('@/pages/auth/signin/index'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------
export default function AppRouter() {
  // 1. Get user role from Redux
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const withRole = (element, roles) => (
    <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
  );

  // --- Admin & Teacher Routes ---
  const adminRoutes = [
    {
      path: '/dashboard',
      element: (
        <AdminLayout>
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </AdminLayout>
      ),
      children: [
        { element: <DashboardPage />, index: true },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'eu/student-form', element: withRole(<HomeStudentApplication />, ['admin']) },
        { path: 'international/student-form', element: withRole(<InternationalStudentApplication />, ['admin']) },
        { path: 'assignments-feedback', element: withRole(<AssignmentFeedbackList />, ['admin', 'teacher']) },
        { path: 'student-assignments-feedback', element: withRole(<StudentAssignmentFeedbackList />, ['admin']) },
        { path: 'student-assignments', element: withRole(<StudentAssignmentsPage />, ['admin', 'teacher']) },
        { path: 'applications', element: withRole(<ApplicationListPage />, ['admin', 'teacher']) },
        { path: 'course-application/:id', element: withRole(<CourseApplicationPage />, ['admin']) },
        { path: 'job-application/:id', element: withRole(<JobApplicationPage />, ['admin']) },
        { path: 'student-application/:id', element: withRole(<ViewStudentApplicationPage />, ['admin', 'teacher']) },
        { path: 'student-application/:id/edit/eu', element: withRole(<EuStudentProfile />, ['admin', 'teacher']) },
        { path: 'student-application/:id/edit/international', element: withRole(<InternationalStudentProfile />, ['admin', 'teacher']) },
        { path: 'career-application/:id/:userId', element: withRole(<ViewCareerApplicationPage />, ['admin', 'applicant']) },
        { path: 'career-application/:id/:userId/edit', element: withRole(<ApplicantEditProfile />, ['admin']) },
        { path: 'courses', element: withRole(<CoursesPage />, ['admin', 'teacher']) },
        { path: 'courses/course-document/:id', element: withRole(<CourseDocumentPage />, ['admin', 'teacher']) },
        { path: 'courses/:id/unit', element: withRole(<CourseUnitPage />, ['admin', 'teacher']) },
        { path: 'courses/:id/unit/:unitId', element: withRole(<CourseResource />, ['admin', 'teacher']) },
        { path: 'terms', element: withRole(<TermPage />, ['admin']) },
        { path: 'jobs', element: withRole(<JobPage />, ['admin']) },
        { path: 'jobs/:id', element: withRole(<CareerApplicationsPage />, ['admin']) },
        { path: 'career-application', element: withRole(<CareerPage />, ['admin']) },
        { path: 'career', element: withRole(<CareerResumeUpload />, ['admin']) },
        { path: 'career-guideline', element: withRole(<CareerGuideline />, ['admin']) },
        { path: 'student-guideline', element: withRole(<StudentGuideline />, ['admin']) },
        { path: 'student-applications', element: withRole(<StudentApplicationsPage />, ['admin']) },
        { path: 'student-applications/:id/assignment/:studentId', element: withRole(<AssignmentPage />, ['admin', 'teacher']) },
        { path: 'student-applications/:id/assignment/:studentId/unit-assignments/:unitId', element: withRole(<AssignmentDetailPage />, ['admin', 'teacher']) },
        { path: 'student-application/:id/:applicationId/mails', element: withRole(<StudentMailPage />, ['admin', 'teacher']) },
        { path: 'template', element: withRole(<TemplatePage />, ['admin']) },
        { path: 'signature', element: withRole(<SignaturePage />, ['admin']) },
        { path: 'teachers', element: withRole(<TeachersPage />, ['admin']) },
        { path: 'teachers/:userId', element: withRole(<TeacherProfile />, ['admin', 'teacher']) },
        { path: 'teachers/courses/:id', element: withRole(<TeacherDetailsPage />, ['admin', 'teacher']) },
        { path: 'teacher-assignments-feedback', element: withRole(<TeacherAssignmentFeedbackList />, ['admin', 'teacher']) },
        { path: 'teacher/student-applications', element: withRole(<TeacherStudentApplicationListPage />, ['admin', 'teacher']) },
        { path: 'report', element: withRole(<ReportPage />, ['admin']) },
        { path: 'attendance', element: withRole(<AttendancePage />, ['admin', 'teacher']) },
        { path: 'assignment-report', element: withRole(<AssignmentReportsPage />, ['admin', 'teacher']) },
        { path: 'verification', element: withRole(<StudentVerificationPage />, ['admin']) }
      ]
    }
  ];

  const studentRoutes = [
    {
      path: '/dashboard',
      element: (
        <StudentLayout>
          <ProtectedRoute allowedRoles={['student', 'applicant']}>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </StudentLayout>
      ),
      children: [
        { element: withRole(<DashboardPage />, ['student','applicant']), index: true },
        { path: 'profile', element: withRole(<ProfilePage />, ['student','applicant']) },
        { path: 'eu/student-form', element: withRole(<HomeStudentApplication />, ['student']) },
        { path: 'international/student-form', element: withRole(<InternationalStudentApplication />, ['student']) },
        { path: 'student-assignments-feedback', element: withRole(<StudentAssignmentFeedbackList />, ['student']) },
        { path: 'student-assignments', element: withRole(<StudentAssignmentsPage />, ['student']) },
        { path: 'course-application/:id', element: withRole(<CourseApplicationPage />, ['student']) },
        { path: 'job-application/:id', element: withRole(<JobApplicationPage />, ['applicant']) },
        { path: 'student-application/:id', element: withRole(<ViewStudentApplicationPage />, ['student']) },
        { path: 'student-application/:id/edit/eu', element: withRole(<EuStudentProfile />, ['student']) },
        { path: 'student-application/:id/edit/international', element: withRole(<InternationalStudentProfile />, ['student']) },
        { path: 'career-application/:id/:userId', element: withRole(<ViewCareerApplicationPage />, ['applicant']) },
        { path: 'career-application/:id/:userId/edit', element: withRole(<ApplicantEditProfile />, ['applicant']) },
        { path: 'courses', element: withRole(<CoursesPage />, ['student']) },
        { path: 'courses/course-document/:id', element: withRole(<CourseDocumentPage />, ['student']) },
        { path: 'courses/:id/unit', element: withRole(<CourseUnitPage />, ['student']) },
        { path: 'courses/:id/unit/:unitId', element: withRole(<CourseResource />, ['student']) },
        { path: 'terms', element: withRole(<TermPage />, ['student']) },
        { path: 'jobs', element: withRole(<JobPage />, ['applicant']) },
        { path: 'jobs/:id', element: withRole(<CareerApplicationsPage />, ['applicant']) },
        { path: 'career-application', element: withRole(<CareerPage />, ['applicant']) },
        { path: 'career', element: withRole(<CareerResumeUpload />, ['applicant']) },
        { path: 'career-guideline', element: withRole(<CareerGuideline />, ['applicant']) },
        { path: 'student-guideline', element: withRole(<StudentGuideline />, ['student']) },
        { path: 'student-applications', element: withRole(<StudentApplicationsPage />, ['student']) },
        { path: 'student-applications/:id/assignment/:studentId', element: withRole(<AssignmentPage />, ['student']) },
        { path: 'student-applications/:id/assignment/:studentId/unit-assignments/:unitId', element: withRole(<AssignmentDetailPage />, ['student']) }
      ]
    }
  ];

  // --- Public Routes ---
  const publicRoutes = [
    { path: 'courses/apply/:id', element: <CourseRegistration /> },
    { path: 'jobs/apply/:id', element: <JobApplication /> },
    { path: '/', element: <SignInPage />, index: true },
    { path: '/signup', element: <SignUpPage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/otp', element: <Otp /> },
    { path: '/new-password', element: <NewPassword /> },
    { path: '/404', element: <NotFound /> },
    { path: '*', element: <Navigate to="/404" replace /> }
  ];

  // 2. Select route set based on active role
  let authenticatedRoutes:any = [];
  
  if (role === 'admin' || role === 'teacher') {
    authenticatedRoutes = adminRoutes;
  } else if (role === 'student' || role === 'applicant') {
    authenticatedRoutes = studentRoutes;
  }

  // 3. Compile and return routes
  const routes = useRoutes([...publicRoutes, ...authenticatedRoutes]);

  return routes;
}