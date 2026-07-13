import React from 'react';
import moment from 'moment';
import { countries } from '@/types';
import { EditableField } from '../components/EditableField';

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
  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ];

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'terminated', label: 'Terminated' }
  ];

  const servicePriorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const typeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'organization', label: 'Organization' },
    { value: 'individual-with-medication', label: 'Individual With Medication' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' }
  ];

  const ethnicOriginOptions = [
    { value: 'white-british', label: 'White British' },
    { value: 'white-irish', label: 'White Irish' },
    { value: 'white-other', label: 'White Other' },
    {
      value: 'mixed-white-black-caribbean',
      label: 'Mixed White and Black Caribbean'
    },
    {
      value: 'mixed-white-black-african',
      label: 'Mixed White and Black African'
    },
    { value: 'mixed-white-asian', label: 'Mixed White and Asian' },
    { value: 'mixed-other', label: 'Mixed Other' },
    { value: 'asian-indian', label: 'Asian Indian' },
    { value: 'asian-pakistani', label: 'Asian Pakistani' },
    { value: 'asian-bangladeshi', label: 'Asian Bangladeshi' },
    { value: 'asian-other', label: 'Asian Other' },
    { value: 'black-caribbean', label: 'Black Caribbean' },
    { value: 'black-african', label: 'Black African' },
    { value: 'black-other', label: 'Black Other' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'other', label: 'Other' }
  ];

  const religionOptions = [
    { value: 'christianity', label: 'Christianity' },
    { value: 'islam', label: 'Islam' },
    { value: 'hinduism', label: 'Hinduism' },
    { value: 'buddhism', label: 'Buddhism' },
    { value: 'sikhism', label: 'Sikhism' },
    { value: 'judaism', label: 'Judaism' },
    { value: 'atheism', label: 'Atheism' },
    { value: 'agnosticism', label: 'Agnosticism' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const missingFields = getMissingFields('general', formData);

  const isFieldMissing = (fieldKey: string) => {
    return missingFields.includes(fieldKey);
  };
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <EditableField
            id="serviceUserType"
            label="Service User Type"
            value={formData.serviceUserType}
            type="select"
            options={typeOptions}
            onUpdate={(value) => onSelectChange('serviceUserType', value)}
            isSaving={isFieldSaving.type}
            required
            isMissing={isFieldMissing('serviceUserType')}
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
            placeholder="Enter first name"
            isMissing={isFieldMissing('firstName')}
          />

          <EditableField
            id="initial"
            label="Middle Initial"
            value={formData.middleInitial}
            onUpdate={(value) => onUpdate('initial', value)}
            isSaving={isFieldSaving.initial}
            placeholder="Enter middle initial"
          />

          <EditableField
            id="lastName"
            label="Last Name"
            value={formData.lastName}
            onUpdate={(value) => onUpdate('lastName', value)}
            isSaving={isFieldSaving.lastName}
            required
            placeholder="Enter last name"
            isMissing={isFieldMissing('lastName')}
          />

          <EditableField
            id="dateOfBirth"
            label="Date of Birth"
            value={
              formData.dateOfBirth
                ? moment(formData.dateOfBirth).format('YYYY-MM-DD')
                : ''
            }
            type="date"
            onUpdate={(value) => onDateChange('dateOfBirth', value)}
            isSaving={isFieldSaving.dateOfBirth}
            required
            isMissing={isFieldMissing('dateOfBirth')}
          />

          <EditableField
            id="startDate"
            label="Start Date"
            value={formData.startDate ? formData.startDate : ''}
            type="date"
            onUpdate={(value) => onDateChange('startDate', value)}
            isSaving={isFieldSaving.startDate}
            required
            isMissing={isFieldMissing('startDate')}
          />
          <EditableField
            id="lastDutyDate"
            label="Last Duty Date"
            value={formData.lastDutyDate ? formData.lastDutyDate : ''}
            type="date"
            onUpdate={(value) => onDateChange('lastDutyDate', value)}
            isSaving={isFieldSaving.lastDutyDate}
            
            isMissing={isFieldMissing('lastDutyDate')}
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
            id="servicePriority"
            label="Service Priority"
            value={formData.servicePriority}
            type="select"
            options={servicePriorityOptions}
            onUpdate={(value) => onSelectChange('servicePriority', value)}
            isSaving={isFieldSaving.servicePriority}
            required
            isMissing={isFieldMissing('servicePriority')}
          />
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Address Information
        </h3>

        <div className="space-y-6">
          <EditableField
            id="address"
            label="Full Address"
            value={formData.address}
            type="textarea"
            onUpdate={(value) => onUpdate('address', value)}
            isSaving={isFieldSaving.address}
            required
            placeholder="Enter full street address"
            rows={3}
            isMissing={isFieldMissing('address')}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <EditableField
              id="city"
              label="City/Town"
              value={formData.city}
              onUpdate={(value) => onUpdate('city', value)}
              isSaving={isFieldSaving.city}
              required
              placeholder="Enter city"
              isMissing={isFieldMissing('city')}
            />

            <EditableField
              id="postCode"
              label="Postal Code"
              value={formData.postCode}
              onUpdate={(value) => onUpdate('postCode', value)}
              isSaving={isFieldSaving.postCode}
              required
              placeholder="Enter postal code"
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
    </div>
  );
};

export default PersonalInfoTab;
