import React, { useEffect, useMemo, useState } from 'react';
import { countries } from '@/types';
import { EditableField } from '../components/EditableField';
import axiosInstance from '@/lib/axios';
interface PersonalInfoTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  onDateChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: any, formData: Record<string, any>) => string[];
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  onUpdate,
  onDateChange,
  onSelectChange,
  isFieldSaving,
  getMissingFields
}) => {
  const [serviceUserOptions, setServiceUserOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const typeOptions = [
  { value: 'private', label: 'Private Client' },
  { value: 'otherOrganization', label: 'Other Organization' },
  { value: 'socialServices', label: 'Social Services' }
];

  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'terminated', label: 'Terminated' }
  ];

  const branchOptions = [
    { value: 'everycare-romford', label: 'Everycare Romford' },
    { value: 'staff-hours', label: 'Staff Hours' },
 
  ];

  // 🔹 Dynamically compute area options based on branch
  const areaOptions = useMemo(() => {
    if (formData.branch === 'everycare-romford') {
      return [
       { value: 'romford-north', label: 'Romford North' },
    { value: 'romford-south', label: 'Romford South' }
      ];
    }
    if (formData.branch === 'staff-hours') {
      return [ { value: 'day-shift', label: 'Day Shift' },
    { value: 'night-shift', label: 'Night Shift' }];
    }
  }, [formData.branch]);

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const res = await axiosInstance.get(
          '/users?role=serviceUser&limit=all'
        );
        const users = res.data?.data?.result || [];
        const options = users.map((user: any) => ({
          value: user._id,
          label:
            `${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
        setServiceUserOptions(options);
      } catch (error) {
        console.error('Failed to fetch service users:', error);
      }
    };

    fetchServiceUsers();
  }, []);

  const missingFields = getMissingFields('general', formData);

  const isFieldMissing = (fieldKey: string) => {
    return missingFields.includes(fieldKey);
  };


  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <EditableField
            id="type"
            label="Funder Type"
            value={formData.type}
            type="select"
            options={typeOptions}
            onUpdate={(value) => onSelectChange('type', value)}
            isSaving={isFieldSaving.type}
            required
            isMissing={isFieldMissing('type')}
          />
          <EditableField
            id="serviceUser"
            label="Service User"
            value={formData.serviceUser || ''}
            type="select"
            options={serviceUserOptions}
            onUpdate={(value) => onSelectChange('serviceUser', value)}
            isSaving={isFieldSaving.serviceUser}
            isMissing={isFieldMissing('serviceUser')}
          />
          <EditableField
            id="title"
            label="Title"
            value={formData.title}
            type="select"
            options={titleOptions}
            onUpdate={(value) => onSelectChange('title', value)}
            isSaving={isFieldSaving.title}
            required
            isMissing={isFieldMissing('title')}
          />

          <EditableField
            id="firstName"
            label="First Name"
            value={formData.firstName}
            onUpdate={(value) => onUpdate('firstName', value)}
            isSaving={isFieldSaving.firstName}
            required
            isMissing={isFieldMissing('firstName')}
          />

          <EditableField
            id="middleInitial"
            label="Middle Initial"
            value={formData.middleInitial}
            onUpdate={(value) => onUpdate('middleInitial', value)}
            isSaving={isFieldSaving.middleInitial}
            placeholder="M"
            
          />

          <EditableField
            id="lastName"
            label="Last Name"
            value={formData.lastName}
            onUpdate={(value) => onUpdate('lastName', value)}
            isSaving={isFieldSaving.lastName}
            required
            isMissing={isFieldMissing('lastName')}
          />

          <EditableField
            id="startDate"
            label="Start Date"
            value={formData.startDate || ''}
            type="date"
            onUpdate={(value) => onDateChange('startDate', value)}
            isSaving={isFieldSaving.startDate}
            required
            isMissing={isFieldMissing('startDate')}
          />

          <EditableField
            id="status"
            label="Status"
            value={formData.status}
            type="select"
            options={statusOptions}
            onUpdate={(value) => onSelectChange('status', value)}
            isSaving={isFieldSaving.status}
            required
            isMissing={isFieldMissing('status')}
          />

          <EditableField
            id="branch"
            label="Branch"
            value={formData.branch}
            type="select"
            options={branchOptions}
            onUpdate={(value) => onSelectChange('branch', value)}
            isSaving={isFieldSaving.branch}
            required
            isMissing={isFieldMissing('branch')}
          />

          <EditableField
            id="area"
            label="Area"
            value={formData.area}
            type="select"
            options={areaOptions}
            onUpdate={(value) => onSelectChange('area', value)}
            isSaving={isFieldSaving.area}
            required
            isMissing={isFieldMissing('area')}
          />

          <EditableField
            id="description"
            label="Description"
            value={formData.description}
            type="textarea"
            onUpdate={(value) => onUpdate('description', value)}
            isSaving={isFieldSaving.description}
            required
            rows={3}
            isMissing={isFieldMissing('description')}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Address Information
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <EditableField
            id="address"
            label="Full Address"
            value={formData.address}
            type="textarea"
            onUpdate={(value) => onUpdate('address', value)}
            isSaving={isFieldSaving.address}
            required
            rows={3}
            isMissing={isFieldMissing('address')}
          />

          <EditableField
            id="city"
            label="City/Town"
            value={formData.city}
            onUpdate={(value) => onUpdate('city', value)}
            isSaving={isFieldSaving.city}
            required
            isMissing={isFieldMissing('city')}
          />

          <EditableField
            id="postCode"
            label="Postal Code"
            value={formData.postCode?.toUpperCase()}
            onUpdate={(value) => onUpdate('postCode', value.toUpperCase())}
            isSaving={isFieldSaving.postCode}
            required
            isMissing={isFieldMissing('postCode')}
          />

          <EditableField
            id="country"
            label="Country"
            value={formData.country}
            type="select"
            options={countryOptions}
            onUpdate={(value) => onSelectChange('country', value)}
            isSaving={isFieldSaving.country}
            required
            isMissing={isFieldMissing('country')}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
