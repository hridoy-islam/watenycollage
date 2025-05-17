import React from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface ComplianceDataProps {
  userData: User;
  isEditing?: boolean;
}

const ComplianceData: React.FC<ComplianceDataProps> = ({ userData, isEditing = false }) => {
  return (
    <TabSection 
      title="Compliance Information" 
      description="Regulatory and compliance requirements" 
      userData={userData}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date in UK</label>
            {isEditing ? (
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.startDateInUK as string}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {userData.complianceData?.startDateInUK 
                  ? new Date(userData.complianceData.startDateInUK).toLocaleDateString() 
                  : '-'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">National Insurance Number</label>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="AB123456C"
                defaultValue={userData.complianceData?.niNumber}
              />
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.niNumber || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visa/Immigration Status</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.status}
              >
                <option value="">Select status</option>
                <option value="UK Citizen">UK Citizen</option>
                <option value="EU Settled">EU Settled Status</option>
                <option value="EU Pre-Settled">EU Pre-Settled Status</option>
                <option value="Student Visa">Student Visa</option>
                <option value="Graduate Visa">Graduate Visa</option>
                <option value="Skilled Worker">Skilled Worker Visa</option>
                <option value="Dependent">Dependent Visa</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.status || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LTR/BRP Code</label>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.ltrCode}
              />
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.ltrCode || '-'}</div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Do you have any disabilities or learning difficulties?</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.disability}
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.disability || '-'}</div>
            )}
          </div>

          {(userData.complianceData?.disability === 'Yes' || userData.complianceData?.disabilityDetails) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Please provide details</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.complianceData?.disabilityDetails}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.complianceData?.disabilityDetails || '-'}</div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Are you receiving any benefits?</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.benefits}
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.benefits || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Do you have any criminal convictions?</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.criminalConviction}
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.criminalConviction || '-'}</div>
            )}
          </div>

          {(userData.complianceData?.criminalConviction === 'Yes' || userData.complianceData?.convictionDetails) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Please provide details</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.complianceData?.convictionDetails}
                />
              ) : (
                <div className="mt-1 text-gray-900">{userData.complianceData?.convictionDetails || '-'}</div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Will you be applying for student finance?</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={userData.complianceData?.studentFinance}
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{userData.complianceData?.studentFinance || '-'}</div>
            )}
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default ComplianceData;