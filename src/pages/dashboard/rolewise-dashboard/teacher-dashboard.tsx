import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment-timezone';
import clsx from 'clsx';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  UserCheck,
  UserX,
  Timer,
  Check,
  X,
  Loader2,
  File,
  Users,
  CalendarRange,
  CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

// ── Types & Interfaces ──────────────────────────────────────────────────
type AttendanceStatus = 'present' | 'absent' | 'late';

interface RoutineEntry {
  _id: string;
  classDate: string;
  startTime?: string;
  endTime?: string;
  note?: string;
  courseId?: { _id: string; name: string } | string;
  groupId?: { _id: string; name: string } | string;
  termId?: { _id: string; name: string } | string;
}

interface SheetStudent {
  studentId: any;
  applicationCourseId: string;
  status?: AttendanceStatus;
  remark?: string;
}

interface AttendanceSheet {
  _id: string;
  classRoutineId: string;
  classDate: string;
  attendance: SheetStudent[];
  courseId?: { _id: string; name: string } | string;
  groupId?: { _id: string; name: string } | string;
  termId?: { _id: string; name: string } | string;
}

interface SlotInfo {
  entry: RoutineEntry;
  idx: number;
  span: number;
  isStart: boolean;
  topPx: number;
  heightPx: number;
}

interface TeacherDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface TimeLog {
  _id: string;
  clockIn?: string;
  clockOut?: string;
  breaks: Array<{
    breakStart?: string;
    breakEnd?: string;
  }>;
  action: string;
}

// ── Constants & Helpers ──────────────────────────────────────────────────
const STATUS_META: Record<
  AttendanceStatus,
  { label: string; icon: any; active: string; chip: string }
> = {
  present: {
    label: 'Present',
    icon: UserCheck,
    active: 'bg-emerald-500 text-white border-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700'
  },
  absent: {
    label: 'Absent',
    icon: UserX,
    active: 'bg-rose-500 text-white border-rose-600',
    chip: 'bg-rose-100 text-rose-700'
  },
  late: {
    label: 'Late',
    icon: Timer,
    active: 'bg-amber-500 text-white border-amber-600',
    chip: 'bg-amber-100 text-amber-700'
  }
};

const COURSE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#22c55e'
];

const attendancePayloadSchema = z.array(
  z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    status: z.enum(['present', 'absent', 'late'], {
      required_error: 'Attendance status is required for every student',
      invalid_type_error: 'Invalid attendance status'
    }),
    remark: z
      .string()
      .max(200, 'Remark must be at most 200 characters')
      .optional()
  })
);

const START_H = 8;
const END_H = 23;
const HOURS = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const ROW_HEIGHT = 96;
const COLUMN_MIN_PX = 120;
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

function routineToFormDay(entry: RoutineEntry, days: Date[]): number {
  const ed = entry.classDate.split('T')[0];
  return days.findIndex((d) => ed === toUTCDateKey(d));
}

