import { useState, useEffect, forwardRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Trash2,
  Edit,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Wallet,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios'; 
import { toast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import ScheduleTable from './components/ScheduleTable';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

// --- TYPES ---

interface EmployeeRateMap {
    [key: string]: { rate: number };
}

interface Shift {
    _id: string;
    name: string;
    startTime: string; 
    endTime: string;
    _rates?: EmployeeRateMap; 
    // Added to track the source Rate Document ID
    rateDocId?: string; 
}

interface Visit {
  id: string; // Front-end temp ID
  startTime: string;
  endTime: string;
  carerName: string;
  carerId?: string; 
  amount: string; 
  payRate?: number; 
  invoiceRate?: number;
  shiftId?: string;
  // Backend specific fields
  employmentRateId?: string | null; // Matches backend typo "employmentRateId"
  _id?: string; 
}

interface DayConfig {
  visits: Visit[];
}

interface GeneratedVisit {
  id: string;
  date: string;
  dayName: string;
  visits: Visit[];
  price: number;
}

const WEEKDAYS = [
  { key: 'Monday', label: 'Monday', short: 'Mon' },
  { key: 'Tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'Wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'Thursday', label: 'Thursday', short: 'Thu' },
  { key: 'Friday', label: 'Friday', short: 'Fri' },
  { key: 'Saturday', label: 'Saturday', short: 'Sat' },
  { key: 'Sunday', label: 'Sunday', short: 'Sun' }
];

// --- Custom Date Input for Picker ---
const DatePickerInput = forwardRef(({ value, onClick, placeholder }: any, ref: any) => (
  <Button
    variant="outline"
    className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
    onClick={onClick}
    ref={ref}
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    {value ? value : <span>{placeholder}</span>}
  </Button>
));

export default function ServiceUserTask() {
  const { sid } = useParams(); // This is the Service User ID (sid)
  const navigate = useNavigate();

  // State for Schedule
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({
    Monday: { visits: [] },
    Tuesday: { visits: [] },
    Wednesday: { visits: [] },
    Thursday: { visits: [] },
    Friday: { visits: [] },
    Saturday: { visits: [] },
    Sunday: { visits: [] }
  });

  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reference data for mapping names
  const [staffList, setStaffList] = useState<{_id: string, firstName: string, lastName: string}[]>([]);

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedVisit[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Dialog States
  const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isAddCallTimeOpen, setIsAddCallTimeOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [serviceUserData, setServiceUserData] = useState<any>(null)
  const [editingVisit, setEditingVisit] = useState<{
    dayKey: string;
    visit: Visit | null;
  }>({ dayKey: '', visit: null });

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, dayKey: string | null, visitId: string | null }>({
    isOpen: false,
    dayKey: null,
    visitId: null
  });
  
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
 
  
  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        try {
            // A. Fetch Staff List (to map IDs to Names if backend sends only IDs)
            const staffRes = await axiosInstance.get(`/users?role=employee&limit=all`);
            const staff = staffRes.data.data.result || [];
            setStaffList(staff);

            // B. Fetch Existing Schedule
            const scheduleRes = await axiosInstance.get(`/serviceuser-schedule?serviceUserId=${sid}`);
            const existingData = scheduleRes.data.data.result?.[0]; // Accessing result[0] as requested
            setScheduleData(existingData);
            const serviceUserRes = await axiosInstance.get(`/users/${sid}`);
            setServiceUserData(serviceUserRes.data.data);

            if (existingData) {
                setHasExistingSchedule(true);
                mapBackendToFrontend(existingData.schedule, staff);
            }
        } catch (error) {
            console.error("Failed to load schedule", error);
        } finally {
            setIsLoading(false);
        }
    };

    if(sid) initData();
  }, [sid]);

  // --- HELPERS: Data Mapping ---

  const mapBackendToFrontend = (backendSchedule: any[], staff: any[]) => {
      const newConfigs: Record<string, DayConfig> = {
        Monday: { visits: [] }, Tuesday: { visits: [] }, Wednesday: { visits: [] },
        Thursday: { visits: [] }, Friday: { visits: [] }, Saturday: { visits: [] }, Sunday: { visits: [] }
      };

      backendSchedule.forEach((dayGroup: any) => {
          if (newConfigs[dayGroup.day]) {
              newConfigs[dayGroup.day].visits = dayGroup.visits.map((v: any) => {
                  // Attempt to find carer name
                  let carerName = '';
                  // If employeeId is populated object
                  if (v.employeeId && typeof v.employeeId === 'object' && v.employeeId.firstName) {
                      carerName = `${v.employeeId.firstName} ${v.employeeId.lastName}`;
                  } 
                  // If employeeId is string, look up in staffList
                  else if (v.employeeId && typeof v.employeeId === 'string') {
                      const found = staff.find(s => s._id === v.employeeId);
                      if (found) carerName = `${found.firstName} ${found.lastName}`;
                  }

                  // Calculate Amount for display (invRate * duration)
                  const start = parseInt(v.startTime.split(':')[0]) + parseInt(v.startTime.split(':')[1]) / 60;
                  const end = parseInt(v.endTime.split(':')[0]) + parseInt(v.endTime.split(':')[1]) / 60;
                  let duration = end - start;
                  if (duration < 0) duration += 24; 
                  const amount = (duration * (v.invoiceRate || 0)).toFixed(2);

                  return {
                      id: v._id || Date.now().toString() + Math.random(), // Use backend ID if available
                      startTime: v.startTime,
                      endTime: v.endTime,
                      carerId: v.employeeId?._id || v.employeeId, // Store ID
                      carerName: carerName,
                      shiftId: v.shiftId,
                      // Map the Rate ID from backend
                      employmentRateId: v.employmentRateId, 
                      payRate: v.payRate,
                      invoiceRate: v.invoiceRate,
                      amount: amount,
                      _id: v._id
                  };
              });
          }
      });
      setDayConfigs(newConfigs);
  };

  // --- HANDLER: Persist Schedule (API Call) ---
  const persistSchedule = async (currentConfigs: Record<string, DayConfig>) => {
    setIsSaving(true);
    try {
        // Transform frontend state to backend model structure
        const schedulePayload = Object.entries(currentConfigs)
            .filter(([_, config]) => config.visits.length > 0)
            .map(([day, config]) => ({
                day: day,
                visits: config.visits.map(v => ({
                    startTime: v.startTime,
                    endTime: v.endTime,
                    employeeId: v.carerId || null,
                    shiftId: v.shiftId || null,
                    // Pass the ID stored in state
                    employmentRateId: v.employmentRateId || null, 
                    payRate: v.payRate || 0,
                    invoiceRate: v.invoiceRate || 0,
                }))
            }));

        const body = {
            serviceUserId: sid,
            schedule: schedulePayload
        };

        if (hasExistingSchedule) {
            // PATCH
            await axiosInstance.patch(`/serviceuser-schedule/${scheduleData?._id}`, body);
            toast({ title: "Success", description: "Schedule updated successfully." });
        } else {
            // POST
            await axiosInstance.post(`/serviceuser-schedule`, body);
            setHasExistingSchedule(true);
            toast({ title: "Success", description: "Schedule created successfully." });
        }
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save schedule." });
    } finally {
        setIsSaving(false);
    }
  };

  // --- Handlers (Local State + Auto Save) ---

  const editVisit = (dayKey: string, visit: Visit) => {
    setEditingVisit({ dayKey, visit });
    setIsEditVisitOpen(true);
  };

  const initiateDeleteVisit = (dayKey: string, visitId: string) => {
    setDeleteConfirm({ isOpen: true, dayKey, visitId });
  };

  const confirmDeleteVisit = async () => {
    const { dayKey, visitId } = deleteConfirm;
    if (!dayKey || !visitId) return;

    // 1. Calculate new state
    const newConfigs = { ...dayConfigs };
    newConfigs[dayKey] = {
        ...newConfigs[dayKey],
        visits: newConfigs[dayKey].visits.filter((v) => v.id !== visitId)
    };

    // 2. Update UI
    setDayConfigs(newConfigs);
    setDeleteConfirm({ isOpen: false, dayKey: null, visitId: null });

    // 3. Auto Save
    await persistSchedule(newConfigs);
  };

  // --- HELPER: CHECK FOR OVERLAPS ---
  const checkOverlap = (newStart: string, newEnd: string, existingVisits: Visit[], currentVisitId?: string, newCarerId?: string) => {
    if(!newCarerId) return false;

    const parseMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const newStartMin = parseMinutes(newStart);
    let newEndMin = parseMinutes(newEnd);
    if (newEndMin < newStartMin) newEndMin += 24 * 60; // Handle overnight

    return existingVisits.some(v => {
        // Skip self if editing
        if (currentVisitId && v.id === currentVisitId) return false;
        
        // Skip if different carer or no carer assigned
        if (!v.carerId || v.carerId !== newCarerId) return false;

        const vStartMin = parseMinutes(v.startTime);
        let vEndMin = parseMinutes(v.endTime);
        if (vEndMin < vStartMin) vEndMin += 24 * 60; // Handle overnight existing

        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (Math.max(newStartMin, vStartMin) < Math.min(newEndMin, vEndMin));
    });
  };

  const handleUpdateVisit = async (updatedData: any) => {
    const { dayKey, visit } = editingVisit;
    if (!visit) return;

    // --- VALIDATION: Check for overlaps ---
    const hasConflict = checkOverlap(
        updatedData.startTime, 
        updatedData.endTime, 
        dayConfigs[dayKey].visits, 
        visit.id, 
        updatedData.carerId || visit.carerId // Use updated or existing carer ID
    );

    if (hasConflict) {
        toast({ 
            variant: "destructive", 
            title: "Scheduling Conflict", 
            description: "This carer already has a visit scheduled during this time." 
        });
        return;
    }

    // Recalculate amount
    const start = parseInt(updatedData.startTime.split(':')[0]) + parseInt(updatedData.startTime.split(':')[1]) / 60;
    const end = parseInt(updatedData.endTime.split(':')[0]) + parseInt(updatedData.endTime.split(':')[1]) / 60;
    let duration = end - start;
    if (duration < 0) duration += 24; 
    const calculatedAmount = (duration * updatedData.invoiceRate).toFixed(2);

    // 1. Calculate new state
    const newConfigs = { ...dayConfigs };
    newConfigs[dayKey] = {
        ...newConfigs[dayKey],
        visits: newConfigs[dayKey].visits.map((v) =>
              v.id === visit.id 
              ? { 
                  ...v, 
                  ...updatedData, 
                  amount: calculatedAmount,
                  // Ensure ID is updated or preserved
                  employmentRateId: updatedData.employmentRateId 
                } 
              : v
            )
    };

    // 2. Update UI
    setDayConfigs(newConfigs);
    setIsEditVisitOpen(false);
    setEditingVisit({ dayKey: '', visit: null });

    // 3. Auto Save
    await persistSchedule(newConfigs);
  };

  const handleSaveCallTime = async (data: any) => {
    // 1. VALIDATION CHECK FIRST
    for (const dayKey of data.selectedDays) {
        if(dayConfigs[dayKey]) {
            const hasConflict = checkOverlap(
                data.startTime, 
                data.endTime, 
                dayConfigs[dayKey].visits, 
                undefined, // No ID yet (new visit)
                data.carerId
            );

            if(hasConflict) {
                 toast({ 
                    variant: "destructive", 
                    title: "Scheduling Conflict", 
                    description: `Conflict detected on ${dayKey}. This carer is already booked for this time.` 
                });
                return; // Stop the save process
            }
        }
    }

    // 2. Calculate new state locally
    const newConfigs = { ...dayConfigs };
    
    const start = parseInt(data.startTime.split(':')[0]) + parseInt(data.startTime.split(':')[1]) / 60;
    const end = parseInt(data.endTime.split(':')[0]) + parseInt(data.endTime.split(':')[1]) / 60;
    let duration = end - start;
    if (duration < 0) duration += 24; 
    const calculatedAmount = (duration * data.invoiceRate).toFixed(2);

    data.selectedDays.forEach((dayKey: string) => {
        if(newConfigs[dayKey]) {
            newConfigs[dayKey] = {
                ...newConfigs[dayKey],
                visits: [
                    ...newConfigs[dayKey].visits,
                    {
                        id: Date.now().toString() + Math.random().toString(), 
                        startTime: data.startTime,
                        endTime: data.endTime,
                        carerName: data.carerName, 
                        carerId: data.carerId,
                        amount: calculatedAmount,
                        payRate: data.payRate,
                        invoiceRate: data.invoiceRate,
                        shiftId: data.shiftId,
                        // Store the ID from the dialog
                        employmentRateId: data.employmentRateId 
                    }
                ]
            };
        }
    });

    // 3. Update UI
    setDayConfigs(newConfigs);
    setIsAddCallTimeOpen(false);

    // 4. Auto Save to Backend
    await persistSchedule(newConfigs);
  };

  const validatePlan = () => {
    const errors: string[] = [];
    WEEKDAYS.forEach((weekday) => {
      const config = dayConfigs[weekday.key];
      if (config.visits.length > 0) {
        const hasMissingAmount = config.visits.some(visit => !visit.amount || isNaN(Number(visit.amount)) || Number(visit.amount) <= 0);
        if (hasMissingAmount) {
          errors.push(`Some visits on ${weekday.label} are missing a valid amount.`);
        }
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const openDateRangePicker = () => {
    if (!validatePlan()) return;
    setIsDateRangeOpen(true);
  };

  // --- Generate via API ---
  const generatePlan = async () => {
    if (!dateRange.fromDate || !dateRange.toDate) return;
    
    setIsSaving(true);
    try {
        const payload = {
            ...scheduleData,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
        };

        await axiosInstance.post('/schedules/bulk-schedule', payload);
        // counterIncrement(); // Removed undefined function
        toast({ title: "Success", description: "Schedule generated successfully." });
        setIsDateRangeOpen(false);

    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message||"Failed to generate schedule." });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center"><BlinkingDots size='large' color="bg-watney"/></div>;
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold">{serviceUserData?.firstName} {serviceUserData?.lastName}'s Visit Schedule</h1>
        </div>
        <div className="flex flex-wrap gap-3">
           <Button onClick={()=> navigate(-1)} size="sm" >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button
            onClick={() => setIsAddCallTimeOpen(true)}
            size="sm"
          >
            <Clock className="mr-2 h-4 w-4" />
            Add Call Time
          </Button>

          {/* <Button
            onClick={openDateRangePicker}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" /> Generate Plan
          </Button> */}
          
          {/* Auto-save Indicator */}
          {isSaving && <div className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</div>}

        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 space-y-2">
          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Grid of Days */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEKDAYS.map((weekday) => {
          const config = dayConfigs[weekday.key];
          return (
            <Card key={weekday.key} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  {weekday.label}
                </CardTitle>
               
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {config.visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-theme/50 hover:shadow-md"
                  >
                    {/* --- Header: Time & Actions --- */}
                    <div className="flex items-center justify-between border-b border-gray-100 p-3 pb-2">
                      <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-watney/10 text-theme">
                          <Clock className="h-6 w-6" />
                        </div>
                        <span>
                          {visit.startTime} - {visit.endTime}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => editVisit(weekday.key, visit)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-watney/10 hover:text-theme"
                          title="Edit Visit"
                        >
                          <Edit className="h-6 w-6" />
                        </button>
                        <button
                          onClick={() => initiateDeleteVisit(weekday.key, visit.id)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete Visit"
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* --- Body: Carer Info --- */}
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2 text-lg ">
                        <User className="h-6 w-6 " />
                        <span className="font-semibold truncate">
                          {visit.carerName || <span className="italic ">No Carer Assigned</span>}
                        </span>
                      </div>
                    </div>

                    {/* --- Footer: Rates --- */}
                    {(visit.payRate || visit.invoiceRate) && (
                      <div className="mt-1 rounded-b-xl  px-3 py-2 text-[10px]">
                        <div className="space-y-1.5">
                          {visit.payRate && (
                            <div className="flex items-center justify-between gap-2 text-lg">
                              <div className="flex items-center gap-1.5 ">
                                <FileText className="h-6 w-6 " />
                                <span className="truncate capitalize ">Payment rate</span>
                              </div>
                              <span className="font-bold  font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                £{visit.payRate}
                              </span>
                            </div>
                          )}

                          {visit.invoiceRate && (
                            <div className="flex items-center justify-between gap-2 text-lg">
                              <div className="flex items-center gap-1.5 ">
                                <Wallet className="h-6 w-6 " />
                                <span className="truncate ">Invoice rate</span>
                              </div>
                              <span className="font-bold  font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                £{visit.invoiceRate}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      

      {/* --- DIALOGS --- */}
      <AddCallTimeDialog 
        isOpen={isAddCallTimeOpen} 
        onClose={() => setIsAddCallTimeOpen(false)} 
        onSave={handleSaveCallTime}
      />

     <Dialog open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Select Date Range For Generate Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>From Date</Label>
                <DatePicker
                  selected={
                    dateRange.fromDate ? new Date(dateRange.fromDate) : null
                  }
                  onChange={(date) =>
                    setDateRange((prev) => ({
                      ...prev,
                      fromDate: date ? moment(date).format('YYYY-MM-DD') : '',
                      // Optional: Clear toDate if it becomes invalid (earlier than new fromDate)
                      toDate: 
                        prev.toDate && date && moment(date).isAfter(moment(prev.toDate)) 
                          ? '' 
                          : prev.toDate
                    }))
                  }
                  // FIX 1: Use 'dd' (lowercase) for Day of Month
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>To Date</Label>
                <DatePicker
                  selected={
                    dateRange.toDate ? new Date(dateRange.toDate) : null
                  }
                  onChange={(date) =>
                    setDateRange((prev) => ({
                      ...prev,
                      toDate: date ? moment(date).format('YYYY-MM-DD') : '',
                    }))
                  }
                  // FIX 1: Use 'dd' (lowercase) for Day of Month
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  // FIX 2: Restrict selection to prevent dates before From Date
                  minDate={
                    dateRange.fromDate ? new Date(dateRange.fromDate) : null
                  }
                  disabled={!dateRange.fromDate} // Optional: Disable until From Date is picked
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={generatePlan}
              disabled={!dateRange.fromDate || !dateRange.toDate}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditVisitOpen} onOpenChange={setIsEditVisitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Visit</DialogTitle></DialogHeader>
          {editingVisit.visit && (
            <EditVisitForm 
                initialVisit={editingVisit.visit} 
                dayKey={editingVisit.dayKey}
                onSave={handleUpdateVisit} 
                onCancel={() => setIsEditVisitOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ ...deleteConfirm, isOpen: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-black">
              This action cannot be undone. This will permanently delete the visit schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ isOpen: false, dayKey: null, visitId: null })} >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVisit} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER: Validation & Formatting for Time
// ----------------------------------------------------------------------
const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const inputValue = e.target.value;
    if (inputValue === '') { onChange(''); return; }
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
        else if (value.length === 3) onChange(`${value.slice(0, 2)}:0${value.slice(2)}`);
        else if (value.length === 4) onChange(`${value.slice(0, 2)}:${value.slice(2)}`);
    } else {
        const [h, m] = value.split(':');
        const formatted = `${h.padStart(2, '0')}:${(m || '00').padEnd(2, '0')}`;
        onChange(formatted);
    }
};

// ----------------------------------------------------------------------
// COMPONENT: Add Call Time Dialog (Bulk Add)
// ----------------------------------------------------------------------
function AddCallTimeDialog({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void }) {
    const {id} = useParams()
    const form = useForm({
        defaultValues: {
            selectedEmployee: null as { value: string, label: string } | null,
            shift: null as { value: string, label: string } | null,
            startTime: '',
            endTime: '',
            payRate: '',
            invoiceRate: ''
        }
    });

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoadingShifts, setIsLoadingShifts] = useState(false);
    const [employees, setEmployees] = useState<{value: string, label: string}[]>([]);

    const selectedEmployee = form.watch('selectedEmployee');
    const payRate = form.watch('payRate');
    const invoiceRate = form.watch('invoiceRate');
    
    // Validation Logic: Invoice rate cannot be smaller than pay rate
    const isRateInvalid = Boolean(payRate && invoiceRate && Number(invoiceRate) < Number(payRate));

    // 1. Fetch Employees
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!isOpen) return;
            try {
                const empRes = await axiosInstance.get(`/users?companyId=${id}&role=staff&limit=all`);
                const emps = empRes.data.data.result || [];
                setEmployees(emps.map((e: any) => ({ value: e._id, label: `${e.firstName} ${e.lastName}` })));
            } catch (error) {
                console.error("Error fetching employees", error);
            }
        };
        fetchEmployees();
    }, [isOpen, id]);

    // 2. Fetch Shifts Logic
    useEffect(() => {
        const fetchShifts = async () => {
          setShifts([]);
          form.setValue('shift', null); 
    
          if (!selectedEmployee?.value) return;
    
          setIsLoadingShifts(true);
          try {
            const rateRes = await axiosInstance.get(`/hr/employeeRate?employeeId=${selectedEmployee.value}`);
            const ratesData = rateRes?.data?.data?.result || [];
            const collectedShifts: Shift[] = [];
            const seenShiftIds = new Set<string>();
    
            ratesData.forEach((rateDoc: any) => {
              const rawShift = rateDoc.shiftId || rateDoc.shifts;
              let shiftsInRate: Shift[] = [];
              if (Array.isArray(rawShift)) {
                shiftsInRate = rawShift;
              } else if (rawShift && typeof rawShift === 'object') {
                shiftsInRate = [rawShift];
              }
    
              shiftsInRate.forEach((s) => {
                if (s._id && !seenShiftIds.has(s._id)) {
                  seenShiftIds.add(s._id);
                  // CAPTURE THE RATE DOC ID
                  collectedShifts.push({ ...s, _rates: rateDoc.rates, rateDocId: rateDoc._id });
                }
              });
            });
            setShifts(collectedShifts);
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoadingShifts(false);
          }
        };
        fetchShifts();
      }, [selectedEmployee?.value, form]);

    const onShiftChange = (option: any) => {
        form.setValue('shift', option);
        updatePaymentRate(option?.value, selectedDays);
    };

    const updatePaymentRate = (shiftId: string, currentDays: string[]) => {
        if(!shiftId) return;
        const shiftData = shifts.find(s => s._id === shiftId);
        if(!shiftData || !shiftData._rates) return;

        let foundRate = 0;
        if(currentDays.length > 0) {
            const firstDay = currentDays[0];
            const rateObj = shiftData._rates[firstDay];
            if(rateObj && typeof rateObj.rate === 'number') foundRate = rateObj.rate;
        } 
        if(foundRate === 0) {
             const keys = Object.keys(shiftData._rates);
             if(keys.length > 0) foundRate = shiftData._rates[keys[0]].rate;
        }
        form.setValue('payRate', foundRate.toString());
    };

    const toggleDay = (key: string) => {
        const currentDays = selectedDays.includes(key) 
            ? selectedDays.filter(d => d !== key) 
            : [...selectedDays, key];
        setSelectedDays(currentDays);
        const currentShift = form.getValues('shift');
        if(currentShift) updatePaymentRate(currentShift.value, currentDays);
    };

    const handleSave = () => {
        const values = form.getValues();
        // FIND SELECTED SHIFT TO GET ID
        const selectedShiftObj = shifts.find(s => s._id === values.shift?.value);

        onSave({
            selectedDays,
            startTime: values.startTime,
            endTime: values.endTime,
            shiftId: values.shift?.value,
            // PASS THE ID
            employmentRateId: selectedShiftObj?.rateDocId || null,
            carerId: values.selectedEmployee?.value,
            carerName: values.selectedEmployee?.label,
            payRate: Number(values.payRate),
            invoiceRate: Number(values.invoiceRate)
        });
        form.reset();
        setSelectedDays([]);
    };

    const shiftOptions = shifts.map((shift) => ({
        value: shift._id,
        label: `${shift.name} (${shift.startTime} - ${shift.endTime})` 
    }));

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Call Time</DialogTitle>
            <DialogDescription>
              Assign shifts and rates for the Service User.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <div className="space-y-4 py-4">
              {/* Day Selector */}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Start Time (HH:MM){' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="09:00"
                          maxLength={5}
                          onChange={(e) => handleTimeInput(e, field.onChange)}
                          onBlur={() =>
                            handleTimeBlur(field.value, field.onChange)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        End Time (HH:MM) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="17:00"
                          maxLength={5}
                          onChange={(e) => handleTimeInput(e, field.onChange)}
                          onBlur={() =>
                            handleTimeBlur(field.value, field.onChange)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

             

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="selectedEmployee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carer / Employee</FormLabel>
                      <Select
                        {...field}
                        options={employees}
                        placeholder="Select Carer..."
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '48px',
                            borderRadius: '0.5rem',
                            borderColor: '#e2e8f0',
                            '&:hover': {
                              borderColor: '#cbd5e1'
                            }
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '2px 12px'
                          }),
                          input: (base) => ({
                            ...base,
                            margin: '0px'
                          })
                        }}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select
                        {...field}
                        options={shiftOptions}
                        onChange={onShiftChange}
                        isLoading={isLoadingShifts}
                        isDisabled={!selectedEmployee}
                        placeholder="Select Shift..."
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '48px',
                            borderRadius: '0.5rem',
                            borderColor: '#e2e8f0',
                            '&:hover': {
                              borderColor: '#cbd5e1'
                            }
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '2px 12px'
                          }),
                          input: (base) => ({
                            ...base,
                            margin: '0px'
                          })
                        }}
                      />
                    </FormItem>
                  )}
                />
              </div>
 <div>
                <Label className="mb-3 block font-semibold">Select Days</Label>
                <div className="flex flex-wrap gap-4">
                  {WEEKDAYS.map((day) => (
                    <div key={day.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`day-${day.key}`}
                        checked={selectedDays.includes(day.key)}
                        onChange={() => toggleDay(day.key)}
                        className="h-4 w-4 rounded border-gray-300 text-theme focus:ring-theme/100"
                      />
                      <Label
                        htmlFor={`day-${day.key}`}
                        className="cursor-pointer"
                      >
                        {day.short}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-300 bg-slate-50 p-4">
                <FormField
                  control={form.control}
                  name="payRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payment For Carer Per Hour
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Auto-set from shift"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Auto-filled based on Day/Shift.
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Invoice rate per hour for service user{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter rate"
                          className={`${isRateInvalid ? 'border-red-500 focus:border-red-500' : 'border-green-300 focus:border-green-500'}`}
                        />
                      </FormControl>
                      {isRateInvalid ? (
                        <p className="text-xs text-red-500 font-medium">Invoice rate cannot be smaller than pay rate</p>
                      ) : (
                        <p className="text-xs text-gray-500">Manually set for Service User.</p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  selectedDays.length === 0 ||
                  !form.watch('shift') ||
                  !form.watch('invoiceRate') ||
                  isRateInvalid
                }
              >
                Done
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    );
}

// ----------------------------------------------------------------------
// COMPONENT: Edit Visit Form 
// ----------------------------------------------------------------------
function EditVisitForm({
  initialVisit,
  dayKey,
  onSave,
  onCancel
}: {
  initialVisit: Visit;
  dayKey: string;
  onSave: (data: any) => void; 
  onCancel: () => void;
}) {
  const { id } = useParams();
  
  const form = useForm({
    defaultValues: {
      selectedEmployee: initialVisit.carerId && initialVisit.carerName 
        ? { value: initialVisit.carerId, label: initialVisit.carerName } 
        : null as { value: string, label: string } | null,
      shift: null as { value: string, label: string } | null,
      startTime: initialVisit.startTime || '',
      endTime: initialVisit.endTime || '',
      payRate: initialVisit.payRate?.toString() || '',
      invoiceRate: initialVisit.invoiceRate?.toString() || ''
    }
  });

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<{value: string, label: string}[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);

  const selectedEmployee = form.watch('selectedEmployee');
  const payRate = form.watch('payRate');
  const invoiceRate = form.watch('invoiceRate');

  // Validation Logic
  const isRateInvalid = Boolean(payRate && invoiceRate && Number(invoiceRate) < Number(payRate));

  // 1. Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const empRes = await axiosInstance.get(`/users?companyId=${id}&role=staff&limit=all`);
        const emps = empRes.data.data.result || [];
        setEmployees(emps.map((e: any) => ({ value: e._id, label: `${e.firstName} ${e.lastName}` })));
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    fetchEmployees();
  }, [id]);

  // 2. Fetch Shifts when Employee is set
  useEffect(() => {
    const fetchShifts = async () => {
      if (!selectedEmployee?.value) {
          setShifts([]);
          return;
      }

      setIsLoadingShifts(true);
      try {
        const rateRes = await axiosInstance.get(`/hr/employeeRate?employeeId=${selectedEmployee.value}`);
        const ratesData = rateRes?.data?.data?.result || [];
        const collectedShifts: Shift[] = [];
        const seenShiftIds = new Set<string>();

        ratesData.forEach((rateDoc: any) => {
          const rawShift = rateDoc.shiftId || rateDoc.shifts;
          let shiftsInRate: Shift[] = [];
          if (Array.isArray(rawShift)) shiftsInRate = rawShift;
          else if (rawShift && typeof rawShift === 'object') shiftsInRate = [rawShift];

          shiftsInRate.forEach((s) => {
            if (s._id && !seenShiftIds.has(s._id)) {
              seenShiftIds.add(s._id);
              // CAPTURE RATE DOC ID
              collectedShifts.push({ ...s, _rates: rateDoc.rates, rateDocId: rateDoc._id });
            }
          });
        });
        setShifts(collectedShifts);

        if (initialVisit.shiftId) {
            const matchingShift = collectedShifts.find(s => s._id === initialVisit.shiftId);
            if(matchingShift) {
                form.setValue('shift', { 
                    value: matchingShift._id, 
                    label: `${matchingShift.name} (${matchingShift.startTime} - ${matchingShift.endTime})` 
                });
            }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [selectedEmployee?.value, form, initialVisit.shiftId]);

  const onShiftChange = (option: any) => {
    form.setValue('shift', option);
    if (!option?.value) return;

    const shiftData = shifts.find(s => s._id === option.value);
    if (!shiftData || !shiftData._rates) return;

    let foundRate = 0;
    const rateObj = shiftData._rates[dayKey];
    if (rateObj && typeof rateObj.rate === 'number') {
        foundRate = rateObj.rate;
    } else {
        const keys = Object.keys(shiftData._rates);
        if (keys.length > 0) foundRate = shiftData._rates[keys[0]].rate;
    }

    form.setValue('payRate', foundRate.toString());
  };

  const handleSave = () => {
    const values = form.getValues();
    const selectedShiftObj = shifts.find(s => s._id === values.shift?.value);

    onSave({
      startTime: values.startTime,
      endTime: values.endTime,
      carerName: values.selectedEmployee?.label || '',
      carerId: values.selectedEmployee?.value,
      shiftId: values.shift?.value,
      // PASS ID OR KEEP EXISTING
      employmentRateId: selectedShiftObj?.rateDocId || initialVisit.employmentRateId,
      payRate: Number(values.payRate),
      invoiceRate: Number(values.invoiceRate)
    });
  };

  const shiftOptions = shifts.map((shift) => ({
    value: shift._id,
    label: `${shift.name} (${shift.startTime} - ${shift.endTime})` 
  }));

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="selectedEmployee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carer / Employee</FormLabel>
                <Select 
                    {...field} 
                    options={employees} 
                    onChange={(val) => {
                        field.onChange(val);
                        form.setValue('shift', null);
                        form.setValue('payRate', '');
                    }}
                    placeholder="Select Carer..." 
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '0.5rem',
                        borderColor: '#e2e8f0',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        }
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '2px 12px'
                      }),
                      input: (base) => ({
                        ...base,
                        margin: '0px'
                      })
                    }}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select 
                  {...field}
                  options={shiftOptions} 
                  onChange={onShiftChange}
                  isLoading={isLoadingShifts}
                  isDisabled={!selectedEmployee}
                  placeholder="Select Shift..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '48px',
                      borderRadius: '0.5rem',
                      borderColor: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#cbd5e1'
                      }
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '2px 12px'
                    }),
                    input: (base) => ({
                      ...base,
                      margin: '0px'
                    })
                  }}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Start Time (HH:MM) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            placeholder="09:00"
                            maxLength={5}
                            onChange={(e) => handleTimeInput(e, field.onChange)}
                            onBlur={() => handleTimeBlur(field.value, field.onChange)}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>End Time (HH:MM) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            placeholder="17:00"
                            maxLength={5}
                            onChange={(e) => handleTimeInput(e, field.onChange)}
                            onBlur={() => handleTimeBlur(field.value, field.onChange)}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
            <FormField
            control={form.control}
            name="payRate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Payment rate for service user per hour</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" placeholder="Auto-set from shift" />
                    </FormControl>
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="invoiceRate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Invoice rate per hour for service user <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Enter rate" 
                          className={`${isRateInvalid ? 'border-red-500 focus:border-red-500' : 'border-green-300 focus:border-green-500'}`}
                        />
                    </FormControl>
                    {isRateInvalid && (
                      <p className="text-xs text-red-500 font-medium">Invoice rate cannot be smaller than pay rate</p>
                    )}
                </FormItem>
            )}
        />
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={
              !form.watch('invoiceRate') || 
              !form.watch('startTime') || 
              !form.watch('endTime') ||
              isRateInvalid
            }
          >
            Update Visit
          </Button>
        </DialogFooter>
      </div>
    </Form>
  );
}