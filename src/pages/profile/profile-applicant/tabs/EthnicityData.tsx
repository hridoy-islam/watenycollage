import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';

interface EthnicityProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

// Your ethnicity options
const ethnicityOptions = [
  { group: 'White or White British', value: 'english', label: 'English' },
  { group: 'White or White British', value: 'scottish', label: 'Scottish' },
  { group: 'White or White British', value: 'welsh', label: 'Welsh' },
  { group: 'White or White British', value: 'irish', label: 'Irish' },
  { group: 'White or White British', value: 'irish_traveller', label: 'Irish Traveller' },
  { group: 'White or White British', value: 'other_white', label: 'Other White Background' },
  { group: 'Mixed', value: 'white_black_caribbean', label: 'White & Black Caribbean' },
  { group: 'Mixed', value: 'white_black_african', label: 'White & Black African' },
  { group: 'Mixed', value: 'white_asian', label: 'White & Asian' },
  { group: 'Mixed', value: 'other_mixed', label: 'Other mixed background' },
  { group: 'Asian or Asian British', value: 'indian', label: 'Indian' },
  { group: 'Asian or Asian British', value: 'pakistani', label: 'Pakistani' },
  { group: 'Asian or Asian British', value: 'bangladeshi', label: 'Bangladeshi' },
  { group: 'Asian or Asian British', value: 'other_asian', label: 'Other Asian Background' },
  { group: 'Black or Black British', value: 'caribbean', label: 'Caribbean' },
  { group: 'Black or Black British', value: 'african', label: 'African' },
  { group: 'Black or Black British', value: 'other_black', label: 'Other Black Background' },
  { group: 'Chinese or Chinese British', value: 'chinese', label: 'Chinese or Chinese British' },
  { group: 'Other Ethnic Background', value: 'other_ethnic', label: 'Other Ethnic Background' }
];

const ethnicGroups = [
  { value: 'White or White British', label: 'White or White British' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Asian or Asian British', label: 'Asian or Asian British' },
  { value: 'Black or Black British', label: 'Black or Black British' },
  { value: 'Chinese or Chinese British', label: 'Chinese or Chinese British' },
  { value: 'Other Ethnic Background', label: 'Other Ethnic Background' }
];

const OTHER_VALUES = ['other_white', 'other_mixed', 'other_asian', 'other_black', 'other_ethnic'];

const EthnicityData: React.FC<EthnicityProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'ethnicityGroup' ? { ethnicityValue: '', ethnicityOther: '' } : {}),
      ...(field === 'ethnicityValue' ? { ethnicityOther: '' } : {})
    }));
  };

  const handleSave = () => {
    onSave?.(localData);
  };

  const selectedGroup = localData?.ethnicityGroup;
  const selectedValue = localData?.ethnicityValue;
  const filteredOptions = ethnicityOptions
    .filter((option) => option.group === selectedGroup)
    .map((option) => ({ value: option.value, label: option.label }));

  const requiresOther = OTHER_VALUES.includes(selectedValue || '');

  return (
    <TabSection
      title="Ethnic Background"
      description="This information helps us ensure our recruitment practices are fair and inclusive. Your response is optional and will not affect your application."
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Step 1: Ethnic Group */}
        <div>
          <Label className="text-lg font-medium">
            Select Your Ethnic Group <span className="text-red-500">*</span>
          </Label>
          {isEditing ? (
            <Select
              options={ethnicGroups}
              placeholder="Choose an ethnic group..."
              isClearable
              value={ethnicGroups.find((g) => g.value === selectedGroup) || null}
              onChange={(option) => handleInputChange('ethnicityGroup', option?.value || '')}
              menuPortalTarget={document.body}
              styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
            />
          ) : (
            <div className="mt-1 text-gray-900">{selectedGroup || '-'}</div>
          )}
        </div>

        {/* Step 2: Specific Ethnicity */}
        {selectedGroup && filteredOptions.length > 0 && (
          <div>
            <Label className="text-lg font-medium">
              Select Your Specific Ethnicity <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <Select
                options={filteredOptions}
                placeholder="Choose your specific ethnicity..."
                isClearable
                value={filteredOptions.find((opt) => opt.value === selectedValue) || null}
                onChange={(option) => handleInputChange('ethnicityValue', option?.value || '')}
                menuPortalTarget={document.body}
                styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {filteredOptions.find((opt) => opt.value === selectedValue)?.label || '-'}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Other */}
        {requiresOther && (
          <div>
            <Label className="text-lg font-medium">Please Specify</Label>
            {isEditing ? (
              <Textarea
                value={localData?.ethnicityOther || ''}
                onChange={(e) => handleInputChange('ethnicityOther', e.target.value)}
                placeholder="e.g., Polish, Nigerian, Filipino, etc."
                className="min-h-[100px] border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
              />
            ) : (
              <div className="mt-1 text-gray-900">{localData?.ethnicityOther || '-'}</div>
            )}
          </div>
        )}
      </div>
    </TabSection>
  );
};

export default EthnicityData;
