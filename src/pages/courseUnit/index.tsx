/**
 * Course unit workspace.
 *
 * The unit is the organising object here: a routine is scheduled under a unit
 * and a teacher is assigned to a unit, so both live on the unit row rather
 * than on the group as a whole. The cohort (students) and the attendance
 * history stay group-level, since enrolment itself is on the group.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import clsx from 'clsx';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Plus,
  FileText,
  MoveLeft,
  Pen,
  Trash2,
  ClipboardCheck,
  UserCheck,
  UserX,
  Timer,
  Loader2,
  History,
  Circle,
  Clock,
  Search,
  GraduationCap,
  UserMinus,
  BookOpen,
  Users,
  ChevronRight,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import axiosInstance from '@/lib/axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import Select from 'react-select';
import { fetchTeacherOptions } from '@/lib/teachers';
import { useEffectiveRole } from '@/hooks/use-effective-role';

// ── Types ────────────────────────────────────────────────────────────────

interface CourseUnit {
  _id: string;
  courseId: string;
  groupId: string;
  termId: string;
  unitReference: string;
  title: string;
  level: string;
  gls: string;
  credit: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late';

interface SheetStudent {
  studentId: any;
  applicationCourseId: string;
  status?: AttendanceStatus;
  remark?: string;
}

interface ChangeLogItem {
  _id?: string;
  studentId: any;
  previousStatus?: string;
  newStatus: string;
  remark?: string;
}

interface AttendanceLog {
  _id?: string;
  message?: string;
  updatedBy: any;
  updatedAt: string;
  changes: ChangeLogItem[];
}

interface AttendanceSheet {
  _id: string;
  classRoutineId: any;
  unitId?: any;
  classDate: string;
  attendance: SheetStudent[];
  logs?: AttendanceLog[];
  updatedBy?: any;
  updatedAt?: string;
  courseId?: any;
  groupId?: any;
  termId?: any;
}

interface AssignedMember {
  _id: string;
  unitId?: { _id: string; title?: string; unitReference?: string } | string;
  studentId?: { _id: string; name?: string; email?: string } | string;
  teacherId?: { _id: string; name?: string; email?: string } | string;
}

interface CourseStudent {
  _id: string;
  refId?: string;
  status?: string;
  studentId?: {
    _id: string;
    name?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | string;
  intakeId?: { _id: string; termName?: string } | string;
}

// ── Constants & Helpers ──────────────────────────────────────────────────

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; icon: any; active: string; chip: string }
> = {
  present: {
    label: 'Present',
    icon: UserCheck,
    active: 'bg-emerald-600 text-white',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  absent: {
    label: 'Absent',
    icon: UserX,
    active: 'bg-rose-600 text-white',
    chip: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  late: {
    label: 'Late',
    icon: Timer,
    active: 'bg-amber-500 text-white',
    chip: 'bg-amber-50 text-amber-700 border-amber-200'
  }
};

const attendancePayloadSchema = z.array(
  z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    status: z.enum(['present', 'absent', 'late'], {
      required_error: 'Status is required for every student'
    }),
    remark: z
      .string()
      .max(200, 'Remark must be at most 200 characters')
      .optional()
  })
);

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return moment.utc(dateStr).local().format('ddd, DD MMM YYYY');
}

const userName = (userObj: any) => {
  if (!userObj) return 'System / Unknown';
  if (typeof userObj === 'string') return userObj;
  return (
    userObj.name ||
    [userObj.firstName, userObj.lastName].filter(Boolean).join(' ') ||
    userObj.email ||
    'User'
  );
};

const studentName = (s: any) =>
  s?.name ||
  [s?.title, s?.firstName, s?.lastName].filter(Boolean).join(' ') ||
  s?.email ||
  'Unknown Student';

/** Two initials, for the roster avatars. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const idOf = (value: any): string =>
  typeof value === 'object' && value?._id ? value._id : String(value ?? '');

/** "REF — Title", falling back to whichever half exists. */
const unitLabel = (unit: any) => {
  if (!unit || typeof unit !== 'object') return '';
  return [unit.unitReference, unit.title].filter(Boolean).join(' — ');
};

const selectStyles = {
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: 'auto' as const
  }),
  control: (base: any) => ({
    ...base,
    minHeight: '38px',
    fontSize: '13px',
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    '&:hover': { borderColor: '#cbd5e1' }
  }),
  menu: (base: any) => ({ ...base, fontSize: '13px', zIndex: 9999 }),
  multiValue: (base: any) => ({ ...base, backgroundColor: '#f1f5f9' }),
  multiValueLabel: (base: any) => ({ ...base, fontSize: '12px' })
};

const menuPortalTarget =
  typeof document !== 'undefined' ? document.body : undefined;

type Option = { value: string; label: string };

// ── Small presentational pieces ──────────────────────────────────────────

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-watney/5 px-2 py-1 text-[11px] font-medium text-black">
      <span className="text-black">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-watney/5 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-black">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-black">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Icon-only action button with a tooltip — keeps the row dense but legible. */
