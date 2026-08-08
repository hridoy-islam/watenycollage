import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import clsx from 'clsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
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
  File,
  User,
  Users,
  DoorOpen
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentCourse {
  _id: string;
  courseId?: { _id: string; name: string } | string;
  groupId?: { _id: string; name: string } | string;
  intakeId?: { _id: string; termName: string } | string;
  status: string;
}

interface AttendanceRecord {
  classDate: string;
  status?: AttendanceStatus;
  remark?: string;
  startTime?: string | null;
  courseId?: any;
}

interface ClassEntry {
  _id: string;
  classDate: string;
  startTime?: string;
  endTime?: string;
  note?: string;
  roomNumber?: string;
  courseId?: any;
  courseName?: string;
  groupName?: string;
  termName?: string;
  teacherName?: string;
  teacherEmail?: string;
  status?: AttendanceStatus | undefined;
  remark?: string;
}

interface StudentClassRoutineProps {
  studentId: string;
}

const STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    text: string;
    border: string;
    hex: string;
    soft: string;
  }
> = {
  present: {
    label: 'Present',
    text: 'text-emerald-600',
    border: 'border-emerald-400',
    hex: '#10b981',
    soft: 'bg-emerald-50'
  },
  absent: {
    label: 'Absent',
    text: 'text-rose-600',
    border: 'border-rose-400',
    hex: '#f43f5e',
    soft: 'bg-rose-50'
  },
  late: {
    label: 'Late',
    text: 'text-amber-600',
    border: 'border-amber-400',
    hex: '#f59e0b',
    soft: 'bg-amber-50'
  }
};

const PENDING_META = {
  label: 'Pending',
  text: 'text-gray-500',
  border: 'border-gray-200',
  hex: '#9ca3af',
  soft: 'bg-gray-50'
};

// ── Grid constants ────────────────────────────────────────────────────────
const START_H = 8;
const END_H = 23;
const HOURS = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const ROW_HEIGHT = 112;
const DAY_HEIGHT = HOURS.length * ROW_HEIGHT;
const COLUMN_MIN_PX = 96;
const COLUMN_MAX_PX = 180;
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

const asObject = (v: any) => (typeof v === 'string' ? { _id: v } : v);
const dateKey = (iso: string) => iso.split('T')[0];
const toLocalDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface DayBlock {
  entry: ClassEntry;
  topPx: number;
  heightPx: number;
  leftPct: number;
  widthPct: number;
}

function layoutDayBlocks(entries: ClassEntry[]): DayBlock[] {
  const items = entries
    .map((entry) => {
      if (!entry.startTime || !entry.endTime) return null;
      const [sh, sm] = entry.startTime.split(':').map(Number);
      const [eh, em] = entry.endTime.split(':').map(Number);
      let startD = Math.max(sh + sm / 60, START_H);
      let endD = Math.min(eh + em / 60, END_H);
      if (startD >= endD) return null;
      return {
        entry,
        start: startD,
        end: endD,
        topPx: (startD - START_H) * ROW_HEIGHT,
        heightPx: (endD - startD) * ROW_HEIGHT
      };
    })
    .filter(Boolean) as Array<{ entry: ClassEntry; start: number; end: number; topPx: number; heightPx: number }>;

  if (items.length === 0) return [];

  // group intervals into connected overlapping clusters
  const parent = Array.from({ length: items.length }, (_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].start < items[j].end && items[j].start < items[i].end) {
        union(i, j);
      }
    }
  }

  const clusters = new Map<number, number[]>();
  items.forEach((_, i) => {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(i);
  });

  const layouts: DayBlock[] = new Array(items.length);
  clusters.forEach((indices) => {
    const sorted = indices.sort((a, b) => items[a].start - items[b].start);
    const lanes: number[] = [];
    const assigned: { item: typeof items[0]; lane: number }[] = [];
    for (const idx of sorted) {
      const item = items[idx];
      let lane = lanes.findIndex((end) => end <= item.start);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(item.end);
      } else {
        lanes[lane] = item.end;
      }
      assigned.push({ item, lane });
    }
    const laneCount = lanes.length;
    assigned.forEach(({ item, lane }) => {
      layouts[items.indexOf(item)] = {
        entry: item.entry,
        topPx: item.topPx,
        heightPx: item.heightPx,
        leftPct: laneCount === 1 ? 0 : (lane * 100) / laneCount,
        widthPct: laneCount === 1 ? 100 : 100 / laneCount
      };
    });
  });

  return layouts;
}

