import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import clsx from 'clsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Loader from '@/components/shared/loader';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import {
  CalendarDays,
  CalendarRange,
  CalendarIcon,
  List,
  Clock,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  MessageSquare,
  GraduationCap,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Types and Interfaces ──────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentCourse {
  _id: string;
  courseId?: { _id: string; name: string } | string;
  groupId?: { _id: string; name: string } | string;
  intakeId?: { _id: string; termName: string } | string;
  status: string;
}

interface ClassEntry {
  _id: string;
  attendanceId?: string;
  classDate: string;
  startTime?: string;
  endTime?: string;
  roomNumber?: string | null;
  status?: AttendanceStatus | undefined;
  remark?: string;
  courseId?: string;
  courseName?: string | null;
  groupId?: string;
  groupName?: string | null;
  termId?: string;
  termName?: string | null;
  teacherId?: string;
  teacherName?: string | null;
  teacherEmail?: string | null;
}

interface Course {
  _id: string;
  name: string;
}

interface Application {
  _id: string;
  courseId: Course;
  intakeId?: { termName: string };
  status: string;
  createdAt: string;
  assignmentCount?: number;
}

interface UnitMaterial {
  _id: string;
  courseId: string;
  assignments: Array<{
    _id: string;
    type: string;
    title: string;
    fileUrl?: string;
    fileName?: string;
    content?: string;
    deadline?: Date;
  }>;
}

interface Assignment {
  _id: string;
  status: string;
  feedbacks: Array<{
    _id: string;
    seen: boolean;
    createdAt: string;
  }>;
}

interface StudentDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface SlotInfo {
  entry: ClassEntry;
  idx: number;
  span: number;
  isStart: boolean;
  topPx: number;
  heightPx: number;
}

// ── Constants and Helpers ─────────────────────────────────────────────────

const STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    text: string;
    border: string;
    hex: string;
  }
> = {
  present: {
    label: 'Present',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    hex: '#10b981'
  },
  absent: {
    label: 'Absent',
    text: 'text-rose-600',
    border: 'border-rose-200',
    hex: '#f43f5e'
  },
  late: {
    label: 'Late',
    text: 'text-amber-600',
    border: 'border-amber-200',
    hex: '#f59e0b'
  }
};

const START_H = 8;
const END_H = 23;
const HOURS = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const ROW_HEIGHT = 132;
const COLUMN_MIN_PX = 88;
const COLUMN_MAX_PX = 150;
const COLUMN_WIDTH = `clamp(${COLUMN_MIN_PX}px, calc((100vw - 64px) / 7), ${COLUMN_MAX_PX}px)`;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtH(h: number) {
  return `${pad(h)}:00`;
}