function buildSlotMap(routines: RoutineEntry[], days: Date[]) {
  const map: Record<number, Record<number, SlotInfo>> = {};

  routines.forEach((entry, idx) => {
    const di = routineToFormDay(entry, days);
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

const studentName = (s: any) =>
  s?.name ||
  [s?.title, s?.firstName, s?.lastName].filter(Boolean).join(' ') ||
  s?.email ||
  'Unknown Student';

const asObject = (v: any) => (typeof v === 'string' ? { _id: v } : v);
const courseIdOf = (r: RoutineEntry) => {
  const c = asObject(r.courseId);
  return c?._id || '';
};
const courseNameOf = (r?: RoutineEntry | null) => {
  if (!r) return '';
  return asObject(r.courseId)?.name || 'Course';
};
const groupNameOf = (s?: AttendanceSheet | null) => {
  return asObject(s?.groupId)?.name || '';
};
const termNameOf = (s?: AttendanceSheet | null) => {
  return asObject(s?.termId)?.name || '';
};
const routineGroupNameOf = (r?: RoutineEntry | null) => {
  return asObject(r?.groupId)?.name || '';
};
const routineTermNameOf = (r?: RoutineEntry | null) => {
  return asObject(r?.termId)?.name || '';
};

// ── Main Dashboard Component ─────────────────────────────────────────────
export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ==========================================
  // Dashboard Metrics & Time Logs (Commented out)
  // ==========================================

  const [allCourses, setAllCourses] = useState<number>(0);
  const [pendingFeedbacks, setPendingFeedbacks] = useState<number>(0);
  const [studentListCount, setStudentListCount] = useState<number>(0);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLog, setTimeLog] = useState<TimeLog | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd' | null
  >(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const getLondonTime = () => {
    return moment.tz('Europe/London').toISOString();
  };

  const formatToLondon = (
    isoString: string | undefined,
    format = 'DD/MM/YYYY HH:mm'
  ) => {
    if (!isoString) return '—';
    return moment.utc(isoString).tz('Europe/London').format(format);
  };

  // // Helper: Calculate net working minutes (in UTC to avoid DST issues)
  // const calculateNetWorkingSeconds = (log: TimeLog): number => {
  //   if (!log.clockIn) return 0;

  //   const clockIn = moment.tz(log.clockIn, 'Europe/London');
  //   const clockOut = log.clockOut
  //     ? moment.tz(log.clockOut, 'Europe/London')
  //     : moment.tz('Europe/London'); // use now in London time if no clockOut

  //   let totalBreakMs = 0;
  //   for (const brk of log.breaks || []) {
  //     if (brk.breakStart) {
  //       const start = moment.tz(brk.breakStart, 'Europe/London');
  //       // Use breakEnd if exists, otherwise if ongoing, use current London time
  //       const end = brk.breakEnd
  //         ? moment.tz(brk.breakEnd, 'Europe/London')
  //         : moment.tz('Europe/London');
  //       if (end.isAfter(start)) {
  //         totalBreakMs += end.diff(start);
  //       }
  //     }
  //   }

  //   const totalWorkMs = clockOut.diff(clockIn);
  //   const netWorkMs = Math.max(0, totalWorkMs - totalBreakMs);
  //   return Math.floor(netWorkMs / 1000);
  // };

  // const formatDurationWithSeconds = (totalSeconds: number) => {
  //   if (totalSeconds <= 0) return '0s';

  //   const hours = Math.floor(totalSeconds / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = totalSeconds % 60;

  //   const parts = [];
  //   if (hours > 0) parts.push(`${hours}h`);
  //   if (minutes > 0) parts.push(`${minutes}m`);
  //   if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  //   return parts.join(' ');
  // };

  // // Update current time every second
  // useEffect(() => {
  //   const updateTime = () => {
  //     setCurrentTime(formatToLondon(getLondonTime(), 'DD/MM/YYYY HH:mm:ss'));
  //   };

  //   updateTime();
  //   const interval = setInterval(updateTime, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // // ✅ Fetch teacher dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch teacher courses (teacherCourse by login teacherId) and
      // pending feedbacks in parallel
      const [coursesResponse, feedbackResponse] = await Promise.all([
        axiosInstance.get(`/teacher-courses`, {
          params: { teacherId: user._id, limit: 'all' }
        }),
        axiosInstance.get(
          `/assignment/teacher-feedback/${user._id}?limit=1&fields=applicationId`
        )
      ]);
      const courses = coursesResponse?.data?.data?.result || [];
      setTeacherCourses(Array.isArray(courses) ? courses : []);
      setAllCourses(courses.length);

      const pending = feedbackResponse?.data?.data?.meta.total || 0;
      setPendingFeedbacks(pending);

      // Students assigned to each of the teacher's courses via
      // groupAssignedStudent — fetched in parallel and flattened
      setStudentsLoading(true);
      const validCourses = (Array.isArray(courses) ? courses : []).filter(
        (c: any) => c?.courseId?._id || c?.courseId
      );
      const studentResponses = await Promise.all(
        validCourses.map((c: any) =>
          axiosInstance.get('/student-assign-group', {
            params: {
              courseId: c.courseId?._id || c.courseId,
              groupId: c.groupId?._id || c.groupId,
              courseTermId: c.courseTermId,
              limit: 'all'
            }
          })
        )
      );

      const students = studentResponses.flatMap((res, i) => {
        const course = validCourses[i];
        const courseId = course.courseId?._id || course.courseId;
        const courseName = course.courseId?.name || 'Course';
        const groupId = course.groupId?._id || course.groupId;
        const groupName = course.groupId?.name || '';
        const courseTermId = course.courseTermId;
        const termName = course.termId?.name || '';
        return (res?.data?.data?.result || []).map((item: any) => ({
          _id: item._id,
          studentId: item.studentId,
          courseId,
          courseName,
          groupId,
          groupName,
          courseTermId,
          termName
        }));
      });
      setAssignedStudents(students);
      setStudentListCount(
        new Set(
          students.map((s) => s.studentId?._id || s.studentId).filter(Boolean)
        ).size
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setStudentsLoading(false);
    }
  }, [user._id]);

  // const fetchTimeLog = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/logs?userId=${user._id}`);
  //     const logs = response.data?.data?.result || [];

  //     if (logs.length === 0) {
  //       setTimeLog(null);
  //       return;
  //     }

  //     const latestLog = logs[0];

  //     if (latestLog.clockIn && latestLog.clockOut) {
  //       setTimeLog(null);
  //     } else {
  //       // Active session (clocked in but not out)
  //       setTimeLog(latestLog);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching time logs:', error);
  //   }
  // };

  // const handleClockIn = async () => {
  //   try {
  //     await axiosInstance.post('/logs', {
  //       userId: user._id,
  //       action: 'clockIn',
  //       clockIn: getLondonTime()
  //     });
  //     await fetchTimeLog();
  //   } catch (error) {
  //     console.error('Error clocking in:', error);
  //   }
  // };

  // const handleClockOut = async () => {
  //   try {
  //     await axiosInstance.patch('/logs', {
  //       userId: user._id,
  //       action: 'clockOut',
  //       clockOut: getLondonTime()
  //     });
  //     await fetchTimeLog();
  //   } catch (error) {
  //     console.error('Error clocking out:', error);
  //   }
  // };

  // const handleBreakStart = async () => {
  //   try {
  //     await axiosInstance.patch('/logs', {
  //       userId: user._id,
  //       action: 'break',
  //       break: getLondonTime()
  //     });
  //     await fetchTimeLog();
  //   } catch (error) {
  //     console.error('Error starting break:', error);
  //   }
  // };

  // const handleBreakEnd = async () => {
  //   try {
  //     await axiosInstance.patch('/logs', {
  //       userId: user._id,
  //       action: 'break',
  //       break: getLondonTime()
  //     });
  //     await fetchTimeLog();
  //   } catch (error) {
  //     console.error('Error ending break:', error);
  //   }
  // };

  // // ✅ Confirmation handling
  // const confirmAction = (
  //   action: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'
  // ) => {
  //   setPendingAction(action);
  //   setShowConfirm(true);
  // };

  // const executeAction = () => {
  //   if (!pendingAction) return;

  //   switch (pendingAction) {
  //     case 'clockIn':
  //       handleClockIn();
  //       break;
  //     case 'clockOut':
  //       handleClockOut();
  //       break;
  //     case 'breakStart':
  //       handleBreakStart();
  //       break;
  //     case 'breakEnd':
  //       handleBreakEnd();
  //       break;
  //   }

  //   setShowConfirm(false);
  //   setPendingAction(null);
  // };

  // // ✅ Check if currently on break
  // const isOnBreak = timeLog?.breaks?.some(
  //   (breakItem) => breakItem.breakStart && !breakItem.breakEnd
  // );

  useEffect(() => {
    if (user._id) fetchData();
  }, [user._id]);

  // ==========================================
  // Teacher Routine & Attendance Logic
  // ==========================================
  const [appliedRange, setAppliedRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').toDate(),
    moment().endOf('isoWeek').toDate()
  ]);

  const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').toDate(),
    moment().endOf('isoWeek').toDate()
  ]);

  const [startDate, endDate] = appliedRange;
  const [tempStart, tempEnd] = customRange;

  const [isCustomMode, setIsCustomMode] = useState(false);

  const [routines, setRoutines] = useState<RoutineEntry[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [attendanceTakenIds, setAttendanceTakenIds] = useState<Set<string>>(
    new Set()
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    {}
  );
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [unmarkedIds, setUnmarkedIds] = useState<Set<string>>(new Set());
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineEntry | null>(
    null
  );

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

  const toLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

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

  const goThisMonth = () => {
    const thisMonth: [Date, Date] = [
      moment().startOf('month').toDate(),
      moment().endOf('month').toDate()
    ];
    setAppliedRange(thisMonth);
    setCustomRange(thisMonth);
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

  const fetchRoutines = useCallback(async () => {
    if (weekDays.length === 0) return;
    // Only fetch routines once the teacher's assigned courses are known —
    // skip entirely if the teacher has no teacherCourse assignments.
    if (teacherCourses.length === 0) {
      setRoutines([]);
      setAttendanceTakenIds(new Set());
      return;
    }
    setRoutinesLoading(true);
    try {
      const params = {
        teacherId: user._id, // Use user._id instead of props teacherId
        startDate: toLocalDateString(weekDays[0]),
        endDate: toLocalDateString(weekDays[weekDays.length - 1])
      };

      const [routineRes, attendanceRes] = await Promise.all([
        axiosInstance.get('/course-routine?limit=500', { params }),
        axiosInstance.get('/student-attendance?limit=500', { params })
      ]);

      const routineResult = routineRes.data?.data?.result || [];
      setRoutines(Array.isArray(routineResult) ? routineResult : []);

      const sheets = attendanceRes.data?.data?.result || [];
      const taken = new Set<string>();
      (Array.isArray(sheets) ? sheets : []).forEach((sheet: any) => {
        const hasMarks = (sheet?.attendance || []).some(
          (entry: any) => entry?.status
        );
        const routineId = sheet?.classRoutineId?._id || sheet?.classRoutineId;
        if (hasMarks && routineId) taken.add(routineId.toString());
      });
      setAttendanceTakenIds(taken);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      setRoutines([]);
      setAttendanceTakenIds(new Set());
    } finally {
      setRoutinesLoading(false);
    }
  }, [user._id, weekDays, teacherCourses]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const courseColor = useMemo(() => {
    const ids = [...new Set(routines.map(courseIdOf))].filter(Boolean);
    const map: Record<string, string> = {};
    ids.forEach((id, i) => {
      map[id] = COURSE_COLORS[i % COURSE_COLORS.length];
    });
    return map;
  }, [routines]);

  const slotMap = useMemo(
    () => buildSlotMap(routines, weekDays),
    [routines, weekDays]
  );

 const openAttendance = async (routine: RoutineEntry) => {
  setSelectedRoutine(routine);
  setDialogOpen(true);
  setSheet(null);
  setStatuses({});
  setRemarks({});
  setUnmarkedIds(new Set());
  setSheetLoading(true);
  try {
    const res = await axiosInstance.get(
      `/student-attendance/by-routine/${routine._id}`
    );
    const sheetData: AttendanceSheet = res.data?.data;
    setSheet(sheetData);
    const initialStatuses: Record<string, AttendanceStatus> = {};
    const initialRemarks: Record<string, string> = {};
    sheetData?.attendance?.forEach((entry) => {
      const sid = entry.studentId?._id || entry.studentId;
      if (sid) {
        if (entry.status) initialStatuses[sid] = entry.status;
        if (entry.remark) initialRemarks[sid] = entry.remark;
      }
    });
    setStatuses(initialStatuses);
    setRemarks(initialRemarks);
  } catch (error: any) {
    toast({
      title: 'Failed to load attendance sheet',
      description: error?.response?.data?.message || 'Please try again',
      variant: 'destructive'
    });
  } finally {
    setSheetLoading(false);
  }
};

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setUnmarkedIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
    setStatuses((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    setStatuses((prev) => {
      const next = { ...prev };
      sheet?.attendance?.forEach((entry) => {
        const sid = entry.studentId?._id || entry.studentId;
        if (sid) next[sid] = 'present';
      });
      return next;
    });
  };

  const stats = useMemo(() => {
    const students = sheet?.attendance || [];
    const present = students.filter(
      (e) => statuses[e.studentId?._id || e.studentId] === 'present'
    ).length;
    const absent = students.filter(
      (e) => statuses[e.studentId?._id || e.studentId] === 'absent'
    ).length;
    const late = students.filter(
      (e) => statuses[e.studentId?._id || e.studentId] === 'late'
    ).length;
    return {
      total: students.length,
      present,
      absent,
      late,
      unmarked: students.length - present - absent - late
    };
  }, [sheet, statuses]);

  const saveAttendance = async () => {
    if (!sheet) return;
    const entries = (sheet.attendance || [])
      .map((entry) => {
        const sid = entry.studentId?._id || entry.studentId;
        const status = statuses[sid];
        const remark = remarks[sid]?.trim();
        if (!sid) return null;
        const payload: Record<string, unknown> = { studentId: sid, status };
        if (remark) payload.remark = remark;
        return payload;
      })
      .filter(Boolean);

    const parsed = attendancePayloadSchema.safeParse(entries);
    if (!parsed.success) {
      const missing = new Set<string>();
      (sheet.attendance || []).forEach((entry) => {
        const sid = entry.studentId?._id || entry.studentId;
        if (sid && !statuses[sid]) missing.add(sid);
      });
      setUnmarkedIds(missing);
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.patch(
        `/student-attendance/bulk/${sheet.classRoutineId}`,
        { entries: parsed.data, userId: user._id }
      );
      toast({
        title: 'Attendance saved successfully',
        description: `${stats.present} present, ${stats.absent} absent, ${stats.late} late`
      });
      setDialogOpen(false);
      setUnmarkedIds(new Set());
      fetchRoutines();
    } catch (error: any) {
      toast({
        title: 'Failed to save attendance',
        description: error?.response?.data?.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const routineDate = selectedRoutine
    ? moment.utc(selectedRoutine.classDate).format('dddd, DD MMM YYYY')
    : '';

  const selectedCourseName =
    courseNameOf(sheet as any) || courseNameOf(selectedRoutine);

  const rangeLabel =
    weekDays.length > 0
      ? `${moment(weekDays[0]).format('DD MMM')} – ${moment(
          weekDays[weekDays.length - 1]
        ).format('DD MMM YYYY')}`
      : 'Select dates';

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 rounded-md bg-white p-5 shadow-sm">
      {/* <div className="">
        <Card className="  shadow-none">
          <CardHeader className='p-0 pb-4'>
            <CardTitle className="text-xl text-gray-700">
              <div className="flex flex-row items-center gap-20">
                <div>
                  <div className="text-lg text-gray-600">Current Time</div>
                  <div className="text-xl font-bold text-gray-800">
                    {currentTime}
                  </div>
                </div>

                {timeLog && (
                  <div>
                    <div className="text-lg text-gray-600 flex flex-row items-center gap-2">Working Time {isOnBreak && (
                      <div className=" text-lg font-medium text-orange-600">
                        On Break
                      </div>
                    )}</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatDurationWithSeconds(
                        calculateNetWorkingSeconds(timeLog)
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className=" space-y-4 p-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {!timeLog ? (
                <Button
                  onClick={() => confirmAction('clockIn')}
                  className=" h-20 bg-watney text-xl text-white hover:bg-watney/90 font-semibold"
                >
                  Clock In
                </Button>
              ) : (
                <>
                  {!isOnBreak ? (
                    <Button
                      onClick={() => confirmAction('breakStart')}
                      className=" h-20 bg-blue-600  text-xl text-white hover:bg-blue-700 font-semibold"
                    >
                      Start Break
                    </Button>
                  ) : (
                    <Button
                      onClick={() => confirmAction('breakEnd')}
                      className=" h-20 bg-orange-600 text-xl text-white hover:bg-orange-700 font-semibold"
                    >
                      End Break
                    </Button>
                  )}
                  {!isOnBreak && (
                    <Button
                      onClick={() => confirmAction('clockOut')}
                      className=" h-20 bg-destructive text-xl text-white hover:bg-destructive/90 font-semibold"
                    >
                      Clock Out
                    </Button>
                  )}
                </>
              )}
            </div>
         
          </CardContent>
        </Card>

        <div></div>
      </div> */}

      {/* Routine & Attendance Section Integrated Directly */}
      <Card className="w-full min-w-0 max-w-full overflow-hidden shadow-none">
        <div className="flex flex-col gap-4">
          {/* Header with Welcome Message */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* <div className="rounded-lg bg-watney/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-watney" />
              </div> */}
              <div>
                {user?.name && (
                  <p className="text-2xl font-bold text-gray-800">
                    Welcome, <span className="text-watney">{user.name}</span>
                  </p>
                )}
                {/* <p className="text-xs text-gray-500">
                  Click a class block to take or update attendance
                </p> */}
              </div>
            </div>
          </div>
          {/* Dashboard Summary Cards (unchanged) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Card
              onClick={() => navigate(`teachers/courses/${user._id}`)}
              className="cursor-pointer border border-gray-300 transition-colors hover:bg-gray-50"
            >
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allCourses}</div>
              </CardContent>
            </Card>

            <Card
              onClick={() => navigate(`teacher-assignments-feedback`)}
              className="cursor-pointer border border-gray-300 transition-colors hover:bg-gray-50"
            >
              <CardHeader>
                <CardTitle>Pending Feedbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingFeedbacks}</div>
              </CardContent>
            </Card>

          
          </div>

         
          <div className="flex items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-watney/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-watney" />
              </div>
              <div>
                {user?.name && (
                  <p className="text-lg font-bold text-gray-800">
                    Class Routine & Attendance
                  </p>
                )}
                {/* <p className="text-xs text-gray-500">
                  Click a class block to take or update attendance
                </p> */}
              </div>
            </div>
          </div>
          {/* Date range controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-y border-gray-100 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="icon"
                className="h-8 w-8 bg-watney text-white hover:bg-watney/90"
                onClick={() => shiftRange(-(weekDays.length || 7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Range display / Custom picker switcher */}
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
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!tempStart || !tempEnd}
                    className="h-7 rounded-full bg-watney px-3 text-[11px] font-bold text-white hover:bg-watney/90 disabled:opacity-40"
                  >
                    Apply
                  </Button>
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

              <Button
                size="icon"
                className="h-8 w-8 bg-watney text-white hover:bg-watney/90"
                onClick={() => shiftRange(weekDays.length || 7)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={goThisWeek}
              >
                This Week
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={goThisMonth}
              >
                This Month
              </Button>
              <Button
                size="sm"
                className="h-8 bg-watney text-xs text-white hover:bg-watney/90"
                onClick={goToday}
              >
                Today
              </Button>
            </div>

          <span className="text-xs font-medium text-gray-600">
  Total: {routines.length} class{routines.length === 1 ? '' : 'es'} within this period
</span>
          </div>

          {/* Scrollable 2D Grid View */}
          {routinesLoading ? (
            <div className="flex justify-center py-8">
              <BlinkingDots size="small" color="bg-watney" />
            </div>
          ) : (
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
                            today ? 'bg-blue-50' : wknd ? 'bg-slate-100/60' : ''
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
                            {d.toLocaleDateString('en-GB', { month: 'short' })}
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
                          today ? 'bg-blue-50/20' : wknd ? 'bg-slate-50/60' : ''
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
                        const color =
                          courseColor[courseIdOf(entry)] || '#3b82f6';
                        const courseName = courseNameOf(entry);
                        const attendanceTaken = attendanceTakenIds.has(
                          entry._id
                        );

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
                            <div className="relative h-full w-full p-1">
                              <button
                                onClick={() => openAttendance(entry)}
                                title={
                                  attendanceTaken
                                    ? 'View / update attendance'
                                    : 'Take attendance'
                                }
                                className="absolute left-1 right-1 z-10 flex flex-col overflow-hidden rounded-md border bg-white p-2 text-left text-xs shadow-sm transition-all hover:shadow-md hover:brightness-[0.98]"
                                style={{
                                  top: topPx + 2,
                                  height: Math.max(heightPx - 4, 32),
                                  borderLeft: `3px solid ${color}`
                                }}
                              >
                                <div className="flex h-full select-none flex-col justify-start overflow-hidden">
                                  <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[9px] font-semibold text-black">
                                    <Clock
                                      className="h-2.5 w-2.5 shrink-0"
                                      style={{ color }}
                                    />
                                    {entry.startTime} – {entry.endTime}
                                  </div>
                                  <div className="mt-0.5 shrink-0 truncate text-[10px] font-bold text-black">
                                    {courseName}
                                  </div>
                                  {(routineGroupNameOf(entry) ||
                                    routineTermNameOf(entry)) && (
                                    <div className="mt-0.5 flex shrink-0 items-center gap-1 overflow-hidden text-[8px] font-medium text-black">
                                      {routineGroupNameOf(entry) && (
                                        <span className="truncate">
                                          G: {routineGroupNameOf(entry)}
                                        </span>
                                      )}
                                      {routineGroupNameOf(entry) &&
                                        routineTermNameOf(entry) && (
                                          <span className="shrink-0">·</span>
                                        )}
                                      {routineTermNameOf(entry) && (
                                        <span className="truncate">
                                          T: {routineTermNameOf(entry)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {entry.note && (
                                    <div className="mt-0.5 flex w-full shrink-0 items-center gap-1 overflow-hidden text-black">
                                      <File className="h-2.5 w-2.5 shrink-0" />
                                      <span className="truncate text-[9px]">
                                        {entry.note}
                                      </span>
                                    </div>
                                  )}
                                  <div
                                    className={clsx(
                                      'mt-auto flex shrink-0 items-center gap-1 pt-1 text-[8px] font-semibold',
                                      attendanceTaken
                                        ? 'text-watney'
                                        : 'text-black'
                                    )}
                                  >
                                    {attendanceTaken ? (
                                      <>
                                        <UserCheck className="h-2.5 w-2.5 shrink-0" />
                                        View Attendance
                                      </>
                                    ) : (
                                      <>Take Attendance →</>
                                    )}
                                  </div>
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
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-6xl flex-col overflow-hidden p-0 sm:p-0">
            <div className="shrink-0 px-4 py-4 sm:px-6">
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2 text-base text-black sm:text-lg">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-watney sm:h-5 sm:w-5" />
                  <span className="break-words">
                    Take Attendance
                    {selectedCourseName ? ` — ${selectedCourseName}` : ''}
                  </span>
                </DialogTitle>
                <DialogDescription className="space-y-1 text-xs text-black">
                  <div className="font-medium text-black">
                    {routineDate} · {selectedRoutine?.startTime || '--:--'} –{' '}
                    {selectedRoutine?.endTime || '--:--'}
                  </div>
                  {(groupNameOf(sheet) || termNameOf(sheet)) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {groupNameOf(sheet) && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 shrink-0" />
                          <span>Group: {groupNameOf(sheet)}</span>
                        </span>
                      )}
                      {termNameOf(sheet) && (
                        <span className="flex items-center gap-1">
                          <CalendarRange className="h-3 w-3 shrink-0" />
                          <span>Term: {termNameOf(sheet)}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {selectedRoutine?.note && (
                    <div className="flex items-center gap-1">
                      <File className="h-3 w-3 shrink-0" />
                      <span>{selectedRoutine.note}</span>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="px-4 py-4 sm:px-6">
                {sheetLoading ? (
                  <div className="flex justify-center py-12">
                    <BlinkingDots size="medium" color="bg-watney" />
                  </div>
                ) : !sheet ? (
                  <p className="py-12 text-center text-sm text-black">
                    Could not load the attendance sheet.
                  </p>
                ) : (
                  <>
                    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg bg-gray-100 p-2 text-center sm:p-3">
                        <p className="text-lg font-bold text-black sm:text-xl">
                          {stats.total}
                        </p>
                        <p className="text-[9px] font-semibold uppercase text-black sm:text-[10px]">
                          Students
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2 text-center sm:p-3">
                        <p className="text-lg font-bold text-emerald-700 sm:text-xl">
                          {stats.present}
                        </p>
                        <p className="text-[9px] font-semibold uppercase text-emerald-700 sm:text-[10px]">
                          Present
                        </p>
                      </div>
                      <div className="rounded-lg bg-rose-50 p-2 text-center sm:p-3">
                        <p className="text-lg font-bold text-rose-700 sm:text-xl">
                          {stats.absent}
                        </p>
                        <p className="text-[9px] font-semibold uppercase text-rose-700 sm:text-[10px]">
                          Absent
                        </p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2 text-center sm:p-3">
                        <p className="text-lg font-bold text-amber-700 sm:text-xl">
                          {stats.late}
                        </p>
                        <p className="text-[9px] font-semibold uppercase text-amber-700 sm:text-[10px]">
                          Late
                        </p>
                      </div>
                    </div>

                    {unmarkedIds.size > 0 && (
                      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                        {unmarkedIds.size} student
                        {unmarkedIds.size === 1 ? '' : 's'} not marked yet —
                        every student must be marked before saving.
                      </div>
                    )}

                    <div className="space-y-2">
                      {sheet.attendance?.length === 0 ? (
                        <p className="py-8 text-center text-sm text-black">
                          No enrolled students found for this class.
                        </p>
                      ) : (
                        sheet.attendance?.map((entry) => {
                          const sid = entry.studentId?._id || entry.studentId;
                          const status = statuses[sid];
                          const isUnmarked = unmarkedIds.has(sid);
                          return (
                            <div
                              key={sid || entry.applicationCourseId}
                              className={clsx(
                                'flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between',
                                isUnmarked
                                  ? 'border-rose-300 bg-rose-50/60 ring-1 ring-rose-200'
                                  : 'border-gray-100 hover:bg-gray-50/60'
                              )}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-black">
                                    {studentName(entry.studentId)}
                                  </p>
                                  <p className="truncate text-[11px] text-black/60">
                                    {entry.studentId?.email || ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex flex-wrap overflow-hidden rounded-md border border-gray-200">
                                  {(
                                    Object.keys(
                                      STATUS_META
                                    ) as AttendanceStatus[]
                                  ).map((key) => {
                                    const meta = STATUS_META[key];
                                    const Icon = meta.icon;
                                    const isActive = status === key;
                                    return (
                                      <button
                                        key={key}
                                        onClick={() => toggleStatus(sid, key)}
                                        title={meta.label}
                                        className={clsx(
                                          'flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-colors',
                                          isActive
                                            ? meta.active
                                            : 'bg-white text-black hover:bg-gray-50'
                                        )}
                                      >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">
                                          {meta.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                <Input
                                  placeholder="Remark (optional)"
                                  value={remarks[sid] || ''}
                                  onChange={(e) =>
                                    setRemarks((prev) => ({
                                      ...prev,
                                      [sid]: e.target.value
                                    }))
                                  }
                                  className="h-8 w-full text-xs text-black placeholder:text-black/40 sm:w-48 md:w-56"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 px-4 py-4 sm:px-6">
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllPresent}
                  disabled={!sheet || sheetLoading}
                  className="w-full sm:w-auto"
                >
                  <UserCheck className="mr-1.5 h-4 w-4" /> Mark All Present
                </Button>
                <div className="flex flex-1 flex-col-reverse justify-end gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false);
                      setUnmarkedIds(new Set());
                    }}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-1.5 h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                    onClick={saveAttendance}
                    disabled={saving || !sheet || sheetLoading}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 h-4 w-4" />
                    )}
                    Save Attendance
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Confirmation Dialog (Commented out logically matching your setup) */}
      {/* <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'clockIn' &&
                'Are you sure you want to clock in?'}
              {pendingAction === 'clockOut' &&
                'Are you sure you want to clock out?'}
              {pendingAction === 'breakStart' &&
                'Are you sure you want to start your break?'}
              {pendingAction === 'breakEnd' &&
                'Are you sure you want to end your break?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}