export function StudentClassRoutine({ studentId }: StudentClassRoutineProps) {
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const [selected, setSelected] = useState<ClassEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Date range state (same controls as the teacher routine) ───────────
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

  // ── Fetch all approved course routines + attendance for the range ──────
  const fetchData = useCallback(async () => {
    if (!studentId || weekDays.length === 0) return;
    setLoading(true);
    try {
      const startDateStr = toLocalDateString(weekDays[0]);
      const endDateStr = toLocalDateString(weekDays[weekDays.length - 1]);

      const appRes = await axiosInstance.get('/application-course', {
        params: { studentId, limit: 'all' }
      });
      const apps: StudentCourse[] = (
        (appRes.data?.data?.result || []) as StudentCourse[]
      ).filter((a) => a.status === 'approved');

      const comboMap = new Map<
        string,
        { courseId?: string; groupId?: string; termId?: string }
      >();
      apps.forEach((app) => {
        const courseId = asObject(app.courseId)?._id;
        const groupId = asObject(app.groupId)?._id;
        const termId = asObject(app.intakeId)?._id;
        if (!courseId) return;
        const key = `${courseId}|${groupId || ''}|${termId || ''}`;
        if (!comboMap.has(key)) {
          comboMap.set(key, {
            courseId,
            groupId,
            termId
          });
        }
      });

      const combos = [...comboMap.values()];

      const routineReq = combos.map((c) =>
        axiosInstance.get('/course-routine?limit=500', {
          params: {
            courseId: c.courseId,
            ...(c.groupId ? { groupId: c.groupId } : {}),
            ...(c.termId ? { termId: c.termId } : {}),
            startDate: startDateStr,
            endDate: endDateStr
          }
        })
      );

      const historyReq = axiosInstance.get(
        `/student-attendance/history/${studentId}`,
        {
          params: {
            startDate: startDateStr,
            endDate: endDateStr,
            limit: 'all'
          }
        }
      );

      const [routineResArr, historyRes] = await Promise.all([
        Promise.all(routineReq),
        historyReq
      ]);

      const routineFlat = routineResArr.flatMap(
        (r) => r.data?.data?.result || []
      );

      const unique = new Map<string, any>();
      routineFlat.forEach((r: any) => {
        unique.set(r._id, r);
      });
      const routines = [...unique.values()];

      const historyArr: AttendanceRecord[] = Array.isArray(
        historyRes.data?.data?.result
      )
        ? historyRes.data.data.result
        : [];

      const historyMap: Record<string, AttendanceRecord> = {};
      historyArr.forEach((h) => {
        const courseIdStr = asObject(h.courseId)?._id?.toString() || '';
        historyMap[
          `${dateKey(h.classDate)}|${courseIdStr}|${h.startTime || ''}`
        ] = h;
        historyMap[`${dateKey(h.classDate)}|${h.startTime || ''}`] =
          historyMap[`${dateKey(h.classDate)}|${h.startTime || ''}`] || h;
        historyMap[`${dateKey(h.classDate)}|${courseIdStr}`] =
          historyMap[`${dateKey(h.classDate)}|${courseIdStr}`] || h;
      });

      const merged: ClassEntry[] = routines.map((routine: any) => {
        const course = asObject(routine.courseId);
        const group = asObject(routine.groupId);
        const term = asObject(routine.termId);
        const teacher = asObject(routine.teacherId);
        const courseIdStr = course?._id?.toString() || '';
        const matched =
          historyMap[`${dateKey(routine.classDate)}|${courseIdStr}|${routine.startTime || ''}`] ||
          historyMap[`${dateKey(routine.classDate)}|${courseIdStr}`] ||
          historyMap[`${dateKey(routine.classDate)}|${routine.startTime || ''}`] ||
          historyMap[dateKey(routine.classDate)];

        return {
          _id: routine._id,
          classDate: routine.classDate,
          startTime: routine.startTime,
          endTime: routine.endTime,
          note: routine.note,
          roomNumber: routine.roomNumber,
          courseId: course?._id,
          courseName: course?.name || 'Course',
          groupName: group?.name || '',
          termName: term?.name || '',
          teacherName: teacher?.name || '',
          teacherEmail: teacher?.email || '',
          status: matched?.status as AttendanceStatus | undefined,
          remark: matched?.remark
        };
      });

      merged.sort((a, b) =>
        a.classDate === b.classDate
          ? (a.startTime || '').localeCompare(b.startTime || '')
          : a.classDate.localeCompare(b.classDate)
      );

      setClasses(merged);
    } catch (error) {
      console.error('Failed to load routine data:', error);
      toast({
        title: 'Failed to load your class routine',
        description: 'Something went wrong while loading your schedule.',
        variant: 'destructive'
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, weekDays, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Layout helpers ─────────────────────────────────────────────────────
  const blocksByDay = useMemo(() => {
    const arr: ClassEntry[][] = weekDays.map(() => []);
    classes.forEach((c) => {
      const di = weekDays.findIndex(
        (d) => dateKey(c.classDate) === toUTCDateKey(d)
      );
      if (di !== -1) arr[di].push(c);
    });
    return arr;
  }, [classes, weekDays]);

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

  const statusOf = (status?: AttendanceStatus) => {
    if (!status) return PENDING_META;
    return STATUS_META[status];
  };

  const openDetails = (entry: ClassEntry) => {
    setSelected(entry);
    setDialogOpen(true);
  };

  const rangeLabel =
    weekDays.length > 0
      ? `${moment(weekDays[0]).format('DD MMM')} – ${moment(
          weekDays[weekDays.length - 1]
        ).format('DD MMM YYYY')}`
      : 'Select dates';

  return (
    <Card className="w-full max-w-full min-w-0 overflow-hidden shadow-sm">
      <div className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-watney/10 p-2">
              <CalendarClock className="h-5 w-5 text-watney" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                My Class Routine & Attendance
              </h2>
              <p className="text-xs text-gray-500">
                Your weekly schedule for all enrolled courses
              </p>
            </div>
          </div>
        </div>

        {/* Date range controls */}
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
                <button
                  className="h-8 rounded-md border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={goThisWeek}
                >
                  This Week
                </button>
                <button
                  className="h-8 rounded-md bg-watney px-3 text-xs font-semibold text-white transition-colors hover:bg-watney/90"
                  onClick={goToday}
                >
                  Today
                </button>
              </>
            )}
          </div>

          <span className="text-xs text-gray-400">
            {classes.length} class{classes.length === 1 ? '' : 'es'} in range
          </span>
        </div>

        {/* Stats */}
        {!loading && classes.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-[10px] font-semibold uppercase text-gray-500">
                Classes
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">
                {stats.present}
              </p>
              <p className="text-[10px] font-semibold uppercase text-emerald-600">
                Present
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-center">
              <p className="text-xl font-bold text-rose-600">{stats.absent}</p>
              <p className="text-[10px] font-semibold uppercase text-rose-600">
                Absent
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-xl font-bold text-amber-600">{stats.late}</p>
              <p className="text-[10px] font-semibold uppercase text-amber-600">
                Late
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{stats.unmarked}</p>
              <p className="text-[10px] font-semibold uppercase text-blue-600">
                Pending
              </p>
            </div>
          </div>
        )}

        {/* Attendance rate */}
        {!loading && classes.length > 0 && (
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">
                Attendance Rate (Present + Late)
              </span>
              <span className="text-sm font-bold text-watney">
                {stats.rate}%
              </span>
            </div>
            <Progress value={stats.rate} className="h-2" />
          </div>
        )}

        {/* View toggle */}
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
              <span className="text-sm font-bold text-gray-700">
                Click a class to see full details
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {(Object.keys(STATUS_META) as AttendanceStatus[]).map((key) => (
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
                ))}
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PENDING_META.hex }}
                  />
                  Pending
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <BlinkingDots size="small" color="bg-watney" />
              </div>
            ) : classes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No classes scheduled in this date range.
              </p>
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
                                  : 'bg-slate-50'
                            }`}
                          >
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                              {d.toLocaleDateString('en-GB', {
                                weekday: 'short'
                              })}
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
                    {HOURS.map((hr, hi) => (
                      <tr key={hr}>
                        <td className="sticky left-0 z-50 w-16 min-w-[64px] border-b border-r border-gray-200 bg-white px-2 pt-1 text-right align-top text-[11px] font-semibold text-black/70 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.15)]">
                          {fmtH(hr)}
                        </td>
                        {hi === 0
                          ? weekDays.map((d, di) => {
                              const today = isToday(d);
                              const wknd = [0, 6].includes(d.getDay());
                              const blocks = layoutDayBlocks(blocksByDay[di]);
                              return (
                                <td
                                  key={di}
                                  rowSpan={HOURS.length}
                                  className={clsx(
                                    'relative border-b border-r border-gray-200 p-0 align-top',
                                    today
                                      ? 'bg-blue-50/20'
                                      : wknd
                                        ? 'bg-slate-50/60'
                                        : 'bg-white'
                                  )}
                                  style={{
                                    width: COLUMN_WIDTH,
                                    minWidth: `${COLUMN_MIN_PX}px`,
                                    maxWidth: `${COLUMN_MAX_PX}px`
                                  }}
                                >
                                  <div
                                    className="relative w-full"
                                    style={{
                                      height: DAY_HEIGHT,
                                      backgroundImage: `repeating-linear-gradient(
                                        to bottom,
                                        transparent 0,
                                        transparent ${ROW_HEIGHT - 1}px,
                                        #e5e7eb ${ROW_HEIGHT - 1}px,
                                        #e5e7eb ${ROW_HEIGHT}px
                                      )`
                                    }}
                                  >
                                    {blocks.map((block, i) => {
                                      const meta = statusOf(block.entry.status);
                                      return (
                                        <button
                                          key={`${block.entry._id}-${i}`}
                                          onClick={() =>
                                            openDetails(block.entry)
                                          }
                                          title={
                                            block.entry.remark || 'View details'
                                          }
                                          className={clsx(
                                            'absolute z-10 flex cursor-pointer flex-col overflow-hidden rounded-md border bg-white p-2 text-left text-xs shadow-sm transition-all hover:shadow-md hover:brightness-[0.98]',
                                            meta.border
                                          )}
                                          style={{
                                            top: block.topPx + 2,
                                            left: `calc(${block.leftPct}% + 2px)`,
                                            width: `calc(${block.widthPct}% - 4px)`,
                                            height: Math.max(
                                              block.heightPx - 4,
                                              34
                                            )
                                          }}
                                        >
                                          <div className="flex h-full select-none flex-col justify-start overflow-hidden">
                                            <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[9px] font-semibold text-black">
                                              <Clock
                                                className="h-2.5 w-2.5 shrink-0"
                                                style={{ color: meta.hex }}
                                              />
                                              {block.entry.startTime} –{' '}
                                              {block.entry.endTime}
                                            </div>
                                            <div className="mt-0.5 flex shrink-0 items-center gap-1 overflow-hidden text-[10px] font-bold text-black">
                                              <BookOpen
                                                className="h-2.5 w-2.5 shrink-0 text-watney"
                                                style={{ color: meta.hex }}
                                              />
                                              <span className="truncate">
                                                {block.entry.courseName}
                                              </span>
                                            </div>
                                            {(block.entry.groupName ||
                                              block.entry.termName) && (
                                              <div className="mt-0.5 flex shrink-0 items-center gap-1 overflow-hidden text-[8px] font-medium text-black">
                                                {block.entry.groupName && (
                                                  <span className="truncate">
                                                    {block.entry.groupName}
                                                  </span>
                                                )}
                                                {block.entry.groupName &&
                                                  block.entry.termName && (
                                                    <span className="shrink-0">
                                                      ·
                                                    </span>
                                                  )}
                                                {block.entry.termName && (
                                                  <span className="truncate">
                                                    {block.entry.termName}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                            {block.entry.teacherName && (
                                              <div className="mt-0.5 flex shrink-0 items-center gap-1 overflow-hidden text-black">
                                                <User className="h-2.5 w-2.5 shrink-0" />
                                                <span className="truncate text-[9px]">
                                                  {block.entry.teacherName}
                                                </span>
                                              </div>
                                            )}
                                            {block.entry.note && (
                                              <div className="mt-0.5 flex w-full shrink-0 items-center gap-1 overflow-hidden text-black">
                                                <File className="h-2.5 w-2.5 shrink-0" />
                                                <span className="truncate text-[9px]">
                                                  {block.entry.note}
                                                </span>
                                              </div>
                                            )}
                                            <div
                                              className={clsx(
                                                'mt-auto flex shrink-0 items-center gap-1 pt-1 text-[9px] font-bold',
                                                meta.text
                                              )}
                                            >
                                              <span
                                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                style={{
                                                  backgroundColor: meta.hex
                                                }}
                                              />
                                              {meta.label}
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                              );
                            })
                          : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* ── List view ── */}
          <TabsContent value="list" className="mt-4">
            {loading ? (
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
                      <TableHead>Group</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-6 text-center text-gray-500"
                        >
                          No classes scheduled for this course.
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map((cls) => {
                        const meta = statusOf(cls.status);
                        return (
                          <TableRow
                            key={cls._id}
                            className="cursor-pointer hover:bg-gray-50/60"
                            onClick={() => openDetails(cls)}
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
                            <TableCell className="font-medium">
                              {cls.courseName || 'Course'}
                            </TableCell>
                            <TableCell>{cls.groupName || '—'}</TableCell>
                            <TableCell>{cls.termName || '—'}</TableCell>
                            <TableCell>
                              {cls.teacherName || '—'}
                            </TableCell>
                            <TableCell>
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
      </div>

      {/* ── Class details dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] w-[95vw] flex-col overflow-hidden p-0 sm:p-0">
          {selected && (
            <>
              <DialogHeader className="px-4 py-4 sm:px-6">
                <DialogTitle className="flex flex-wrap items-center gap-2 text-base text-black sm:text-lg">
                  <BookOpen
                    className="h-4 w-4 shrink-0 text-watney sm:h-5 sm:w-5"
                  />
                  <span className="break-words">{selected.courseName}</span>
                </DialogTitle>
                <DialogDescription className="space-y-1 text-xs text-black">
                  <div className="font-medium text-black">
                    {moment.utc(selected.classDate).format('dddd, DD MMM YYYY')}{' '}
                    · {selected.startTime || '--:--'} –{' '}
                    {selected.endTime || '--:--'}
                  </div>
                  {(selected.groupName || selected.termName) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {selected.groupName && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 shrink-0" />
                          <span>Group: {selected.groupName}</span>
                        </span>
                      )}
                      {selected.termName && (
                        <span className="flex items-center gap-1">
                          <CalendarRange className="h-3 w-3 shrink-0" />
                          <span>Term: {selected.termName}</span>
                        </span>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto px-4 pb-4 sm:px-6">
                <div className="space-y-3">
                  <DetailRow icon={<Clock className="h-3.5 w-3.5" />} label="Time">
                    {selected.startTime || '--:--'} – {selected.endTime || '--:--'}
                  </DetailRow>
                  {selected.roomNumber && (
                    <DetailRow icon={<DoorOpen className="h-3.5 w-3.5" />} label="Room">
                      {selected.roomNumber}
                    </DetailRow>
                  )}
                  {selected.teacherName && (
                    <DetailRow icon={<User className="h-3.5 w-3.5" />} label="Teacher">
                      {selected.teacherName}
                      {selected.teacherEmail ? ` (${selected.teacherEmail})` : ''}
                    </DetailRow>
                  )}
                  {selected.termName && (
                    <DetailRow icon={<CalendarRange className="h-3.5 w-3.5" />} label="Term">
                      {selected.termName}
                    </DetailRow>
                  )}
                  {selected.note && (
                    <DetailRow icon={<File className="h-3.5 w-3.5" />} label="Note">
                      {selected.note}
                    </DetailRow>
                  )}
                  {selected.remark && (
                    <DetailRow icon={<File className="h-3.5 w-3.5" />} label="Teacher note">
                      {selected.remark}
                    </DetailRow>
                  )}

                  <div className="rounded-lg border border-gray-100 p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Attendance Status
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: statusOf(selected.status).hex }}
                      />
                      <span
                        className={clsx(
                          'text-sm font-bold',
                          statusOf(selected.status).text
                        )}
                      >
                        {statusOf(selected.status).label}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  children
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm text-gray-800">
          {children || '—'}
        </span>
      </div>
    </div>
  );
}