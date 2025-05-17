import React from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface EmergencyContactDataProps {
  userData: User;
  isEditing?: boolean;
}

const EmergencyContactData: React.FC<EmergencyContactDataProps> = ({ userData, isEditing = false }) => {
  return (
    <TabSection 
      title="Emergency Contact" 
      description="Contact information in case of emergency" 
      userData={userData}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.emergencyContactData?.emergencyFullName}
              />
            ) : (
              <div className="mt-1 text-gray-900">{userData.emergencyContactData?.emergencyFullName || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.emergencyContactData?.emergencyRelationship}
              >
                <option value="">Select relationship</option>
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.emergencyContactData?.emergencyRelationship || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            {isEditing ? (
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.emergencyContactData?.emergencyContactNumber}
              />
            ) : (
              <div className="mt-1 text-gray-900">{userData.emergencyContactData?.emergencyContactNumber || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.emergencyContactData?.emergencyEmail}
              />
            ) : (
              <div className="mt-1 text-gray-900">{userData.emergencyContactData?.emergencyEmail || '-'}</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          {isEditing ? (
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={userData.emergencyContactData?.emergencyAddress}
            />
          ) : (
            <div className="mt-1 text-gray-900">{userData.emergencyContactData?.emergencyAddress || '-'}</div>
          )}
        </div>
      </div>
    </TabSection>
  );
};

export default EmergencyContactData;