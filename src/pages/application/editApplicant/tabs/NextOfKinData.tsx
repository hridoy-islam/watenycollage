import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { emergencyContactRelationships } from '@/types';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
const NextToKinData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = (field: keyof User[''], value: any) => {
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

  const relationshipOptions = emergencyContactRelationships.map((relation) => ({
    value: relation,
    label: relation
  }));

  return (
    <TabSection
      title="Next Of Kin"
      description="Details of your next of kin"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Residential Address */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Emergency Contact Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData?.emergencyFullName || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyFullName', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.emergencyFullName || '-'}
                </div>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Relationship
              </Label>

              {isEditing ? (
                <Select
                  options={relationshipOptions}
                  value={
                    relationshipOptions.find(
                      (option) =>
                        option.value === localData?.emergencyRelationship
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    handleInputChange(
                      'emergencyRelationship',
                      selectedOption?.value || ''
                    )
                  }
                  className="mt-1"
                  classNamePrefix="react-select"
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
                  menuPortalTarget={document.body}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.emergencyRelationship || '-'}
                </div>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Contact Number
              </Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData?.emergencyContactNumber || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyContactNumber', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.emergencyContactNumber || '-'}
                </div>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={localData?.emergencyEmail || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyEmail', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.emergencyEmail || '-'}
                </div>
              )}
            </div>
<div>

              <Label className="block text-sm font-medium text-gray-700">
                Address
              </Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData?.emergencyAddress || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyAddress', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.emergencyAddress || '-'}
                </div>
              )}
                </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default NextToKinData;
