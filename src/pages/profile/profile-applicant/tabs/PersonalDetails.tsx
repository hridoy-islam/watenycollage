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
  const { userData, isEditing, onSave, onCancel, onEdit ,refreshData} = props;
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
    label:country,
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
                          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
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
            <h3 className="text-xl font-semibold text-gray-900">
              {capitalizeFirstLetter(localData.title)}{' '}
              {capitalizeFirstLetter(localData.firstName)}{' '}
              {capitalizeFirstLetter(localData.initial)}{' '}
              {capitalizeFirstLetter(localData.lastName)}
            </h3>
            <p className="text-gray-500">{localData.email}</p>
            <p className="text-gray-500">{localData.phone}</p>
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
              <label className="block text-sm font-medium text-gray-700">Title</label>
              {isEditing ? (
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={titleOptions}
                  value={titleOptions.find((option) => option.value === localData?.title)}
                  onChange={(selectedOption) =>
                    handleInputChange('title', selectedOption?.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.title || '-')}
                </div>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.firstName || '-')}
                </div>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name</label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.initial || ''}
                  onChange={(e) => handleInputChange('initial', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.initial || '-')}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.lastName || '-')}
                </div>
              )}
            </div>

            {/* Country of Residence */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Country of Residence</label>
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
                <div className="mt-1 text-gray-900">
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
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              {isEditing ? (
                <CustomDatePicker
                  selected={
                    localData.dateOfBirth ? new Date(localData.dateOfBirth) : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleInputChange('dateOfBirth', date.toISOString());
                    }
                  }}
                  placeholder="Use your official birth date"
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.dateOfBirth
                    ? new Date(localData.dateOfBirth).toLocaleDateString()
                    : '-'}
                </div>
              )}
            </div>

            {/* Share Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Share Code</label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData.shareCode || ''}
                  onChange={(e) => handleInputChange('shareCode', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.shareCode || '-'}
                </div>
              )}
            </div>

            {/* National Insurance Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">National Insurance Number</label>
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
                <div className="mt-1 text-gray-900">
                  {localData.nationalInsuranceNumber || '-'}
                </div>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
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
                <div className="mt-1 text-gray-900">
                  {findOption(
                    nationalityOptions,
                    localData?.nationality || ''
                  )?.label || '-'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
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
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
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
              <label className="block text-sm font-medium text-gray-700">City</label>
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
              <label className="block text-sm font-medium text-gray-700">Country</label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData.postalCountry || ''}
                  onChange={(e) =>
                    handleInputChange('postalCountry', e.target.value)
                  }
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
              <label className="block text-sm font-medium text-gray-700">Post Code</label>
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