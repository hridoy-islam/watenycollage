import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Textarea } from '@/components/ui/textarea';

// --- Options Data ---

const ethnicGroups = [
  { value: 'White or White British', label: 'White or White British' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Asian or Asian British', label: 'Asian or Asian British' },
  { value: 'Black or Black British', label: 'Black or Black British' },
  { value: 'Chinese or Chinese British', label: 'Chinese or Chinese British' },
  { value: 'Other Ethnic Background', label: 'Other Ethnic Background' },
  { value: 'Prefer Not to Say', label: 'Prefer Not to Say' }
];

const ethnicityOptions = [
  { group: 'White or White British', value: 'english', label: 'English' },
  { group: 'White or White British', value: 'scottish', label: 'Scottish' },
  { group: 'White or White British', value: 'welsh', label: 'Welsh' },
  { group: 'White or White British', value: 'irish', label: 'Irish' },
  { group: 'White or White British', value: 'gypsy_traveller', label: 'Gypsy or Traveller' },
  { group: 'White or White British', value: 'other_white', label: 'Other White Background' },

  { group: 'Mixed', value: 'white_black_caribbean', label: 'White & Black Caribbean' },
  { group: 'Mixed', value: 'white_black_african', label: 'White & Black African' },
  { group: 'Mixed', value: 'white_asian', label: 'White & Asian' },
  { group: 'Mixed', value: 'other_mixed', label: 'Other mixed background' },

  { group: 'Asian or Asian British', value: 'indian', label: 'Indian' },
  { group: 'Asian or Asian British', value: 'pakistani', label: 'Pakistani' },
  { group: 'Asian or Asian British', value: 'bangladeshi', label: 'Bangladeshi' },
  { group: 'Asian or Asian British', value: 'sri_lankan', label: 'Sri Lankan' },
  { group: 'Asian or Asian British', value: 'nepali', label: 'Nepali' },
  { group: 'Asian or Asian British', value: 'other_asian', label: 'Other Asian Background' },

  { group: 'Black or Black British', value: 'caribbean', label: 'Caribbean' },
  { group: 'Black or Black British', value: 'african', label: 'African' },
  { group: 'Black or Black British', value: 'other_black', label: 'Other Black Background' },

  { group: 'Chinese or Chinese British', value: 'chinese', label: 'Chinese' },

  { group: 'Other Ethnic Background', value: 'arab', label: 'Arab' },
  { group: 'Other Ethnic Background', value: 'other_ethnic', label: 'Other Ethnic Background' },
  { group: 'Prefer Not to Say', value: 'prefer_not_to_say', label: 'Prefer Not to Say' }
];

const religionOptions = [
  { value: 'no_religion', label: 'No Religion' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'christian', label: 'Christian' },
  { value: 'christian_church_of_scotland', label: 'Christian – Church of Scotland' },
  { value: 'christian_roman_catholic', label: 'Christian – Roman Catholic' },
  { value: 'christian_presbyterian', label: 'Christian – Presbyterian Church in Ireland' },
  { value: 'christian_church_of_ireland', label: 'Christian – Church of Ireland' },
  { value: 'christian_methodist', label: 'Christian – Methodist Church in Ireland' },
  { value: 'christian_other', label: 'Christian – Other Denomination' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'other_religion', label: 'Any other Religion or Belief' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

const sexualOrientationOptions = [
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'gay_man', label: 'Gay Man' },
  { value: 'gay_woman_lesbian', label: 'Gay Woman/Lesbian' },
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

const genderIdentityOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

interface EthnicityDataProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

const EthnicityData: React.FC<EthnicityDataProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = <K extends keyof User>(
    field: K,
    value: User[K]
  ) => {
    setLocalData((prevData) => ({
      ...prevData,
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

  // --- Helper to get labels for view mode ---
  const getLabel = (value: string | undefined, options: any[]) => {
    if (!value) return '-';
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : value;
  };

  // --- Derived State for Inputs ---
  const selectedGroup = ethnicGroups.find(g => g.value === localData.ethnicityGroup);
  
  const filteredEthnicityOptions = ethnicityOptions.filter(
    (option) => option.group === localData.ethnicityGroup
  );

  const selectedEthnicity = filteredEthnicityOptions.find(
    (opt) => opt.value === localData.ethnicityValue
  );
  
  // Also check full list in case group changed but value remained (edge case safety)
  const displayEthnicity = ethnicityOptions.find(opt => opt.value === localData.ethnicityValue);

  const requiresOther = [
    'other_white',
    'other_mixed',
    'other_asian',
    'other_black',
    'other_ethnic'
  ].includes(localData.ethnicityValue || '');

  // Select Styles
  const selectStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
  };

  return (
    <TabSection
      title="Diversity and Equality"
      description="This information helps us ensure our recruitment practices are fair and inclusive."
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        
        {/* --- Ethnicity Section --- */}
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Ethnicity</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Ethnic Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ethnic Group
              </label>
              {isEditing ? (
                <Select
                  value={selectedGroup}
                  onChange={(option) => {
                    handleInputChange('ethnicityGroup', option?.value || '');
                    handleInputChange('ethnicityValue', ''); // Reset specific value
                    handleInputChange('ethnicityOther', ''); // Reset other text
                  }}
                  options={ethnicGroups}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={selectStyles}
                  placeholder="Select Group..."
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.ethnicityGroup || '-'}
                </div>
              )}
            </div>

            {/* Specific Ethnicity */}
            {(localData.ethnicityGroup || !isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specific Background
                </label>
                {isEditing ? (
                   <Select
                    value={selectedEthnicity}
                    onChange={(option) => {
                        handleInputChange('ethnicityValue', option?.value || '');
                        handleInputChange('ethnicityOther', ''); 
                    }}
                    options={filteredEthnicityOptions}
                    menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                    styles={selectStyles}
                    placeholder="Select Specific Background..."
                    isDisabled={!localData.ethnicityGroup}
                  />
                ) : (
                  <div className="mt-1 text-gray-900">
                     {displayEthnicity?.label || '-'}
                  </div>
                )}
              </div>
            )}

            {/* Other Ethnicity Text Area */}
            {requiresOther && (
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700">
                   Please Specify
                 </label>
                 {isEditing ? (
                   <Textarea
                     value={localData.ethnicityOther || ''}
                     onChange={(e) => handleInputChange('ethnicityOther', e.target.value)}
                     placeholder="e.g., Polish, Nigerian, Filipino..."
                   />
                 ) : (
                   <div className="mt-1 text-gray-900">
                     {localData.ethnicityOther || '-'}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* --- Other Details Section --- */}
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Additional Details</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Religion or Belief
              </label>
              {isEditing ? (
                <Select
                  value={religionOptions.find(o => o.value === localData.religion)}
                  onChange={(option) => handleInputChange('religion', option?.value || '')}
                  options={religionOptions}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={selectStyles}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {getLabel(localData.religion, religionOptions)}
                </div>
              )}
            </div>

            {/* Sexual Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sexual Orientation
              </label>
              {isEditing ? (
                <Select
                  value={sexualOrientationOptions.find(o => o.value === localData.sexualOrientation)}
                  onChange={(option) => handleInputChange('sexualOrientation', option?.value || '')}
                  options={sexualOrientationOptions}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={selectStyles}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                   {getLabel(localData.sexualOrientation, sexualOrientationOptions)}
                </div>
              )}
            </div>

            {/* Gender Identity */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Is your gender identity the same as assigned at birth?
              </label>
              {isEditing ? (
                <Select
                  value={genderIdentityOptions.find(o => o.value === localData.genderIdentitySameAtBirth)}
                  onChange={(option) => handleInputChange('genderIdentitySameAtBirth', option?.value || '')}
                  options={genderIdentityOptions}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={selectStyles}
                  className="max-w-md"
                />
              ) : (
                <div className="mt-1 text-gray-900">
                   {getLabel(localData.genderIdentitySameAtBirth, genderIdentityOptions)}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </TabSection>
  );
};

export default EthnicityData;