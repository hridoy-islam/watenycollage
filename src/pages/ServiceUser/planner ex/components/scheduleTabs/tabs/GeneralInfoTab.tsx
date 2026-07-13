import React, { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import { EditableField } from '../components/EditableField';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useParams } from 'react-router-dom';

// --- Interfaces ---
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Funder {
  _id: string;
  funderName?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface TypeOption {
  _id: string;
  title: string;
}

interface GeneralInfoTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  onDateChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: any, formData: Record<string, any>) => string[];
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
  formData,
  onUpdate,
  onDateChange,
  onSelectChange,
  isFieldSaving,
  getMissingFields
}) => {
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [visitTypes, setVisitTypes] = useState<TypeOption[]>([]);
  const [serviceTypes, setServiceTypes] = useState<TypeOption[]>([]);

  // Shift State
  const [shiftOptions, setShiftOptions] = useState<any[]>([]);
  const [shiftLookupMap, setShiftLookupMap] = useState<Record<string, any>>({});

  const { id: companyId } = useParams();

  const missingFields = getMissingFields('general', formData);
  const isFieldMissing = (fieldKey: string) => missingFields.includes(fieldKey);

  // --- Helper: Safely Extract ID ---
  const getValueId = (fieldValue: any): string => {
    if (!fieldValue) return '';
    if (typeof fieldValue === 'string') return fieldValue;
    return fieldValue._id || '';
  };

  const selectedServiceUserId = getValueId(formData.serviceUser);
  const selectedEmployeeId = getValueId(formData.employee);
  const selectedShiftId = getValueId(formData.employeeShiftId);

  // --- Duration Calculator ---
  const calculateDuration = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '';
    const start = moment(startTime, 'HH:mm');
    let end = moment(endTime, 'HH:mm');
    if (end.isBefore(start)) end = end.add(1, 'day');

    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const mins = duration.minutes();
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // --- 1. Fetch Static Data (Users, Visit Types, Service Types) ---
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const usersReq = axiosInstance.get('/users', {
          params: {
            limit: 'all',
            role: ['serviceUser', 'staff'],
            companyId: companyId,
            fields: 'title firstName lastName role'
          }
        });

        const visitTypesReq = axiosInstance.get('/visit-type', {
          params: { companyId, limit: 'all' }
        });

        const serviceTypesReq = axiosInstance.get('/service-type', {
          params: { companyId, limit: 'all' }
        });

        const [usersRes, visitTypesRes, serviceTypesRes] = await Promise.all([
          usersReq,
          visitTypesReq,
          serviceTypesReq
        ]);

        setUsers(usersRes?.data?.data?.result || []);
        setVisitTypes(visitTypesRes?.data?.data?.result || []);
        setServiceTypes(serviceTypesRes?.data?.data?.result || []);
      } catch (error) {
        console.error('Failed to fetch static data:', error);
        toast({
          title: 'Error loading data',
          description: 'Please refresh the page',
          variant: 'destructive'
        });
      }
    };
    if (companyId) fetchStaticData();
  }, [companyId]);

  // --- 2. Dynamic Fetch: Funders (Based on Service User) ---
  useEffect(() => {
    const fetchFunders = async () => {
      if (!selectedServiceUserId) {
        setFunders([]);
        return;
      }
      try {
        const res = await axiosInstance.get('/service-funder', {
          params: {
            limit: 'all',
            companyId: companyId,
            serviceUser: selectedServiceUserId
          }
        });
        setFunders(res.data?.data?.result || []);
      } catch (error) {
        console.error('Failed to fetch funders:', error);
      }
    };
    fetchFunders();
  }, [selectedServiceUserId, companyId]);

  // --- 3. Dynamic Fetch: Employee Shifts (Based on Employee) ---
  useEffect(() => {
    const fetchEmployeeShifts = async () => {
      if (!selectedEmployeeId) {
        setShiftOptions([]);
        setShiftLookupMap({});
        return;
      }

      try {
        const res = await axiosInstance.get('/hr/employeerate', {
          params: {
            limit: 'all',
           
            employeeId: selectedEmployeeId
          }
        });

        const employeeRates = res.data?.data?.result || [];
        
     const allShiftOptions: any[] = [];
      const lookupMap: Record<string, any> = {};

      employeeRates.forEach((rateDoc: any) => {
        // FIX: Check for shiftId (not shifts)
        if (rateDoc.shiftId && Array.isArray(rateDoc.shiftId)) {
          rateDoc.shiftId.forEach((shift: any) => {
            const shiftId = shift._id;
            const shiftLabel = shift.name || 'Unnamed Shift';

            allShiftOptions.push({
              value: shiftId,
              label: shiftLabel
            });

            // Store reference to parent rate doc for this shift
            lookupMap[shiftId] = {
              parentRateDoc: rateDoc,
              shiftData: shift
            };
          });
        }
      });

      setShiftOptions(allShiftOptions);
      setShiftLookupMap(lookupMap);

    } catch (error) {
      console.error('Failed to fetch employee shifts:', error);
      toast({
        title: 'Error loading shifts',
        description: 'Could not load employee shifts',
        variant: 'destructive'
      });
    }
  };

    fetchEmployeeShifts();
  }, [selectedEmployeeId, companyId]);

  // --- Options Generators ---
  const serviceUserOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === 'serviceUser' || u.role === 'client')
        .map((u) => ({ value: u._id, label: `${u.firstName} ${u.lastName}` })),
    [users]
  );

  const employeeOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === 'staff' || u.role === 'employee')
        .map((u) => ({ value: u._id, label: `${u.firstName} ${u.lastName}` })),
    [users]
  );

  const funderOptions = useMemo(
    () =>
      funders.map((f) => {
        const name = f.funderName || `${f.firstName || ''} ${f.lastName || ''}`;
        return { value: f._id, label: name.trim() || 'Unnamed Funder' };
      }),
    [funders]
  );

  const visitTypeOptions = useMemo(
    () => visitTypes.map((vt) => ({ value: vt._id, label: vt.title })),
    [visitTypes]
  );

  const serviceTypeOptions = useMemo(
    () => serviceTypes.map((st) => ({ value: st._id, label: st.title })),
    [serviceTypes]
  );

  return (
    <div className="space-y-3">
      {/* Date & Time Section */}
      <div className="rounded border border-gray-200 bg-white p-2">
        <h3 className="mb-2 text-xs font-semibold text-gray-900">
          Date & Time
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <EditableField
            id="date"
            label="Date"
            value={formData.date ? String(formData.date).split('T')[0] : ''}
            type="date"
            onUpdate={(val) => onDateChange('date', val)}
            isSaving={isFieldSaving.date}
            required
            isMissing={isFieldMissing('date')}
            compact
          />
          <EditableField
            id="startTime"
            label="Start"
            value={formData.startTime}
            type="time"
            onUpdate={(val) => onUpdate('startTime', val)}
            isSaving={isFieldSaving.startTime}
            required
            isMissing={isFieldMissing('startTime')}
            compact
          />
          <EditableField
            id="endTime"
            label="End"
            value={formData.endTime}
            type="time"
            onUpdate={(val) => onUpdate('endTime', val)}
            isSaving={isFieldSaving.endTime}
            required
            isMissing={isFieldMissing('endTime')}
            compact
          />
          <EditableField
            id="duration"
            label="Duration"
            value={calculateDuration(formData.startTime, formData.endTime)}
            readOnly
            isSaving={false}
            compact
          />
          <EditableField
            id="timeInMinutes"
            label="Mins"
            value={formData.timeInMinutes}
            type="number"
            onUpdate={(val) => onUpdate('timeInMinutes', val)}
            isSaving={isFieldSaving.timeInMinutes}
            required
            isMissing={isFieldMissing('timeInMinutes')}
            compact
          />
          <EditableField
            id="travelTime"
            label="Travel"
            value={formData.travelTime}
            type="number"
            onUpdate={(val) => onUpdate('travelTime', val)}
            isSaving={isFieldSaving.travelTime}
            required
            isMissing={isFieldMissing('travelTime')}
            compact
          />
        </div>
      </div>

      {/* Service User & Funder Section */}
      <div className="rounded border border-gray-200 bg-white p-2">
        <h3 className="mb-2 text-xs font-semibold text-gray-900">
          Service User & Funder
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <EditableField
            id="branch"
            label="Branch"
            value={formData.branch}
            type="select"
            options={[
              { value: 'Everycare Romford', label: 'Everycare Romford' }
            ]}
            onUpdate={(val) => onSelectChange('branch', val)}
            isSaving={isFieldSaving.branch}
            required
            isMissing={isFieldMissing('branch')}
            compact
          />
          <EditableField
            id="area"
            label="Area"
            value={formData.area}
            type="select"
            options={[{ value: 'care', label: 'Care' }]}
            onUpdate={(val) => onSelectChange('area', val)}
            isSaving={isFieldSaving.area}
            required
            isMissing={isFieldMissing('area')}
            compact
          />
          <EditableField
            id="serviceUser"
            label="Service User"
            value={getValueId(formData.serviceUser)}
            type="select"
            options={serviceUserOptions}
            onUpdate={(val) => {
              onSelectChange('serviceUser', val);
              onSelectChange('serviceFunder', '');
            }}
            isSaving={isFieldSaving.serviceUser}
            required
            isMissing={isFieldMissing('serviceUser')}
            compact
          />
          <EditableField
            id="serviceFunder"
            label="Funder"
            value={getValueId(formData.serviceFunder)}
            type="select"
            options={funderOptions}
            onUpdate={(val) => onSelectChange('serviceFunder', String(val))}
            isSaving={isFieldSaving.serviceFunder}
            required
            isMissing={isFieldMissing('serviceFunder')}
            compact
          />
        </div>
      </div>

      {/* Employee & Shift Section */}
      <div className="rounded border border-gray-200 bg-white p-2">
        <h3 className="mb-2 text-xs font-semibold text-gray-900">
          Employee & Shift
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <EditableField
            id="employeeBranch"
            label="Branch"
            value={formData.employeeBranch}
            type="select"
            options={[
              { value: 'Everycare Romford', label: 'Everycare Romford' }
            ]}
            onUpdate={(val) => onSelectChange('employeeBranch', val)}
            isSaving={isFieldSaving.employeeBranch}
            required
            isMissing={isFieldMissing('employeeBranch')}
            compact
          />
          <EditableField
            id="employeeArea"
            label="Area"
            value={formData.employeeArea}
            type="select"
            options={[{ value: 'care', label: 'Care' }]}
            onUpdate={(val) => onSelectChange('employeeArea', val)}
            isSaving={isFieldSaving.employeeArea}
            required
            isMissing={isFieldMissing('employeeArea')}
            compact
          />
          <EditableField
            id="employee"
            label="Employee"
            value={getValueId(formData.employee)}
            type="select"
            options={employeeOptions}
            onUpdate={(val) => {
              onSelectChange('employee', val);
              onSelectChange('employeeShiftId', '');
              onUpdate('employeeRateId', '');
            }}
            isSaving={isFieldSaving.employee}
            required
            isMissing={isFieldMissing('employee')}
            compact
          />

          <EditableField
            id="employeeShiftId"
            label="Shift"
            value={getValueId(formData.employeeShiftId)}
            type="select"
            options={shiftOptions}
            onUpdate={(val) => {
              onSelectChange('employeeShiftId', val);

              // Update the Rate ID when shift changes
              const lookup = shiftLookupMap[val];
              if (lookup && lookup.parentRateDoc) {
                const newRateId = lookup.parentRateDoc._id;
                const currentRateId = getValueId(formData.employeeRateId);

                if (newRateId !== currentRateId) {
                  onUpdate('employeeRateId', newRateId);
                }
              }
            }}
            isSaving={isFieldSaving.employeeShiftId}
            required
            isMissing={isFieldMissing('employeeShiftId')}
            compact
          />
        </div>
      </div>

      {/* Service & Rates Section */}
      <div className="rounded border border-gray-200 bg-white p-2">
        <h3 className="mb-2 text-xs font-semibold text-gray-900">
          Service & Rates
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <EditableField
            id="serviceType"
            label="Service Type"
            value={getValueId(formData.serviceType)}
            type="select"
            options={serviceTypeOptions}
            onUpdate={(val) => onSelectChange('serviceType', val)}
            isSaving={isFieldSaving.serviceType}
            required
            isMissing={isFieldMissing('serviceType')}
            compact
          />
          <EditableField
            id="visitType"
            label="Visit Type"
            value={getValueId(formData.visitType)}
            type="select"
            options={visitTypeOptions}
            onUpdate={(val) => onSelectChange('visitType', val)}
            isSaving={isFieldSaving.visitType}
            required
            isMissing={isFieldMissing('visitType')}
            compact
          />
          <EditableField
            id="payRate"
            label="Pay Rate"
            value={formData.payRate}
            type="number"
            onUpdate={(val) => onUpdate('payRate', val)}
            isSaving={isFieldSaving.payRate}
            required
            isMissing={isFieldMissing('payRate')}
            compact
          />
          <EditableField
            id="invoiceRate"
            label="Invoice Rate"
            value={formData.invoiceRate}
            type="number"
            onUpdate={(val) => onUpdate('invoiceRate', val)}
            isSaving={isFieldSaving.invoiceRate}
            required
            isMissing={isFieldMissing('invoiceRate')}
            compact
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className="rounded border border-gray-200 bg-white p-2">
        <h3 className="mb-2 text-xs font-semibold text-gray-900">Summary</h3>
        <div className="grid grid-cols-3 gap-2">
          <EditableField
            id="cancellation"
            label="Cancellation"
            value={formData.cancellation}
            type="select"
            options={[
              { value: '', label: 'None' },
              { value: 'Cancelled by Client', label: 'Cancelled by Client' },
              { value: 'Cancelled by Staff', label: 'Cancelled by Staff' }
            ]}
            onUpdate={(val) => onSelectChange('cancellation', val)}
            isSaving={isFieldSaving.cancellation}
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;