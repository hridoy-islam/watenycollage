import { useState, useEffect, useCallback } from 'react';
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
import {
  Plus,
  FileText,
  MoveLeft,
  Pen,
  Trash2,
  CalendarRange,
  ClipboardCheck,
  UserCheck,
  UserX,
  Timer,
  Loader2,
  History,
  Circle,
  Clock,
  Search,
  UserMinus
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Select from 'react-select';

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
  _id: string;
  message?: string;
  updatedBy: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | string;
  updatedAt: string;
  changes: ChangeLogItem[];
}

interface AttendanceSheet {
  _id: string;
  classRoutineId: any;
  classDate: string;
  attendance: SheetStudent[];
  logs?: AttendanceLog[];
  updatedBy?: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
  updatedAt?: string;
  courseId?: any;
  groupId?: any;
  termId?: any;
}

interface AssignedMember {
  _id: string;
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
  { label: string; icon: any; active: string; chip: string; dot: string }
> = {
  present: {
    label: 'Present',
    icon: UserCheck,
    active: 'bg-emerald-500 text-white border-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'text-emerald-500'
  },
  absent: {
    label: 'Absent',
    icon: UserX,
    active: 'bg-rose-500 text-white border-rose-600',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'text-rose-500'
  },
  late: {
    label: 'Late',
    icon: Timer,
    active: 'bg-amber-500 text-white border-amber-600',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'text-amber-500'
  }
};

const attendancePayloadSchema = z.array(
  z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    status: z.enum(['present', 'absent', 'late'], {
      required_error: 'Status is required for every student'
    }),
    remark: z.string().max(200, 'Remark must be at most 200 characters').optional()
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

// ── Component ────────────────────────────────────────────────────────────

function CourseUnitPage() {
  const { id: courseId, gid: groupId, tid: termId } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Units state
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<CourseUnit | null>(null);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [memberToUnassign, setMemberToUnassign] = useState<{ _id: string; type: 'student' | 'teacher'; name: string } | null>(null);

  // Unit form inputs
  const [unitReference, setUnitReference] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [gls, setGls] = useState('');
  const [credit, setCredit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Header meta names
  const [courseName, setCourseName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [termName, setTermName] = useState('');

  // Pagination for Units
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ── Attendance State ───────────────────────────────────────────────────
  const [attendanceSheets, setAttendanceSheets] = useState<AttendanceSheet[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // ── Assigned Students & Teachers State ────────────────────────────────
  const [assignedStudents, setAssignedStudents] = useState<AssignedMember[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // ── Assign Student / Teacher State ─────────────────────────────────────
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignType, setAssignType] = useState<'student' | 'teacher'>('student');
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(null);
  const [assigning, setAssigning] = useState(false);

  // ── Course Students (Application Course) State ─────────────────────────
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);

  // Date range filter: editable date range
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').startOf('day').toDate(),
    moment().endOf('isoWeek').startOf('day').toDate()
  ]);
  const [startDate, endDate] = dateRange;

  // Applied date range (actual filter used for API calls)
  const [appliedDateRange, setAppliedDateRange] = useState<[Date | null, Date | null]>([
    moment().startOf('isoWeek').startOf('day').toDate(),
    moment().endOf('isoWeek').startOf('day').toDate()
  ]);

  // Active modal attendance sheet editing state
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheet | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [sheetStatuses, setSheetStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [sheetRemarks, setSheetRemarks] = useState<Record<string, string>>({});
  const [unmarkedIds, setUnmarkedIds] = useState<Set<string>>(new Set());
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [viewLogsModalOpen, setViewLogsModalOpen] = useState(false);
  const [activeLogs, setActiveLogs] = useState<AttendanceLog[]>([]);

  // ── Fetch Units & Meta ─────────────────────────────────────────────────
  const fetchUnitsData = async (page = 1, limit = entriesPerPage) => {
    if (!courseId) return;
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

      const unitsRes = await axiosInstance.get('/course-unit', {
        params: { courseId, groupId, termId, page, limit }
      });

      setUnits(unitsRes.data?.data?.result || []);
      setTotalPages(unitsRes.data?.data?.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch {
      toast({ title: 'Error', description: 'Failed to load course units.', variant: 'destructive' });
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Attendance Sheets by Course/Group/Term & Applied Date Range ──
  const fetchAttendanceData = useCallback(async () => {
    if (!courseId) return;
    const [appliedStart, appliedEnd] = appliedDateRange;
    
    try {
      setAttendanceLoading(true);
      const params: Record<string, any> = {
        courseId,
        limit: 'all'
      };
      if (groupId) params.groupId = groupId;
      if (termId) params.termId = termId;
      if (appliedStart) params.startDate = moment(appliedStart).format('YYYY-MM-DD');
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

  // Apply date range filter
  const handleApplyDateRange = () => {
    setAppliedDateRange(dateRange);
  };

  // ── Fetch Assigned Students & Teachers by Course/Term/Group ───────────
  const fetchGroupMembers = useCallback(async () => {
    if (!courseId || !groupId) return;
    try {
      setMembersLoading(true);
      const params: Record<string, any> = {
        courseId,
        groupId,
        limit: 'all'
      };
      if (termId) params.courseTermId = termId;

      const [studentsRes, teachersRes] = await Promise.all([
        axiosInstance.get('/student-assign-group', { params }),
        axiosInstance.get('/teacher-courses', { params })
      ]);
      setAssignedStudents(studentsRes.data?.data?.result || []);
      setAssignedTeachers(teachersRes.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to load assigned students/teachers:', error);
      setAssignedStudents([]);
      setAssignedTeachers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [courseId, groupId, termId]);

  // ── Fetch Course Students (Application Course with same courseId) ─────
  const fetchCourseStudents = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await axiosInstance.get('/application-course', {
        params: { courseId, limit: 'all' }
      });
      setCourseStudents(res.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to load course students:', error);
      setCourseStudents([]);
    }
  }, [courseId]);

  // ── Assign Student / Teacher ──────────────────────────────────────────
  const openAssignDialog = (type: 'student' | 'teacher') => {
    setAssignType(type);
    setSelectedUser(null);
    setUserOptions([]);
    setAssignDialogOpen(true);
    if (type === 'student' && courseStudents.length === 0) {
      fetchCourseStudents();
    }
  };

  useEffect(() => {
    if (!assignDialogOpen) return;

    if (assignType === 'student') {
      const assignedIds = new Set(
        assignedStudents
          .map((item) => {
            const student = item.studentId;
            return typeof student === 'object' && student?._id ? student._id : typeof student === 'string' ? student : '';
          })
          .filter(Boolean)
      );
      setUserOptions(
        courseStudents
          .filter((app) => {
            const sid = typeof app.studentId === 'object' ? app.studentId?._id : app.studentId;
            return !sid || !assignedIds.has(sid);
          })
          .map((app) => {
            const student = app.studentId;
            return {
              value: typeof student === 'object' && student?._id ? student._id : typeof student === 'string' ? student : '',
              label: studentName(student)
            };
          })
      );
      setUserOptionsLoading(false);
      return;
    }

    const fetchTeachers = async () => {
      setUserOptionsLoading(true);
      try {
        const assignedIds = new Set(
          assignedTeachers
            .map((item) => {
              const teacher = item.teacherId;
              return typeof teacher === 'object' && teacher?._id ? teacher._id : typeof teacher === 'string' ? teacher : '';
            })
            .filter(Boolean)
        );
        const res = await axiosInstance.get('/users', {
          params: { role: 'teacher', status: 'active', limit: 'all' }
        });
        const result = res.data?.data?.result || [];
        setUserOptions(
          result
            .filter((u: any) => !assignedIds.has(u._id))
            .map((u: any) => ({
              value: u._id,
              label: u.name || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email
            }))
        );
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        setUserOptions([]);
      } finally {
        setUserOptionsLoading(false);
      }
    };
    fetchTeachers();
  }, [assignDialogOpen, assignType, courseStudents, assignedStudents, assignedTeachers]);

  const handleAssign = async () => {
    if (!selectedUser || !courseId || !groupId) return;
    setAssigning(true);
    try {
      const isStudent = assignType === 'student';
      const memberKey = isStudent ? 'studentId' : 'teacherId';

      await axiosInstance.post(isStudent ? '/student-assign-group' : '/teacher-courses', {
        courseId,
        courseTermId: termId,
        groupId,
        [memberKey]: selectedUser.value
      });

      toast({ title: 'Success', description: `${isStudent ? 'Student' : 'Teacher'} assigned successfully.` });
      setAssignDialogOpen(false);
      await fetchGroupMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || `Failed to assign ${assignType}.`,
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const openUnassignDialog = (item: AssignedMember, type: 'student' | 'teacher') => {
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
        `${memberToUnassign.type === 'student' ? '/student-assign-group' : '/teacher-courses'}/${memberToUnassign._id}`
      );
      toast({
        title: 'Success',
        description: `${memberToUnassign.type === 'student' ? 'Student' : 'Teacher'} unassigned successfully.`
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

  // Handle Today button
  const handleToday = () => {
    const today = moment().startOf('day').toDate();
    const newRange: [Date | null, Date | null] = [today, today];
    setDateRange(newRange);
    setAppliedDateRange(newRange);
  };

  // Handle This Week button
  const handleThisWeek = () => {
    const start = moment().startOf('isoWeek').startOf('day').toDate();
    const end = moment().endOf('isoWeek').startOf('day').toDate();
    const newRange: [Date | null, Date | null] = [start, end];
    setDateRange(newRange);
    setAppliedDateRange(newRange);
  };

  // Handle This Month button
  const handleThisMonth = () => {
    const start = moment().startOf('month').startOf('day').toDate();
    const end = moment().endOf('month').startOf('day').toDate();
    const newRange: [Date | null, Date | null] = [start, end];
    setDateRange(newRange);
    setAppliedDateRange(newRange);
  };

  useEffect(() => {
    if (courseId) {
      fetchUnitsData(currentPage, entriesPerPage);
      fetchAttendanceData();
      fetchGroupMembers();
      fetchCourseStudents();
    }
  }, [courseId, groupId, termId, currentPage, entriesPerPage, fetchAttendanceData, fetchGroupMembers, fetchCourseStudents]);

  // ── Handlers for Units ─────────────────────────────────────────────────
  const openAddDialog = () => {
    setIsEditing(false);
    setCurrentUnitId(null);
    setUnitReference(''); setTitle(''); setLevel(''); setGls(''); setCredit('');
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
    if (!unitReference.trim() || !title.trim() || !level.trim() || !gls.trim() || !credit.trim()) {
      toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { courseId, groupId, termId, unitReference, title, level, gls, credit };
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
      toast({ title: 'Error', description: 'Failed to save unit.', variant: 'destructive' });
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
      toast({ title: 'Error', description: 'Failed to delete unit.', variant: 'destructive' });
    }
  };

  const handleViewModules = (unit: CourseUnit) => navigate(`${unit._id}`);

  // ── Handlers for Attendance Modal & Updates ────────────────────────────
  const openAttendanceModal = (sheet: AttendanceSheet) => {
    setSelectedSheet(sheet);
    const statuses: Record<string, AttendanceStatus> = {};
    const remarks: Record<string, string> = {};
    sheet.attendance?.forEach((item) => {
      const sid = item.studentId?._id || item.studentId;
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
        const sid = item.studentId?._id || item.studentId;
        if (sid) next[sid] = 'present';
      });
      return next;
    });
  };

  const saveAttendanceChanges = async () => {
    if (!selectedSheet) return;
    const entries = (selectedSheet.attendance || [])
      .map((item) => {
        const sid = item.studentId?._id || item.studentId;
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
        const sid = item.studentId?._id || item.studentId;
        if (sid && !sheetStatuses[sid]) missing.add(sid);
      });
      setUnmarkedIds(missing);
      toast({ title: 'Validation Warning', description: 'Please mark attendance for all students before saving.', variant: 'destructive' });
      return;
    }

    setSavingAttendance(true);
    try {
      await axiosInstance.patch(`/student-attendance/${selectedSheet._id}`, {
        attendance: parsed.data,
        userId: user._id,
      });
      toast({ title: 'Attendance updated successfully!' });
      setAttendanceModalOpen(false);
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update attendance.',
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

  // ── Role Permissions ──
  const canEdit =user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  // Card visibility checks
  const canSeeAttendance = isTeacher || isAdmin;
  const canSeeStudents = isTeacher || isAdmin;
  const canSeeTeachers = isTeacher || isAdmin || isStudent;
  const canManageMembers = isAdmin; // Only Admin can assign/unassign teachers and students

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">
      {/* ── Delete Unit Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the unit{' '}
              <span className="font-semibold">"{unitToDelete?.title}"</span> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnitDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unit Add/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Course Unit' : 'Add New Course Unit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitRef">Unit Reference</Label>
                <Input id="unitRef" value={unitReference} onChange={(e) => setUnitReference(e.target.value)} placeholder="e.g., CS101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Intro to Programming" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input id="level" value={level} type="number" min="0" onChange={(e) => setLevel(e.target.value)} placeholder="e.g., 4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gls">GLS</Label>
                <Input id="gls" type="number" min="0" value={gls} onChange={(e) => setGls(e.target.value)} placeholder="e.g., 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit">Credit</Label>
                <Input id="credit" type="number" min="0" value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="e.g., 15" />
              </div>
            </div>
            <div className="flex flex-col-reverse justify-between gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUnitSubmit} disabled={submitting} className="bg-watney text-white hover:bg-watney/90">
                {submitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update' : 'Add Unit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Attendance Sheet Modal ── */}
      <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden p-0">
          <div className="px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ClipboardCheck className="h-5 w-5 text-watney" />
                Manage Attendance — {formatDate(selectedSheet?.classDate || '')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {unmarkedIds.size > 0 && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                {unmarkedIds.size} student(s) unmarked. All students must be marked before saving.
              </div>
            )}
            <div className="space-y-3">
              {selectedSheet?.attendance?.map((item) => {
                const sid = item.studentId?._id || item.studentId;
                const status = sheetStatuses[sid];
                const isUnmarked = unmarkedIds.has(sid);
                return (
                  <div
                    key={sid}
                    className={clsx(
                      'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                      isUnmarked ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-white'
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{studentName(item.studentId)}</p>
                      <p className="text-xs text-gray-500">{item.studentId?.email || ''}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex overflow-hidden rounded-md border border-gray-200">
                        {(Object.keys(STATUS_META) as AttendanceStatus[]).map((key) => {
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
                                isActive ? meta.active : 'bg-white text-gray-700 hover:bg-gray-50'
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{meta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <Input
                        placeholder="Remark (optional)"
                        value={sheetRemarks[sid] || ''}
                        onChange={(e) =>
                          setSheetRemarks((prev) => ({ ...prev, [sid]: e.target.value }))
                        }
                        className="h-8 w-full sm:w-44 text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <UserCheck className="mr-1.5 h-4 w-4" /> Mark All Present
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAttendanceModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-watney text-white hover:bg-watney/90"
                onClick={saveAttendanceChanges}
                disabled={savingAttendance}
              >
                {savingAttendance && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Change Logs Modal ── */}
      <Dialog open={viewLogsModalOpen} onOpenChange={setViewLogsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-watney" /> Attendance Change History 
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 my-2 pr-4">
            {activeLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No change logs recorded for this session yet.</div>
            ) : (
              <div className="space-y-4">
                {[...activeLogs]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((log, idx) => (
                  <div key={log._id || idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-semibold ">
                        {log.message || ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLogsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page Header ── */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{courseName || 'Course'} Management</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium ">
              {groupName && (
                <span className="text-gray-700">
                  Group: <span className="font-semibold">{groupName}</span>
                </span>
              )}
              {groupName && termName && <span>•</span>}
              {termName && (
                <span className="text-gray-700">
                  Term: <span className="font-semibold">{termName}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="bg-watney text-white hover:bg-watney/90"
              onClick={() => navigate(-1)}
              size="sm"
            >
              <MoveLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {canEdit && (
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                onClick={openAddDialog}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Unit
              </Button>
            )}
            {/* <Button
              className="bg-watney text-white hover:bg-watney/90"
              onClick={() => navigate('class-routine')}
              size="sm"
            >
              <CalendarRange className="mr-2 h-4 w-4" /> Routine
            </Button> */}
          </div>
        </CardHeader>
      </Card>

      {/* ── Main Layout: Units, Attendance, Students & Teachers ── */}
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-4">
        {/* ── Course Units ── */}
        <Card
          className={`shadow-sm ${
            canSeeAttendance
              ? 'lg:col-span-2'
              : canSeeTeachers || canSeeStudents
                ? 'lg:col-span-3'
                : 'lg:col-span-4'
          }`}
        >
          <CardHeader className="p-2 pb-3">
            <CardTitle className="text-lg font-semibold">Course Units</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <BlinkingDots size="large" color="bg-watney" />
              </div>
            ) : units.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 /50" />
                <h3 className="mt-2 text-sm font-medium ">No course units added yet</h3>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Reference</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>GLS</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((unit) => (
                        <TableRow key={unit._id}>
                          <TableCell className="font-medium">{unit.unitReference}</TableCell>
                          <TableCell>{unit.title}</TableCell>
                          <TableCell>{unit.level}</TableCell>
                          <TableCell>{unit.gls}</TableCell>
                          <TableCell>{unit.credit}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewModules(unit)}
                                className="bg-watney text-white hover:bg-watney/90"
                              >
                                <FileText className="mr-1.5 h-4 w-4" /> Modules
                              </Button>
                              {canEdit && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => openEditDialog(unit)}
                                    className="bg-watney text-white hover:bg-watney/90"
                                  >
                                    <Pen className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteDialog(unit)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
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
          </CardContent>
        </Card>

        {/* ── Attendance (list view) — Teacher and Admin ── */}
        {canSeeAttendance && (
          <Card className="shadow-sm">
            <CardHeader className="p-2 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <ClipboardCheck className="h-5 w-5 text-watney" />
                  Attendance
                </CardTitle>
              </div>

              {/* Date Filter */}
              <div className="mt-3 space-y-2">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                  dateFormat="dd MMM yyyy"
                  isClearable={true}
                  placeholderText="Select date range"
                  wrapperClassName="w-full"
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-watney"
                />
                <Button
                  size="sm"
                  className="h-8 w-full bg-watney text-white hover:bg-watney/90 text-[11px]"
                  onClick={handleApplyDateRange}
                >
                  <Search className="mr-1.5 h-3.5 w-3.5" /> Apply Date Filter
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 flex-1 text-[11px]"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 flex-1 text-[11px]"
                    onClick={handleThisWeek}
                  >
                    This Week
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 flex-1 text-[11px]"
                    onClick={handleThisMonth}
                  >
                    This Month
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-2 pt-0">
              {attendanceLoading ? (
                <div className="flex justify-center py-12">
                  <BlinkingDots size="large" color="bg-watney" />
                </div>
              ) : attendanceSheets.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  No attendance records found for the selected date range.
                </div>
              ) : (
                <ScrollArea className="max-h-[calc(100vh-22rem)]">
                  <div className="divide-y divide-gray-100">
                    {attendanceSheets.map((sheet) => {
                      const totalStudents = sheet.attendance?.length || 0;
                      const presentCount = sheet.attendance?.filter((a) => a.status === 'present').length || 0;
                      const absentCount = sheet.attendance?.filter((a) => a.status === 'absent').length || 0;
                      const lateCount = sheet.attendance?.filter((a) => a.status === 'late').length || 0;
                      const unmarkedCount = totalStudents - presentCount - absentCount - lateCount;
                      const dateMoment = moment.utc(sheet.classDate).local();

                      return (
                        <div key={sheet._id} className="group px-4 py-3 transition-colors hover:bg-slate-50/80">
                          <div className="flex items-start gap-3">
                            {/* Date badge */}
                            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-watney/20 bg-watney/5 text-watney">
                              <span className="text-[9px] font-bold uppercase leading-none">
                                {dateMoment.format('MMM')}
                              </span>
                              <span className="text-sm font-bold leading-tight">{dateMoment.format('DD')}</span>
                            </div>

                            {/* Session info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {dateMoment.format('dddd')}
                                </p>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {sheet.classRoutineId?.startTime || '09:00'}–{sheet.classRoutineId?.endTime || '10:00'}
                                </span>
                                {sheet.classRoutineId?.note && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Note: {sheet.classRoutineId.note}
                                  </span>
                                )}
                              </div>

                              {/* Status pills */}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={clsx('flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold', STATUS_META.present.chip)}>
                                  <Circle className="h-1.5 w-1.5 fill-current" /> {presentCount} Present
                                </span>
                                <span className={clsx('flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold', STATUS_META.absent.chip)}>
                                  <Circle className="h-1.5 w-1.5 fill-current" /> {absentCount} Absent
                                </span>
                                <span className={clsx('flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold', STATUS_META.late.chip)}>
                                  <Circle className="h-1.5 w-1.5 fill-current" /> {lateCount} Late
                                </span>
                                {unmarkedCount > 0 && (
                                  <span className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                                    <Circle className="h-1.5 w-1.5 fill-current" /> {unmarkedCount} Unmarked
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 truncate text-[10.5px] text-gray-400">
                                Updated by <span className="font-medium text-gray-500">{userName(sheet.updatedBy)}</span>
                                {sheet.updatedAt ? ` · ${moment(sheet.updatedAt).format('DD MMM, HH:mm')}` : ''}
                              </p>

                              {/* Actions */}
                              <div className="mt-2.5 flex items-center gap-2">
                                {sheet.logs && sheet.logs.length > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openLogsModal(sheet.logs)}
                                    className="h-7 text-[11px]"
                                  >
                                    <History className="mr-1 h-3.5 w-3.5" /> Logs
                                  </Button>
                                )}
                                {canEdit && (
                                  <Button
                                    size="sm"
                                    onClick={() => openAttendanceModal(sheet)}
                                    className="h-7 bg-watney text-white hover:bg-watney/90 text-[11px]"
                                  >
                                    <Pen className="mr-1 h-3.5 w-3.5" /> Update
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Assigned Members Column (Students & Teachers) ── */}
        {(canSeeStudents || canSeeTeachers) && (
          <div className="flex flex-col gap-2">
            {/* ── Assigned Students — Teacher and Admin ── */}
            {canSeeStudents && (
              <Card className="shadow-sm">
                <CardHeader className="p-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      Student List
                    </CardTitle>
                    {canManageMembers && (
                      <Button size="sm" onClick={() => openAssignDialog('student')}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Assign Student
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  {membersLoading ? (
                    <div className="flex justify-center py-8">
                      <BlinkingDots size="large" color="bg-watney" />
                    </div>
                  ) : assignedStudents.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No students assigned to this group yet.
                    </div>
                  ) : (
                    <ScrollArea className="max-h-80">
                      <div className="space-y-2">
                        {assignedStudents.map((item) => {
                          const student = item.studentId;
                          const name =
                            typeof student === 'object'
                              ? student?.name || student?.email || 'Unknown Student'
                              : 'Unknown Student';
                          const email = typeof student === 'object' ? student?.email || '' : '';
                          return (
                            <div
                              key={item._id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                                {email && <p className="truncate text-xs text-gray-500">{email}</p>}
                              </div>
                              {canManageMembers && (
                                <button
                                  type="button"
                                  onClick={() => openUnassignDialog(item, 'student')}
                                  title="Unassign student"
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Assigned Teachers — Student, Teacher, and Admin ── */}
            {canSeeTeachers && (
              <Card className="shadow-sm">
                <CardHeader className="p-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                       Teacher List
                    </CardTitle>
                    {canManageMembers && (
                      <Button size="sm" onClick={() => openAssignDialog('teacher')}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Assign Teacher
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  {membersLoading ? (
                    <div className="flex justify-center py-8">
                      <BlinkingDots size="large" color="bg-watney" />
                    </div>
                  ) : assignedTeachers.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No teachers assigned to this group yet.
                    </div>
                  ) : (
                    <ScrollArea className="max-h-80">
                      <div className="space-y-2">
                        {assignedTeachers.map((item) => {
                          const teacher = item.teacherId;
                          const name =
                            typeof teacher === 'object'
                              ? teacher?.name || teacher?.email || 'Unknown Teacher'
                              : 'Unknown Teacher';
                          const email = typeof teacher === 'object' ? teacher?.email || '' : '';
                          return (
                            <div
                              key={item._id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                                {email && <p className="truncate text-xs text-gray-500">{email}</p>}
                              </div>
                              {canManageMembers && (
                                <button
                                  type="button"
                                  onClick={() => openUnassignDialog(item, 'teacher')}
                                  title="Unassign teacher"
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* ── Unassign Student / Teacher Dialog ── */}
      <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Unassign {memberToUnassign?.type === 'teacher' ? 'Teacher' : 'Student'}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign{' '}
              <span className="font-semibold">{memberToUnassign?.name}</span> from this group?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUnassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnassign}
              className="bg-red-600 hover:bg-red-700"
            >
              Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Student / Teacher Dialog ── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{assignType === 'student' ? 'Assign Student' : 'Assign Teacher'}</DialogTitle>
            <DialogDescription>
              Select a {assignType} to assign to {groupName ? `group "${groupName}"` : 'this group'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>{assignType === 'student' ? 'Student' : 'Teacher'} *</Label>
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={(option) => setSelectedUser(option as { value: string; label: string } | null)}
              placeholder={userOptionsLoading ? 'Loading...' : `Select a ${assignType}`}
              isLoading={userOptionsLoading}
              isDisabled={userOptionsLoading}
              styles={{
                control: (base: any) => ({ ...base, fontSize: '14px', borderColor: '#e5e7eb', boxShadow: 'none' }),
                menu: (base: any) => ({ ...base, fontSize: '14px', zIndex: 50 })
              }}
              noOptionsMessage={() => `No ${assignType}s available`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedUser || assigning}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CourseUnitPage;