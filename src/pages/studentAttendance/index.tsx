/**
 * A student's own attendance record.
 *
 * Read only by design: the register is the teacher's document, and this is the
 * student's window onto it. Nothing here can mark, edit or delete - the API
 * endpoint it reads has no writing counterpart.
 *
 * Everything the filters offer comes from the server alongside the rows, drawn
 * from the student's own sheets, so a course they never took is never listed
 * and choosing one filter never empties the others.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import {
  ArrowLeft,
  CalendarCheck,
  CalendarRange,
  Clock,
  MapPin,
  RotateCcw,
  Search,
  UserCheck
} from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { useEffectiveRole } from '@/hooks/use-effective-role';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import DynamicPagination from '@/components/shared/DynamicPagination';

interface FilterOption {
  value: string;
  label: string;
}

interface AttendanceRow {
  _id: string;
  attendanceId: string;
  classDate?: string;
  status?: 'present' | 'absent' | 'late' | null;
  remark?: string;
  courseName?: string;
  groupName?: string;
  termName?: string;
  unitTitle?: string;
  unitReference?: string;
  teacherName?: string;
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  notMarked: number;
  attendancePercentage: number | null;
  firstClass?: string | null;
  lastClass?: string | null;
}

const EMPTY_SUMMARY: AttendanceSummary = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  notMarked: 0,
  attendancePercentage: null,
  firstClass: null,
  lastClass: null
};

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'not_marked', label: 'Not marked' }
];

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 36,
    fontSize: 12,
    color: '#000'
  }),
  menu: (base: any) => ({ ...base, fontSize: 12, zIndex: 30 }),
  input: (base: any) => ({ ...base, color: '#000' }),
  singleValue: (base: any) => ({ ...base, color: '#000' }),
  option: (base: any) => ({ ...base, color: '#000' }),
  placeholder: (base: any) => ({ ...base, color: '#000', opacity: 0.5 })
};

/** How one register entry reads. Unmarked is its own state, not an absence. */
const statusStyle = (status?: string | null) => {
  switch (status) {
    case 'present':
      return { label: 'Present', badge: 'bg-emerald-100 text-emerald-700' };
    case 'late':
      return { label: 'Late', badge: 'bg-amber-100 text-amber-700' };
    case 'absent':
      return { label: 'Absent', badge: 'bg-rose-100 text-rose-700' };
    default:
      return { label: 'Not marked', badge: 'bg-gray-100 text-black' };
  }
};

const capitalise = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const toDateParam = (date: Date | null) =>
  date ? moment(date).format('YYYY-MM-DD') : undefined;

