import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { Textarea } from '@/components/ui/textarea';

const ComplianceData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  // Handle input changes for all fields
  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const statusOptions = [
    { value: 'british-citizen', label: 'British Citizen' },
    { value: 'eu-settled', label: 'EU Settled Status' },
    { value: 'eu-pre-settled', label: 'EU Pre-Settled Status' },
    { value: 'tier4-student-visa', label: 'Tier 4 Student Visa' },
    { value: 'tier2-skilled-worker', label: ' Tier 2 Skilled worker' },
    { value: 'other', label: 'Other' }
  ];

  const disabilityOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const studentFinanceOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const hearAboutUsOptions = [
    { label: 'Google Search', value: 'google' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Word of Mouth', value: 'word_of_mouth' },
    { label: 'Friend or Family', value: 'friend_family' },
    { label: 'University Fair', value: 'university' },
    { label: 'Online Advertisement', value: 'online' },
    { label: 'Education Agent', value: 'agent' },
    { label: 'School/College', value: 'school/college' },
    { label: 'Other', value: 'other' }
  ];

  return (
    <TabSection
      title="Additional Information"
      description=""
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Immigration Status / Visa Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visa/Immigration Status
            </label>
            {isEditing ? (
              <Select
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === localData?.immigrationStatus
                )}
                onChange={(selected) =>
                  handleInputChange('complianceData', {
                    ...localData,
                    immigrationStatus: selected?.value
                  })
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {capitalizeFirstLetter(localData?.immigrationStatus || '-')}
              </div>
            )}
          </div>
          {/* Disability */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Do you have any disabilities or learning difficulties?
            </label>
            {isEditing ? (
              <Select
                options={disabilityOptions}
                value={disabilityOptions.find(
                  (option) => option.value === localData?.disability
                )}
                onChange={(selected) =>
                  handleInputChange('complianceData', {
                    ...localData,
                    disability: selected?.value
                  })
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {capitalizeFirstLetter(localData?.disability || '-')}
              </div>
            )}
          </div>
          {/* Disability Details (Conditional) */}
          {localData?.disability === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Please provide disability details
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData?.disabilityDetails || ''}
                  onChange={(e) =>
                    handleInputChange('disabilityDetails', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.disabilityDetails || '-'}
                </div>
              )}
            </div>
          )}{' '}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Where did I hear about Watney College?
            </label>
            {isEditing ? (
              <Select
                options={hearAboutUsOptions}
                value={hearAboutUsOptions.find(
                  (option) => option.value === localData?.hearAboutUs
                )}
                onChange={(selected) =>
                  handleInputChange('hearAboutUs', {
                    ...localData,
                    hearAboutUs: selected?.value
                  })
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {capitalizeFirstLetter(localData?.hearAboutUs || '-')}
              </div>
            )}
          </div>
          {/* National Insurance Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              National Insurance Number
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={localData?.niNumber || ''}
                onChange={(e) => handleInputChange('niNumber', e.target.value)}
                placeholder="AB123456C"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.niNumber || '-'}
              </div>
            )}
          </div>
          {/* LTR/BRP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              LTR/BRP Code
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={localData?.ltrCode || ''}
                onChange={(e) => handleInputChange('ltrCode', e.target.value)}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.ltrCode || '-'}
              </div>
            )}
          </div>
          {/* Criminal Conviction */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Do I have any criminal convictions?
            </label>
            {isEditing ? (
              <Select
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                value={{
                  value: localData?.criminalConviction || false,
                  label: localData?.criminalConviction ? 'Yes' : 'No'
                }}
                onChange={(selectedOption) =>
                  handleInputChange('criminalConviction', selectedOption?.value)
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused
                      ? '#4F46E5'
                      : provided.borderColor,
                    boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB'
                    }
                  })
                }}
                menuPortalTarget={document.body}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.criminalConviction ? 'Yes' : 'No'}
              </div>
            )}
          </div>
          {/* Conviction Details (Conditional) */}
          {(localData?.criminalConviction || localData?.convictionDetails) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conviction details
              </label>
              {isEditing ? (
                <Textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData?.convictionDetails || ''}
                  onChange={(e) =>
                    handleInputChange('convictionDetails', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.convictionDetails || '-'}
                </div>
              )}
            </div>
          )}
          {/* Student Finance */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have I apply for student finance?
            </label>
            {isEditing ? (
              <Select
                options={studentFinanceOptions}
                value={studentFinanceOptions.find(
                  (option) => option.value === localData?.studentFinance
                )}
                onChange={(selected) =>
                  handleInputChange('complianceData', {
                    ...localData,
                    studentFinance: selected?.value
                  })
                }
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused
                      ? '#4F46E5'
                      : provided.borderColor,
                    boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB'
                    }
                  })
                }}
                menuPortalTarget={document.body}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {capitalizeFirstLetter(localData?.studentFinance || '-')}
              </div>
            )}
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default ComplianceData;
