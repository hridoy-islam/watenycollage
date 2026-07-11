import React from 'react';
import { EditableField } from '../EditableField';
import moment from '@/lib/moment-setup';
import { ClipboardList, Briefcase } from 'lucide-react';
import { SectionHeader, FormRow } from './layout';

interface ApplicationTabProps {
  formData: any;
  onUpdate: (fieldName: string, value: any) => void;
  onDateChange: (fieldName: string, dateStr: string) => void;
  onSelectChange: (fieldName: string, value: string) => void;
  onCheckboxChange: (fieldName: string, checked: boolean) => void;
  isFieldSaving: Record<string, boolean>;
}

const ApplicationTab: React.FC<ApplicationTabProps> = ({
  formData,
  onUpdate,
  onDateChange,
  onSelectChange,
  onCheckboxChange,
  isFieldSaving
}) => {
  const yesNoOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm h-fit">
          <SectionHeader icon={ClipboardList} title="Application Details" />
          <div className="flex flex-col">
            <FormRow label="Source" isSaving={isFieldSaving['source']}>
              <EditableField
                id="source"
                label=""
                value={formData.source || ''}
                onUpdate={(value) => onUpdate('source', value)}
                isSaving={isFieldSaving['source']}
              />
            </FormRow>
            <FormRow label="Referral Employee" isSaving={isFieldSaving['referralEmployee']}>
              <EditableField
                id="referralEmployee"
                label=""
                value={formData.referralEmployee || ''}
                onUpdate={(value) => onUpdate('referralEmployee', value)}
                isSaving={isFieldSaving['referralEmployee']}
              />
            </FormRow>
            <FormRow label="Available From" isSaving={isFieldSaving['availableFromDate']}>
              <EditableField
                id="availableFromDate"
                label=""
                value={
                  formData.availableFromDate
                    ? moment(formData.availableFromDate).format('YYYY-MM-DD')
                    : ''
                }
                type="date"
                onUpdate={(value) => onDateChange('availableFromDate', value)}
                isSaving={isFieldSaving['availableFromDate']}
              />
            </FormRow>
            <FormRow label="Travel Areas" isSaving={isFieldSaving['travelAreas']}>
              <EditableField
                id="travelAreas"
                label=""
                value={formData.travelAreas || ''}
                onUpdate={(value) => onUpdate('travelAreas', value)}
                isSaving={isFieldSaving['travelAreas']}
              />
            </FormRow>
            <FormRow label="Other Employers" isSaving={isFieldSaving['otherEmployers']}>
              <EditableField
                id="otherEmployers"
                label=""
                value={formData.otherEmployers || ''}
                type="textarea"
                onUpdate={(value) => onUpdate('otherEmployers', value)}
                isSaving={isFieldSaving['otherEmployers']}
              />
            </FormRow>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm h-fit">
          <SectionHeader icon={Briefcase} title="Eligibility" />
          <div className="flex flex-col">
            <FormRow
              label="Is Student"
              isSaving={isFieldSaving['isStudent']}
            >
              <EditableField
                id="isStudent"
                label=""
                value={String(formData.isStudent)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('isStudent', value)}
                isSaving={isFieldSaving['isStudent']}
              />
            </FormRow>
            <FormRow label="Is Over 18" isSaving={isFieldSaving['isOver18']}>
              <EditableField
                id="isOver18"
                label=""
                value={String(formData.isOver18)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('isOver18', value)}
                isSaving={isFieldSaving['isOver18']}
              />
            </FormRow>
            <FormRow label="Can Work In UK" isSaving={isFieldSaving['canWorkInUK']}>
              <EditableField
                id="canWorkInUK"
                label=""
                value={String(formData.canWorkInUK)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('canWorkInUK', value)}
                isSaving={isFieldSaving['canWorkInUK']}
              />
            </FormRow>
            <FormRow
              label="Subject To Immigration Control"
              isSaving={isFieldSaving['isSubjectToImmigrationControl']}
            >
              <EditableField
                id="isSubjectToImmigrationControl"
                label=""
                value={String(formData.isSubjectToImmigrationControl)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) =>
                  onSelectChange('isSubjectToImmigrationControl', value)
                }
                isSaving={isFieldSaving['isSubjectToImmigrationControl']}
              />
            </FormRow>
            <FormRow
              label="Competent In Other Language"
              isSaving={isFieldSaving['competentInOtherLanguage']}
            >
              <EditableField
                id="competentInOtherLanguage"
                label=""
                value={String(formData.competentInOtherLanguage)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) =>
                  onSelectChange('competentInOtherLanguage', value)
                }
                isSaving={isFieldSaving['competentInOtherLanguage']}
              />
            </FormRow>
            <FormRow label="Driving License" isSaving={isFieldSaving['drivingLicense']}>
              <EditableField
                id="drivingLicense"
                label=""
                value={String(formData.drivingLicense)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('drivingLicense', value)}
                isSaving={isFieldSaving['drivingLicense']}
              />
            </FormRow>
            <FormRow label="Car Owner" isSaving={isFieldSaving['carOwner']}>
              <EditableField
                id="carOwner"
                label=""
                value={String(formData.carOwner)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('carOwner', value)}
                isSaving={isFieldSaving['carOwner']}
              />
            </FormRow>
            <FormRow
              label="Solely For Everycare"
              isSaving={isFieldSaving['solelyForEverycare']}
            >
              <EditableField
                id="solelyForEverycare"
                label=""
                value={String(formData.solelyForEverycare)}
                type="select"
                options={yesNoOptions}
                onUpdate={(value) => onSelectChange('solelyForEverycare', value)}
                isSaving={isFieldSaving['solelyForEverycare']}
              />
            </FormRow>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTab;