function isToday(d: Date) {
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

function toUTCDateKey(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .split('T')[0];
}

function dayIndex(entry: ClassEntry, days: Date[]): number {
  const ed = entry.classDate.split('T')[0];
  return days.findIndex((d) => ed === toUTCDateKey(d));
}

function buildSlotMap(classes: ClassEntry[], days: Date[]) {
  const map: Record<number, Record<number, SlotInfo>> = {};

  classes.forEach((entry, idx) => {
    const di = dayIndex(entry, days);
    if (di === -1 || !entry.startTime || !entry.endTime) return;

    const [sh, sm] = entry.startTime.split(':').map(Number);
    const [eh, em] = entry.endTime.split(':').map(Number);

    let startD = sh + sm / 60;
    let endD = eh + em / 60;

    startD = Math.max(startD, START_H);
    endD = Math.min(endD, END_H);

    if (startD >= endD) return;

    const startGridHr = Math.floor(startD);
    const endGridHr = Math.ceil(endD);
    const span = endGridHr - startGridHr;

    const topPx = (startD - startGridHr) * ROW_HEIGHT;
    const heightPx = (endD - startD) * ROW_HEIGHT;

    if (!map[di]) map[di] = {};

    for (let h = startGridHr; h < endGridHr; h++) {
      map[di][h] = {
        entry,
        idx,
        span: h === startGridHr ? span : 0,
        isStart: h === startGridHr,
        topPx,
        heightPx
      };
    }
  });
  return map;
}

const toLocalDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const asId = (v: unknown): string | undefined => {
  if (!v) return undefined;
  return typeof v === 'string' ? v : (v as { _id?: string })._id;
};
const asName = (v: unknown): string | undefined => {
  if (!v || typeof v === 'string') return undefined;
  return (v as { name?: string }).name;
};

// ── Main Component ────────────────────────────────────────────────────────

export function StudentDashboard({ user }: StudentDashboardProps) {
  // ── Dashboard States ──
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [totalApplication, setTotalApplication] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Routine States ──
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedEntry, setSelectedEntry] = useState<ClassEntry | null>(null);

  const [appliedRange, setAppliedRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').toDate(),
    moment().endOf('isoWeek').toDate()
  ]);
  const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').toDate(),
    moment().endOf('isoWeek').toDate()
  ]);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [startDate, endDate] = appliedRange;
  const [tempStart, tempEnd] = customRange;

  // ── Dashboard Logic ──
  const fetchDataOptimized = async (page = 1, limit = 'all') => {
    try {
      setDashboardLoading(true);

      const appRes = await axiosInstance.get(
        `/application-course?studentId=${user._id}&limit=all`
      );
      
      const appData = appRes.data?.data || {};
      const applicationsData = Array.isArray(appData.result) ? appData.result : [];

      const courseIds = applicationsData.map((app: Application) => app.courseId._id);

      const unitMaterialPromises = courseIds.map((courseId: string) => 
        axiosInstance.get(`/unit-material?courseId=${courseId}&limit=all`)
      );

      const unitMaterialResponses = await Promise.allSettled(unitMaterialPromises);
      
      const courseAssignmentCounts: { [key: string]: number } = {};
      
      unitMaterialResponses.forEach((response, index) => {
        const courseId = courseIds[index];
        if (response.status === 'fulfilled') {
          const unitMaterials: UnitMaterial[] = response.value.data?.data?.result || [];
          let assignmentCount = 0;
          
          unitMaterials.forEach((unitMaterial: UnitMaterial) => {
            if (unitMaterial.assignments && Array.isArray(unitMaterial.assignments)) {
              assignmentCount += unitMaterial.assignments.length;
            }
          });
          
          courseAssignmentCounts[courseId] = assignmentCount;
        } else {
          console.error(`Failed to fetch unit materials for course ${courseId}:`, response.reason);
          courseAssignmentCounts[courseId] = 0;
        }
      });

      const applicationsWithCounts = applicationsData.map((application: Application) => ({
        ...application,
        assignmentCount: courseAssignmentCounts[application.courseId._id] || 0
      }));

      setApplications(applicationsWithCounts);
      setTotalApplication(appData.meta?.total || 0);
      setTotalPages(appData.meta?.totalPage || 1);

      try {
        const pendingFeedbackRes = await axiosInstance.get(
          `/assignment/student-feedback/${user._id}?limit=all`
        );
        const pendingData: Assignment[] = pendingFeedbackRes.data?.data?.meta.total || 0;
        
        const finalCount = pendingData as any;
        setPendingFeedbackCount(finalCount);
        
      } catch (feedbackError) {
        console.error('Error fetching pending feedback:', feedbackError);
        setPendingFeedbackCount(0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Failed to fetch dashboard data',
        variant: 'destructive'
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDataOptimized(currentPage);
  }, [currentPage, entriesPerPage]);

  useEffect(() => {
    if (applications.length > 0) {
      const totalAssignments = applications.reduce((total, app) => total + (app.assignmentCount || 0), 0);
    }
  }, [applications]);

  // ── Routine Logic ──
  const weekDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');
    if (end.isBefore(start)) return [start.toDate()];
    const days: Date[] = [];
    let cur = start.clone();
    while (cur.isSameOrBefore(end)) {
      days.push(cur.toDate());
      cur = cur.clone().add(1, 'day');
    }
    return days;
  }, [startDate, endDate]);

  const shiftRange = (daysCount: number) => {
    const [s, e] = appliedRange;
    if (!s || !e) return;
    const nextRange: [Date, Date] = [
      moment(s).add(daysCount, 'days').toDate(),
      moment(e).add(daysCount, 'days').toDate()
    ];
    setAppliedRange(nextRange);
    setCustomRange(nextRange);
  };

  const goThisWeek = () => {
    const thisWeek: [Date, Date] = [
      moment().startOf('isoWeek').toDate(),
      moment().endOf('isoWeek').toDate()
    ];
    setAppliedRange(thisWeek);
    setCustomRange(thisWeek);
    setIsCustomMode(false);
  };

  const goToday = () => {
    const today = moment().startOf('day').toDate();
    const todayRange: [Date, Date] = [today, today];
    setAppliedRange(todayRange);
    setCustomRange(todayRange);
    setIsCustomMode(false);
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      setAppliedRange(customRange);
      setIsCustomMode(false);
    }
  };

  const openCustomMode = () => {
    setCustomRange(appliedRange);
    setIsCustomMode(true);
  };

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await axiosInstance.get('/application-course', {
        params: { studentId: user._id, limit: 'all' }
      });
      const result = res.data?.data?.result || [];
      const approved = (Array.isArray(result) ? result : []).filter(
        (app: StudentCourse) => app.status === 'approved'
      );
      setCourses(approved);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast({
        title: 'Failed to load your courses',
        variant: 'destructive'
      });
    } finally {
      setCoursesLoading(false);
    }
  }, [user._id, toast]);

  useEffect(() => {
    if (user._id) fetchCourses();
  }, [user._id, fetchCourses]);

  const hasCourses = courses.length > 0;

  useEffect(() => {
    if (!hasCourses || weekDays.length === 0) return;

    const startDateStr = toLocalDateString(weekDays[0]);
    const endDateStr = toLocalDateString(weekDays[weekDays.length - 1]);

    setRoutineLoading(true);
    const fetchAll = async () => {
      try {
        const routinePromises = courses.map((application) => {
          const courseId = asId(application.courseId);
          const groupId = asId(application.groupId);
          const termId = asId(application.intakeId);
          if (!courseId) return Promise.resolve({ application, result: [] });

          return axiosInstance
            .get('/course-routine', {
              params: {
                limit: 500,
                courseId,
                ...(groupId ? { groupId } : {}),
                startDate: startDateStr,
                endDate: endDateStr
              }
            })
            .then((res) => ({
              application,
              result: res.data?.data?.result || []
            }))
            .catch((error) => {
              console.error(
                `Failed to load routine for course ${courseId}:`,
                error
              );
              return { application, result: [] };
            });
        });

        const [routineResponses, historyRes] = await Promise.all([
          Promise.all(routinePromises),
          axiosInstance.get(`/student-attendance/history/${user._id}`, {
            params: {
              startDate: startDateStr,
              endDate: endDateStr,
              limit: 'all'
            }
          })
        ]);

        const historyResult = historyRes.data?.data?.result || [];
        const historyById: Record<string, ClassEntry> = {};
        (Array.isArray(historyResult) ? historyResult : []).forEach(
          (h: ClassEntry) => {
            if (h._id) historyById[h._id] = h;
          }
        );

        const byRoutineId = new Map<string, ClassEntry>();
        routineResponses.forEach(({ application, result }) => {
          const courseId = asId(application.courseId);
          const groupId = asId(application.groupId);
          const termId = asId(application.intakeId);
          const routineResults = Array.isArray(result) ? result : [];
          const firstRoutine = routineResults[0] || {};
          const courseName =
            asName(application.courseId) || asName(firstRoutine.courseId);
          const groupName =
            asName(application.groupId) || asName(firstRoutine.groupId);
          const termName = asName(firstRoutine.termId);

          routineResults.forEach((routine: any) => {
            const matched = historyById[routine._id];
            byRoutineId.set(routine._id, {
              _id: routine._id,
              attendanceId: matched?.attendanceId,
              classDate: routine.classDate,
              startTime: routine.startTime,
              endTime: routine.endTime,
              roomNumber: routine.roomNumber ?? matched?.roomNumber ?? null,
              status: matched?.status,
              remark: matched?.remark,
              courseId,
              courseName: matched?.courseName || courseName,
              groupId: asId(routine.groupId) || groupId,
              groupName: matched?.groupName || groupName,
              termId: asId(routine.termId) || termId,
              termName: matched?.termName || termName,
              teacherId: routine.teacherId?._id ?? matched?.teacherId,
              teacherName: routine.teacherId?.name ?? matched?.teacherName,
              teacherEmail: routine.teacherId?.email ?? matched?.teacherEmail
            });
          });
        });

        const merged = Array.from(byRoutineId.values()).sort((a, b) =>
          a.classDate === b.classDate
            ? (a.startTime || '').localeCompare(b.startTime || '')
            : a.classDate.localeCompare(b.classDate)
        );

        setClasses(merged);
      } catch (error) {
        console.error('Failed to load routine data:', error);
        setClasses([]);
      } finally {
        setRoutineLoading(false);
      }
    };
    fetchAll();
  }, [hasCourses, courses, user._id, weekDays]);

  const slotMap = useMemo(() => buildSlotMap(classes, weekDays), [
    classes,
    weekDays
  ]);

  const stats = useMemo(() => {
    const present = classes.filter((c) => c.status === 'present').length;
    const absent = classes.filter((c) => c.status === 'absent').length;
    const late = classes.filter((c) => c.status === 'late').length;
    const unmarked = classes.length - present - absent - late;
    const marked = present + late;
    const rate =
      classes.length > 0 ? Math.round((marked / classes.length) * 100) : 0;
    return { total: classes.length, present, absent, late, unmarked, rate };
  }, [classes]);

  const rangeLabel =
    weekDays.length > 0
      ? `${moment(weekDays[0]).format('DD MMM')} – ${moment(
          weekDays[weekDays.length - 1]
        ).format('DD MMM YYYY')}`
      : 'Select dates';

  const statusOf = (status?: AttendanceStatus) => {
    if (!status || !STATUS_META[status]) return null;
    return STATUS_META[status];
  };

  const applicationStatusStyle = (status: string) => {
    const label =
      status === 'approved'
        ? 'Enrolled'
        : status === 'cancelled'
          ? 'Rejected'
          : status;
    switch (status) {
      case 'approved':
        return { label, badge: 'bg-emerald-100 text-emerald-700', viewable: true };
      case 'applied':
        return { label, badge: 'bg-blue-100 text-blue-700', viewable: false };
      case 'cancelled':
        return { label, badge: 'bg-rose-100 text-rose-700', viewable: false };
      default:
        return { label, badge: 'bg-gray-100 text-gray-600', viewable: false };
    }
  };

  // ── Render ──

  if (dashboardLoading) {
    return (
      <div className="flex h-[80vh] flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const totalAssignments = applications.reduce((total, app) => total + (app.assignmentCount || 0), 0);

  return (
    <Card className="min-w-0 w-full max-w-full flex-1 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
         {user?.name && (
                  <p className="text-2xl font-bold text-gray-800">
                    Welcome, <span className="text-watney">{user.name}</span>
                  </p>
                )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* ── Enrolled Courses (Desktop) ── */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">My Courses</h2>
              {/* <p className="text-xs text-gray-500">
                All your application statuses in one place
              </p> */}
            </div>
           
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Course Name
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Intake
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Applied On
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </TableHead>
                  <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {applications.length > 0 ? (
                  applications.map((application) => {
                    const st = applicationStatusStyle(application.status);
                    return (
                      <TableRow
                        key={application._id}
                        className="group transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney transition-colors group-hover:bg-watney/15">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-800">
                                {application.courseId?.name || 'Unnamed'}
                              </div>
                              {/* <div className="text-xs text-gray-500">
                                {application.assignmentCount
                                  ? `${application.assignmentCount} assignment${application.assignmentCount === 1 ? '' : 's'}`
                                  : 'No assignments yet'}
                              </div> */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {application.intakeId?.termName || '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-gray-600">
                          {moment(application.createdAt).format('DD MMM YYYY')}
                        </TableCell>
                        <TableCell>
                          <Badge className={st.badge}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {st.viewable ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/dashboard/courses/${application.courseId._id}/unit`
                                )
                              }
                              className="font-medium text-white bg-watney hover:bg-watney/95 "
                            >
                              <FileText className="mr-1.5 h-3.5 w-3.5" /> View
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not available
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center"
                    >
                      <GraduationCap className="mx-auto mb-2 h-9 w-9 text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">
                        No applications found
                      </p>
                      <p className="text-xs text-gray-400">
                        Once you apply, your courses will appear here.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Enrolled Courses (Mobile) ── */}
    <div className="grid gap-3 md:hidden">
  <div className="flex items-center justify-between px-1">
    <h2 className="text-base font-bold text-gray-800 sm:text-lg">My Courses</h2>
  </div>
  
  {applications.length > 0 ? (
    applications.map((application) => {
      const st = applicationStatusStyle(application.status);
      return (
        <div
          key={application._id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Course Info */}
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {application.courseId?.name || 'Unnamed Course'}
              </h3>
              <p className="text-xs text-gray-500">
                {application.intakeId?.termName || 'Intake not set'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Applied {moment(application.createdAt).format('DD MMM YYYY')}
              </p>
            </div>
          </div>

          {/* Status & Action */}
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-gray-100 pt-3">
            <div className="flex-1">
              <Badge className={`${st.badge} w-full sm:w-auto justify-center`}>
                {st.label}
              </Badge>
            </div>
            
            {st.viewable ? (
              <Button
                size="sm"
                onClick={() =>
                  navigate(
                    `/dashboard/courses/${application.courseId._id}/unit`
                  )
                }
                className="w-full sm:w-auto bg-watney text-white hover:bg-watney/90 text-xs sm:text-sm"
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> 
                View Course
              </Button>
            ) : (
              <span className="text-xs text-gray-400 text-center sm:text-left">
                Not available
              </span>
            )}
          </div>
        </div>
      );
    })
  ) : (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
      <GraduationCap className="mx-auto mb-2 h-8 w-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-600">
        No applications found
      </p>
      <p className="text-xs text-gray-400">
        Once you apply, your courses will appear here.
      </p>
    </div>
  )}
</div>
        {/* ── Overview Stats ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Assignments Card */}
          <div
            onClick={() => navigate('/dashboard/student-assignments')}
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-watney/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Total Assignments
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Across all your courses
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-watney" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">
              {totalAssignments}
            </p>
          </div>

          {/* Pending Assignment Feedback */}
          <div
            onClick={() => navigate('/dashboard/student-assignments-feedback')}
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-watney/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Assignment Feedbacks
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Pending review
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-watney" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">
              {pendingFeedbackCount}
            </p>
          </div>
        </div>

        {/* Student Class Routine & Attendance */}
        <div className="w-full max-w-full min-w-0 overflow-hidden border border-gray-200 rounded-lg bg-white">
          <div className="flex flex-col gap-4 p-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-watney/10 p-2">
                  <CalendarClock className="h-5 w-5 text-watney" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                   Class Routine & Attendance
                  </h2>
                 
                </div>
              </div>
            </div>

            {/* Date range controls */}
            {hasCourses && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-y border-gray-100 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-watney text-white transition-colors hover:bg-watney/90"
                    onClick={() => shiftRange(-(weekDays.length || 7))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {isCustomMode ? (
                    <div className="z-50 flex items-center gap-2 rounded-full border border-watney/40 bg-white p-1 shadow-sm">
                      <CalendarRange className="ml-2 h-3.5 w-3.5 shrink-0 text-watney" />
                      <DatePicker
                        selectsRange
                        startDate={tempStart}
                        endDate={tempEnd}
                        onChange={(dates: [Date | null, Date | null]) =>
                          setCustomRange(dates)
                        }
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select date range..."
                        isClearable={false}
                        popperPlacement="bottom-start"
                        popperProps={{ strategy: 'fixed' }}
                        className="w-52 border-none bg-transparent text-xs font-semibold text-gray-700 outline-none placeholder:text-gray-400"
                      />
                      <button
                        onClick={handleApply}
                        disabled={!tempStart || !tempEnd}
                        className="h-7 rounded-full bg-watney px-3 text-[11px] font-bold text-white transition-colors hover:bg-watney/90 disabled:opacity-40"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setIsCustomMode(false)}
                        className="mr-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openCustomMode}
                      className="flex min-w-[180px] items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-50"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-watney" />
                      {rangeLabel}
                    </button>
                  )}

                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-watney text-white transition-colors hover:bg-watney/90"
                    onClick={() => shiftRange(weekDays.length || 7)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {!isCustomMode && (
                    <>
                      <Button
                      variant="outline"
                        className="h-8 rounded-md border border-gray-200 px-3 text-xs font-semibold transition-colors"
                        onClick={goThisWeek}
                      >
                        This Week
                      </Button>
                      <Button
                        className="h-8 rounded-md bg-watney px-3 text-xs font-semibold text-white transition-colors hover:bg-watney/90"
                        onClick={goToday}
                      >
                        Today
                      </Button>
                    </>
                  )}
                </div>

                <span className="text-xs text-gray-400">
                  {classes.length} class{classes.length === 1 ? '' : 'es'} in range
                </span>
              </div>
            )}

            {/* View toggle */}
            {!routineLoading && hasCourses && (
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="calendar">
                    <CalendarDays className="mr-1.5 h-4 w-4" /> Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="mr-1.5 h-4 w-4" /> List View
                  </TabsTrigger>
                </TabsList>

                {/* ── Weekly grid calendar view ── */}
                <TabsContent value="calendar" className="mt-4">
                  <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      {(Object.keys(STATUS_META) as AttendanceStatus[]).map(
                        (key) => (
                          <span
                            key={key}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: STATUS_META[key].hex }}
                            />
                            {STATUS_META[key].label}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {routineLoading ? (
                    <div className="flex justify-center py-8">
                      <BlinkingDots size="small" color="bg-watney" />
                    </div>
                  )  : (
                    <div className="relative max-h-[650px] w-full min-w-0 max-w-full overflow-auto rounded-sm border border-gray-300 bg-white shadow-sm">
                      <table className="w-max min-w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-30 bg-slate-50">
                          <tr>
                            <th className="sticky left-0 top-0 z-40 w-16 min-w-[64px] border-b border-r border-gray-200 bg-slate-50 px-2 py-2 text-right text-[10px] font-semibold uppercase tracking-wide shadow-[4px_0_8px_-3px_rgba(0,0,0,0.15)]">
                              Time
                            </th>
                            {weekDays.map((d, di) => {
                              const today = isToday(d);
                              const wknd = [0, 6].includes(d.getDay());
                              const dayName = d.toLocaleDateString('en-GB', {
                                weekday: 'short'
                              });
                              return (
                                <th
                                  key={di}
                                  style={{
                                    width: COLUMN_WIDTH,
                                    minWidth: `${COLUMN_MIN_PX}px`,
                                    maxWidth: `${COLUMN_MAX_PX}px`
                                  }}
                                  className={`border-b border-r border-gray-200 py-2 text-center ${
                                    today
                                      ? 'bg-blue-50'
                                      : wknd
                                        ? 'bg-slate-100/60'
                                        : ''
                                  }`}
                                >
                                  <div className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                                    {dayName}
                                  </div>
                                  {today ? (
                                    <div className="mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[13px] font-medium text-white">
                                      {d.getDate()}
                                    </div>
                                  ) : (
                                    <div className="mt-1 text-sm font-medium text-black">
                                      {d.getDate()}
                                    </div>
                                  )}
                                  <div className="mt-0.5 text-[9px] font-medium text-black/50">
                                    {d.toLocaleDateString('en-GB', {
                                      month: 'short'
                                    })}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {HOURS.map((hr) => (
                            <tr key={hr}>
                              <td className="sticky left-0 z-20 w-16 min-w-[64px] border-b border-r border-gray-200 bg-white px-2 pt-1 text-right align-top text-[11px] font-semibold text-black/70 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.15)]">
                                {fmtH(hr)}
                              </td>
                              {weekDays.map((_, di) => {
                                const slot = slotMap[di]?.[hr];
                                if (slot && !slot.isStart) return null;

                                const today = isToday(weekDays[di]);
                                const wknd = [0, 6].includes(weekDays[di].getDay());
                                const cellCls = `border-b border-r border-gray-200 p-0 align-top transition-colors relative ${
                                  today
                                    ? 'bg-blue-50/20'
                                    : wknd
                                      ? 'bg-slate-50/60'
                                      : ''
                                }`;

                                if (!slot)
                                  return (
                                    <td
                                      key={di}
                                      className={cellCls}
                                      style={{
                                        height: ROW_HEIGHT,
                                        width: COLUMN_WIDTH,
                                        minWidth: `${COLUMN_MIN_PX}px`,
                                        maxWidth: `${COLUMN_MAX_PX}px`
                                      }}
                                    />
                                  );

                                const { entry, span, topPx, heightPx } = slot;
                                const meta = statusOf(entry.status);

                                return (
                                  <td
                                    key={di}
                                    rowSpan={span}
                                    className={cellCls}
                                    style={{
                                      height: span * ROW_HEIGHT,
                                      width: COLUMN_WIDTH,
                                      minWidth: `${COLUMN_MIN_PX}px`,
                                      maxWidth: `${COLUMN_MAX_PX}px`
                                    }}
                                  >
                                    <div
                                      className="relative h-full w-full p-1"
                                      title={entry.remark || undefined}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setSelectedEntry(entry)}
                                        className={clsx(
                                          'absolute left-1 right-1 z-10 flex cursor-pointer flex-col overflow-hidden rounded-md border bg-white p-2 text-left text-xs shadow-sm transition-shadow hover:shadow-md',
                                          meta ? meta.border : 'border-gray-200'
                                        )}
                                        style={{
                                          top: topPx + 2,
                                          height: Math.max(heightPx - 4, 32),
                                          borderLeft: meta ? `3px solid ${meta.hex}` : '3px solid #e5e7eb'
                                        }}
                                      >
                                        <div className="flex h-full select-none flex-col justify-start overflow-hidden">
                                          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[9px] font-semibold text-black">
                                            <Clock
                                              className="h-2.5 w-2.5 shrink-0"
                                              style={{ color: meta ? meta.hex : '#9ca3af' }}
                                            />
                                            {entry.startTime} – {entry.endTime}
                                          </div>
                                          <div className="mt-0.5 shrink-0 truncate text-[11px] font-bold text-black">
                                            {entry.courseName || 'Course'}
                                          </div>
                                          {(entry.groupName || entry.termName) && (
                                            <div className="mt-0.5 shrink-0 truncate text-[9px] text-black/60">
                                              {[entry.groupName, entry.termName]
                                                .filter(Boolean)
                                                .join(' · ')}
                                            </div>
                                          )}
                                          {entry.teacherName && (
                                            <div className="mt-0.5 flex shrink-0 items-center gap-1 overflow-hidden text-black/70">
                                              <User className="h-2.5 w-2.5 shrink-0" />
                                              <span className="truncate text-[9px]">
                                                {entry.teacherName}
                                              </span>
                                            </div>
                                          )}
                                          {meta && (
                                            <div
                                              className={clsx(
                                                'mt-auto flex shrink-0 items-center gap-1 pt-1 text-[9px] font-bold',
                                              meta.text
                                              )}
                                            >
                                              <span
                                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: meta.hex }}
                                              />
                                              {meta.label}
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* ── List view ── */}
                <TabsContent value="list" className="mt-4">
                  {routineLoading ? (
                    <div className="flex justify-center py-8">
                      <BlinkingDots size="small" color="bg-watney" />
                    </div>
                  ) : (
                    <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-gray-100">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remark</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classes.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="py-6 text-center text-gray-500"
                              >
                                No classes scheduled in this date range.
                              </TableCell>
                            </TableRow>
                          ) : (
                            classes.map((cls) => {
                              const meta = statusOf(cls.status);
                              return (
                                <TableRow
                                  key={cls._id}
                                  onClick={() => setSelectedEntry(cls)}
                                  className="h-16 cursor-pointer hover:bg-gray-50"
                                >
                                  <TableCell className="whitespace-nowrap">
                                    {moment
                                      .utc(cls.classDate)
                                      .format('ddd, DD MMM YYYY')}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {cls.startTime || '--:--'} –{' '}
                                    {cls.endTime || '--:--'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">
                                      {cls.courseName || 'Course'}
                                    </div>
                                    {(cls.groupName || cls.termName) && (
                                      <div className="text-xs text-gray-500">
                                        {[cls.groupName, cls.termName]
                                          .filter(Boolean)
                                          .join(' · ')}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>{cls.teacherName || '—'}</TableCell>
                                  <TableCell>
                                    {meta ? (
                                      <span
                                        className={clsx(
                                          'inline-flex items-center gap-1.5 text-xs font-bold',
                                          meta.text
                                        )}
                                      >
                                        <span
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: meta.hex }}
                                        />
                                        {meta.label}
                                      </span>
                                    ) : (
                                      '—'
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-[220px] truncate text-xs text-gray-600">
                                    {cls.remark || '—'}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {routineLoading && hasCourses && (
              <div className="flex justify-center py-8">
                <BlinkingDots size="small" color="bg-watney" />
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
        >
          <DialogContent className="max-w-md">
            {selectedEntry && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-gray-900">
                    {selectedEntry.courseName || 'Class Details'}
                  </DialogTitle>
                  {(selectedEntry.groupName || selectedEntry.termName) && (
                    <p className="text-xs font-medium text-black/70">
                      {[selectedEntry.groupName, selectedEntry.termName]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </DialogHeader>

                <div className="border border-gray-200 shadow-none rounded-lg bg-white">
                  <div className="divide-y divide-gray-100 px-4 py-1">
                    {statusOf(selectedEntry.status) && (
                      <div className="flex items-center justify-between gap-3 py-3">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Status
                        </span>
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                            statusOf(selectedEntry.status)!.text,
                            statusOf(selectedEntry.status)!.border
                          )}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusOf(selectedEntry.status)!.hex }}
                          />
                          {statusOf(selectedEntry.status)!.label}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 py-2.5">
                      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                        Date
                      </span>
                      <span className="text-right text-black">
                        {moment
                          .utc(selectedEntry.classDate)
                          .format('dddd, DD MMM YYYY')}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 py-2.5">
                      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                        Time
                      </span>
                      <span className="text-right text-black">
                        {selectedEntry.startTime || '--:--'} –{' '}
                        {selectedEntry.endTime || '--:--'}
                      </span>
                    </div>

                    {selectedEntry.groupName && (
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Group
                        </span>
                        <span className="text-right text-black">
                          {selectedEntry.groupName}
                        </span>
                      </div>
                    )}

                    {selectedEntry.termName && (
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Term
                        </span>
                        <span className="text-right text-black">
                          {selectedEntry.termName}
                        </span>
                      </div>
                    )}

                    {selectedEntry.teacherName && (
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Teacher
                        </span>
                        <div className="text-right text-black">
                          <div>{selectedEntry.teacherName}</div>
                          {selectedEntry.teacherEmail && (
                            <div className="text-xs text-black/60">
                              {selectedEntry.teacherEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedEntry.roomNumber && (
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Room
                        </span>
                        <span className="text-right text-black">
                          {selectedEntry.roomNumber}
                        </span>
                      </div>
                    )}

                    {selectedEntry.remark && (
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-black/80">
                          Remark
                        </span>
                        <span className="text-right text-black">
                          {selectedEntry.remark}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}