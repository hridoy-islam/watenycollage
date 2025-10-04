import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PaymentDataProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onBack?: () => void; // Optional back handler
}

const PaymentData: React.FC<PaymentDataProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit,
  onBack,
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: string) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave?.(localData);
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <TabSection
      title="Bank/Building Society Details"
      description="Please provide your bank details for payroll purposes"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Bank Details Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Account Number */}
            <div>
              <Label className="text-lg font-medium">
                Account Number <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <Input
                  value={localData.accountNumber || ''}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="12345678"
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.accountNumber || '-'}</div>
              )}
            </div>

            {/* Sort Code */}
            <div>
              <Label className="text-lg font-medium">
                Sort Code <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <Input
                  value={localData.sortCode || ''}
                  onChange={(e) => handleInputChange('sortCode', e.target.value)}
                  placeholder="124456"
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.sortCode || '-'}</div>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <Label className="text-lg font-medium">
                Bank Name <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <Input
                  value={localData.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Barclays Bank"
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.bankName || '-'}</div>
              )}
            </div>

            {/* Branch Name */}
            <div>
              <Label className="text-lg font-medium">Branch Name</Label>
              {isEditing ? (
                <Input
                  value={localData.branchName || ''}
                  onChange={(e) => handleInputChange('branchName', e.target.value)}
                  placeholder="Oxford Street Branch"
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.branchName || '-'}</div>
              )}
            </div>

            {/* Building Society Roll No */}
            <div className="sm:col-span-2">
              <Label className="text-lg font-medium">
                Building Society Roll No. (if applicable)
              </Label>
              {isEditing ? (
                <Input
                  value={localData.buildingSocietyRollNo || ''}
                  onChange={(e) =>
                    handleInputChange('buildingSocietyRollNo', e.target.value)
                  }
                  placeholder="ROLL123456"
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.buildingSocietyRollNo || '-'}
                </div>
              )}
            </div>
          </div>
        </div>

        
      </div>
    </TabSection>
  );
};

export default PaymentData;