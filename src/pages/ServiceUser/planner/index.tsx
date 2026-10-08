import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar as CalendarIcon,
  UserCheck,
  CalendarSearch,
  Plus,
  MoreVertical,
  AlertTriangle,
  Filter,
  X,
  Edit,
  Save,
  XCircle,
  Trash2,
  MoveLeft
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import  DynamicPagination  from '@/components/shared/DynamicPagination';
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
      return 'bg-slate-100 text-black border-slate-200';
  }
};

interface GenerateRotaFormData {
  serviceUsers: any[];
  fromDate: Date | null;
  toDate: Date | null;
}

interface AssignCarerFormData {
  employee: any;
}

export default function ServiceUserPlannerPage() {
  const {  sid } = useParams();

  // Generate Rota Dialog State
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GenerateRotaFormData>({
    serviceUsers: [],
    fromDate: null,
    toDate: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate()
  // Service Users & Staff Options
  const [serviceUserOptions, setServiceUserOptions] = useState<any[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Schedules State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  // Filters State
  const [filterFromDate, setFilterFromDate] = useState<Date | null>(
    moment().startOf('month').toDate()
  );
  const [filterToDate, setFilterToDate] = useState<Date | null>(
    moment().endOf('month').toDate()
  );
  const [filterServiceUser, setFilterServiceUser] = useState<any>(null);
  const [filterStaff, setFilterStaff] = useState<any>(null);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);

  // Assign Carer Dialog State
  const [assignCarerDialogOpen, setAssignCarerDialogOpen] = useState(false);
  const [selectedScheduleForAssign, setSelectedScheduleForAssign] =
    useState<any>(null);
  const [assignCarerFormData, setAssignCarerFormData] =
    useState<AssignCarerFormData>({
      employee: null
    });
  const [isAssigning, setIsAssigning] = useState(false);

  const [reconcilingScheduleId, setReconcilingScheduleId] = useState<
    string | null
  >(null);
  const [reconcileData, setReconcileData] = useState<any>({});
  const [isSavingReconcile, setIsSavingReconcile] = useState(false);

  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: moment().startOf('month').toDate(),
    toDate: moment().endOf('month').toDate(),
    serviceUser: null,
    staff: null,
    showOnlyDuplicates: false
  });

  const [userData, setUserData] = useState<any>(null);

  const duplicateCount = schedules.filter((s) => s.isDuplicate).length;

  // --- Time Handling Logic ---
  const handleTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: string) => void
  ) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange('');
      return;
    }
    if (!/^[0-9:]*$/.test(inputValue)) return;

    const rawNums = inputValue.replace(':', '');
    if (rawNums.length > 4) return;

    let newValue = inputValue;
    if (rawNums.length === 3 && !inputValue.includes(':')) {
      newValue = `${rawNums.slice(0, 2)}:${rawNums.slice(2)}`;
    }

    const parts = newValue.split(':');
    if (parts[0] && parseInt(parts[0]) > 23) return;
    if (parts[1] && parseInt(parts[1]) > 59) return;
    if (newValue.length > 5) return;

    onChange(newValue);
  };

  const handleTimeBlur = (value: string, onChange: (val: string) => void) => {
    if (!value) return;
    if (!value.includes(':')) {
      if (value.length === 1) onChange(`0${value}:00`);
      else if (value.length === 2) onChange(`${value}:00`);
      else if (value.length === 3)
        onChange(`${value.slice(0, 2)}:0${value.slice(2)}`);
      else if (value.length === 4)
        onChange(`${value.slice(0, 2)}:${value.slice(2)}`);
    } else {
      const [h, m] = value.split(':');
      const formatted = `${h.padStart(2, '0')}:${(m || '00').padEnd(2, '0')}`;
      onChange(formatted);
    }
  };

  // Wrapper for updating Reconcile Data state
  const handleReconcileTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'startTime' | 'endTime'
  ) => {
    handleTimeInput(e, (val) =>
      setReconcileData({ ...reconcileData, [field]: val })
    );
  };

  const handleReconcileTimeBlur = (field: 'startTime' | 'endTime') => {
    handleTimeBlur(reconcileData[field], (val) =>
      setReconcileData({ ...reconcileData, [field]: val })
    );
  };

  // Calculate duration in HH:mm format considering dates
  const calculateDuration = (
    startDate: Date | null,
    endDate: Date | null,
    startTime: string,
    endTime: string
  ): string => {
    if (!startTime || !endTime || !startDate || !endDate) return '00:00';

    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');

    if (!start.isValid() || !end.isValid()) return '00:00';

    // Check if dates are the same
    const isSameDate = moment(startDate).isSame(moment(endDate), 'day');

    let duration;
    if (isSameDate) {
      // Same date - simple time difference
      duration = moment.duration(end.diff(start));
    } else {
      // Different dates - calculate across days
      const startDateTime = moment(startDate).set({
        hour: start.hours(),
        minute: start.minutes()
      });
      const endDateTime = moment(endDate).set({
        hour: end.hours(),
        minute: end.minutes()
      });
      duration = moment.duration(endDateTime.diff(startDateTime));
    }

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    // Return 00:00 if negative
    if (hours < 0 || minutes < 0) return '00:00';

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Validation function for reconcile data
  const validateReconcileData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if all required fields are present
    if (!reconcileData.startDate) errors.push('Start date is required');
    if (!reconcileData.endDate) errors.push('End date is required');
    if (!reconcileData.startTime) errors.push('Start time is required');
    if (!reconcileData.endTime) errors.push('End time is required');

    // If any required field is missing, return early
    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const startDate = moment(reconcileData.startDate);
    const endDate = moment(reconcileData.endDate);
    const startTime = moment(reconcileData.startTime, 'HH:mm');
    const endTime = moment(reconcileData.endTime, 'HH:mm');

    // Validate time format
    if (!startTime.isValid()) errors.push('Invalid start time format');
    if (!endTime.isValid()) errors.push('Invalid end time format');

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Check if endDate is not before startDate
    if (endDate.isBefore(startDate, 'day')) {
      errors.push('End date cannot be earlier than start date');
    }

    // Check if dates are the same
    const isSameDate = startDate.isSame(endDate, 'day');

    if (isSameDate) {
      // If same date, end time cannot be before or equal to start time
      if (endTime.isSameOrBefore(startTime)) {
        errors.push('End time must be after start time when on the same date');
      }
    } else {
      // Different dates - calculate duration to ensure it's not negative
      const startDateTime = moment(reconcileData.startDate).set({
        hour: startTime.hours(),
        minute: startTime.minutes()
      });
      const endDateTime = moment(reconcileData.endDate).set({
        hour: endTime.hours(),
        minute: endTime.minutes()
      });

      if (endDateTime.isSameOrBefore(startDateTime)) {
        errors.push('End date and time must be after start date and time');
      }
    }

    // Check invoice rate vs pay rate
    if (reconcileData.invoiceRate < reconcileData.payRate) {
      errors.push('Invoice rate cannot be smaller than pay rate');
    }

    return { isValid: errors.length === 0, errors };
  };

  // Fetch Service Users and Staff for Options
  useEffect(() => {
    const fetchOptions = async () => {

      setLoadingOptions(true);
      try {
        // Fetch Service Users
        const serviceUsersRes = await axiosInstance.get(`/users/${sid}`);
setUserData(serviceUsersRes.data?.data || null);
   

        // Add "All" option for filters
      
        // Fetch Staff (Carers)
        const staffRes = await axiosInstance.get('/users', {
          params: {
            role: 'employee',
            limit: 'all',
           
          }
        });

        const staff = staffRes.data?.data?.result || [];
        const staffOpts = staff.map((member: any) => ({
          value: member._id,
          label: `${member.firstName} ${member.lastName}`,
          data: member
        }));

        setStaffOptions(staffOpts);
      } catch (error) {
        console.error('Failed to fetch options', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load service users and staff'
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [sid]);

  // Fetch Schedules with Filters
  const fetchSchedules = async () => {
    if (!sid) return;
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: entriesPerPage
      };

      // Apply Filters from appliedFilters state
      if (appliedFilters.fromDate) {
        params.fromDate = moment(appliedFilters.fromDate).format('YYYY-MM-DD');
      }

      if (appliedFilters.toDate) {
        params.toDate = moment(appliedFilters.toDate).format('YYYY-MM-DD');
      }

      params.serviceUser = sid;

      if (appliedFilters.showOnlyDuplicates) {
        params.isDuplicate = true;
      }
      params.completeSchedule = false;

      const response = await axiosInstance.get('/schedules', { params });

      let fetchedSchedules = response.data?.data?.result || [];

      // Sort by start date
      fetchedSchedules = fetchedSchedules.sort((a: any, b: any) => {
        return moment(a.startDate).diff(moment(b.startDate));
      });

      setSchedules(fetchedSchedules);

      if (response.data?.data?.meta) {
        setTotalPages(response.data.data.meta.totalPage || 1);
      }
    } catch (error) {
      console.error('Failed to fetch schedules', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load schedules'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [sid, currentPage, entriesPerPage, appliedFilters]);

  // Handle Generate Rota Dialog Open
  const handleOpenGenerateDialog = () => {
    setGenerateDialogOpen(true);
  };

  const handleSearch = () => {
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      serviceUser: filterServiceUser,
      staff: filterStaff,
      showOnlyDuplicates: showOnlyDuplicates
    });
    setCurrentPage(1);
  };

  // Handle Generate Rota Submit
  const handleGenerateRota = async () => {


    if (!formData.fromDate || !formData.toDate) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select both from and to dates'
      });
      return;
    }

    const from = moment(formData.fromDate).format('YYYY-MM-DD');
    const to = moment(formData.toDate).format('YYYY-MM-DD');

    setIsGenerating(true);

    try {
      let serviceUserIds = [sid];

      const payload = {
        fromDate: from,
        toDate: to,
        serviceUserIds: serviceUserIds
      };

      const response = await axiosInstance.post(
        '/schedules/bulk-schedule',
        payload
      );

      toast({
        title: 'Success',
        description: response.data?.message || 'Rota generated successfully'
      });

      setGenerateDialogOpen(false);
      setFormData({
        serviceUsers: [],
        fromDate: null,
        toDate: null
      });
     

      setFilterFromDate(formData.fromDate);
      setFilterToDate(formData.toDate);
    } catch (error: any) {
      console.error('Failed to generate rota', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate rota'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Assign Carer Dialog Open
  const handleOpenAssignCarerDialog = (schedule: any) => {
    // Close the custom dropdown if open
    setActionMenuOpenId(null);
    setSelectedScheduleForAssign(schedule);
    setAssignCarerFormData({
      employee: null
    });
    setAssignCarerDialogOpen(true);
  };

  // Handle Assign Carer Submit

  const handleAssignCarer = async () => {
    if (!selectedScheduleForAssign) return;
    if (!assignCarerFormData.employee) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a Employer'
      });
      return;
    }

    setIsAssigning(true);

    try {
      const payload = {
        startDate: moment(selectedScheduleForAssign.startDate).format(
          'YYYY-MM-DD'
        ),
        endDate: moment(selectedScheduleForAssign.endDate).format('YYYY-MM-DD'),
        startTime: selectedScheduleForAssign.startTime,
        endTime: selectedScheduleForAssign.endTime,
        serviceUser: selectedScheduleForAssign.serviceUser._id,
        employee: assignCarerFormData.employee.value,
        payRate: selectedScheduleForAssign.payRate,
        invoiceRate: selectedScheduleForAssign.invoiceRate,
        duration: selectedScheduleForAssign.duration,
      };

      await axiosInstance.post('/schedules', payload);

      toast({
        title: 'Success',
        description: 'New schedule created with assigned Employer'
      });

      // Close dialog
      setAssignCarerDialogOpen(false);
      setSelectedScheduleForAssign(null);

      // Keep loading true to avoid showing stale data
      setLoading(true);

      // Wait for backend to recalculate duplicates
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fetch updated schedules
      await fetchSchedules();

      // Update local state: filter out schedules that are no longer duplicates
      if (showOnlyDuplicates) {
        setSchedules((prev) => prev.filter((s) => s.isDuplicate));
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Failed to assign Employer', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to assign Employer'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Delete Dialog Open
  const handleOpenDeleteDialog = (schedule: any) => {
    setActionMenuOpenId(null);
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  // Handle Delete Confirm

  // Handle Delete Confirm
  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);

    try {
      await axiosInstance.delete(`/schedules/${scheduleToDelete._id}`);

      toast({
        title: 'Success',
        description: 'Schedule deleted successfully'
      });

      // Close dialog
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);

      // Keep loading true to avoid showing stale data
      setLoading(true);

      // Wait for backend to recalculate duplicates
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fetch updated schedules
      await fetchSchedules();

      // Update local state: filter out schedules that are no longer duplicates
      if (showOnlyDuplicates) {
        setSchedules((prev) => prev.filter((s) => s.isDuplicate));
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Failed to delete schedule', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to delete schedule'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reconcile Start
  const handleStartReconcile = (schedule: any) => {
    setReconcilingScheduleId(schedule._id);
    setActionMenuOpenId(null); // Close dropdown if open

    // Find current staff selection
    const currentStaff = schedule.employee
      ? staffOptions.find((opt) => opt.value === schedule.employee._id)
      : null;

    setReconcileData({
      startDate: schedule.startDate ? new Date(schedule.startDate) : null,
      endDate: schedule.endDate ? new Date(schedule.endDate) : null,
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      employee: currentStaff,
      payRate: schedule.payRate || 0,
      invoiceRate: schedule.invoiceRate || 0
    });
  };

  // Handle Reconcile Cancel
  const handleCancelReconcile = () => {
    setReconcilingScheduleId(null);
    setReconcileData({});
  };

  // Handle Reconcile Save
  const handleSaveReconcile = async () => {
    if (!reconcilingScheduleId) return;

    // Run validation
    const validation = validateReconcileData();

    if (!validation.isValid) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: validation.errors[0]
      });
      return;
    }

    setIsSavingReconcile(true);

    try {
      const payload = {
        startDate: moment(reconcileData.startDate).format('YYYY-MM-DD'),
        endDate: moment(reconcileData.endDate).format('YYYY-MM-DD'),
        startTime: reconcileData.startTime,
        endTime: reconcileData.endTime,
        employee: reconcileData.employee ? reconcileData.employee.value : null,
        payRate: reconcileData.payRate,
        invoiceRate: reconcileData.invoiceRate
      };

      await axiosInstance.patch(`/schedules/${reconcilingScheduleId}`, payload);

      toast({
        title: 'Success',
        description: 'Schedule reconciled successfully'
      });

      // Reset reconcile state
      setReconcilingScheduleId(null);
      setReconcileData({});

      // Keep loading true to avoid showing stale data
      setLoading(true);

      // Wait for backend to recalculate duplicates
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fetch updated schedules
      await fetchSchedules();

      // Update local state: filter out schedules that are no longer duplicates
      if (showOnlyDuplicates) {
        setSchedules((prev) => prev.filter((s) => s.isDuplicate));
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Failed to reconcile schedule', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to reconcile schedule'
      });
    } finally {
      setIsSavingReconcile(false);
    }
  };

  const clearFilters = () => {
    setFilterFromDate(moment().startOf('month').toDate());
    setFilterToDate(moment().endOf('month').toDate());
    setFilterServiceUser(null);
    setFilterStaff(null);
    setShowOnlyDuplicates(false);

    // Also clear applied filters
    setAppliedFilters({
      fromDate: moment().startOf('month').toDate(),
      toDate: moment().endOf('month').toDate(),
      serviceUser: null,
      staff: null,
      showOnlyDuplicates: false
    });
    setCurrentPage(1);
  };

  // Custom styles for smaller React Select
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '36px',
      fontSize: '0.875rem'
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '2px 8px'
    }),
    input: (base: any) => ({
      ...base,
      margin: '0px',
      padding: '0px'
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: '36px'
    })
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header with Generate Button */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-theme/5 to-transparent p-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-watney shadow-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">{userData?.firstName}{" "}{userData?.lastName}'s Call Time</h2>
             
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <Button onClick={()=>{navigate(-1)}}>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {duplicateCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowOnlyDuplicates(!showOnlyDuplicates);
                  // Also update applied filters and trigger search
                  setAppliedFilters((prev) => ({
                    ...prev,
                    showOnlyDuplicates: !showOnlyDuplicates
                  }));
                }}
                className={`h-9 ${
                  showOnlyDuplicates
                    ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-700'
                    : 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-700'
                }`}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {showOnlyDuplicates
                  ? 'Show All'
                  : `Fix Duplicates (${duplicateCount})`}
              </Button>
            )}
            <Button
              onClick={handleOpenGenerateDialog}
              className="bg-watney text-white shadow-md hover:bg-watney/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Rota
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-black" />
                <span className="text-sm font-semibold text-black">
                  Filters:
                </span>
              </div>

              <div className="relative">
                <DatePicker
                  selected={filterFromDate}
                  onChange={(date) => setFilterFromDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="From Date"
className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                   showMonthDropdown
                   showYearDropdown
                   dropdownMode="select"
                   portalId="root"
                 />
               </div>

               <div className="relative z-20">
                 <DatePicker
                   selected={filterToDate}
                   onChange={(date) => setFilterToDate(date)}
                   dateFormat="dd-MM-yyyy"
                   placeholderText="To Date"
                   className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  portalId="root"
                />
              </div>

              <Button
                onClick={handleSearch}
                className="bg-watney text-white shadow-md hover:bg-watney/90"
              >
                Search
              </Button>

              {(filterFromDate ||
                filterToDate ||
                filterServiceUser ||
                filterStaff ||
                showOnlyDuplicates) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-black"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="flex-1 p-0">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-black">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-black">
              <div className="mb-4 rounded-full bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <CalendarSearch className="h-12 w-12 text-theme/60" />
              </div>
              <p className="text-lg font-medium text-black">
                No schedules found
              </p>
              <p className="mt-2 text-center text-sm text-black">
                Generate a rota to get started
              </p>
            </div>
          ) : (
            <div className="p-2">
              {/* Responsive Container */}
              <div className="w-full ">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-12 min-w-[150px] font-semibold text-black">
                        Employer
                      </TableHead>
                     
                      <TableHead className="h-12 w-[130px] font-semibold text-black">
                        Start Date
                      </TableHead>
                      <TableHead className="h-12 w-[100px] font-semibold text-black">
                        Start Time
                      </TableHead>
                      <TableHead className="h-12 w-[130px] font-semibold text-black">
                        End Date
                      </TableHead>
                      <TableHead className="h-12 w-[100px] font-semibold text-black">
                        End Time
                      </TableHead>
                      <TableHead className="h-12 w-[90px] font-semibold text-black">
                        Duration
                      </TableHead>
                      <TableHead className="h-12 font-semibold text-black">
                        Pay Rate
                      </TableHead>
                      <TableHead className="h-12 font-semibold text-black">
                        Invoice Rate
                      </TableHead>

                      <TableHead className="h-12 text-right font-semibold text-black">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule: any) => {
                      const isReconciling =
                        reconcilingScheduleId === schedule._id;
                      const isActionMenuOpen =
                        actionMenuOpenId === schedule._id;

                      const duration = calculateDuration(
                        schedule.startDate
                          ? new Date(schedule.startDate)
                          : null,
                        schedule.endDate ? new Date(schedule.endDate) : null,
                        schedule.startTime,
                        schedule.endTime
                      );

                      // Get validation state for reconcile mode
                      const validation = isReconciling
                        ? validateReconcileData()
                        : { isValid: true, errors: [] };
                      const isSaveDisabled =
                        isReconciling &&
                        (!validation.isValid || isSavingReconcile);

                      // Check individual field errors for visual feedback
                      const hasDateError =
                        isReconciling &&
                        reconcileData.startDate &&
                        reconcileData.endDate &&
                        moment(reconcileData.endDate).isBefore(
                          moment(reconcileData.startDate),
                          'day'
                        );
                      const hasTimeError =
                        isReconciling &&
                        reconcileData.startDate &&
                        reconcileData.endDate &&
                        reconcileData.startTime &&
                        reconcileData.endTime &&
                        moment(reconcileData.startDate).isSame(
                          moment(reconcileData.endDate),
                          'day'
                        ) &&
                        moment(reconcileData.endTime, 'HH:mm').isSameOrBefore(
                          moment(reconcileData.startTime, 'HH:mm')
                        );
                      const hasRateError =
                        isReconciling &&
                        reconcileData.invoiceRate < reconcileData.payRate;

                      if (isReconciling) {
                        // Reconcile Edit Mode
                        return (
                          <TableRow key={schedule._id} className="">
                            <TableCell className="py-3">
                              <div className="max-w-[200px]">
                                <Select
                                  value={reconcileData.employee}
                                  onChange={(selected) =>
                                    setReconcileData({
                                      ...reconcileData,
                                      employee: selected
                                    })
                                  }
                                  options={staffOptions}
                                  placeholder="Select staff..."
                                  isClearable
                                  className="text-sm text-black"
                                  styles={customSelectStyles}
                                />
                              </div>
                            </TableCell>
                           

                            <TableCell className="py-3">
                              <DatePicker
                                selected={reconcileData.startDate}
                                onChange={(date) =>
                                  setReconcileData({
                                    ...reconcileData,
                                    startDate: date
                                  })
                                }
                                dateFormat="dd-MM-yyyy"
className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                                 showMonthDropdown
                                 showYearDropdown
                                 dropdownMode="select"
                                 portalId="root"
                                 popperPlacement="right-start"
                              />
                            </TableCell>

                            <TableCell className="py-3">
                              <Input
                                type="text"
                                placeholder="09:00"
                                maxLength={5}
                                value={reconcileData.startTime}
                                onChange={(e) =>
                                  handleReconcileTimeChange(e, 'startTime')
                                }
                                onBlur={() =>
                                  handleReconcileTimeBlur('startTime')
                                }
                                className={`w-[70px] tracking-wider  ${
                                  hasTimeError
                                    ? 'border-red-500 bg-red-50 text-black'
                                    : 'text-black'
                                }`}
                              />
                            </TableCell>
                            <TableCell className="py-3">
                              <DatePicker
                                selected={reconcileData.endDate}
                                onChange={(date) =>
                                  setReconcileData({
                                    ...reconcileData,
                                    endDate: date
                                  })
                                }
                                dateFormat="dd-MM-yyyy"
                                className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                                 showMonthDropdown
                                 showYearDropdown
                                 dropdownMode="select"
                                 portalId="root"
                               />
                             </TableCell>

                            <TableCell className="py-3">
                              <Input
                                type="text"
                                placeholder="17:00"
                                maxLength={5}
                                value={reconcileData.endTime}
                                onChange={(e) =>
                                  handleReconcileTimeChange(e, 'endTime')
                                }
                                onBlur={() =>
                                  handleReconcileTimeBlur('endTime')
                                }
                                className={`w-[70px] tracking-wider  ${
                                  hasTimeError
                                    ? 'border-red-500 bg-red-50 text-black'
                                    : 'text-black'
                                }`}
                              />
                            </TableCell>

                            <TableCell className="py-3">
                              <span className="text-sm font-medium text-black">
                                {calculateDuration(
                                  reconcileData.startDate,
                                  reconcileData.endDate,
                                  reconcileData.startTime,
                                  reconcileData.endTime
                                )}
                              </span>
                            </TableCell>

                            <TableCell className="py-3">
                              <Input
                                type="number"
                                step="0.01"
                                value={reconcileData.payRate}
                                onChange={(e) =>
                                  setReconcileData({
                                    ...reconcileData,
                                    payRate: parseFloat(e.target.value) || 0
                                  })
                                }
                                className={`w-16 ${
                                  hasRateError
                                    ? 'border-red-500 bg-red-50 text-black'
                                    : 'text-black'
                                }`}
                              />
                            </TableCell>

                            <TableCell className="py-3">
                              <Input
                                type="number"
                                step="0.01"
                                value={reconcileData.invoiceRate}
                                onChange={(e) =>
                                  setReconcileData({
                                    ...reconcileData,
                                    invoiceRate: parseFloat(e.target.value) || 0
                                  })
                                }
                                className={`w-16 ${
                                  hasRateError
                                    ? 'border-red-500 bg-red-50 text-black'
                                    : 'text-black'
                                }`}
                              />
                            </TableCell>

                            <TableCell className="py-3 text-center">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveReconcile}
                                  disabled={isSaveDisabled}
                                  className="bg-watney text-white hover:bg-watney/90 disabled:cursor-not-allowed disabled:opacity-50"
                                  title={
                                    !validation.isValid
                                      ? validation.errors.join(', ')
                                      : ''
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelReconcile}
                                  disabled={isSavingReconcile}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // Normal Display Mode
                      return (
                        <TableRow
                          key={schedule._id}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                            schedule.isDuplicate
                              ? 'bg-red-50 hover:bg-red-100/50'
                              : ''
                          }`}
                        >
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  schedule.employee
                                    ? 'text-black'
                                    : 'italic text-amber-700'
                                }`}
                              >
                                {schedule.employee
                                  ? `${schedule.employee.firstName} ${schedule.employee.lastName}`
                                  : 'Unallocated'}
                              </span>
                            </div>
                            {schedule.isDuplicate && (
                              <Badge
                                variant="outline"
                                className="w-fit rounded-full border-none bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 shadow-sm"
                              >
                                Duplicate
                              </Badge>
                            )}
                          </TableCell>
                          

                          <TableCell className="py-3">
                            <span className="text-sm text-black">
                              {moment(schedule.startDate).format('DD-MM-YYYY')}
                            </span>
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span className=" text-sm text-black">
                                {schedule.startTime}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <span className="text-sm text-black">
                              {moment(schedule.endDate).format('DD-MM-YYYY')}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span className=" text-sm text-black">
                                {schedule.endTime}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <span className="text-sm font-medium tabular-nums text-black">
                              {duration}
                            </span>
                          </TableCell>

                          <TableCell className="py-3">
                            <span className="text-sm font-semibold text-black">
                              £{schedule.payRate?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-xs text-black"> </span>
                          </TableCell>

                          <TableCell className="py-3">
                            <span className="text-sm font-semibold text-black">
                              £{schedule.invoiceRate?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-xs text-black"> </span>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartReconcile(schedule)}
                                className="gap-1 "
                              >
                                Update
                              </Button>

                              {/* Custom Native Dropdown Implementation */}
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    setActionMenuOpenId(
                                      isActionMenuOpen ? null : schedule._id
                                    )
                                  }
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {isActionMenuOpen && (
                                  <>
                                    {/* Backdrop to close when clicking outside */}
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setActionMenuOpenId(null)}
                                    ></div>

                                    {/* Menu Items */}
                                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                                      <div
                                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-black hover:bg-watney hover:text-white"
                                        onClick={() =>
                                          handleOpenAssignCarerDialog(schedule)
                                        }
                                      >
                                        Assign Another Carer
                                      </div>
                                      <div
                                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() =>
                                          handleOpenDeleteDialog(schedule)
                                        }
                                      >
                                        Delete Rota
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="p-4">
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

      {/* Generate Rota Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <CalendarIcon className="h-5 w-5 text-theme" />
              Generate Rota
            </DialogTitle>
            <DialogDescription className="text-black/70">
              Select how you want to generate the rota
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
           

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-black">From Date</Label>
                <DatePicker
                  selected={formData.fromDate}
                  onChange={(date) =>
                    setFormData({ ...formData, fromDate: date })
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select start date"
                  className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  preventOpenOnFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-black">To Date</Label>
                <DatePicker
                  selected={formData.toDate}
                  onChange={(date) =>
                    setFormData({ ...formData, toDate: date })
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select end date"
                  className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  preventOpenOnFocus
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGenerateDialogOpen(false);
               
                setFormData({
                  serviceUsers: [],
                  fromDate: null,
                  toDate: null
                });
              }}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateRota}
              disabled={isGenerating }
              className="bg-watney text-white hover:bg-watney/90"
            >
              {isGenerating ? (
                <>
                  <BlinkingDots size="small" color="bg-white" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Carer Dialog */}
      <Dialog
        open={assignCarerDialogOpen}
        onOpenChange={setAssignCarerDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <UserCheck className="h-5 w-5 text-theme" />
              Assign Another Carer
            </DialogTitle>
            <DialogDescription className="text-black/70">
              Select a Employer to create a new schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="carer" className="text-black">
                Select Employer
              </Label>
              <Select
                id="carer"
                value={assignCarerFormData.employee}
                onChange={(selected) =>
                  setAssignCarerFormData({ employee: selected })
                }
                options={staffOptions}
                placeholder="Select a Employer..."
                className="text-sm text-black"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignCarerDialogOpen(false)}
              disabled={isAssigning}
              className=""
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignCarer}
              disabled={isAssigning}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {isAssigning ? (
                <>
                  <BlinkingDots size="small" color="bg-white" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                'Create Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-black">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Rota
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black/70">
              Are you sure you want to delete this schedule? This action cannot
              be undone.
              {scheduleToDelete && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-black">
                    {scheduleToDelete.serviceUser
                      ? `${scheduleToDelete.serviceUser.firstName} ${scheduleToDelete.serviceUser.lastName}`
                      : 'Unknown Service User'}
                  </p>
                  <p className="text-black/70">
                    {moment(scheduleToDelete.startDate).format('DD-MM-YYYY')} •{' '}
                    {scheduleToDelete.startTime} - {scheduleToDelete.endTime}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <BlinkingDots size="small" color="bg-white" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
