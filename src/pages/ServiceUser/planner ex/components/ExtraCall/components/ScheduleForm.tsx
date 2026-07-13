import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '@/lib/axios';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';

const UK_TZ = "Europe/London";

// ========================
// ZOD VALIDATION SCHEMAS
// ========================

const Step1Schema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  employee: z.string().min(1, 'Employee is required'),
  serviceUser: z.string().min(1, 'Service user is required'), // Still required for validation, but hidden
  serviceFunder: z.string().min(1, 'Service funder is required'),
  shiftId: z.string().min(1, 'Shift is required'),
  employeeRateDocId: z.string().optional(),
  branch: z.string().min(1, 'Branch is required'),
  area: z.string().min(1, 'Area is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  visitType: z.string().min(1, 'Visit type is required'),
  payRate: z.coerce.number().min(0, 'Pay rate must be valid'),
  invoiceRate: z.coerce.number().min(0.01, 'Invoice rate is required'),
  timeInMinutes: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Time in minutes is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "Time in minutes must be a valid number",
    }),
  travelTime: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Travel time is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "Travel time must be a valid number",
    }),
});

const Step2Schema = z.object({
  noteInput: z.string().optional(),
  glovesAprons: z.boolean().default(false),
  uniform: z.boolean().default(false),
  idBadge: z.boolean().default(false),
  purchaseOrder: z.boolean().default(false),
  expenses: z
    .array(
      z.object({
        expenseType: z.string().optional(),
        distance: z.string().optional(),
        payEmployee: z.boolean().optional(),
        invoiceCustomer: z.boolean().optional(),
        payAmount: z.number().nullable().optional(),
        invoiceAmount: z.number().nullable().optional(),
        notes: z.string().optional()
      })
    )
    .optional(),
  tags: z
    .array(
      z.object({
        tag: z.string(),
        message: z.string().optional(),
        deliveryDuration: z.number().nullable().optional(),
        deliveryOption: z.string().optional()
      })
    )
    .optional()
});

const FormSchema = Step1Schema.merge(Step2Schema);

type FormData = z.infer<typeof FormSchema>;

// ========================
// OPTIONS INTERFACES
// ========================

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Option {
  value: string;
  label: string;
}

