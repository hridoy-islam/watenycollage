import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import Select from 'react-select';

interface MedicalHistoryProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

const PostEmployment: React.FC<MedicalHistoryProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit,
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(localData);
  };

  // Helper: Render a medical condition row with "Details:" label
 const renderCondition = (
  label: string,
  boolField: keyof User,
  detailsField: keyof User
) => {
  const isChecked = localData[boolField] === true;

  return (
    <div key={boolField} className="space-y-2">
      <div className="flex items-start space-x-3">
        <Checkbox
          id={boolField as string}
          checked={isChecked}
          onCheckedChange={(checked) =>
            handleInputChange(boolField, checked === true)
          }
          disabled={!isEditing}
        />
        <div className="flex-1">
          <Label htmlFor={boolField as string} className="text-sm font-medium">
            {label}
          </Label>

          {isChecked && (
            <div className="mt-1 text-sm">
              <span className="font-medium">Details: </span>
              {isEditing ? (
                <Textarea
                  value={localData[detailsField] || ''}
                  onChange={(e) => handleInputChange(detailsField, e.target.value)}
                  placeholder={`Please provide details about ${label.toLowerCase()}`}
                  className="mt-1 w-full"
                />
              ) : (
                <span>{localData[detailsField] || '-'}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <TabSection
      title="Medical History"
      description="Please provide accurate information about your medical history and consent to the declarations below."
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <Label>Sex</Label>
            {isEditing ? (
              <Select
                options={sexOptions}
                value={sexOptions.find((opt) => opt.value === localData.sex)}
                onChange={(opt) => handleInputChange('sex', opt?.value)}
                placeholder="Select"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData.sex ? localData.sex.charAt(0).toUpperCase() + localData.sex.slice(1) : '-'}
              </div>
            )}
          </div>
          <div className="">
            <Label>Job Role</Label>
            {isEditing ? (
              <Input
                value={localData.jobRole || ''}
                onChange={(e) => handleInputChange('jobRole', e.target.value)}
              />
            ) : (
              <div className="mt-1 text-gray-900">{localData.jobRole || '-'}</div>
            )}
          </div>
        </div>

        {/* Medical Work Restriction */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Have you ever been advised by a medical practitioner of any work restrictions?
          </Label>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="advisedMedicalWorkRestriction"
              checked={localData.advisedMedicalWorkRestriction === true}
              onCheckedChange={(checked) =>
                handleInputChange('advisedMedicalWorkRestriction', checked === true)
              }
              disabled={!isEditing}
            />
            <div className="flex-1">
              {localData.advisedMedicalWorkRestriction && (
                <>
                  <Label className="mt-2 text-sm font-medium text-gray-700">Details:</Label>
                  {isEditing ? (
                    <Textarea
                      value={localData.advisedMedicalWorkRestrictionComment || ''}
                      onChange={(e) =>
                        handleInputChange('advisedMedicalWorkRestrictionComment', e.target.value)
                      }
                      placeholder="Please explain the restriction"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-gray-900 text-sm">
                      {localData.advisedMedicalWorkRestrictionComment || '-'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
          <div className="space-y-4">
            {renderCondition('Undue Fatigue', 'undueFatigue', 'undueFatigueDetails')}
            {renderCondition('Bronchitis', 'bronchitis', 'bronchitisDetails')}
            {renderCondition('Breathlessness', 'breathlessness', 'breathlessnessDetails')}
            {renderCondition('Allergies', 'allergies', 'allergiesDetails')}
            {renderCondition('Pneumonia', 'pneumonia', 'pneumoniaDetails')}
            {renderCondition('Hay Fever', 'hayFever', 'hayFeverDetails')}
            {renderCondition('Shortness of Breath', 'shortnessOfBreath', 'shortnessOfBreathDetails')}
            {renderCondition('Jundice', 'jundice', 'jundiceDetails')}
            {renderCondition('Stomach Problems', 'stomachProblems', 'stomachProblemsDetails')}
            {renderCondition('Stomach Ulcer', 'stomachUlcer', 'stomachUlcerDetails')}
            {renderCondition('Hernias', 'hernias', 'herniasDetails')}
            {renderCondition('Bowel Problem', 'bowelProblem', 'bowelProblemDetails')}
            {renderCondition('Diabetes Mellitus', 'diabetesMellitus', 'diabetesMellitusDetails')}
            {renderCondition('Nervous Disorder', 'nervousDisorder', 'nervousDisorderDetails')}
            {renderCondition('Dizziness', 'dizziness', 'dizzinessDetails')}
            {renderCondition('Ear Problems', 'earProblems', 'earProblemsDetails')}
            {renderCondition('Hearing Defect', 'hearingDefect', 'hearingDefectDetails')}
            {renderCondition('Epilepsy', 'epilepsy', 'epilepsyDetails')}
            {renderCondition('Eye Problems', 'eyeProblems', 'eyeProblemsDetails')}
            {renderCondition('PPE Allergy', 'ppeAllergy', 'ppeAllergyDetails')}
            {renderCondition('Rheumatic Fever', 'rheumaticFever', 'rheumaticFeverDetails')}
            {renderCondition('High Blood Pressure', 'highBloodPressure', 'highBloodPressureDetails')}
            {renderCondition('Low Blood Pressure', 'lowBloodPressure', 'lowBloodPressureDetails')}
            {renderCondition('Palpitations', 'palpitations', 'palpitationsDetails')}
            {renderCondition('Heart Attack', 'heartAttack', 'heartAttackDetails')}
            {renderCondition('Angina', 'angina', 'anginaDetails')}
            {renderCondition('Asthma', 'asthma', 'asthmaDetails')}
            {renderCondition('Chronic Lung Problems', 'chronicLungProblems', 'chronicLungProblemsDetails')}
            {renderCondition('Stroke', 'stroke', 'strokeDetails')}
            {renderCondition('Heart Murmur', 'heartMurmur', 'heartMurmurDetails')}
            {renderCondition('Back Problems', 'backProblems', 'backProblemsDetails')}
            {renderCondition('Joint Problems', 'jointProblems', 'jointProblemsDetails')}
            {renderCondition('Swollen Legs', 'swollenLegs', 'swollenLegsDetails')}
            {renderCondition('Varicose Veins', 'varicoseVeins', 'varicoseVeinsDetails')}
            {renderCondition('Rheumatism', 'rheumatism', 'rheumatismDetails')}
            {renderCondition('Migraine', 'migraine', 'migraineDetails')}
            {renderCondition('Drug Reaction', 'drugReaction', 'drugReactionDetails')}
            {renderCondition('Vision Correction', 'visionCorrection', 'visionCorrectionDetails')}
            {renderCondition('Skin Conditions', 'skinConditions', 'skinConditionsDetails')}
            {renderCondition('Alcohol Health Problems', 'alcoholHealthProblems', 'alcoholHealthProblemsDetails')}
          </div>
        </div>

        {/* Additional Health Questions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Have you had any serious illness not listed above?
            </Label>
            {isEditing ? (
              <>
                <Label className="text-sm font-medium text-gray-700 mt-2">Details:</Label>
                <Textarea
                  value={localData.seriousIllnessDetails || ''}
                  onChange={(e) => handleInputChange('seriousIllnessDetails', e.target.value)}
                  placeholder="Describe any serious illness"
                  className="mt-1"
                />
              </>
            ) : (
              <div className="mt-1 text-gray-900">{localData.seriousIllnessDetails || '-'}</div>
            )}
          </div>

          {renderCondition(
            'Recent Ill Health (last 3 months)',
            'recentIllHealth',
            'recentIllHealthComment'
          )}
          {renderCondition(
            'Currently attending a clinic or under medical care',
            'attendingClinic',
            'attendingClinicComment'
          )}
          {renderCondition('Had Chicken Pox', 'hadChickenPox', 'hadChickenPoxComment')}
          {renderCondition(
            'Other communicable disease',
            'otherCommunicableDisease',
            'otherCommunicableDiseaseComment'
          )}

          <div>
            <Label className="text-sm font-medium">Days sick in last year</Label>
            {isEditing ? (
              <Input
                type="text"
                value={localData.daysSickLastYear || ''}
                onChange={(e) => handleInputChange('daysSickLastYear', e.target.value)}
                placeholder="e.g., 5 days"
              />
            ) : (
              <div className="mt-1 text-gray-900">{localData.daysSickLastYear || '-'}</div>
            )}
          </div>
        </div>

        {/* Vaccination History */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vaccination History</h3>
          <div className="space-y-4">
            {renderCondition('Diphtheria', 'inocDiphtheria', 'inocDiphtheriaComment')}
            {renderCondition('Hepatitis B', 'inocHepatitisB', 'inocHepatitisBComment')}
            {renderCondition('Tuberculosis', 'inocTuberculosis', 'inocTuberculosisComment')}
            {renderCondition('Rubella', 'inocRubella', 'inocRubellaComment')}
            {renderCondition('Varicella (Chicken Pox)', 'inocVaricella', 'inocVaricellaComment')}
            {renderCondition('Polio', 'inocPolio', 'inocPolioComment')}
            {renderCondition('Tetanus', 'inocTetanus', 'inocTetanusComment')}
            {renderCondition('Tested for HIV', 'testedHIV', 'testedHIVComment')}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Other Vaccinations</Label>
              {isEditing ? (
                <Input
                  value={localData.inocOther || ''}
                  onChange={(e) => handleInputChange('inocOther', e.target.value)}
                  placeholder="List other vaccinations"
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.inocOther || '-'}</div>
              )}
              {(localData.inocOther || isEditing) && (
                <>
                  <Label className="mt-2 text-sm font-medium text-gray-700">Details:</Label>
                  {isEditing ? (
                    <Textarea
                      value={localData.inocOtherComment || ''}
                      onChange={(e) => handleInputChange('inocOtherComment', e.target.value)}
                      placeholder="Details about other vaccinations"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-gray-900 text-sm">
                      {localData.inocOtherComment || '-'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONSENT SECTION */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Declarations & Consent</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentMedicalDeclaration"
                checked={localData.consentMedicalDeclaration === true}
                onCheckedChange={(checked) =>
                  handleInputChange('consentMedicalDeclaration', checked === true)
                }
                disabled={!isEditing}
              />
              <Label htmlFor="consentMedicalDeclaration" className="text-sm">
                I confirm that the information provided is true and accurate to the best of my knowledge.
                I understand that any false information may result in termination of employment.
                <span className="text-red-500 ml-1">*</span>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentVaccination"
                checked={localData.consentVaccination === true}
                onCheckedChange={(checked) =>
                  handleInputChange('consentVaccination', checked === true)
                }
                disabled={!isEditing}
              />
              <Label htmlFor="consentVaccination" className="text-sm">
                I consent to vaccination requirements as per company policy.
                <span className="text-red-500 ml-1">*</span>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentTerminationClause"
                checked={localData.consentTerminationClause === true}
                onCheckedChange={(checked) =>
                  handleInputChange('consentTerminationClause', checked === true)
                }
                disabled={!isEditing}
              />
              <Label htmlFor="consentTerminationClause" className="text-sm">
                I agree that providing false medical information may lead to termination of employment.
                <span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default PostEmployment;