/**
 * Picks the scheduled session a lesson is taught in.
 *
 * A lecture no longer floats loose under its unit - it belongs to a slot on
 * the timetable, which is what puts it in front of the student and the teacher
 * on the day. A unit can carry a term's worth of sessions, so the list is
 * narrowed by date before it is searched rather than asking whoever is
 * uploading to scroll a hundred rows.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { CalendarRange, RotateCcw } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type RoutineOption = {
  value: string;
  label: string;
  classDate?: string;
  startTime?: string;
  endTime?: string;
  note?: string;
};

interface LessonRoutineSelectProps {
  courseId?: string;
  termId?: string;
  groupId?: string;
  unitId?: string;
  value?: string | null;
  onChange: (routineId: string | null) => void;
  /** Shown under the control when the form has been submitted without one. */
  error?: string | null;
}

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '38px',
    fontSize: '13px',
    borderColor: state.isFocused ? 'hsl(var(--watney))' : '#d1d5db',
    boxShadow: 'none',
    '&:hover': { borderColor: '#9ca3af' }
  }),
  menu: (base: any) => ({ ...base, fontSize: '13px', zIndex: 60 }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: 'auto' as const
  }),
  option: (base: any) => ({ ...base, fontSize: '13px' })
};

const routineLabel = (routine: any) => {
  const date = routine.classDate
    ? moment(routine.classDate).format('ddd DD MMM YYYY')
    : 'Date to be confirmed';
  const time =
    routine.startTime && routine.endTime
      ? `${routine.startTime} - ${routine.endTime}`
      : '';
  return [date, time, routine.note].filter(Boolean).join('  |  ');
};

export default function LessonRoutineSelect({
  courseId,
  termId,
  groupId,
  unitId,
  value,
  onChange,
  error
}: LessonRoutineSelectProps) {
  const [routines, setRoutines] = useState<RoutineOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const fetchRoutines = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    try {
      // The unit alone identifies the sessions, but course/term/group are sent
      // too so a unit re-run for another cohort cannot bleed into the list.
      const params: Record<string, string | number> = {
        unitId,
        limit: 'all' as unknown as number,
        sort: 'classDate'
      };
      if (courseId) params.courseId = courseId;
      if (termId) params.termId = termId;
      if (groupId) params.groupId = groupId;
      // The endpoint takes plain dates and widens them to whole days itself.
      if (from) params.startDate = moment(from).format('YYYY-MM-DD');
      if (to) params.endDate = moment(to).format('YYYY-MM-DD');

      const res = await axiosInstance.get('/course-routine', { params });
      const result = res.data?.data?.result || [];

      setRoutines(
        (Array.isArray(result) ? result : []).map((routine: any) => ({
          value: routine._id,
          label: routineLabel(routine),
          classDate: routine.classDate,
          startTime: routine.startTime,
          endTime: routine.endTime,
          note: routine.note
        }))
      );
    } catch (err) {
      console.error('Failed to load class routines:', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, [unitId, courseId, termId, groupId, from, to]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  // The selected routine may sit outside the current date filter - when a
  // saved lesson is reopened, for instance - so it is kept in the options
  // rather than leaving the control looking empty.
  const selected = useMemo(
    () => routines.find((r) => r.value === value) || null,
    [routines, value]
  );

  const clearFilters = () => {
    setFrom(null);
    setTo(null);
  };

  return (
    <div>
      <Label className="flex items-center gap-1.5">
        <CalendarRange className="h-3.5 w-3.5" />
        Class routine <span className="text-red-600">*</span>
      </Label>

      <p className="mt-1 text-[11px] text-black">
        The session this lesson is taught in. It is what shows the lesson on the
        student and teacher class routine.
      </p>

      {/* Narrow by date first - a unit can hold a term's worth of sessions. */}
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="w-full md:w-[250px]">
          <Label className="text-[11px] font-normal text-black">From</Label>
          <DatePicker
            selected={from}
            onChange={(date) => setFrom(date)}
            // Neither end may cross the other, so the range stays sane without
            // having to validate it after the fact.
            selectsStart
            startDate={from}
            endDate={to}
            maxDate={to || undefined}
            dateFormat="dd/MM/yyyy"
            placeholderText="Any date"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-2 text-xs text-black"
            wrapperClassName="w-full"
            // The form lives inside a dialog, so the calendar has to clear it.
            popperClassName="z-[1001]"
          />
        </div>
        <div className="w-full md:w-[250px]">
          <Label className="text-[11px] font-normal text-black">To</Label>
          <DatePicker
            selected={to}
            onChange={(date) => setTo(date)}
            selectsEnd
            startDate={from}
            endDate={to}
            minDate={from || undefined}
            dateFormat="dd/MM/yyyy"
            placeholderText="Any date"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-2 text-xs text-black"
            wrapperClassName="w-full"
            popperClassName="z-[1001]"
          />
        </div>
        {(from || to) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={clearFilters}
          >
            <RotateCcw className="mr-1.5 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="mt-2">
        <Select
          options={routines}
          value={selected}
          onChange={(option) =>
            onChange((option as RoutineOption)?.value || null)
          }
          isLoading={loading}
          isClearable
          placeholder={
            unitId
              ? 'Search a date, time or note...'
              : 'Open a unit to pick a session'
          }
          noOptionsMessage={() =>
            loading
              ? 'Loading sessions...'
              : 'No class routine for this unit in that range'
          }
          className="react-select-container"
          classNamePrefix="react-select"
          styles={selectStyles}
          menuPortalTarget={
            typeof document !== 'undefined' ? document.body : undefined
          }
          menuPlacement="auto"
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
