import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types'; // Assuming User type covers referee structure
import { Input } from '@/components/ui/input';

interface RefereeDataProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

const RefereeData: React.FC<RefereeDataProps> = ({
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

  // Helper to handle nested updates (e.g., referee1.name)
  const handleNestedChange = (
    refereeKey: 'referee1' | 'referee2',
    field: string,
    value: string
  ) => {
    setLocalData((prevData) => ({
      ...prevData,
      [refereeKey]: {
        ...prevData[refereeKey],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  // Reusable render function for a single referee section
  const renderRefereeSection = (
    refKey: 'referee1' | 'referee2',
    title: string,
    subTitle: string
  ) => {
    const data = localData[refKey] || {};

    return (
      <div className="rounded-lg border p-4 shadow-sm">
        <div className="mb-4 border-b pb-2">
          <h4 className="text-base font-semibold text-black">{title}</h4>
          <p className="text-xs text-black">{subTitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-black">
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={data.name || ''}
                onChange={(e) =>
                  handleNestedChange(refKey, 'name', e.target.value)
                }
                placeholder="e.g. Sarah Johnson"
              />
            ) : (
              <div className="mt-1 text-black font-medium">
                {data.name || '-'}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black">
              Email Address
            </label>
            {isEditing ? (
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) =>
                  handleNestedChange(refKey, 'email', e.target.value)
                }
                placeholder="e.g. s.johnson@example.com"
              />
            ) : (
              <div className="mt-1 text-black">{data.email || '-'}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-black">
              Phone Number
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={(e) =>
                  handleNestedChange(refKey, 'phone', e.target.value)
                }
                placeholder="e.g. +44 7911 123456"
              />
            ) : (
              <div className="mt-1 text-black">{data.phone || '-'}</div>
            )}
          </div>

          {/* Address */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-black">
              Address
            </label>
            {isEditing ? (
              <Input
                value={data.address || ''}
                onChange={(e) =>
                  handleNestedChange(refKey, 'address', e.target.value)
                }
                placeholder="Company or Business Address"
              />
            ) : (
              <div className="mt-1 text-black">{data.address || '-'}</div>
            )}
          </div>

          {/* Post Code */}
          <div>
            <label className="block text-sm font-medium text-black">
              Post Code
            </label>
            {isEditing ? (
              <Input
                value={data.postCode || ''}
                onChange={(e) =>
                  handleNestedChange(refKey, 'postCode', e.target.value)
                }
                placeholder="e.g. SW1A 0AA"
              />
            ) : (
              <div className="mt-1 text-black">{data.postCode || '-'}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TabSection
      title="Reference Details"
      description="Referees must be able to speak to your skills, experience, and character. We will contact them as part of the recruitment process."
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {renderRefereeSection(
          'referee1',
          'Reference1',
          ''
        )}
        
        {renderRefereeSection(
          'referee2',
          'Reference1',
          ''
        )}
      </div>
    </TabSection>
  );
};

export default RefereeData;