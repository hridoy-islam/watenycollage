import { useState, useEffect, forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  CalendarSearch,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import Shadcn Alert Dialog
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DynamicPagination } from '@/components/shared/DynamicPagination';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'unallocated':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const UserCell = ({
  user,
  role,
  fallback,
  fallbackIcon: Icon,
  isUnallocated
}: any) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border ${
        isUnallocated
          ? 'border-amber-100 bg-amber-50 text-amber-600'
          : 'border-slate-200 bg-slate-100 text-slate-600'
      }`}
    >
      {user?.firstName ? (
        <span className="text-xs font-bold">{user.firstName[0]}</span>
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </div>
    <div className="flex flex-col">
      <span
        className={`text-sm font-medium ${isUnallocated ? 'italic text-amber-700' : 'text-slate-700'}`}
      >
        {user ? `${user.firstName} ${user.lastName}` : fallback}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-400">
        {role}
      </span>
    </div>
  </div>
);

const CustomDateInput = forwardRef(
  ({ value, onClick, placeholder }: any, ref: any) => (
    <button
      className={`flex items-center gap-2 rounded-md border px-4 py-2 font-bold transition-colors ${
        !value
          ? 'border-theme bg-watney text-white hover:bg-watney/90'
          : 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100'
      }`}
      onClick={onClick}
      ref={ref}
    >
      <CalendarIcon
        className={`h-5 w-5 ${!value ? 'text-white' : 'text-theme'}`}
      />
      <span className="text-lg">
        {value ? moment(value).format('DD MMM YYYY') : placeholder}
      </span>
    </button>
  )
);

export default function ScheduleTable({ refresh }: any) {
  const { sid } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  
  // State for Confirmation Modal
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingScheduleId, setPendingScheduleId] = useState<string | null>(null);
  const [updatingSchedule, setUpdatingSchedule] = useState<string | null>(null);

  const handlePrevDay = () => {
    if (selectedDate)
      setSelectedDate((d) => moment(d).subtract(1, 'days').toDate());
  };

  const handleNextDay = () => {
    if (selectedDate) setSelectedDate((d) => moment(d).add(1, 'days').toDate());
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Step 1: User clicks button -> Open Modal
  const initiateStatusUpdate = (scheduleId: string) => {
    setPendingScheduleId(scheduleId);
    setConfirmationOpen(true);
  };

  // Step 2: User confirms -> Execute API Call
  const confirmStatusUpdate = async () => {
    if (!pendingScheduleId) return;

    // Close modal immediately
    setConfirmationOpen(false);
    
    // Set loading state for specific row
    setUpdatingSchedule(pendingScheduleId);
    
    try {
      // Assuming we are setting it to true based on the button logic
      const newStatus = true; 

      await axiosInstance.patch(`/schedules/${pendingScheduleId}`, {
        completeSchedule: newStatus
      });

      setSchedules(prev =>
        prev.map(s =>
          s._id === pendingScheduleId
            ? { ...s, completeSchedule: newStatus }
            : s
        )
      );

      toast({
        title: 'Success',
        description: `Schedule marked as completed`
      });
    } catch (error) {
      console.error('Failed to update schedule', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update schedule status'
      });
    } finally {
      setUpdatingSchedule(null);
      setPendingScheduleId(null);
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const params: any = {
          serviceUser: sid,
          page: currentPage,
          limit: entriesPerPage
        };

        if (selectedDate) {
          params.dateFilter = moment(selectedDate).format('YYYY-MM-DD');
        }

        const response = await axiosInstance.get('/schedules', { params });

        setSchedules(response.data?.data?.result || []);

        if (response.data?.data?.meta) {
          setTotalPages(response.data.data.meta.totalPage || 1);
        }
      } catch (error) {
        console.error('Failed to fetch schedules', error);
      } finally {
        setLoading(false);
      }
    };

    if (sid) {
      fetchSchedules();
    }
  }, [selectedDate, currentPage, entriesPerPage, sid, refresh]);

  return (
    <>
      <div className="mx-auto flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 p-5 md:flex-row">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Schedule History</h2>
            <div className="flex items-center rounded-lg bg-slate-50 p-1">
              {selectedDate && (
                <button
                  onClick={handlePrevDay}
                  className="rounded-md p-2 text-slate-500 transition-all hover:bg-watney hover:text-white hover:shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div className="relative z-20 mx-1">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  customInput={<CustomDateInput placeholder="Filter by Date" />}
                  dateFormat="dd MMM yyyy"
                  todayButton="Jump to Today"
                  popperClassName="react-datepicker-left"
                  placeholderText="Select a date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  portalId="root"
                />
              </div>

              {selectedDate && (
                <button
                  onClick={handleNextDay}
                  className="rounded-md p-2 text-slate-500 transition-all hover:bg-watney hover:text-white hover:shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <div className="mb-4 rounded-full bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <CalendarSearch className="h-12 w-12 text-theme/60" />
              </div>
              <p className="text-lg font-medium text-slate-600">
                No schedules found
              </p>
              <p className="mt-2 text-center text-sm text-slate-500">
                {selectedDate
                  ? `There are no visits for ${moment(selectedDate).format('DD MMM YYYY')}`
                  : 'No scheduled visits available for this service user'}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-12 font-semibold text-slate-600">
                      Date
                    </TableHead>
                    <TableHead className="h-12 w-[180px] font-semibold text-slate-600">
                      Time / Duration
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-600">
                      Staff Member
                    </TableHead>
                    <TableHead className="hidden h-12 font-semibold text-slate-600 md:table-cell">
                      Service Type
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="h-12 pr-6 text-center font-semibold text-slate-600">
                      Completed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((service) => {
                    const start = moment(service.startTime, 'HH:mm');
                    const end = moment(service.endTime, 'HH:mm');
                    const durationHrs = moment
                      .duration(end.diff(start))
                      .asHours()
                      .toFixed(2);

                    return (
                      <TableRow
                        key={service._id}
                        className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                      >
                        <TableCell className="font-medium text-slate-600">
                          {moment(service.date).format('DD MMM YYYY')}
                        </TableCell>

                        <TableCell className="py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-mono text-sm font-semibold text-slate-700">
                                {service.startTime}
                              </span>
                              <span className="text-slate-400">-</span>
                              <span className="font-mono text-sm font-semibold text-slate-700">
                                {service.endTime}
                              </span>
                            </div>
                            <span className="pl-5.5 text-xs font-medium tabular-nums text-slate-400">
                              {durationHrs} hrs
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="align-middle">
                          <UserCell
                            user={service.employee}
                            role="Carer"
                            fallback="Unallocated"
                            fallbackIcon={UserCheck}
                            isUnallocated={!service.employee}
                          />
                        </TableCell>

                        <TableCell className="hidden align-middle md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></span>
                            <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                              {service.serviceType?.title || 'General Care'}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="align-middle">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                              service.completeSchedule
                                ? getStatusStyles('completed')
                                : getStatusStyles(service.employee ? 'scheduled' : 'unallocated')
                            }`}
                          >
                            {service.completeSchedule
                              ? 'Completed'
                              : service.employee
                                ? 'Scheduled'
                                : 'Unallocated'}
                          </Badge>
                        </TableCell>

                        <TableCell className="pr-6 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              // CHANGED: Logic to trigger modal instead of direct API call
                              onClick={() => initiateStatusUpdate(service._id)}
                              disabled={updatingSchedule === service._id || service.completeSchedule}
                              className={`transition-all ${
                                service.completeSchedule
                                  ? 'bg-watney text-white hover:bg-watney/90 opacity-100 cursor-not-allowed'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {updatingSchedule === service._id ? (
                                <span className="text-xs">...</span>
                              ) : service.completeSchedule ? (
                                <span className="text-xs font-bold">Yes</span>
                              ) : (
                                <span className="text-xs">No</span>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="pt-4">
                  <DynamicPagination
                    pageSize={entriesPerPage}
                    setPageSize={setEntriesPerPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-theme" />
              Mark as Completed?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this schedule as finished? This action will update the status and cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingSchedule}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-closing to handle async if needed, though we close manually above
                confirmStatusUpdate();
              }}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}