export function ScheduleForm({
  onClose,
  onScheduleCreated
}: {
  onClose: () => void;
  onScheduleCreated: (newSchedule: any) => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // State for dynamic options
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);
  // Removed serviceUserOptions as it is no longer selectable
  const [funderOptions, setFunderOptions] = useState<Option[]>([]);
  const [shiftOptions, setShiftOptions] = useState<Option[]>([]);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<Option[]>([]);
  const [visitTypeOptions, setVisitTypeOptions] = useState<Option[]>([]);
  const [branchOptions, setBranchOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);

  // Loading states
  const [isLoadingFunders, setIsLoadingFunders] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);

  // Store shift lookup map
  const [shiftLookupMap, setShiftLookupMap] = useState<Record<string, any>>({});

  const { id: companyId, sid } = useParams();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: undefined,
      startTime: '',
      endTime: '',
      employee: '',
      serviceUser: sid || '', // Initialize with sid
      serviceFunder: '',
      shiftId: '',
      employeeRateDocId: '',
      branch: '',
      area: '',
      serviceType: '',
      visitType: '',
      payRate: 0,
      invoiceRate: 0,
      timeInMinutes: '',
      travelTime: '',
      noteInput: '',
      tags: [],
      glovesAprons: false,
      uniform: false,
      idBadge: false,
      purchaseOrder: false
    }
  });

  // Watchers
  const selectedEmployee = form.watch('employee');
  const selectedShiftId = form.watch('shiftId');
  const selectedDate = form.watch('date');

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
    // Ensure the hidden form field matches the URL param
    if (sid) {
      form.setValue('serviceUser', sid);
    }
  }, [companyId, sid]);

  const fetchInitialData = async () => {
    if (!companyId) return;
    setFetchingData(true);
    try {
      // Only fetch staff, not service users anymore
      const [usersRes, serviceTypesRes, visitTypesRes] = await Promise.all([
        axiosInstance.get(`/users?companyId=${companyId}&role=staff&limit=all`),
        axiosInstance.get(`/service-type?companyId=${companyId}&limit=all`),
        axiosInstance.get(`/visit-type?companyId=${companyId}&limit=all`)
      ]);

      const users: User[] = usersRes.data.data.result;

      setEmployeeOptions(
        users.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName}`
        }))
      );

      setServiceTypeOptions(
        (serviceTypesRes.data?.data?.result || []).map((st: any) => ({
          value: st._id,
          label: st.title
        }))
      );

      setVisitTypeOptions(
        (visitTypesRes.data?.data?.result || []).map((vt: any) => ({
          value: vt._id,
          label: vt.title
        }))
      );

      // Static options
      setBranchOptions([
        { value: 'Everycare Romford', label: 'Everycare Romford' }
      ]);
      setAreaOptions([{ value: 'care', label: 'Care' }]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch form data'
      });
      console.error('Error fetching initial data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch Funders based on SID (URL Param) instead of dropdown selection
  useEffect(() => {
    form.setValue('serviceFunder', '');
    setFunderOptions([]);
    
    // Check for sid instead of selectedServiceUser
    if (!sid) return;

    const fetchFunders = async () => {
      setIsLoadingFunders(true);
      try {
        const res = await axiosInstance.get(
          `/service-funder?serviceUser=${sid}&companyId=${companyId}&limit=all`
        );
        setFunderOptions(
          (res.data?.data?.result || []).map((f: any) => ({
            value: f._id,
            label: `${f.firstName || ''} ${f.lastName || ''} (${f.funderType || 'Funder'})`.trim()
          }))
        );
      } catch (error) {
        console.error('Error fetching funders:', error);
      } finally {
        setIsLoadingFunders(false);
      }
    };
    fetchFunders();
  }, [sid, companyId]);

  // Fetch Employee Shifts when Employee changes
  useEffect(() => {
    form.setValue('shiftId', '');
    form.setValue('employeeRateDocId', '');
    form.setValue('payRate', 0);
    setShiftOptions([]);
    setShiftLookupMap({});

    if (!selectedEmployee) return;

    const fetchEmployeeRates = async () => {
      setIsLoadingShifts(true);
      try {
        const res = await axiosInstance.get(
          `/hr/employeerate?employeeId=${selectedEmployee}&limit=all`
        );
        const employeeRatesDocs = res.data?.data?.result || [];

        const newOptions: any[] = [];
        const newMap: Record<string, any> = {};

        employeeRatesDocs.forEach((doc: any) => {
          if (doc.shiftId && Array.isArray(doc.shiftId)) {
            doc.shiftId.forEach((shift: any) => {
              newOptions.push({
                value: shift._id,
                label: `${shift.name} (${shift.startTime} - ${shift.endTime})`
              });

              newMap[shift._id] = {
                shiftDetails: shift,
                parentRateDoc: doc
              };
            });
          }
        });

        setShiftOptions(newOptions);
        setShiftLookupMap(newMap);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        toast({ title: 'Error fetching shifts', variant: 'destructive' });
      } finally {
        setIsLoadingShifts(false);
      }
    };
    fetchEmployeeRates();
  }, [selectedEmployee, companyId]);

  // Auto-fill Pay Rate when Shift or Date changes
  useEffect(() => {
    if (!selectedShiftId || !shiftLookupMap[selectedShiftId]) return;

    const { parentRateDoc } = shiftLookupMap[selectedShiftId];

    // Set hidden Parent ID
    form.setValue('employeeRateDocId', parentRateDoc._id);

    // Set Pay Rate based on selected Date (Day of Week in UK Timezone)
    if (selectedDate && parentRateDoc.rates) {
      const dayName = moment(selectedDate).tz(UK_TZ).format('dddd');
      const rateObj = parentRateDoc.rates[dayName];
      const rateAmount = rateObj ? rateObj.rate : 0;
      form.setValue('payRate', rateAmount);
    }
  }, [selectedShiftId, selectedDate, shiftLookupMap]);

  // Tag options
  const tagOptions = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'fragile', label: 'Fragile' },
    { value: 'call_office', label: 'Please call office' }
  ];

  // Time input handler
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

  const handleNext = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await form.trigger(fields as any);

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Calculate duration
      const start = moment(data.startTime, 'HH:mm');
      let end = moment(data.endTime, 'HH:mm');
      if (end.isBefore(start)) end.add(1, 'day');
      const duration = moment.duration(end.diff(start)).asHours().toFixed(2);

      const payload = {
        companyId: companyId,

        // Use UK Timezone for DB Dates
        date: moment(data.date).tz(UK_TZ).toDate(),
        plannedDate: moment(data.date).tz(UK_TZ).format('YYYY-MM-DD'),

        startTime: data.startTime,
        endTime: data.endTime,
        duration: duration,
        timeInMinutes: Number(data.timeInMinutes),
        travelTime: Number(data.travelTime),

        // Relationships
        employee: data.employee,
        serviceUser: sid, // Use the ID directly
        serviceFunder: data.serviceFunder,
        branch: data.branch,
        area: data.area,

        employeeRateId: data.employeeRateDocId, 
        employeeShiftId: data.shiftId,

        // Service & Rates
        serviceType: data.serviceType,
        visitType: data.visitType,
        payRate: Number(data.payRate),
        invoiceRate: Number(data.invoiceRate),

        // Booleans
        glovesAprons: data.glovesAprons,
        uniform: data.uniform,
        idBadge: data.idBadge,
        purchaseOrder: data.purchaseOrder,

        // Arrays
        notes: data.noteInput ? [{ note: data.noteInput }] : [],
        tags: data.tags || [],
        expenses: data.expenses || [],
        breaks: [],

        completeSchedule: false
      };

      await axiosInstance.post('/schedules', payload);
      toast({ title: 'Success', description: 'Schedule created successfully' });
      onScheduleCreated(payload);
      form.reset();
      onClose();
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to create schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    if (step === 1) {
      return [
        'date',
        'startTime',
        'endTime',
        'employee',
        // 'serviceUser', // Validation happens silently now
        'serviceFunder',
        'shiftId',
        'branch',
        'area',
        'serviceType',
        'visitType',
        'payRate',
        'invoiceRate',
        'timeInMinutes',
        'travelTime'
      ];
    }
    return ['noteInput', 'tags', 'glovesAprons', 'uniform', 'idBadge', 'purchaseOrder'];
  };

  // Show loading state while fetching data
  if (fetchingData) {
    return (
      <div className="mx-auto flex w-full items-center justify-center bg-white p-8">
        <div className="flex items-center gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full bg-white p-2">
      <Form {...form}>
        <div>
          {/* Step 1: Schedule Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Schedule Details</h2>

              {/* Row 1: Date, Branch, Employee */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>
                        Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          dateFormat="dd/MM/yyyy"
                          className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                          placeholderText="Select date"
                          wrapperClassName="w-full h-9"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Branch <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={branchOptions}
                          value={branchOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select branch"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Employee <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={employeeOptions}
                          value={employeeOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select employee"
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
                            }),
                            menuList: (base) => ({
                              ...base,
                              maxHeight: '150px',
                              overflowY: 'auto'
                            })
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Area and Service Funder (Service User removed, using grid-cols-2) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Area <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={areaOptions}
                          value={areaOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select area"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceFunder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Service Funder <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={funderOptions}
                          isLoading={isLoadingFunders}
                          // Disabled logic changed: depend on sid existence
                          isDisabled={!sid}
                          value={funderOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder={
                            !sid
                              ? 'No Service User ID found'
                              : 'Select Funder...'
                          }
                          noOptionsMessage={() => 'No funders found'}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Shift, Start Time, End Time */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="shiftId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Shift <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={shiftOptions}
                          isLoading={isLoadingShifts}
                          isDisabled={!selectedEmployee}
                          value={shiftOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder={
                            !selectedEmployee
                              ? 'Select Employee first'
                              : 'Select Shift...'
                          }
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Start Time <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="09:00"
                          maxLength={5}
                          className="font-mono tracking-wider"
                          onChange={(e) => handleTimeInput(e, field.onChange)}
                          onBlur={() =>
                            handleTimeBlur(field.value, field.onChange)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        End Time <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="18:00"
                          maxLength={5}
                          className="font-mono tracking-wider"
                          onChange={(e) => handleTimeInput(e, field.onChange)}
                          onBlur={() =>
                            handleTimeBlur(field.value, field.onChange)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: Service Type, Visit Type, Pay Rate */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Service Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={serviceTypeOptions}
                          value={serviceTypeOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select service type"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Visit Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={visitTypeOptions}
                          value={visitTypeOptions.find(
                            (option) => option.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select visit type"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Pay Rate (£/hr) -{' '}
                        {selectedDate
                          ? moment(selectedDate).format('dddd')
                          : ''}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                         
                          title="Auto-filled based on Shift and Date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 5: Invoice Rate, Time in Minutes, Travel Time */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Invoice Rate <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeInMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time in Minutes <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="travelTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Travel Time (mins){' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Additional Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="mb-4 text-xl font-semibold">
                Additional Information
              </h2>

              {/* Notes */}
              <FormField
                control={form.control}
                name="noteInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add any additional notes..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => {
                  const selectedValues = field.value?.map((t) => t.tag) || [];

                  return (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Select
                          isMulti
                          options={tagOptions}
                          value={tagOptions.filter((opt) =>
                            selectedValues.includes(opt.value)
                          )}
                          onChange={(selectedOptions) => {
                            const tagObjects = (selectedOptions || []).map(
                              (opt) => ({
                                tag: opt.value,
                                message: '',
                                deliveryDuration: null,
                                deliveryOption: ''
                              })
                            );
                            field.onChange(tagObjects);
                          }}
                          placeholder="Select tags..."
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Equipment Checkboxes */}
              <div className="border-t pt-4">
                <h3 className="mb-4 font-medium">Equipment Required</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="glovesAprons"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Gloves and Aprons
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uniform"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Uniform
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idBadge"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            ID Badge
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between border-t pt-6">
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Previous
            </Button>

            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Schedule'
                )}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}