export default function StudentAttendancePage() {
  const navigate = useNavigate();
  const { user } = useEffectiveRole();

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [terms, setTerms] = useState<FilterOption[]>([]);
  const [units, setUnits] = useState<FilterOption[]>([]);

  // Two copies of the filters: what is being chosen, and what was last
  // submitted. Only the applied copy reaches the API, so a half-picked date
  // range never fires a request and Search always does something visible.
  const [draft, setDraft] = useState({
    course: null as FilterOption | null,
    term: null as FilterOption | null,
    unit: null as FilterOption | null,
    status: null as FilterOption | null,
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [applied, setApplied] = useState(draft);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const appliedKey = JSON.stringify({
    course: applied.course?.value || '',
    term: applied.term?.value || '',
    unit: applied.unit?.value || '',
    status: applied.status?.value || '',
    startDate: toDateParam(applied.startDate) || '',
    endDate: toDateParam(applied.endDate) || ''
  });

  const fetchAttendance = useCallback(async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const filters = JSON.parse(appliedKey);

      const params: Record<string, string | number> = {
        page,
        limit: pageSize
      };

      if (filters.course) params.courseId = filters.course;
      if (filters.term) params.termId = filters.term;
      if (filters.unit) params.unitId = filters.unit;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axiosInstance.get(
        `/student-attendance/record/${user._id}`,
        { params }
      );

      const data = res.data?.data || {};

      setRows(Array.isArray(data.result) ? data.result : []);
      setSummary({ ...EMPTY_SUMMARY, ...(data.summary || {}) });
      setTotalPages(data.meta?.totalPage || 1);

      const options = data.filters || {};
      setCourses(
        (options.courses || []).map((c: any) => ({
          value: String(c._id),
          label: c.courseCode ? `${c.name} (${c.courseCode})` : c.name || 'Course'
        }))
      );
      setTerms(
        (options.terms || []).map((t: any) => ({
          value: String(t._id),
          label: t.year ? `${t.name} — ${capitalise(t.year)}` : t.name || 'Term'
        }))
      );
      setUnits(
        (options.units || []).map((u: any) => ({
          value: String(u._id),
          label: u.unitReference
            ? `${u.unitReference} - ${u.title || 'Untitled unit'}`
            : u.title || 'Unit'
        }))
      );
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setRows([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [user?._id, appliedKey, page, pageSize]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Status is the one filter the API does not take: it lives on the student's
  // own row inside a sheet rather than on the sheet, so narrowing by it here
  // keeps the endpoint honest about what it returns.
  const visibleRows = useMemo(() => {
    const status = applied.status?.value;
    if (!status) return rows;
    if (status === 'not_marked') return rows.filter((row) => !row.status);
    return rows.filter((row) => row.status === status);
  }, [rows, applied.status]);

  const search = () => {
    setPage(1);
    setApplied(draft);
  };

  const reset = () => {
    const cleared = {
      course: null,
      term: null,
      unit: null,
      status: null,
      startDate: null,
      endDate: null
    };
    setPage(1);
    setDraft(cleared);
    setApplied(cleared);
  };

  const stats = [
    {
      label: 'Attendance',
      value:
        summary.attendancePercentage === null
          ? '—'
          : `${summary.attendancePercentage}%`,
      hint: 'of marked classes',
      icon: UserCheck,
      tone: 'bg-watney/10 text-watney'
    },
    {
      label: 'Present',
      value: summary.present,
      hint: `${summary.late} late`,
      icon: CalendarCheck,
      tone: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Absent',
      value: summary.absent,
      hint: `${summary.notMarked} not marked`,
      icon: CalendarRange,
      tone: 'bg-rose-50 text-rose-700'
    },
    {
      label: 'Classes',
      value: summary.total,
      hint:
        summary.firstClass && summary.lastClass
          ? `${moment(summary.lastClass).format('DD MMM YYYY')} — latest`
          : 'No classes yet',
      icon: Clock,
      tone: 'bg-blue-50 text-blue-700'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>My Attendance</CardTitle>
              {/* <CardDescription>
                Every class on your courses and how you were marked. Narrow the
                list by course, term, unit, status or date.
              </CardDescription> */}
            </div>
            <Button
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-watney text-white hover:bg-watney/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Totals across everything the filters match, not just this page. */}
          {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-black">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-black">{stat.value}</p>
                  <p className="truncate text-[11px] text-black">
                    {stat.hint}
                  </p>
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                Course
              </label>
              <Select
                options={courses}
                value={draft.course}
                onChange={(opt) =>
                  setDraft((prev) => ({
                    ...prev,
                    course: opt as FilterOption | null
                  }))
                }
                isClearable
                placeholder="All courses"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                Term
              </label>
              <Select
                options={terms}
                value={draft.term}
                onChange={(opt) =>
                  setDraft((prev) => ({
                    ...prev,
                    term: opt as FilterOption | null
                  }))
                }
                isClearable
                placeholder="All terms"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                Unit
              </label>
              <Select
                options={units}
                value={draft.unit}
                onChange={(opt) =>
                  setDraft((prev) => ({
                    ...prev,
                    unit: opt as FilterOption | null
                  }))
                }
                isClearable
                placeholder="All units"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                Status
              </label>
              <Select
                options={STATUS_OPTIONS}
                value={draft.status}
                onChange={(opt) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: opt as FilterOption | null
                  }))
                }
                isClearable
                placeholder="Any status"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                From
              </label>
              <DatePicker
                selected={draft.startDate}
                onChange={(date) =>
                  setDraft((prev) => ({ ...prev, startDate: date }))
                }
                selectsStart
                startDate={draft.startDate}
                endDate={draft.endDate}
                dateFormat="dd MMM yyyy"
                placeholderText="Start date"
                isClearable
                wrapperClassName="w-full"
                className="h-9 w-full rounded-md border border-gray-300 px-2 text-xs text-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">
                To
              </label>
              <DatePicker
                selected={draft.endDate}
                onChange={(date) =>
                  setDraft((prev) => ({ ...prev, endDate: date }))
                }
                selectsEnd
                startDate={draft.startDate}
                endDate={draft.endDate}
                minDate={draft.startDate || undefined}
                dateFormat="dd MMM yyyy"
                placeholderText="End date"
                isClearable
                wrapperClassName="w-full"
                className="h-9 w-full rounded-md border border-gray-300 px-2 text-xs text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={search}
              className="flex h-9 items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
            >
              <Search className="h-4 w-4" /> Search
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="flex h-9 items-center gap-2 text-xs"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarRange className="mb-3 h-10 w-10 text-black" />
              <h3 className="text-sm font-semibold text-black">
                No attendance records found
              </h3>
              <p className="mt-1 text-xs text-black">
                {summary.total === 0
                  ? 'Your classes have not been registered yet.'
                  : 'Nothing matches the filters you selected.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    {[
                      'Date',
                      'Time',
                      'Course',
                      'Term',
                      'Unit',
                      'Tutor',
                      'Room',
                      'Status'
                    ].map((label) => (
                      <TableHead
                        key={label}
                        className="text-[11px] font-semibold uppercase tracking-wide text-black"
                      >
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleRows.map((row) => {
                    const status = statusStyle(row.status);

                    return (
                      <TableRow key={`${row.attendanceId}-${row._id}`}>
                        <TableCell className="whitespace-nowrap text-xs text-black">
                          {row.classDate
                            ? moment(row.classDate).format('DD MMM YYYY')
                            : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-black">
                          {row.startTime && row.endTime
                            ? `${row.startTime} - ${row.endTime}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-black">
                          {row.courseName || '—'}
                          {row.groupName && (
                            <span className="block text-[11px] text-black">
                              {row.groupName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-black">
                          {row.termName || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-black">
                          {row.unitTitle || '—'}
                          {row.unitReference && (
                            <span className="block text-[11px] text-black">
                              {row.unitReference}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-black">
                          {row.teacherName?.trim() || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-black">
                          {row.roomNumber ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {row.roomNumber}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.badge}>{status.label}</Badge>
                          {row.remark && (
                            <span className="mt-1 block text-[11px] text-black">
                              {row.remark}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end pt-1">
              <DynamicPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
