import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExperienceProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

const ExperienceData: React.FC<ExperienceProps> = ({
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

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(localData);
  };

  return (
    <TabSection
      title="Experience & Interests"
      description="Share your life skills, interests, and any relevant experience that supports this application."
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Life Skills & Interests */}
        <div className="flex flex-col items-start space-y-2">
          <Label htmlFor="lifeSkillsAndInterests" className="text-lg font-medium">
            What are your life skills and interests? <span className="text-red-500">*</span>
          </Label>
          {isEditing ? (
            <Textarea
              id="lifeSkillsAndInterests"
              value={localData?.lifeSkillsAndInterests || ''}
              onChange={(e) => handleInputChange('lifeSkillsAndInterests', e.target.value)}
              placeholder="e.g., Football, cooking, volunteering, public speaking, playing guitar"
              className="min-h-[100px] border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData?.lifeSkillsAndInterests || '-'}
            </div>
          )}
          
        </div>

        {/* Relevant Experience */}
        <div className="flex flex-col items-start space-y-2">
          <Label htmlFor="relevantExperience" className="text-lg font-medium">
            Please provide a brief description of any experience relevant to this application <span className="text-red-500">*</span>
          </Label>
          {isEditing ? (
            <Textarea
              id="relevantExperience"
              value={localData?.relevantExperience || ''}
              onChange={(e) => handleInputChange('relevantExperience', e.target.value)}
              placeholder="e.g., Cared for elderly relative, worked in hospitality, completed first aid training"
              className="min-h-[100px] border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
            />
          ) : (
            <div className="mt-1 text-gray-900">{localData?.relevantExperience || '-'}</div>
          )}
         
        </div>
      </div>
    </TabSection>
  );
};

export default ExperienceData;
