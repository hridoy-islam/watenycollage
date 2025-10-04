import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Select from 'react-select';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import TabSection from '../TabSection';
import { Input } from '@/components/ui/input';
import { countries, nationalities } from '@/types';
import { useSelector } from 'react-redux';

interface AddressProps {
  userData: any;
  isEditing?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  refreshData?: () => void;
}

const AddressDetails: React.FC<AddressProps> = (props) => {
  const { userData, isEditing, onSave, onCancel, onEdit, refreshData } = props;
  const [localData, setLocalData] = useState<any>(userData);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof any, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  // Dropdown options
  const nationalityOptions = nationalities.map((nationality) => ({
    label: nationality,
    value: nationality.toLowerCase().replace(/\s/g, '-')
  }));

  const countryOptions = countries.map((country) => ({
    label: country,
    value: country.toLowerCase().replace(/\s/g, '-')
  }));

  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' }
  ];

  const findOption = (
    options: { value: string; label: string }[],
    value: string
  ) => options.find((opt) => opt.value === value);

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    if (refreshData) {
      refreshData();
    }
  };

  return (
    <TabSection
      title="Address Details"
      description="Your current and permanent address information"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
      
       
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.postalAddressLine1 || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddressLine1', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.postalAddressLine1 || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.postalAddressLine2 || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddressLine2', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.postalAddressLine2 || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.postalCity || ''}
                  onChange={(e) =>
                    handleInputChange('postalCity', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.postalCity || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              {isEditing ? (
                <Select
                  className="mt-1"
                  options={countryOptions}
                  value={
                    localData.postalCountry
                      ? countryOptions.find(
                          (opt) =>
                            opt.label.toLowerCase() ===
                            localData.postalCountry.toLowerCase()
                        )
                      : null
                  }
                  menuPlacement="top"
                  onChange={(selectedOption) =>
                    handleInputChange(
                      'postalCountry',
                      selectedOption?.label || ''
                    )
                  }
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
                  {capitalizeFirstLetter(localData.postalCountry || '-')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Post Code
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.postalPostCode || ''}
                  onChange={(e) =>
                    handleInputChange('postalPostCode', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.postalPostCode || '-'}
                </div>
              )}
            </div>
          </div>
         
        </div> 
        
      </div>
    </TabSection>
  );
};

export default AddressDetails;
