import React from 'react';
import { EditableField } from '../EditableField';
import { FileText } from 'lucide-react';
import { SectionHeader, FormRow } from './layout';

interface TermsTabProps {
  formData: any;
  onCheckboxChange: (fieldName: string, checked: boolean) => void;
  isFieldSaving: Record<string, boolean>;
}

const termsFields = [
  { key: 'termsAccepted', label: 'Terms Accepted' },
  { key: 'dataProcessingAccepted', label: 'Data Processing Accepted' },
  { key: 'consentMedicalDeclaration', label: 'Consent Medical Declaration' },
  { key: 'consentVaccination', label: 'Consent Vaccination' },
  { key: 'consentTerminationClause', label: 'Consent Termination Clause' },
  { key: 'roaDeclaration', label: 'ROA Declaration' },
  { key: 'declarationContactReferee', label: 'Declaration Contact Referee' },
  { key: 'declarationCorrectUpload', label: 'Declaration Correct Upload' },
  { key: 'authorizeReferees', label: 'Authorize Referees' }
];

const TermsTab: React.FC<TermsTabProps> = ({
  formData,
  onCheckboxChange,
  isFieldSaving
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <SectionHeader icon={FileText} title="Terms & Declarations" />
        <div className="flex flex-col">
          {termsFields.map((f) => (
            <FormRow key={f.key} label={f.label} isSaving={isFieldSaving[f.key]}>
              <EditableField
                id={f.key}
                label=""
                value={String(formData[f.key])}
                type="checkbox"
                onUpdate={(value) => onCheckboxChange(f.key, value)}
                isSaving={isFieldSaving[f.key]}
              />
            </FormRow>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsTab;
