import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Select from 'react-select';
import { User } from '../../../types/user.types';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import TabSection from '../TabSection';
import { Input } from '@/components/ui/input';
import { countries, nationalities } from '@/types';
import { useSelector } from 'react-redux';
import { ImageUploader } from '../components/userImage-uploader';

interface PersonalDetailsProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  refreshData?: () => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = (props) => {
  const { userData, isEditing, onSave, onCancel, onEdit, refreshData } = props;
  const [localData, setLocalData] = useState<User>(userData);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
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
      title="Personal Details"
      description="Your basic personal information"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="group relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
              {localData.image ? (
                <img
                  src={localData.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-black">
                  No Image
                </div>
              )}
            </div>

            {isEditing && (
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-watney p-2 text-white shadow-md transition-colors hover:bg-indigo-700"
              >
                <div onClick={() => setUploadOpen(true)}>
                  <Camera size={16} />
                </div>
              </label>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black">
              {capitalizeFirstLetter(localData.title)}{' '}
              {capitalizeFirstLetter(localData.firstName)}{' '}
              {capitalizeFirstLetter(localData.initial)}{' '}
              {capitalizeFirstLetter(localData.lastName)}
            </h3>
            <p className="text-black">{localData.email}</p>
            <p className="text-black">{localData.phone}</p>
            <p className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {localData.status}
            </p>
          </div>
        </div>

        {/* Personal Info Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-black">
                Title
              </label>
              {isEditing ? (
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={titleOptions}
                  value={titleOptions.find(
                    (option) => option.value === localData?.title
                  )}
                  onChange={(selectedOption) =>
                    handleInputChange('title', selectedOption?.value)
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.title || '-')}
                </div>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-black">
                First Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.firstName || ''}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.firstName || '-')}
                </div>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-black">
                Middle Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.initial || ''}
                  onChange={(e) => handleInputChange('initial', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.initial || '-')}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-black">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.lastName || ''}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.lastName || '-')}
                </div>
              )}
            </div>

            {/* Country of Residence */}
            <div>
              <label className="block text-sm font-medium text-black">
                Country of Residence
              </label>
              {isEditing ? (
                <Select
                  options={countryOptions}
                  value={findOption(
                    countryOptions,
                    localData?.countryOfResidence || ''
                  )}
                  onChange={(selectedOption) =>
                    handleInputChange(
                      'countryOfResidence',
                      selectedOption?.value || ''
                    )
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {findOption(
                    countryOptions,
                    localData?.countryOfResidence || ''
                  )?.label || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Extended Fields */}
          <div className="space-y-4">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-black">
                Date of Birth
              </label>
              {isEditing ? (
                <CustomDatePicker
                  selected={
                    localData.dateOfBirth
                      ? new Date(localData.dateOfBirth)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleInputChange('dateOfBirth', date.toISOString());
                    }
                  }}
                  placeholder="Use your official birth date"
                />
              ) : (
                <div className="mt-1 text-black">
                  {localData.dateOfBirth
                    ? new Date(localData.dateOfBirth).toLocaleDateString()
                    : '-'}
                </div>
              )}
            </div>

            {/* Share Code */}
            <div>
              <label className="block text-sm font-medium text-black">
                Share Code
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.shareCode || ''}
                  onChange={(e) =>
                    handleInputChange('shareCode', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {localData.shareCode || '-'}
                </div>
              )}
            </div>

            {/* National Insurance Number */}
            <div>
              <label className="block text-sm font-medium text-black">
                National Insurance Number
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.nationalInsuranceNumber || ''}
                  onChange={(e) =>
                    handleInputChange('nationalInsuranceNumber', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {localData.nationalInsuranceNumber || '-'}
                </div>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-black">
                Nationality
              </label>
              {isEditing ? (
                <Select
                  options={nationalityOptions}
                  value={findOption(
                    nationalityOptions,
                    localData?.nationality || ''
                  )}
                  onChange={(selectedOption) =>
                    handleInputChange(
                      'nationality',
                      selectedOption?.value || ''
                    )
                  }
                />
              ) : (
                <div className="mt-1 text-black">
                  {findOption(nationalityOptions, localData?.nationality || '')
                    ?.label || '-'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">
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
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.postalAddressLine1 || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
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
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.postalAddressLine2 || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
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
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.postalCity || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
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
                />
              ) : (
                <div className="mt-1 text-black">
                  {capitalizeFirstLetter(localData.postalCountry || '-')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">
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
                <div className="mt-1 text-black">
                  {localData.postalPostCode || '-'}
                </div>
              )}
            </div>
          </div>
          {/* Previous Address Fields */}
          {isEditing ||
          localData.prevPostalAddressLine1 ||
          localData.prevPostalAddressLine2 ||
          localData.prevPostalCity ||
          localData.prevPostalPostCode ||
          localData.prevPostalCountry ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-black">
                Previous Address
              </h3>

              {/* Line 1 */}
              <div>
                <label className="block text-sm font-medium text-black">
                  Address Line 1
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    className="mt-1 block w-full"
                    value={localData.prevPostalAddressLine1 || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'prevPostalAddressLine1',
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <div className="mt-1 text-black">
                    {localData.prevPostalAddressLine1 || '-'}
                  </div>
                )}
              </div>

              {/* Line 2 */}
              <div>
                <label className="block text-sm font-medium text-black">
                  Road / Street
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    className="mt-1 block w-full"
                    value={localData.prevPostalAddressLine2 || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'prevPostalAddressLine2',
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <div className="mt-1 text-black">
                    {localData.prevPostalAddressLine2 || '-'}
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-black">
                  City
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    className="mt-1 block w-full"
                    value={localData.prevPostalCity || ''}
                    onChange={(e) =>
                      handleInputChange('prevPostalCity', e.target.value)
                    }
                  />
                ) : (
                  <div className="mt-1 text-black">
                    {localData.prevPostalCity || '-'}
                  </div>
                )}
              </div>

              {/* Post Code */}
              <div>
                <label className="block text-sm font-medium text-black">
                  Post Code
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    className="mt-1 block w-full"
                    value={localData.prevPostalPostCode || ''}
                    onChange={(e) =>
                      handleInputChange('prevPostalPostCode', e.target.value)
                    }
                  />
                ) : (
                  <div className="mt-1 text-black">
                    {localData.prevPostalPostCode || '-'}
                  </div>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-black">
                  Country
                </label>
                {isEditing ? (
                  <Select
                    className="mt-1"
                    options={countryOptions}
                    value={
                      localData.prevPostalCountry
                        ? countryOptions.find(
                            (opt) => opt.label === localData.prevPostalCountry
                          )
                        : null
                    }
                    menuPlacement="top"
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
                    onChange={(selectedOption) =>
                      handleInputChange(
                        'prevPostalCountry',
                        selectedOption?.label || ''
                      )
                    }
                  />
                ) : (
                  <div className="mt-1 text-black">
                    {localData.prevPostalCountry || '-'}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <ImageUploader
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploadComplete={handleUploadComplete}
          entityId={user?._id}
        />
      </div>
    </TabSection>
  );
};

export default PersonalDetails;
