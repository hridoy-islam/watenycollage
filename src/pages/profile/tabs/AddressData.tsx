import React from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface AddressDataProps {
  userData: User;
  isEditing?: boolean;
}

const AddressData: React.FC<AddressDataProps> = ({ userData, isEditing = false }) => {
  return (
    <TabSection 
      title="Address Information" 
      description="Your residential and postal addresses" 
      userData={userData}
    >
      <div className="space-y-8">
        {/* Residential Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Residential Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.residentialAddressLine1}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.residentialAddressLine1 || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.residentialAddressLine2}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.residentialAddressLine2 || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.residentialCity}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.residentialCity || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.residentialPostCode}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.residentialPostCode || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.residentialCountry}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.residentialCountry || '-'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Postal Address */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Postal Address</h3>
            
            {isEditing && (
              <div className="flex items-center">
                <input
                  id="sameAsResidential"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  defaultChecked={userData.addressData?.sameAsResidential}
                />
                <label htmlFor="sameAsResidential" className="ml-2 block text-sm text-gray-700">
                  Same as Residential
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.postalAddressLine1}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.postalAddressLine1 || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.postalAddressLine2}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.postalAddressLine2 || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.postalCity}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.postalCity || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.postalPostCode}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.postalPostCode || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.addressData?.postalCountry}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.addressData?.postalCountry || '-'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default AddressData;