function IconAction({
  label,
  icon: Icon,
  onClick,
  tone = 'default'
}: {
  label: string;
  icon: any;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
            tone === 'danger'
              ? 'border-gray-200 text-black hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
              : 'border-gray-200 text-black hover:border-watney/40 hover:bg-watney/5 hover:text-watney'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Component ────────────────────────────────────────────────────────────

function CourseUnitPage() {
  const { id: courseId, gid: groupId, tid: termId } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Teaching staff are stored as `employee` with a "Teacher" designation, so
  // the raw role would leave a real teacher unscoped - seeing every unit in
  // the group rather than only the ones they hold. `resolved` guards the
  // fetch, which asks for a different page size per role.
  const { isTeacher, isAdmin, resolved: roleResolved } = useEffectiveRole();
  const teacherScoped = isTeacher;

  // Units
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitSearch, setUnitSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<CourseUnit | null>(null);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [memberToUnassign, setMemberToUnassign] = useState<{
    _id: string;
    type: 'student' | 'teacher';
    name: string;
  } | null>(null);

  // Unit form
  const [unitReference, setUnitReference] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [gls, setGls] = useState('');
  const [credit, setCredit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Header meta
  const [courseName, setCourseName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [termName, setTermName] = useState('');

  // Units pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Attendance
  const [attendanceSheets, setAttendanceSheets] = useState<AttendanceSheet[]>(
    []
  );
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceUnitFilter, setAttendanceUnitFilter] = useState<Option>({
    value: 'all',
    label: 'All units'
  });

  // Cohort & teaching team
  const [assignedStudents, setAssignedStudents] = useState<AssignedMember[]>(
    []
  );
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedMember[]>(
    []
  );
  const [membersLoading, setMembersLoading] = useState(false);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignType, setAssignType] = useState<'student' | 'teacher'>(
    'student'
  );
  const [assignUnit, setAssignUnit] = useState<CourseUnit | null>(null);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);
  // Students and teachers are both assigned in batches - a unit can be taught
  // by several people, and a cohort is usually added a handful at a time.
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Applicants on this course, for the student picker
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);

  // Attendance date range — editable vs. applied
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').startOf('day').toDate(),
    moment().endOf('isoWeek').startOf('day').toDate()
  ]);
  const [startDate, endDate] = dateRange;
  const [appliedDateRange, setAppliedDateRange] = useState<
    [Date | null, Date | null]
  >([
    moment().startOf('isoWeek').startOf('day').toDate(),
    moment().endOf('isoWeek').startOf('day').toDate()
  ]);

  // Attendance editing
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheet | null>(
    null
  );
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [sheetStatuses, setSheetStatuses] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [sheetRemarks, setSheetRemarks] = useState<Record<string, string>>({});
  const [unmarkedIds, setUnmarkedIds] = useState<Set<string>>(new Set());
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [viewLogsModalOpen, setViewLogsModalOpen] = useState(false);
  const [activeLogs, setActiveLogs] = useState<AttendanceLog[]>([]);

  /**
   * Units are read-only for everyone but an admin.
   *
   * A teacher holds a unit to teach it, not to maintain the syllabus - adding,
   * editing or deleting a unit, and assigning other teachers to it, stays with
   * the admin. A student can only ever read.
   */
  const canEdit = isAdmin;

  /** Registers are staff business; a student never sees the attendance tab. */
  const canSeeAttendance = isAdmin || isTeacher;

  // ── Fetch units & header meta ──────────────────────────────────────────
  const fetchUnitsData = useCallback(
    async (page = 1, limit = entriesPerPage) => {
      if (!courseId) return;
      if (!roleResolved) return;

      try {
        setLoading(true);
        const courseRes = await axiosInstance.get(`/courses/${courseId}`);
        setCourseName(courseRes.data?.data?.name || 'Course');

        if (groupId) {
          const groupRes = await axiosInstance.get(`/course-group/${groupId}`);
          setGroupName(groupRes.data?.data?.name || '');
        }

        if (termId) {
          const termRes = await axiosInstance.get(`/course-term/${termId}`);
          setTermName(termRes.data?.data?.name || '');
        }

        // A teacher's list is narrowed to their own units after it arrives, so
        // it has to arrive whole - paging first would hand them a page that
        // filters down to nothing while their units sat on page two.
        const unitsRes = await axiosInstance.get('/course-unit', {
          params: {
            courseId,
            groupId,
            termId,
            ...(teacherScoped ? { limit: 'all' } : { page, limit })
          }
        });

        setUnits(unitsRes.data?.data?.result || []);
        // The API returns `totalPage` (singular) in its meta.
        setTotalPages(unitsRes.data?.data?.meta?.totalPage || 1);
        setCurrentPage(page);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load course units.',
          variant: 'destructive'
        });
        setUnits([]);
      } finally {
        setLoading(false);
      }
    },
    [courseId, groupId, termId, entriesPerPage, toast, teacherScoped, roleResolved]
  );

  // ── Fetch attendance sheets for the applied range ─────────────────────
  const fetchAttendanceData = useCallback(async () => {
    if (!courseId) return;
    const [appliedStart, appliedEnd] = appliedDateRange;

    try {
      setAttendanceLoading(true);
      const params: Record<string, any> = { courseId, limit: 'all' };
      if (groupId) params.groupId = groupId;
      if (termId) params.termId = termId;
      if (appliedStart)
        params.startDate = moment(appliedStart).format('YYYY-MM-DD');
      if (appliedEnd) params.endDate = moment(appliedEnd).format('YYYY-MM-DD');

      const res = await axiosInstance.get('/student-attendance', { params });
      setAttendanceSheets(res.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to load attendance records:', error);
      setAttendanceSheets([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, [courseId, groupId, termId, appliedDateRange]);

  // ── Fetch cohort & teaching team ──────────────────────────────────────
  /**
   * The cohort and the teaching team.
   *
   * Fetched independently rather than through one `Promise.all`: the two reads
   * are unrelated, and sharing a failure meant a student - who is not
   * necessarily allowed to list the group's other students - lost the teaching
   * team as well, so the unit rows showed no teacher at all. The teacher read
   * is the one a student actually needs, so it must not depend on the other.
   */
  const fetchGroupMembers = useCallback(async () => {
    // Only the course is required. This page is mounted on two route shapes -
    // `my-courses/:id/terms/:tid/groups/:gid/units`, which carries the group,
    // and `courses/:id/unit`, which does not - and bailing out without a group
    // meant the teaching team was never even requested on the second, so a
    // student arriving that way saw no teacher on any unit.
    if (!courseId) return;

    const params: Record<string, any> = { courseId, limit: 'all' };
    if (groupId) params.groupId = groupId;
    if (termId) params.courseTermId = termId;

    setMembersLoading(true);

    const [students, teachers] = await Promise.allSettled([
      axiosInstance.get('/student-assign-group', { params }),
      axiosInstance.get('/teacher-courses', { params })
    ]);

    if (students.status === 'fulfilled') {
      setAssignedStudents(students.value.data?.data?.result || []);
    } else {
      console.error('Failed to load assigned students:', students.reason);
      setAssignedStudents([]);
    }

    if (teachers.status === 'fulfilled') {
      setAssignedTeachers(teachers.value.data?.data?.result || []);
    } else {
      console.error('Failed to load assigned teachers:', teachers.reason);
      setAssignedTeachers([]);
    }

    setMembersLoading(false);
  }, [courseId, groupId, termId]);

  const fetchCourseStudents = useCallback(async () => {
    // Only ever used to fill the admin's "assign student" picker.
    if (!courseId || !canEdit) return;
    try {
      const res = await axiosInstance.get('/application-course', {
        params: { courseId, limit: 'all' }
      });
      setCourseStudents(res.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to load course students:', error);
      setCourseStudents([]);
    }
  }, [courseId, canEdit]);

  useEffect(() => {
    if (!courseId) return;
    fetchUnitsData(currentPage, entriesPerPage);
  }, [courseId, currentPage, entriesPerPage, fetchUnitsData]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    fetchGroupMembers();
    fetchCourseStudents();
  }, [fetchGroupMembers, fetchCourseStudents]);

  // ── Derived ────────────────────────────────────────────────────────────

  /** Teachers keyed by the unit they teach — the row renders straight off this. */
  const teachersByUnit = useMemo(() => {
    const map = new Map<string, AssignedMember[]>();
    assignedTeachers.forEach((item) => {
      const uid = idOf(item.unitId);
      if (!uid) return;
      if (!map.has(uid)) map.set(uid, []);
      map.get(uid)!.push(item);
    });
    return map;
  }, [assignedTeachers]);


  /**
   * A teacher only ever sees the units they hold.
   *
   * Teachers are assigned per unit, so the unit list has to be cut down to
   * theirs - the group's other units belong to other teachers and are not
   * theirs to open, edit or take a register for. Admins and staff keep the
   * whole group, which is the view they need to assign from.
   *
   * `assignedTeachers` is the same `/teacher-courses` read the teaching-team
   * column uses, already scoped to this course, term and group.
   */
  const teacherOwnUnitIds = useMemo(() => {
    if (!isTeacher) return null;
    const mine = new Set<string>();
    assignedTeachers.forEach((item) => {
      if (idOf(item.teacherId) !== String(user?._id)) return;
      const uid = idOf(item.unitId);
      if (uid) mine.add(uid);
    });
    return mine;
  }, [isTeacher, assignedTeachers, user?._id]);

  const scopedUnits = useMemo(
    () =>
      teacherOwnUnitIds
        ? units.filter((unit) => teacherOwnUnitIds.has(unit._id))
        : units,
    [units, teacherOwnUnitIds]
  );

  const filteredUnits = useMemo(() => {
    const term = unitSearch.trim().toLowerCase();
    if (!term) return scopedUnits;
    return scopedUnits.filter((unit) =>
      [unit.unitReference, unit.title, unit.level]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [scopedUnits, unitSearch]);

  /**
   * The registers on screen.
   *
   * Narrowed twice: to the units in scope - a teacher's own, an admin's all -
   * and then to whatever the unit filter is set to. Without the first pass a
   * teacher could read the register for a unit another teacher holds, since
   * the sheets themselves are fetched for the whole group.
   */
  const visibleSheets = useMemo(() => {
    const inScope = teacherOwnUnitIds
      ? attendanceSheets.filter((sheet) => {
          const uid = idOf(sheet.unitId) || idOf(sheet.classRoutineId?.unitId);
          return uid && teacherOwnUnitIds.has(uid);
        })
      : attendanceSheets;

    if (attendanceUnitFilter.value === 'all') return inScope;

    return inScope.filter((sheet) => {
      const uid = idOf(sheet.unitId) || idOf(sheet.classRoutineId?.unitId);
      return uid === attendanceUnitFilter.value;
    });
  }, [attendanceSheets, attendanceUnitFilter, teacherOwnUnitIds]);

  /** Roll-up across whatever the filters currently show. */
  const attendanceTotals = useMemo(() => {
    return visibleSheets.reduce(
      (totals, sheet) => {
        const entries = sheet.attendance || [];
        const present = entries.filter((a) => a.status === 'present').length;
        const absent = entries.filter((a) => a.status === 'absent').length;
        const late = entries.filter((a) => a.status === 'late').length;
        return {
          sessions: totals.sessions + 1,
          present: totals.present + present,
          absent: totals.absent + absent,
          late: totals.late + late,
          unmarked:
            totals.unmarked + (entries.length - present - absent - late)
        };
      },
      { sessions: 0, present: 0, absent: 0, late: 0, unmarked: 0 }
    );
  }, [visibleSheets]);

  const rangeLabel = useMemo(() => {
    const [from, to] = appliedDateRange;
    if (!from && !to) return 'All dates';
    const format = (date: Date | null) =>
      date ? moment(date).format('DD MMM YYYY') : '…';
    return from && to && moment(from).isSame(to, 'day')
      ? format(from)
      : `${format(from)} – ${format(to)}`;
  }, [appliedDateRange]);

  const unitFilterOptions = useMemo<Option[]>(
    () => [
      { value: 'all', label: 'All units' },
      ...scopedUnits.map((unit) => ({
        value: unit._id,
        label: unit.title || unit.unitReference || 'Untitled unit'
      }))
    ],
    [scopedUnits]
  );

  // ── Assign student / teacher ───────────────────────────────────────────
  const openAssignStudent = () => {
    setAssignType('student');
    setAssignUnit(null);
    setSelectedUsers([]);
    setUserOptions([]);
    setAssignDialogOpen(true);
  };

  const openAssignTeacher = (unit: CourseUnit) => {
    setAssignType('teacher');
    setAssignUnit(unit);
    setSelectedUsers([]);
    setUserOptions([]);
    setAssignDialogOpen(true);
  };

  useEffect(() => {
    if (!assignDialogOpen) return;

    if (assignType === 'student') {
      const assignedIds = new Set(
        assignedStudents.map((item) => idOf(item.studentId)).filter(Boolean)
      );
      setUserOptions(
        courseStudents
          .filter((app) => {
            const sid = idOf(app.studentId);
            return !sid || !assignedIds.has(sid);
          })
          .map((app) => ({
            value: idOf(app.studentId),
            label: studentName(
              typeof app.studentId === 'object' ? app.studentId : null
            )
          }))
          .filter((option) => option.value)
      );
      setUserOptionsLoading(false);
      return;
    }

    // Teachers already holding *this unit* are the ones to exclude — the same
    // person may well teach another unit of the same group.
    const fetchTeachers = async () => {
      setUserOptionsLoading(true);
      try {
        const heldHere = new Set(
          (teachersByUnit.get(assignUnit?._id || '') || [])
            .map((item) => idOf(item.teacherId))
            .filter(Boolean)
        );
        const options = await fetchTeacherOptions();
        setUserOptions(options.filter((option) => !heldHere.has(option.value)));
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        setUserOptions([]);
      } finally {
        setUserOptionsLoading(false);
      }
    };
    fetchTeachers();
  }, [
    assignDialogOpen,
    assignType,
    assignUnit,
    courseStudents,
    assignedStudents,
    teachersByUnit
  ]);

  const handleAssign = async () => {
    if (selectedUsers.length === 0 || !courseId || !groupId) return;
    const isStudent = assignType === 'student';

    if (!isStudent && !assignUnit) {
      toast({
        title: 'Pick a unit',
        description: 'A teacher is assigned to a specific unit.',
        variant: 'destructive'
      });
      return;
    }

    setAssigning(true);
    try {
      // Each assignment is its own record, so a batch is one request per
      // person; failures are collected rather than aborting the whole batch.
      const results = await Promise.allSettled(
        selectedUsers.map((option) =>
          axiosInstance.post(
            isStudent ? '/student-assign-group' : '/teacher-courses',
            {
              courseId,
              courseTermId: termId,
              groupId,
              ...(isStudent
                ? { studentId: option.value }
                : { unitId: assignUnit!._id, teacherId: option.value })
            }
          )
        )
      );

      const failed = results
        .map((result, index) => ({ result, option: selectedUsers[index] }))
        .filter((entry) => entry.result.status === 'rejected');
      const succeeded = results.length - failed.length;

      if (succeeded > 0) {
        toast({
          title: `${succeeded} ${isStudent ? 'student' : 'teacher'}${
            succeeded === 1 ? '' : 's'
          } assigned`,
          description: isStudent
            ? `Added to ${groupName || 'the group'}.`
            : `Now teaching ${assignUnit?.title || 'this unit'}.`
        });
      }

      if (failed.length > 0) {
        toast({
          title: `${failed.length} could not be assigned`,
          description: failed
            .map((entry) => entry.option.label)
            .join(', '),
          variant: 'destructive'
        });
      }

      if (succeeded > 0) setAssignDialogOpen(false);
      await fetchGroupMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || `Failed to assign ${assignType}.`,
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const openUnassignDialog = (
    item: AssignedMember,
    type: 'student' | 'teacher'
  ) => {
    const member = type === 'student' ? item.studentId : item.teacherId;
    const name =
      typeof member === 'object'
        ? member?.name || member?.email || 'Unknown'
        : 'Unknown';
    setMemberToUnassign({ _id: item._id, type, name });
    setUnassignDialogOpen(true);
  };

  const handleUnassign = async () => {
    if (!memberToUnassign) return;
    try {
      await axiosInstance.delete(
        `${
          memberToUnassign.type === 'student'
            ? '/student-assign-group'
            : '/teacher-courses'
        }/${memberToUnassign._id}`
      );
      toast({
        title: 'Unassigned',
        description: `${memberToUnassign.name} was removed.`
      });
      setUnassignDialogOpen(false);
      setMemberToUnassign(null);
      await fetchGroupMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to unassign.',
        variant: 'destructive'
      });
    }
  };

  // ── Date range shortcuts ───────────────────────────────────────────────
  const applyRange = (start: Date, end: Date) => {
    const next: [Date | null, Date | null] = [start, end];
    setDateRange(next);
    setAppliedDateRange(next);
  };

  const handleToday = () => {
    const today = moment().startOf('day').toDate();
    applyRange(today, today);
  };
  const handleThisWeek = () =>
    applyRange(
      moment().startOf('isoWeek').startOf('day').toDate(),
      moment().endOf('isoWeek').startOf('day').toDate()
    );
  const handleThisMonth = () =>
    applyRange(
      moment().startOf('month').startOf('day').toDate(),
      moment().endOf('month').startOf('day').toDate()
    );

  // ── Unit CRUD ──────────────────────────────────────────────────────────
  const openAddDialog = () => {
    setIsEditing(false);
    setCurrentUnitId(null);
    setUnitReference('');
    setTitle('');
    setLevel('');
    setGls('');
    setCredit('');
    setDialogOpen(true);
  };

  const openEditDialog = (unit: CourseUnit) => {
    setIsEditing(true);
    setCurrentUnitId(unit._id);
    setUnitReference(unit.unitReference || '');
    setTitle(unit.title || '');
    setLevel(unit.level || '');
    setGls(unit.gls || '');
    setCredit(unit.credit || '');
    setDialogOpen(true);
  };

  const openDeleteDialog = (unit: CourseUnit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleUnitSubmit = async () => {
    if (
      !unitReference.trim() ||
      !title.trim() ||
      !level.trim() ||
      !gls.trim() ||
      !credit.trim()
    ) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        courseId,
        groupId,
        termId,
        unitReference,
        title,
        level,
        gls,
        credit
      };
      if (isEditing && currentUnitId) {
        await axiosInstance.patch(`/course-unit/${currentUnitId}`, payload);
        toast({ title: 'Unit updated successfully!' });
      } else {
        await axiosInstance.post('/course-unit', payload);
        toast({ title: 'Unit added successfully!' });
      }
      fetchUnitsData(currentPage, entriesPerPage);
      setDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save unit.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnitDelete = async () => {
    if (!unitToDelete) return;
    try {
      await axiosInstance.delete(`/course-unit/${unitToDelete._id}`);
      toast({ title: 'Unit deleted successfully!' });
      fetchUnitsData(currentPage, entriesPerPage);
      setDeleteDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete unit.',
        variant: 'destructive'
      });
    }
  };

  const handleViewModules = (unit: CourseUnit) =>
    navigate(`${unit._id}`);

  // ── Attendance modal ───────────────────────────────────────────────────
  const openAttendanceModal = (sheet: AttendanceSheet) => {
    setSelectedSheet(sheet);
    const statuses: Record<string, AttendanceStatus> = {};
    const remarks: Record<string, string> = {};
    sheet.attendance?.forEach((item) => {
      const sid = idOf(item.studentId);
      if (sid) {
        if (item.status) statuses[sid] = item.status;
        if (item.remark) remarks[sid] = item.remark;
      }
    });
    setSheetStatuses(statuses);
    setSheetRemarks(remarks);
    setUnmarkedIds(new Set());
    setAttendanceModalOpen(true);
  };

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setUnmarkedIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
    setSheetStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    setSheetStatuses((prev) => {
      const next = { ...prev };
      selectedSheet?.attendance?.forEach((item) => {
        const sid = idOf(item.studentId);
        if (sid) next[sid] = 'present';
      });
      return next;
    });
    setUnmarkedIds(new Set());
  };

  const saveAttendanceChanges = async () => {
    if (!selectedSheet) return;
    const entries = (selectedSheet.attendance || [])
      .map((item) => {
        const sid = idOf(item.studentId);
        const status = sheetStatuses[sid];
        const remark = sheetRemarks[sid]?.trim();
        if (!sid) return null;
        const payload: Record<string, unknown> = { studentId: sid, status };
        if (remark) payload.remark = remark;
        return payload;
      })
      .filter(Boolean);

    const parsed = attendancePayloadSchema.safeParse(entries);
    if (!parsed.success) {
      const missing = new Set<string>();
      selectedSheet.attendance?.forEach((item) => {
        const sid = idOf(item.studentId);
        if (sid && !sheetStatuses[sid]) missing.add(sid);
      });
      setUnmarkedIds(missing);
      toast({
        title: 'Validation Warning',
        description: 'Please mark attendance for all students before saving.',
        variant: 'destructive'
      });
      return;
    }

    setSavingAttendance(true);
    try {
      await axiosInstance.patch(`/student-attendance/${selectedSheet._id}`, {
        attendance: parsed.data,
        userId: user._id
      });
      toast({ title: 'Attendance updated successfully!' });
      setAttendanceModalOpen(false);
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to update attendance.',
        variant: 'destructive'
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const openLogsModal = (logs?: AttendanceLog[]) => {
    setActiveLogs(logs || []);
    setViewLogsModalOpen(true);
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  const sheetUnitOf = (sheet: AttendanceSheet) =>
    (typeof sheet.unitId === 'object' && sheet.unitId) ||
    (typeof sheet.classRoutineId?.unitId === 'object' &&
      sheet.classRoutineId.unitId) ||
    null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* ── Page header ──────────────────────────────────────────────── */}
        <header className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <nav className="flex items-center gap-1.5 text-[11px] font-medium text-black">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="transition-colors hover:text-watney"
                >
                  Courses
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate text-black">
                  {courseName || 'Course'}
                </span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-black">Units</span>
              </nav>

              <h1 className="mt-1.5 truncate text-2xl font-bold tracking-tight text-black">
                {courseName || 'Course'}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {termName && <MetaChip label="Term" value={termName} />}
                {groupName && <MetaChip label="Group" value={groupName} />}
                <MetaChip label="Units" value={String(scopedUnits.length)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-9"
              >
                <MoveLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={openAddDialog}
                  className="h-9 bg-watney text-white hover:bg-watney/90"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add unit
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        {/* ── Workspace ────────────────────────────────────────────────── */}
        <Tabs defaultValue="units">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-gray-200 bg-watney/5 px-4 py-2">
            <TabsTrigger
              value="units"
              className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-watney data-[state=active]:text-white"
            >
              <BookOpen className="h-3.5 w-3.5" /> Units
            </TabsTrigger>
            {canSeeAttendance && (
              <TabsTrigger
                value="attendance"
                className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-watney data-[state=active]:text-white"
              >
                <ClipboardCheck className="h-3.5 w-3.5" /> Attendance
              </TabsTrigger>
            )}
            <TabsTrigger
              value="students"
              className="gap-1.5 rounded-lg text-xs data-[state=active]:bg-watney data-[state=active]:text-white"
            >
              <Users className="h-3.5 w-3.5" /> Students
            </TabsTrigger>
          </TabsList>

          {/* ── Units ──────────────────────────────────────────────────── */}
          <TabsContent value="units" className="m-0">
            <section>
              <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-black">
                    Course units
                  </h2>
                  <p className="text-[11px] text-black">
                    Each unit carries its own timetable and teaching team.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black" />
                  <Input
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    placeholder="Search reference, title or level"
                    className="h-9 pl-8 text-xs"
                  />
                  {unitSearch && (
                    <button
                      type="button"
                      onClick={() => setUnitSearch('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <BlinkingDots size="large" color="bg-watney" />
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={BookOpen}
                    title={
                      unitSearch
                        ? 'No unit matches that search'
                        : 'No course units yet'
                    }
                    description={
                      unitSearch
                        ? 'Try a different reference, title or level.'
                        : 'Add the first unit to start scheduling classes and assigning teachers.'
                    }
                    action={
                      !unitSearch && canEdit ? (
                        <Button
                          size="sm"
                          onClick={openAddDialog}
                          className="bg-watney text-white hover:bg-watney/90"
                        >
                          <Plus className="mr-1.5 h-4 w-4" /> Add unit
                        </Button>
                      ) : null
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 bg-watney/5 hover:bg-watney/5">
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-black">
                            Unit
                          </TableHead>
                          <TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wide text-black">
                            Level
                          </TableHead>
                          <TableHead className="w-20 text-[11px] font-semibold uppercase tracking-wide text-black">
                            GLS
                          </TableHead>
                          <TableHead className="w-20 text-[11px] font-semibold uppercase tracking-wide text-black">
                            Credit
                          </TableHead>
                          <TableHead className="min-w-[220px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Teaching team
                          </TableHead>
                          <TableHead className="w-[190px] text-right text-[11px] font-semibold uppercase tracking-wide text-black">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUnits.map((unit) => {
                          const unitTeachers =
                            teachersByUnit.get(unit._id) || [];
                          return (
                            <TableRow
                              key={unit._id}
                              className="border-gray-200 align-top transition-colors hover:bg-watney/5"
                            >
                              <TableCell className="py-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black">
                                      {unit.title || 'Untitled unit'}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[11px] text-black">
                                      {unit.unitReference || '—'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-xs text-black">
                                {unit.level || '—'}
                              </TableCell>
                              <TableCell className="py-3 text-xs text-black">
                                {unit.gls || '—'}
                              </TableCell>
                              <TableCell className="py-3">
                                <span className="inline-flex items-center rounded-md bg-watney/10 px-2 py-0.5 text-[11px] font-semibold text-black">
                                  {unit.credit || '—'}
                                </span>
                              </TableCell>
                              <TableCell
                                className="py-3"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {unitTeachers.length === 0 ? (
                                  canEdit ? (
                                    <button
                                      type="button"
                                      onClick={() => openAssignTeacher(unit)}
                                      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-200 px-2 py-1 text-[11px] font-medium text-black transition-colors hover:border-watney/40 hover:text-watney"
                                    >
                                      <Plus className="h-3 w-3" /> Assign teacher
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-black">
                                      No teacher assigned
                                    </span>
                                  )
                                ) : (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {unitTeachers.map((item) => {
                                      const name = userName(item.teacherId);
                                      const email =
                                        typeof item.teacherId === 'object'
                                          ? item.teacherId?.email
                                          : '';
                                      return (
                                        <span
                                          key={item._id}
                                          className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-0.5 pl-0.5 pr-1.5 text-[11px] font-medium text-black"
                                        >
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-watney/10 text-[9px] font-bold text-watney">
                                            {initialsOf(name)}
                                          </span>
                                          <span className="flex min-w-0 flex-col leading-tight">
                                            <span className="max-w-[160px] truncate">
                                              {name}
                                            </span>
                                            {email && (
                                              <a
                                                href={`mailto:${email}`}
                                                className="max-w-[160px] truncate text-[10px] font-normal text-black hover:text-watney hover:underline"
                                              >
                                                {email}
                                              </a>
                                            )}
                                          </span>
                                          {canEdit && (
                                            <button
                                              type="button"
                                              aria-label={`Unassign ${name}`}
                                              onClick={() =>
                                                openUnassignDialog(
                                                  item,
                                                  'teacher'
                                                )
                                              }
                                              className="text-black transition-colors hover:text-rose-500"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          )}
                                        </span>
                                      );
                                    })}
                                    {canEdit && (
                                      <button
                                        type="button"
                                        aria-label="Assign another teacher"
                                        onClick={() => openAssignTeacher(unit)}
                                        className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-gray-200 text-black transition-colors hover:border-watney/40 hover:text-watney"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell
                                className="py-3"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  <IconAction
                                    label="Modules & resources"
                                    icon={FileText}
                                    onClick={() => handleViewModules(unit)}
                                  />
                                  {canEdit && (
                                    <>
                                      <IconAction
                                        label="Edit unit"
                                        icon={Pen}
                                        onClick={() => openEditDialog(unit)}
                                      />
                                      <IconAction
                                        label="Delete unit"
                                        icon={Trash2}
                                        tone="danger"
                                        onClick={() => openDeleteDialog(unit)}
                                      />
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && !isTeacher && (
                    <div className="border-t border-gray-200 px-4 py-3">
                      <DataTablePagination
                        pageSize={entriesPerPage}
                        setPageSize={setEntriesPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </TabsContent>

          {/* ── Attendance ─────────────────────────────────────────────── */}
          {canSeeAttendance && (
          <TabsContent value="attendance" className="m-0">
            <section>
              {/* Filters - one row, so the list starts near the top */}
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
                <div className="w-48">
                  <Select
                    options={unitFilterOptions}
                    value={attendanceUnitFilter}
                    onChange={(option) =>
                      setAttendanceUnitFilter(
                        (option as Option) || {
                          value: 'all',
                          label: 'All units'
                        }
                      )
                    }
                    isSearchable
                    menuPortalTarget={menuPortalTarget}
                    styles={selectStyles}
                  />
                </div>

                <div className="w-52">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update: [Date | null, Date | null]) =>
                      setDateRange(update)
                    }
                    dateFormat="dd MMM yyyy"
                    isClearable
                    placeholderText="Select date range"
                    wrapperClassName="w-full"
                    className="h-[38px] w-full rounded-md border border-gray-200 bg-white px-3 text-xs text-black focus:outline-none focus:ring-1 focus:ring-watney"
                  />
                </div>

                <Button
                  size="sm"
                  className="h-[38px] bg-watney text-white hover:bg-watney/90"
                  onClick={() => setAppliedDateRange(dateRange)}
                >
                  <Search className="mr-1.5 h-3.5 w-3.5" /> Apply
                </Button>

                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-[11px]"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-[11px]"
                    onClick={handleThisWeek}
                  >
                    This week
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-[11px]"
                    onClick={handleThisMonth}
                  >
                    This month
                  </Button>
                </div>
              </div>

              {attendanceLoading ? (
                <div className="flex justify-center py-16">
                  <BlinkingDots size="large" color="bg-watney" />
                </div>
              ) : visibleSheets.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={ClipboardCheck}
                    title="No attendance in this range"
                    description="Widen the date range, or pick a different unit."
                  />
                </div>
              ) : (
                <>
                  {/* Totals across everything currently shown */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-gray-200 bg-watney/5 px-4 py-2 text-[11px]">
                    <span className="font-semibold text-black">
                      {attendanceTotals.sessions} session
                      {attendanceTotals.sessions === 1 ? '' : 's'}
                    </span>
                    <span className="text-black">
                      {rangeLabel}
                    </span>
                    <span className="ml-auto flex flex-wrap items-center gap-1.5">
                      <span
                        className={clsx(
                          'flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold',
                          STATUS_META.present.chip
                        )}
                      >
                        {attendanceTotals.present} present
                      </span>
                      <span
                        className={clsx(
                          'flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold',
                          STATUS_META.absent.chip
                        )}
                      >
                        {attendanceTotals.absent} absent
                      </span>
                      <span
                        className={clsx(
                          'flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold',
                          STATUS_META.late.chip
                        )}
                      >
                        {attendanceTotals.late} late
                      </span>
                      {attendanceTotals.unmarked > 0 && (
                        <span className="flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 font-semibold text-black">
                          {attendanceTotals.unmarked} unmarked
                        </span>
                      )}
                    </span>
                  </div>

                  <ScrollArea className="max-h-[calc(100vh-20rem)]">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-watney/5">
                        <TableRow className="hover:bg-watney/5">
                          <TableHead className="w-[120px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Date
                          </TableHead>
                          <TableHead className="min-w-[200px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Unit
                          </TableHead>
                          <TableHead className="w-[130px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Time
                          </TableHead>
                          <TableHead className="min-w-[190px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Attendance
                          </TableHead>
                          <TableHead className="w-[110px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Marked
                          </TableHead>
                          <TableHead className="min-w-[150px] text-[11px] font-semibold uppercase tracking-wide text-black">
                            Last updated
                          </TableHead>
                          <TableHead className="w-[150px] text-right text-[11px] font-semibold uppercase tracking-wide text-black">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleSheets.map((sheet) => {
                          const total = sheet.attendance?.length || 0;
                          const present =
                            sheet.attendance?.filter(
                              (a) => a.status === 'present'
                            ).length || 0;
                          const absent =
                            sheet.attendance?.filter(
                              (a) => a.status === 'absent'
                            ).length || 0;
                          const late =
                            sheet.attendance?.filter((a) => a.status === 'late')
                              .length || 0;
                          const unmarked = total - present - absent - late;
                          const dateMoment = moment.utc(sheet.classDate).local();
                          const unit = sheetUnitOf(sheet);
                          const completion = total
                            ? Math.round(((total - unmarked) / total) * 100)
                            : 0;

                          return (
                            <TableRow
                              key={sheet._id}
                              className="align-top hover:bg-watney/5"
                            >
                              {/* Date */}
                              <TableCell className="py-3">
                                <p className="text-xs font-semibold text-black">
                                  {dateMoment.format('DD MMM YYYY')}
                                </p>
                                <p className="text-[11px] text-black">
                                  {dateMoment.format('dddd')}
                                </p>
                              </TableCell>

                              {/* Unit */}
                              <TableCell className="py-3">
                                <p className="text-xs font-medium text-black">
                                  {unit ? unit.title || unit.unitReference : '-'}
                                </p>
                                {unit?.unitReference && (
                                  <p className="font-mono text-[10px] text-black">
                                    {unit.unitReference}
                                  </p>
                                )}
                                {sheet.classRoutineId?.note && (
                                  <p className="mt-1 flex items-start gap-1 text-[11px] text-black">
                                    <FileText className="mt-0.5 h-3 w-3 shrink-0" />
                                    <span className="line-clamp-2">
                                      {sheet.classRoutineId.note}
                                    </span>
                                  </p>
                                )}
                              </TableCell>

                              {/* Time */}
                              <TableCell className="py-3">
                                <span className="flex items-center gap-1 text-[11px] text-black">
                                  <Clock className="h-3 w-3" />
                                  {sheet.classRoutineId?.startTime || '-'}
                                  {'-'}
                                  {sheet.classRoutineId?.endTime || '-'}
                                </span>
                                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-black">
                                  <Users className="h-3 w-3" />
                                  {total} student{total === 1 ? '' : 's'}
                                </span>
                              </TableCell>

                              {/* Attendance breakdown - one bar, split by
                                  status, reads faster at a glance than three
                                  separate numbers. */}
                              <TableCell className="py-3">
                                <div className="flex h-1.5 overflow-hidden rounded-full bg-watney/10">
                                  {[
                                    { value: present, cls: 'bg-emerald-500' },
                                    { value: late, cls: 'bg-amber-400' },
                                    { value: absent, cls: 'bg-rose-500' }
                                  ].map(({ value, cls }, index) =>
                                    value > 0 ? (
                                      <span
                                        key={index}
                                        className={cls}
                                        style={{
                                          width: `${(value / (total || 1)) * 100}%`
                                        }}
                                      />
                                    ) : null
                                  )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={clsx(
                                      'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                                      STATUS_META.present.chip
                                    )}
                                  >
                                    <Circle className="h-1.5 w-1.5 fill-current" />
                                    {present}
                                  </span>
                                  <span
                                    className={clsx(
                                      'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                                      STATUS_META.absent.chip
                                    )}
                                  >
                                    <Circle className="h-1.5 w-1.5 fill-current" />
                                    {absent}
                                  </span>
                                  <span
                                    className={clsx(
                                      'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                                      STATUS_META.late.chip
                                    )}
                                  >
                                    <Circle className="h-1.5 w-1.5 fill-current" />
                                    {late}
                                  </span>
                                  {unmarked > 0 && (
                                    <span className="flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-black">
                                      <Circle className="h-1.5 w-1.5 fill-current" />
                                      {unmarked}
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Completion */}
                              <TableCell className="py-3">
                                <span
                                  className={clsx(
                                    'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold',
                                    completion === 100
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-amber-50 text-amber-700'
                                  )}
                                >
                                  {completion}%
                                </span>
                              </TableCell>

                              {/* Last updated */}
                              <TableCell className="py-3">
                                <p className="truncate text-[11px] text-black">
                                  {userName(sheet.updatedBy)}
                                </p>
                                {sheet.updatedAt && (
                                  <p className="text-[10.5px] text-black">
                                    {moment(sheet.updatedAt).format(
                                      'DD MMM, HH:mm'
                                    )}
                                  </p>
                                )}
                              </TableCell>

                              {/* Actions - a teacher takes the register for
                                  the units they hold, so this is not gated on
                                  canEdit (which is admin-only). */}
                              <TableCell className="py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  {sheet.logs && sheet.logs.length > 0 && (
                                    <IconAction
                                      label="Change history"
                                      icon={History}
                                      onClick={() => openLogsModal(sheet.logs)}
                                    />
                                  )}
                                  {canSeeAttendance && (
                                    <Button
                                      size="sm"
                                      onClick={() => openAttendanceModal(sheet)}
                                      className="h-8 bg-watney text-[11px] text-white hover:bg-watney/90"
                                    >
                                      <Pen className="mr-1 h-3.5 w-3.5" /> Update
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
              )}
            </section>
          </TabsContent>
          )}


          {/* ── Cohort ─────────────────────────────────────────────────── */}
          <TabsContent value="students" className="m-0">
            <section>
              <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-black">
                    Enrolled students
                  </h2>
                  <p className="text-[11px] text-black">
                    Students are enrolled onto {groupName || 'the group'}, so
                    they sit every unit in it.
                  </p>
                </div>
                {canEdit && (
                  <Button
                    size="sm"
                    onClick={openAssignStudent}
                    className="h-9 bg-watney text-white hover:bg-watney/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Assign student
                  </Button>
                )}
              </div>

              {membersLoading ? (
                <div className="flex justify-center py-16">
                  <BlinkingDots size="large" color="bg-watney" />
                </div>
              ) : assignedStudents.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={GraduationCap}
                    title="No students assigned yet"
                    description="Assign students from this course to build the group roster."
                  />
                </div>
              ) : (
                <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {assignedStudents.map((item) => {
                    const student = item.studentId;
                    const name = userName(student);
                    const email =
                      typeof student === 'object' ? student?.email || '' : '';
                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 transition-colors hover:border-gray-200 hover:bg-watney/[0.02]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-watney/10 text-[11px] font-bold text-watney">
                            {initialsOf(name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-black">
                              {name}
                            </p>
                            {email && (
                              <p className="truncate text-[11px] text-black">
                                {email}
                              </p>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <IconAction
                            label="Unassign student"
                            icon={UserMinus}
                            tone="danger"
                            onClick={() => openUnassignDialog(item, 'student')}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>

        {/* ── Delete unit ──────────────────────────────────────────────── */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete this unit?</DialogTitle>
              <DialogDescription>
                This permanently deletes{' '}
                <span className="font-semibold text-black">
                  &quot;{unitToDelete?.title}&quot;
                </span>{' '}
                along with its routine, modules and teaching assignments.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnitDelete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Delete unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Add / edit unit ──────────────────────────────────────────── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit course unit' : 'Add course unit'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {termName && groupName
                  ? `${termName} · ${groupName}`
                  : 'Unit details'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Unit reference *</Label>
                <Input
                  value={unitReference}
                  onChange={(e) => setUnitReference(e.target.value)}
                  placeholder="e.g. H/615/1625"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Business Environment"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Level *</Label>
                <Input
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g. 4"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">GLS *</Label>
                <Input
                  value={gls}
                  onChange={(e) => setGls(e.target.value)}
                  placeholder="Guided learning hours"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Credit *</Label>
                <Input
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="e.g. 15"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUnitSubmit}
                disabled={submitting}
                className="bg-watney text-white hover:bg-watney/90"
              >
                {submitting && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Save changes' : 'Add unit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit attendance sheet ────────────────────────────────────── */}
        <Dialog
          open={attendanceModalOpen}
          onOpenChange={setAttendanceModalOpen}
        >
          <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden p-0">
            <div className="border-b border-gray-200 px-6 py-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-5 w-5 text-watney" />
                  Attendance — {formatDate(selectedSheet?.classDate || '')}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedSheet && sheetUnitOf(selectedSheet)
                    ? unitLabel(sheetUnitOf(selectedSheet))
                    : groupName}
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              {unmarkedIds.size > 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  {unmarkedIds.size} student(s) unmarked. Every student must be
                  marked before saving.
                </div>
              )}
              <div className="space-y-2.5">
                {selectedSheet?.attendance?.map((item) => {
                  const sid = idOf(item.studentId);
                  const status = sheetStatuses[sid];
                  const isUnmarked = unmarkedIds.has(sid);
                  const name = studentName(item.studentId);
                  return (
                    <div
                      key={sid}
                      className={clsx(
                        'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                        isUnmarked
                          ? 'border-rose-300 bg-rose-50/50'
                          : 'border-gray-200 bg-white'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-watney/10 text-[11px] font-bold text-black">
                          {initialsOf(name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-black">
                            {name}
                          </p>
                          <p className="truncate text-[11px] text-black">
                            {item.studentId?.email || ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex overflow-hidden rounded-md border border-gray-200">
                          {(
                            Object.keys(STATUS_META) as AttendanceStatus[]
                          ).map((key) => {
                            const meta = STATUS_META[key];
                            const Icon = meta.icon;
                            const isActive = status === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleStatus(sid, key)}
                                className={clsx(
                                  'flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors',
                                  isActive
                                    ? meta.active
                                    : 'bg-white text-black hover:bg-watney/5'
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
                          value={sheetRemarks[sid] || ''}
                          onChange={(e) =>
                            setSheetRemarks((prev) => ({
                              ...prev,
                              [sid]: e.target.value
                            }))
                          }
                          className="h-8 w-full text-xs sm:w-44"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between border-t border-gray-200 bg-watney/5 px-6 py-4">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                <UserCheck className="mr-1.5 h-4 w-4" /> Mark all present
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttendanceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={saveAttendanceChanges}
                  disabled={savingAttendance}
                >
                  {savingAttendance && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Attendance history ───────────────────────────────────────── */}
        <Dialog open={viewLogsModalOpen} onOpenChange={setViewLogsModalOpen}>
          <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-watney" /> Attendance history
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="my-2 flex-1 pr-4">
              {activeLogs.length === 0 ? (
                <div className="py-8 text-center text-sm text-black">
                  No changes recorded for this session yet.
                </div>
              ) : (
                <ol className="relative space-y-3 border-l border-gray-200 pl-5">
                  {[...activeLogs]
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    )
                    .map((log, idx) => (
                      <li key={log._id || idx} className="relative">
                        <span className="absolute -left-[1.55rem] top-1.5 flex h-2.5 w-2.5 rounded-full bg-watney ring-4 ring-white" />
                        <div className="rounded-lg border border-gray-200 bg-watney/5 px-3 py-2.5">
                          <p className="text-xs font-medium text-black">
                            {log.message || 'Attendance updated'}
                          </p>
                          {log.updatedAt && (
                            <p className="mt-0.5 text-[11px] text-black">
                              {moment(log.updatedAt).format(
                                'DD MMM YYYY, HH:mm'
                              )}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewLogsModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Unassign ─────────────────────────────────────────────────── */}
        <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>
                Unassign{' '}
                {memberToUnassign?.type === 'teacher' ? 'teacher' : 'student'}?
              </DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-black">
                  {memberToUnassign?.name}
                </span>{' '}
                will be removed from{' '}
                {memberToUnassign?.type === 'teacher'
                  ? 'this unit'
                  : groupName || 'this group'}
                .
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setUnassignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnassign}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Unassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Assign student / teacher ─────────────────────────────────── */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>
                {assignType === 'student'
                  ? 'Assign student'
                  : 'Assign teacher to unit'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {assignType === 'student'
                  ? `Add a student from this course to ${groupName || 'this group'}.`
                  : `Choose who teaches ${assignUnit?.title || 'this unit'}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {assignType === 'teacher' && assignUnit && (
                <div className="rounded-lg border border-gray-200 bg-watney/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-black">
                    Unit
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {assignUnit.title}
                  </p>
                  <p className="font-mono text-[11px] text-black">
                    {assignUnit.unitReference}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    {assignType === 'student' ? 'Students' : 'Teachers'} *
                  </Label>
                  {selectedUsers.length > 0 && (
                    <span className="text-[11px] font-medium text-black">
                      {selectedUsers.length} selected
                    </span>
                  )}
                </div>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  options={userOptions}
                  value={selectedUsers}
                  onChange={(option) =>
                    setSelectedUsers((option as Option[]) || [])
                  }
                  placeholder={
                    userOptionsLoading
                      ? 'Loading…'
                      : `Select one or more ${assignType}s`
                  }
                  isLoading={userOptionsLoading}
                  isDisabled={userOptionsLoading}
                  menuPortalTarget={menuPortalTarget}
                  styles={selectStyles}
                  noOptionsMessage={() =>
                    assignType === 'student'
                      ? 'Every student on this course is already assigned'
                      : 'No further teachers available for this unit'
                  }
                />
                <p className="text-[11px] text-black">
                  {assignType === 'student'
                    ? 'Pick several students to assign them all at once.'
                    : 'A unit can be taught by more than one teacher.'}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedUsers.length === 0 || assigning}
                className="bg-watney text-white hover:bg-watney/90"
              >
                {assigning && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {selectedUsers.length > 1
                  ? `Assign ${selectedUsers.length}`
                  : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default CourseUnitPage;
