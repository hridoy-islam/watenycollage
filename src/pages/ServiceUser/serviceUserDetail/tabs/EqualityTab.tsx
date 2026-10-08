import React from 'react';
import { EditableField } from '../components/EditableField';
import moment from 'moment';

interface EqualityTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  onSelectChange: (field: string, value: string) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: any, formData: Record<string, any>) => string[];
}

const EqualityTab: React.FC<EqualityTabProps> = ({
  formData,
  onUpdate,
  getMissingFields,
  onSelectChange,
  isFieldSaving
}) => {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
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

  const missingFields = getMissingFields('equality', formData);

  const isFieldMissing = (fieldKey: string) => {
    return missingFields.includes(fieldKey);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Equality Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <EditableField
            id="gender"
            label="Gender"
            value={formData.gender}
            type="select"
            options={genderOptions}
            onUpdate={(value) => onSelectChange('gender', value)}
            isSaving={isFieldSaving.gender}
            required
            isMissing={isFieldMissing('gender')}
          />

          <EditableField
            id="maritalStatus"
            label="Marital Status"
            value={formData.maritalStatus}
            type="select"
            options={maritalStatusOptions}
            onUpdate={(value) => onSelectChange('maritalStatus', value)}
            isSaving={isFieldSaving.maritalStatus}
            
            isMissing={isFieldMissing('maritalStatus')}
          />

          <EditableField
            id="ethnicOrigin"
            label="Ethnic Origin"
            value={formData.ethnicOrigin}
            type="select"
            options={ethnicOriginOptions}
            onUpdate={(value) => onSelectChange('ethnicOrigin', value)}
            isSaving={isFieldSaving.ethnicOrigin}
            
            isMissing={isFieldMissing('maritalStatus')}
          />

          <EditableField
            id="religion"
            label="Religion"
            value={formData.religion}
            type="select"
            options={religionOptions}
            onUpdate={(value) => onUpdate('religion', value)}
            isSaving={isFieldSaving.religion}
            placeholder="Enter religion"
          />
        </div>
      </div>
    </div>
  );
};

export default EqualityTab;
