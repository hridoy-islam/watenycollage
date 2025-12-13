import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import TabSection from '../TabSection';
import { User, Referee } from '../../../types/user.types';

type RefereeKey = 'professionalReferee1' | 'professionalReferee2' | 'personalReferee';

interface RefereeDetailsProps {
  userData: User;
  isEditing: boolean;
  onSave: (data: User) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const RefereeDetails = ({
  userData,
  isEditing,
  onSave,
  onCancel,
  onEdit,
}: RefereeDetailsProps) => {
  const [localData, setLocalData] = useState<User>(userData);

  // Initialize empty referees if not present
  useEffect(() => {
    const safeData = { ...userData };
    if (!safeData.professionalReferee1) safeData.professionalReferee1 = {};
    if (!safeData.professionalReferee2) safeData.professionalReferee2 = {};
    if (!safeData.personalReferee) safeData.personalReferee = {};
    setLocalData(safeData);
  }, [userData]);

  const handleInputChange = (
    refereeKey: RefereeKey,
    field: keyof Referee,
    value: string
  ) => {
    setLocalData((prev) => ({
      ...prev,
      [refereeKey]: {
        ...prev[refereeKey],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(localData);
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  };

  const renderRefereeSection = (refereeKey: RefereeKey, title: string) => {
    const referee = localData[refereeKey] || ({} as Referee);

    return (
      <div className="space-y-4 p-4 rounded-md bg-white shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          {isEditing ? (
            <Input
              value={referee.name || ''}
              onChange={(e) => handleInputChange(refereeKey, 'name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.name || '-'}</div>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          {isEditing ? (
            <Input
              value={referee.position || ''}
              onChange={(e) => handleInputChange(refereeKey, 'position', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.position || '-'}</div>
          )}
        </div>

        {/* Organisation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Organisation</label>
          {isEditing ? (
            <Input
              value={referee.organisation || ''}
              onChange={(e) => handleInputChange(refereeKey, 'organisation', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.organisation || '-'}</div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          {isEditing ? (
            <Input
              value={referee.address || ''}
              onChange={(e) => handleInputChange(refereeKey, 'address', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.address || '-'}</div>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Relationship</label>
          {isEditing ? (
            <Input
              value={referee.relationship || ''}
              onChange={(e) => handleInputChange(refereeKey, 'relationship', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(referee.relationship || '') || '-'}
            </div>
          )}
        </div>

        {/* Specify Other Relationship */}
        {referee.relationship?.toLowerCase() === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specify Other Relationship
            </label>
            {isEditing ? (
              <Input
                value={referee.otherRelationship || ''}
                onChange={(e) =>
                  handleInputChange(refereeKey, 'otherRelationship', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            ) : (
              <div className="mt-1 text-gray-900">{referee.otherRelationship || '-'}</div>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {isEditing ? (
            <Input
              type="email"
              value={referee.email || ''}
              onChange={(e) => handleInputChange(refereeKey, 'email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.email || '-'}</div>
          )}
        </div>

        {/* Phone (tel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          {isEditing ? (
            <Input
              value={referee.tel || referee.phone || ''}
              onChange={(e) => handleInputChange(refereeKey, 'tel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.tel || referee.phone || '-'}</div>
          )}
        </div>

        {/* Fax (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Fax (Optional)</label>
          {isEditing ? (
            <Input
              value={referee.fax || ''}
              onChange={(e) => handleInputChange(refereeKey, 'fax', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee.fax || '-'}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TabSection
      title="Reference Details"
      description="Provide details for two professional and one personal referee"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderRefereeSection('professionalReferee1', 'Professional Referee 1')}
        {renderRefereeSection('professionalReferee2', 'Professional Referee 2')}
        {renderRefereeSection('personalReferee', 'Personal Referee')}
      </div>
    </TabSection>
  );
};

export default RefereeDetails;