import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  CalendarRange,
  Users,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IntakeInfo {
  _id: string;
  termName: string;
  validTillDate: string;
  status: number;
}

interface TermInfo {
  _id: string;
  name: string;
  order: number;
  year: string;
  status: 'active' | 'inactive';
}

interface GroupInfo {
  _id: string;
  name: string;
  gradingOptions?: string[];
  status: string;
}

interface CourseInfo {
  _id: string;
  name: string;
  courseCode?: string;
  description?: string;
  status?: string;
  intakeId?: IntakeInfo;
}

interface MyCourseRecord {
  _id: string;
  courseId: CourseInfo | string;
  courseTermId: TermInfo | string;
  groupId: GroupInfo | string;
  teacherId?: string;
}

interface CourseGroup {
  courseId: string;
  courseName: string;
  courseCode?: string;
  intakeName?: string;
  applicationStatus?: string;
  terms: {
    recordId: string;
    termId: string;
    termName: string;
    year: string;
    order: number;
    status: 'active' | 'inactive';
    groupId: string;
    groupName: string;
    gradingOptions: string[];
  }[];
}

// ---------------------------------------------------------
// Helper functions
// ---------------------------------------------------------

const getTermId = (term: TermInfo | string): string =>
  typeof term === 'object' && term?._id ? term._id : String(term);

const getTermName = (term: TermInfo | string): string =>
  typeof term === 'object' ? term.name || 'Term' : 'Term';

const getTermOrder = (term: TermInfo | string): number =>
  typeof term === 'object' && typeof term.order === 'number' ? term.order : 0;

const getTermYear = (term: TermInfo | string): string =>
  typeof term === 'object' && term.year
    ? term.year.charAt(0).toUpperCase() + term.year.slice(1)
    : '';

const getTermStatus = (term: TermInfo | string): 'active' | 'inactive' =>
  typeof term === 'object' && term.status ? term.status : 'active';

const getCourseId = (course: CourseInfo | string): string =>
  typeof course === 'object' && course?._id ? course._id : String(course);

const getCourseName = (course: CourseInfo | string): string =>
  typeof course === 'object' ? course.name || 'Course' : 'Course';

const getCourseCode = (course: CourseInfo | string): string =>
  typeof course === 'object' ? course.courseCode || '' : '';

const getIntakeName = (course: CourseInfo | string): string =>
  typeof course === 'object' ? course.intakeId?.termName || '' : '';

const getGroupId = (group: GroupInfo | string): string =>
  typeof group === 'object' && group?._id ? group._id : String(group);

const getGroupName = (group: GroupInfo | string): string =>
  typeof group === 'object' ? group.name || 'Group' : 'Group';

const getGradingOptions = (group: GroupInfo | string): string[] =>
  typeof group === 'object' && Array.isArray(group.gradingOptions)
    ? group.gradingOptions
    : [];

const applicationStatusStyle = (status?: string) => {
  if (!status) return null;
  const label =
    status === 'approved'
      ? 'Enrolled'
      : status === 'cancelled'
        ? 'Rejected'
        : status;
  switch (status) {
    case 'approved':
      return { label, badge: 'bg-emerald-100 text-emerald-700' };
    case 'applied':
      return { label, badge: 'bg-blue-100 text-blue-700' };
    case 'cancelled':
      return { label, badge: 'bg-rose-100 text-rose-700' };
    default:
      return { label, badge: 'bg-gray-100 text-gray-600' };
  }
};

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------

function MyCoursesPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseGroup[]>([]);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // -------------------------------------------------------
  // Fetch Courses
  // -------------------------------------------------------

  const fetchMyCourses = async () => {
    try {
      setLoading(true);

      const courseMap = new Map<string, CourseGroup>();

      if (isTeacher) {
        const res = await axiosInstance.get(
          `/teacher-courses/my-courses/${user?._id}`
        );
        const records: MyCourseRecord[] = res.data?.data || [];

        for (const record of records) {
          const courseId = getCourseId(record.courseId);
          const courseName = getCourseName(record.courseId);
          const courseCode = getCourseCode(record.courseId);
          const intakeName = getIntakeName(record.courseId);

          const termId = getTermId(record.courseTermId);
          const termName = getTermName(record.courseTermId);
          const order = getTermOrder(record.courseTermId);
          const year = getTermYear(record.courseTermId);
          const termStatus = getTermStatus(record.courseTermId);

          const groupId = getGroupId(record.groupId);
          const groupName = getGroupName(record.groupId);
          const gradingOptions = getGradingOptions(record.groupId);

          if (!courseMap.has(courseId)) {
            courseMap.set(courseId, {
              courseId,
              courseName,
              courseCode,
              intakeName,
              terms: []
            });
          }

          const course = courseMap.get(courseId)!;

          if (!course.terms.some((t) => t.termId === termId)) {
            course.terms.push({
              recordId: record._id,
              termId,
              termName,
              year,
              order,
              status: termStatus,
              groupId,
              groupName,
              gradingOptions
            });
          }
        }
      } else {
        const [appRes, recordsRes] = await Promise.all([
          axiosInstance.get(
            `/application-course?studentId=${user?._id}&limit=all`
          ),
          axiosInstance.get(`/student-assign-group/my-courses/${user?._id}`)
        ]);

        const appData = appRes.data?.data || {};
        const applicationsData = Array.isArray(appData.result)
          ? appData.result
          : [];
        const records: MyCourseRecord[] = recordsRes.data?.data || [];

        // 1. Store application course entries along with status
        for (const app of applicationsData) {
          if (!app.courseId) continue;
          const courseId = getCourseId(app.courseId);
          const courseName = getCourseName(app.courseId);
          const courseCode = getCourseCode(app.courseId);
          const intakeName =
            app.intakeId?.termName || getIntakeName(app.courseId);

          if (courseId && !courseMap.has(courseId)) {
            courseMap.set(courseId, {
              courseId,
              courseName,
              courseCode,
              intakeName,
              applicationStatus: app.status,
              terms: []
            });
          }
        }

        // 2. Populate assigned terms & groups
        for (const record of records) {
          const courseId = getCourseId(record.courseId);
          const courseName = getCourseName(record.courseId);
          const courseCode = getCourseCode(record.courseId);
          const intakeName = getIntakeName(record.courseId);

          const termId = getTermId(record.courseTermId);
          const termName = getTermName(record.courseTermId);
          const order = getTermOrder(record.courseTermId);
          const year = getTermYear(record.courseTermId);
          const termStatus = getTermStatus(record.courseTermId);

          const groupId = getGroupId(record.groupId);
          const groupName = getGroupName(record.groupId);
          const gradingOptions = getGradingOptions(record.groupId);

          if (!courseMap.has(courseId)) {
            courseMap.set(courseId, {
              courseId,
              courseName,
              courseCode,
              intakeName,
              applicationStatus: 'approved',
              terms: []
            });
          }

          const course = courseMap.get(courseId)!;

          if (!course.terms.some((t) => t.termId === termId)) {
            course.terms.push({
              recordId: record._id,
              termId,
              termName,
              year,
              order,
              status: termStatus,
              groupId,
              groupName,
              gradingOptions
            });
          }
        }
      }

      // Sort terms per course
      courseMap.forEach((course) => {
        const active = course.terms
          .filter((t) => t.status === 'active')
          .sort((a, b) => a.order - b.order);

        const inactive = course.terms
          .filter((t) => t.status !== 'active')
          .sort((a, b) => b.order - a.order);

        course.terms = [...active, ...inactive];
      });

      setCourses(Array.from(courseMap.values()));
    } catch (error) {
      console.error('Failed to fetch my courses:', error);

      toast({
        title: 'Error',
        description: 'Failed to load your courses.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyCourses();
    }
  }, [user?._id]);

  const handleOpenTerm = (
    course: CourseGroup,
    term: CourseGroup['terms'][number]
  ) => {
    navigate(
      `/dashboard/my-courses/${course.courseId}/terms/${term.termId}/groups/${term.groupId}/units`
    );
  };

  return (
    <div className="w-full rounded-lg bg-white p-4 text-black shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-black" />

          <h1 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
            My Courses
          </h1>
        </div>

        <Button
          variant="default"
          size="sm"
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center rounded-lg bg-white py-16 ">
          <BlinkingDots size="large" color="bg-watney" />
        </div>
      ) : courses.length === 0 ? (
        /* No Courses */
        <div className="rounded-lg bg-white py-16 text-center ">
          <BookOpen className="mx-auto h-10 w-10 text-black" />

          <h3 className="mt-2 text-sm font-medium text-black">
            No courses assigned yet
          </h3>
        </div>
      ) : (
        /* Courses */
        <Card className="!border-none shadow-none">
          <CardContent className="space-y-4 border-0 p-0 shadow-none">
            {' '}
            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
                <BookOpen className="mx-auto h-10 w-10 text-black" />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No courses assigned yet
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const appStatusStyle = applicationStatusStyle(
                    course.applicationStatus
                  );

                  return (
                    <div key={course.courseId} className="">
                      {/* Course Header */}
                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-watney/10 text-watney">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-bold text-black">
                                {course.courseName}
                                {course.intakeName && (
                                  <span className="ml-2 text-sm font-medium text-black">
                                    ({course.intakeName})
                                  </span>
                                )}
                              </h2>
                              {appStatusStyle && (
                                <Badge className={appStatusStyle.badge}>
                                  {appStatusStyle.label}
                                </Badge>
                              )}
                            </div>
                            {course.courseCode && (
                              <p className="text-xs text-black">
                                {course.courseCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Terms / Group Assignment Notice */}
                      <div className="space-y-2 pt-3">
                        {course.terms.length === 0 ? (
                          <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-black">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                Group not assigned yet
                              </p>
                              <p className="text-xs text-gray-500">
                                Your course enrollment is confirmed. You will
                                see term details here once assigned to a group.
                              </p>
                            </div>
                          </div>
                        ) : (
                          course.terms.map((term) => {
                            const isCurrent = term.status === 'active';

                            return (
                              <div
                                key={term.termId}
                                onClick={() => handleOpenTerm(course, term)}
                                className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-black transition-all hover:border-watney/40 hover:bg-watney/5 hover:shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg ${
                                      isCurrent
                                        ? 'bg-watney text-white'
                                        : 'bg-gray-100 text-black'
                                    }`}
                                  >
                                    <CalendarRange className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-black">
                                      {term.termName}
                                      {term.year ? ` — ${term.year}` : ''}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <Badge
                                        className={
                                          isCurrent
                                            ? 'bg-watney/10 text-black'
                                            : 'bg-gray-100 text-black'
                                        }
                                      >
                                        {isCurrent ? 'Current' : 'Completed'}
                                      </Badge>
                                      <span className="flex items-center gap-1 text-[11px] text-black">
                                        <Users className="h-3 w-3" />
                                        {term.groupName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-black transition-transform group-hover:translate-x-0.5" />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MyCoursesPage;
