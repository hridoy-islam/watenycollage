import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface PersonalDetailsProps {
  userData: User;
  isEditing?: boolean;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ userData, isEditing = false }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(userData?.image || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TabSection 
      title="Personal Details" 
      description="Your basic personal information" 
      userData={userData}
    >
      <div className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}
            </div>
            
            {isEditing && (
              <label 
                htmlFor="profile-image" 
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-indigo-700 transition-colors"
              >
                <Camera size={16} />
                <input 
                  id="profile-image" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {userData.personalDetails?.firstName} {userData.personalDetails?.lastName}
            </h3>
            <p className="text-gray-500">{userData.email}</p>
            <p className="text-gray-500">{userData.phone}</p>
            <p className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {userData.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.title}
                >
                  <option value="">Select a title</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                </select>
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.title || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.firstName}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.firstName || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.lastName}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.lastName || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Other Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.otherName}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.otherName || '-'}</div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.gender}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.gender || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.dateOfBirth as string}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {userData.personalDetails?.dateOfBirth 
                    ? new Date(userData.personalDetails.dateOfBirth).toLocaleDateString() 
                    : '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.nationality}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.nationality || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Student Type</label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.personalDetails?.studentType}
                >
                  <option value="">Select student type</option>
                  <option value="Home">Home</option>
                  <option value="EU">EU</option>
                  <option value="International">International</option>
                </select>
              ) : (
                <div className="mt-1 text-gray-900">{userData.personalDetails?.studentType || '-'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default PersonalDetails;